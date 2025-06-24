const cookieParser = require('cookie-parser');
const express = require('express');
const util = require('util');
const app = express();
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var api = express.Router();
const auth = require('../modules/auth');
const sql = require('../modules/pool');
const sqlQuery = util.promisify(sql.query).bind(sql);
const mail = require('../modules/mail');
const documents = require('../modules/documents');
const members = require('../modules/members');

api.get('/getAllRequests', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        try {
            const results = await sqlQuery(`SELECT d.id, d.description, d.accepted, d.documentName, d.documentDOI, d.documentData, COALESCE(u.fullname, 'Utilizador Desconhecido') as fullname FROM documents d LEFT JOIN users u ON d.requested = u.number`);
            var gotResults = results.map(row => ({
                id: row.id,
                description: row.description,
                requested: row.fullname,
                accepted: row.accepted,
                documentName: row.documentName,
                documentDOI: row.documentDOI,
                documentData: row.documentData,
            }))
            return res.status(200).json(gotResults);
        } catch (error) {
            return res.status(500).json({message: 'An Error Occurred: ' + error});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
})

api.get('/getRequest', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        const id = (req.query && req.query.id ? req.query.id : null);
        if (!id || id==null) { return res.status(400).json({message: 'ID do Pedido Inválido.'}) }
        try {
            const result = await sqlQuery(`SELECT d.id, d.description, COALESCE(u.fullname, "Utilizador Desconhecido") as fullname, d.accepted, d.documentName, d.documentDOI, d.documentData FROM documents d LEFT JOIN users u ON d.requested = u.number WHERE d.id = ?`, [id]);
            return res.status(200).json(result[0]);
        } catch (error) {
            return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
})

api.post('/createRequest', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        const description = (req.body && req.body.description ? req.body.description : null)
        const requested = (req.user && req.user.associado ? req.user.associado : null)
        if (!description || description==null) { res.status(400).json({message: 'Descrição de Pedido Inválida.'}) }
        if (!requested || requested==null) { res.status(400).json({message: 'ID de Associado Inválido.'}) }
        try {
            const createdRequest = await sqlQuery(`INSERT INTO documents (description, requested) VALUES (?,?)`, [description, requested]);
            if (createdRequest.affectedRows == 0) { return res.status(400).json({message: 'Ocorreu um Erro.'}); }
            await members.insertLog(`${req.user.fullname} Nº${req.user.associado} Criou um Novo Pedido com a Descrição ${description}`);
            return res.status(200).json({message: 'Pedido Criado com Sucesso.'});
        } catch (error) {
            return res.status(500).json({message: 'Ocorreu um Erro: ' + error.message});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/acceptRequest', documents.upload.single('file'), async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        try {
            const id = (req.body && req.body.id ? req.body.id : null)
            const file = (req.file ? req.file : null)
            const accepted = (req.user && req.user.associado ? req.user.associado : null)
            if (!id||id==null) { return res.status(400).json({message: 'ID de Pedido Inválido.'}) }
            if (!accepted||accepted==null) { return res.status(400).json({message: 'ID de Associado Inválido.'}) }
            if (!file) { return res.status(400).json({ message: 'Nenhum ficheiro enviado' }); }
            try {
                await fs.promises.readFile(file.path);
            } catch (err) {
                return res.status(500).json({ message: 'Erro ao ler ficheiro do disco.' });
            }
            
            try {
                var documentDOI;
                const toDOIData = await documents.getDOI(file.path);
                if (toDOIData) {
                    documentDOI = toDOIData.split('DOI:')[1].split(',')[0];
                    var documentData;
                    const documentDataFetch = await fetch(`https://api.openalex.org/works/https://doi.org/${documentDOI}`);
                    if (documentDataFetch.ok) {
                        const documentDataFetchGot = await documentDataFetch.json();
                        documentData = {title: documentDataFetchGot.title, authors: documentDataFetchGot.authorships.map(a => a.author.display_name)}
                        documentData = `${documentData.title}; ${documentData.authors.join(', ')}`;
                    }
                }
                const uploaded = await documents.Upload(id, accepted, file, documentDOI, documentData);
                if (!uploaded) return res.status(500).json({message: "Ocorreu um Erro."});
                const result = await sqlQuery('SELECT u.email, d.description FROM users u JOIN documents d ON u.number = d.requested WHERE d.id=?', [id]);
                if (result[0]) { await mail.sendAcceptedRequestEmail({id, email: result[0].email, accepted: req.user.fullname, description: result[0].description}); }
                await members.insertLog(`${req.user.fullname} Aceitou o Pedido Nº${id}`);
                return res.status(200).json({ message: 'Pedido Aceite e Documento Enviado!' });
            } catch (error) {
                return res.status(500).json({message: "Ocorreu um Erro: "+error.message});
            }
        } catch (error) {
            return res.status(500).json({message: "Ocorreu um Erro: "+error.message});
        }
    } else {
        return res.status(400).json({message: 'Não Autorizado.'});
    }
});

api.post('/recoverRequest', async(req,res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const id = (req.body && req.body.id ? req.body.id : null)
            if (!id||id==null) { return res.status(400).json({message: 'ID de Pedido Inválido.'}) }
            try {
                const result = await sqlQuery('UPDATE documents SET accepted=?, documentName=?, documentDOI=?, documentData=? WHERE id=?', [null,null,null,null,id]);
                if (result.affectedRows == 0) { return res.status(500).json({message: "Ocorreu um Erro."}) }
                await members.insertLog(`Administrador ${req.user.fullname} Reverteu o Pedido Nº${id}.`);
                return res.status(200).json({message: "Pedido Revertido com Sucesso."})
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

api.delete('/deleteRequest', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    const isAdmin = (isAuthorized ? (req.user.type == "admin" || req.user.type == "superadmin") : false)
    if (isAuthorized && isAdmin) {
        try {
            const id = (req.body && req.body.id ? req.body.id : null)
            if (!id||id==null) { return res.status(400).json({message: 'ID de Pedido Inválido.'}) }
            try {
                const result = await sqlQuery('DELETE FROM documents WHERE id=?', [id]);
                if (result.affectedRows == 0) { return res.status(500).json({message: "Ocorreu um Erro."})}
                await members.insertLog(`Administrador ${req.user.fullname} Apagou o Pedido Nº${id}.`);
                return res.status(200).json({message: "Pedido Apagado com Sucesso."})
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

api.get('/downloadRequest', async(req, res) => {
    const token = req.cookies?.clientToken
    const isAuthorized = await auth.isAuthorized(token, req);
    if (isAuthorized) {
        try {
            const id = (req.query && req.query.id ? req.query.id : null);
            if (!id || id==null) { res.status(400).json({message: 'ID de Documento Inválido.'}) }
            const document = await documents.Download(id);
            if (!document) return res.status(404).json({message: 'Documento não encontrado'});
            const filePath = path.join(__dirname, '../documents', document.documentName);
            if (!fs.existsSync(filePath))  return res.status(404).json({message: 'Ficheiro não encontrado no servidor'});
            res.setHeader('Content-Disposition', `attachment; filename="${document.documentName}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            return res.status(500).json({message: 'An Error Occurred: ' + error});
        }
    } else {
        return res.status(400).json({message: 'Not Autorized.'});
    }
});

module.exports = api;