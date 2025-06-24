const express = require('express');
const app = express();
const util = require('util');
const sql = require('./pool');
const jwt = require('jsonwebtoken');
const jwtVerify = util.promisify(jwt.verify);
const sqlQuery = util.promisify(sql.query).bind(sql);
const passwordValidator = require('password-validator');
var functions = {};

functions.isAuthorized = async(token, req) => {
    if (!token) return false;

    try {
        const decoded = await jwtVerify(token, 'apdis');
        const user = await sqlQuery('SELECT number, fullname, email, type FROM users WHERE number=? AND email=?', [decoded.associado, decoded.email]);
        if (!user) return false;
        req.user = { associado: user[0].number, fullname: user[0].fullname, email: user[0].email, type: user[0].type };
        return true;
    } catch (error) {
        return false;
    }
};

functions.createToken = async(associado, fullname, email, type) => {
    try {
        const token = jwt.sign(
            {
                associado: associado,
                fullname: fullname,
                email: email,
                type: type
            },
            "apdis",
            { expiresIn: "1h" }
        )
        return token;
    } catch (err) {
        throw err;
    }
};

const passwordSchema = new passwordValidator();
passwordSchema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits().has().symbols().has().not().spaces();
async function isPasswordStrong(password) {
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  return strongRegex.test(password);
}

functions.TestPassword = async(password) => {
    if (!passwordSchema.validate(password) || !isPasswordStrong(password)) return false;
    return true;
}

module.exports = functions;