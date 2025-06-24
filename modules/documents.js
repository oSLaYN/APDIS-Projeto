const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const util = require('util');
const sql = require('./pool');
const sqlQuery = util.promisify(sql.query).bind(sql);
const multer = require('multer');
const pdf2doi = require("./pdf2doi.js");
const doi2bib = require('doi2bib');
var functions = {};

pdf2doi.verbose = true;

const publicDir = path.join(__dirname, '../documents');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, publicDir); },
    filename: (req, file, cb) => { cb(null, 'APDIS_' + file.originalname); }
});

functions.upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|docx|pptx|doc|txt/;
        const extname = filetypes.test(path.extname('APDIS_' + file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Ficheiro inválido. Tipos aceites: ' + filetypes));
    }
});

functions.Upload = async(id, associado, file, documentDOI, documentData) => {
    try {
        const result = await sqlQuery('UPDATE documents SET accepted=?, documentName=?, documentDOI=?, documentData=? WHERE id=?', [associado, 'APDIS_'+file.originalname, documentDOI, documentData, id]);
        return (result.affectedRows > 0);
    } catch (error) {
        return false;
    }
};

functions.Download = async(id) => {
    const results = await sqlQuery('SELECT documentName FROM documents WHERE id=?', [id]);
    if (!results[0] || results.length === 0) { return false; }
    return (results[0]);
};

functions.getDOI = async (filePath) => {
    try {    
        const doi = await pdf2doi.fromFile(filePath);
        if (doi && doi.doi) {
            const citation = await doi2bib.getCitation(doi.doi);
            return citation;
        }
        return null;
    } catch (error) {
        console.error("An Error Occurred:", error);
        throw error;
    }
};

module.exports = functions;