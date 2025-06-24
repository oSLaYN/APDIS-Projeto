const express = require('express');
const app = express();
const util = require('util');
var api = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../modules/auth');
const sql = require('../modules/pool');
const sqlQuery = util.promisify(sql.query).bind(sql);
const mail = require('../modules/mail');
const network = require('../modules/network');
const members = require('../modules/members');

api.get('/isAuthorized', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        return res.status(200).json(req.user);
    } else {
        return res.status(400).json(null);
    }
});

api.post('/login', async(req, res) => {
    const associado = (req.body && req.body.associado ? req.body.associado : null);
    const password = (req.body && req.body.password ? req.body.password : null);
    if (!associado || !password) { return res.status(400).json({message: 'Credenciais Inválidas.'});}
    try {
        const results = await sqlQuery('SELECT * FROM users WHERE number = ?', [associado]);
        if (results.length === 0) { return res.status(400).json({message: 'Credenciais Inválidas.'}); }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) { return res.status(400).json({message: 'Credenciais Inválidas.'}); }
        const createdToken = await auth.createToken(associado, user.fullname, user.email, user.type);
        res.cookie('clientToken', createdToken, { httpOnly: true, sameSite: 'Strict', maxAge: 3600000 });
        const userip = await network.getUserIP();
        if (userip != null) { if (userip.ip !== user.ip) { 
            await network.registerAccess(associado, userip); 
            await members.insertLog(`${user.fullname} Nº${user.number} Fez Login com um Novo IP (${userip.ip})`);
        } }
        if (user.resettoken != null) { await sqlQuery('UPDATE users SET resettoken = ? WHERE number = ?', [null, associado]) }
        return res.status(200).json({message: "Utilizador Autenticado com Sucesso!"});
    } catch (error) {
        return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
    }
});

/* FAZER VERIFICAÇÃO QUANTIDADE CARACTERES (MINIMO 8) E CARACTERES ESPECIAIS */

api.post('/register', async(req, res) => {
    const associado = (req.body && req.body.associado ? req.body.associado : null);
    const email = (req.body && req.body.email ? req.body.email : null);
    const nome = (req.body && req.body.nome ? req.body.nome : null);
    const unidsaude = (req.body && req.body.unidsaude ? req.body.unidsaude : null);
    const cargo = (req.body && req.body.cargo ? req.body.cargo : null);
    if (!associado || !email || !nome || !unidsaude || !cargo) { return res.status(500).json({message: 'Todas os Dados São Necessários.'}); }
    try {
        const results = await sqlQuery('SELECT * FROM requests WHERE email = ? OR number = ?', [email, associado]);
        if (results && results.length > 0) { return res.status(500).json({message: "Já Existe um Pedido com Esses Dados."}); }
        try {
            const results = await sqlQuery('SELECT * FROM users WHERE email = ? OR number = ?', [email, associado]);
            if (results && results.length > 0) { return res.status(500).json({message: "Credenciais Já Existentes na Plataforma."}); }
            try {
                const createdUser = await sqlQuery(`INSERT INTO requests (number, fullname, email, unit, position) VALUES (?,?,?,?,?)`, [associado, nome, email, unidsaude, cargo]);
                if (createdUser.affectedRows == 0) { return res.status(500).json({message: "Não Foi Possível Criar o Pedido, Tente Novamente."}); }
                await mail.sendNewRegisterEmail({associado, email, nome, unidsaude, cargo});
                return res.status(200).json({message: 'Pedido de Registo Enviado. \nAguarde Pela Confirmação do Responsável!'});    
            } catch (error) {
                return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
            }
        } catch (error) {
            return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
        }
    } catch (error) {
        return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
    }
});

api.post('/password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({message: 'O Email é Obrigatório.'}); 
        try {
            const results = await sqlQuery('SELECT * FROM users WHERE email = ?', [email]);
            if (!results || results.length == 0) { return res.status(500).json({message: "Email Não Encontrado."}); }
            const resetToken = await mail.generateToken();
            const updatedUser = await sqlQuery(`UPDATE users SET resettoken = ? WHERE email = ?`, [resetToken, email]);
            if (updatedUser.affectedRows == 0) { return res.status(400).json({message: 'An Error Occurred.'}); }
            await mail.sendPasswordResetEmail(email, resetToken);
            await members.insertLog(`${results[0].fullname} Nº${results[0].number} Fez um Pedido de Recuperação de Password.`);
            return res.status(200).json({message: 'E-Mail de Recuperação de Password Enviado.'});
        } catch (error) {
            return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
        }
    } catch (error) {
        return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
    }
});  

api.post('/password-set', async (req, res) => {
    try {
        const {token, password} = req.body
        if (!token || !password) return res.status(400).json({message: 'Credenciais Inválidas.'}); 
        const StrongPassword = await auth.TestPassword(password);
        if (!StrongPassword) return res.status(500).json({message: "Password Não é Forte o Suficiente."}); 
        try {
            const results = await sqlQuery('SELECT * FROM users WHERE resettoken = ?', [token])
            if (!results || results.length == 0) return res.status(500).json({message: "Email Não Encontrado."});
            const cipherPassword = await bcrypt.hash(password, 10);
            const updatedUser = await sqlQuery(`UPDATE users SET password=?,resettoken=? WHERE resettoken=?`, [cipherPassword, "", token]);
            if (updatedUser.affectedRows == 0) return res.status(400).json({message: 'An Error Occurred.'});
            await members.insertLog(`${results[0].fullname} Nº${results[0].number} Definiu uma Nova Password.`);
            return res.status(200).json({message: 'User Registered Successfully.'});
        } catch (error) {
            return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
        }
    } catch (error) {
        return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
    }
});  

api.post('/logout', async (req, res) => {
    try {
        res.clearCookie('clientToken');
        return res.status(200).json('Logout Feito com Sucesso!');
    } catch (error) {
        console.error('Erro: '+ error);
        res.status(500).json('Erro: '+ error);
    }
});

module.exports = api;