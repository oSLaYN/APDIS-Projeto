const express = require('express');
const app = express();
const sql = require('./pool');
var functions = {}

functions.getUserIP = async () => {
    let data;
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            console.error('Failed to fetch IP details');
            return null;
        }
        data = await response.json();
    } catch (e) {
        console.error('Error fetching IP details:', e);
    }
    return data;
}

functions.registerAccess = async (associado, data) => {
    sql.query(`UPDATE users SET ip=? WHERE number=?`, [data.ip, associado])
    console.log(`> Associado Nº${associado} Acedeu ao Website Com Novo IP: ${data.ip} - ${data.org} (${data.asn}) From ${data.city}, ${data.region}, ${data.country_name}`);
}

module.exports = functions;