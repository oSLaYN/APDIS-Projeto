const express = require('express');
const app = express();
const util = require('util');
const sql = require('./pool');
const mail = require('../modules/mail');
const sqlQuery = util.promisify(sql.query).bind(sql);
var functions = {};

functions.approveMember = async(data) => {
    try {
        const result = await sqlQuery(`DELETE FROM requests WHERE id=? AND number=?`, [data.id, data.number]);
        if (result.affectedrows == 0) return false;
        const token = await mail.generateToken();
        try {
            const result = await sqlQuery(`INSERT INTO users (number, fullname, email, password, type, ip, resettoken) VALUES (?,?,?,?,?,?,?)`, [data.number, data.fullname, data.email, null, 'user', null, token]);
            if (result.affectedrows == 0) return false;
            await mail.sendApprovedAssociatedEmail(data, token);
            return true;
        } catch (error) {
            console.error("Error: "+error);
            return false;
        }
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
};

functions.rejectMember = async(data) => {
    try {
        const result = await sqlQuery(`DELETE FROM requests WHERE id=? AND number=?`, [data.id, data.number]);
        if (result.affectedrows == 0) return false;
        await mail.sendRejectedAssociatedEmail(data);
        return true;
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
};

functions.ChangeMemberType = async(id, number, type) => {
    try {
        const result = await sqlQuery(`UPDATE users SET type = ? WHERE id = ? AND number = ?`, [type, id, number]);
        if (result.affectedrows == 0) return false;
        return true;
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
};

functions.removeMember = async(id, number) => {
    try {
        const result = await sqlQuery(`DELETE FROM users WHERE id = ? AND number = ?`, [id, number]);
        if (result.affectedrows == 0) return false;
        return true;
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
};

functions.insertLog = async(description) => {
    try {
        const result = await sqlQuery('INSERT INTO logs (description, moment) VALUES (?, NOW())', [description]);
        if (result.affectedrows == 0) return false;
        return true;
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
};

functions.sendNewAssociatedEmail = async(data) => {
    try {
        await mail.sendNewAssociatedEmail(data);
        return true;
    } catch (error) {
        console.error("Error: "+error);
        return false;
    }
}

module.exports = functions;