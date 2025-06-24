const express = require('express');
const util = require('util');
const app = express();
var api = express.Router();
const auth = require('../modules/auth');
const sql = require('../modules/pool');
const sqlQuery = util.promisify(sql.query).bind(sql);
const members = require('../modules/members');

api.get('/getAllMembers', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            await sqlQuery('SELECT id, number, fullname, email, type FROM users WHERE number != ? OR email != ?', [req.user.associado, req.user.email], async (err, results) => {
                if (err) return res.status(500).json({message: "Ocorreu um Erro: "+err});
                return res.status(200).json(results);
            });
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.get('/getAllRegisters', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            await sqlQuery('SELECT * FROM requests', [], async (err, results) => {
                if (err) return res.status(500).json({message: "Ocorreu um Erro: "+err});
                return res.status(200).json(results);
            })
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/approveRegister', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const {id, number} = req.body;
            try {
                await sqlQuery('SELECT * FROM requests WHERE id=? AND number=?', [id,number], async (err, results) => {
                    if (err) return res.status(500).json({message: "Ocorreu um Erro: "+err});
                    if (results.length == 0) return res.status(500).json({message: "Ocorreu um Erro"});
                    const accepted = await members.approveMember(results[0]);
                    if (!accepted) return res.status(500).json({message: "Ocorreu um Erro."});
                    await members.insertLog(`Administrador ${req.user.fullname} Aprovou o Registo Nº${id} do Associado ${results[0].fullname} Nº${number}.`);
                    return res.status(200).json({message: "Utilizador Aceite."});
                })
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.delete('/rejectRegister', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const {id, number} = req.body;
            try {
                await sqlQuery('SELECT * FROM requests WHERE id=? AND number=?', [id,number], async (err, results) => {
                    if (err) return res.status(500).json({message: "Ocorreu um Erro: "+err});
                    if (results.length == 0) return res.status(500).json({message: "Ocorreu um Erro"});
                    const rejected = await members.rejectMember(results[0]);
                    if (!rejected) return res.status(500).json({message: "Ocorreu um Erro."});
                    await members.insertLog(`Administrador ${req.user.fullname} Rejeitou o Registo Nº${id} do Associado ${results[0].fullname} Nº${number}.`);
                    return res.status(200).json({message: "Utilizador Rejeitado."});
                })
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/adminMember', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const {id, number} = req.body;
            try {
                const changed = await members.ChangeMemberType(id, number, "admin");
                if (!changed) return res.status(500).json({message: "Ocorreu um Erro."});
                await members.insertLog(`Administrador ${req.user.fullname} Tornou o Associado Nº${number} como Administrador.`);
                return res.status(200).json({message: "Utilizador é Agora Administrador."});
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/unAdminMember', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const {id, number} = req.body;
            try {
                const changed = await members.ChangeMemberType(id, number, "user");
                if (!changed) return res.status(500).json({message: "Ocorreu um Erro."});
                await members.insertLog(`Administrador ${req.user.fullname} Tornou o Associado Nº${number} como Utilizador.`);
                return res.status(200).json({message: "Utilizador Já Não é Administrador."});
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.delete('/removeMember', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const {id, number} = req.body;
            try {
                const deleted = await members.removeMember(id, number);
                if (!deleted) return res.status(500).json({message: "Ocorreu um Erro."});
                await members.insertLog(`Administrador ${req.user.fullname} Apagou o Associado Nº${number} da Plataforma.`);
                return res.status(200).json({message: "Utilizador Apagado com Sucesso."});
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.get('/getAllLogs', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            await sqlQuery('SELECT * FROM logs', [], async (err, results) => {
                if (err) return res.status(500).json({message: "Ocorreu um Erro: "+err});
                return res.status(200).json(results);
            });
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/pedidoAssociado', async(req,res) => {
    try {
        const {pessoal, associado} = req.body;
        const sent = await members.sendNewAssociatedEmail({pessoal, associado});
        if (!sent) return res.status(500).json({message: "Ocorreu um Erro."});
        return res.status(200).json({message: "Pedido Enviado com Sucesso."});
    } catch (error) {
        return res.status(500).json({message: "Ocorreu um Erro: "+error});
    }
})

module.exports = api;