require('dotenv').config();
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10, // adjust based on your needs
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

pool.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.error('Reconnecting due to lost connection:', err);
  }
});

module.exports = pool;
