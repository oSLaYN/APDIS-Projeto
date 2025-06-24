/* Requirements */
require('dotenv').config();
const port = process.env.APP_PORT;
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const apis = {
    auth: require('./api/auth'),
    documents: require('./api/documents'),
    members: require('./api/members')
}

app.use('/documents', express.static(path.join(__dirname, '/documents')));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: `http://localhost:${port}`,
    credentials: true
}));

/* WEB */
app.get('/', function(req, res) { res.sendFile(path.join(__dirname, '/web/index.html')) });
app.get('/associado', function(req, res) { res.sendFile(path.join(__dirname, '/web/associado.html')) });
app.get('/profile', function(req, res) { res.sendFile(path.join(__dirname, '/web/profile.html')) });
app.get('/request', function(req, res) { res.sendFile(path.join(__dirname, '/web/requests/request.html')) });
app.get('/login', function(req, res) { res.sendFile(path.join(__dirname, '/web/auth/login.html')) });
app.get('/register', function(req, res) { res.sendFile(path.join(__dirname, '/web/auth/register.html')) });
app.get('/recover-password', function(req, res) { res.sendFile(path.join(__dirname, '/web/auth/password/recover.html')) });
app.get('/create-password', function(req, res) { res.sendFile(path.join(__dirname, '/web/auth/password/create.html')) });
app.get('/admin', function(req, res) { res.sendFile(path.join(__dirname, '/web/admin/index.html')) });
app.get('/admin/registers', function(req, res) { res.sendFile(path.join(__dirname, '/web/admin/users/registos.html')) });
app.get('/admin/members', function(req, res) { res.sendFile(path.join(__dirname, '/web/admin/users/membros.html')) });
app.get('/admin/requests', function(req, res) { res.sendFile(path.join(__dirname, '/web/admin/requests/manage.html')) });
app.get('/admin/logs', function(req, res) { res.sendFile(path.join(__dirname, '/web/admin/logs.html')) });
app.get('/404', function(req, res) { res.sendFile(path.join(__dirname, '/web/404.html')) });

/* API */
Object.keys(apis).forEach((key, index) => {
    app.use(`/api/${key}`, apis[key]); 
});

/* ASSETS */
app.use('/logo', function(req, res) { res.sendFile(path.join(__dirname, '/web/assets/logo.png')) });
app.use('/script', function(req, res) { res.sendFile(path.join(__dirname, '/web/assets/script.js')) });


app.use((req, res) => {
    res.redirect('/404');
}); 


/* ON LOAD */
app.listen(port, () => { console.log(`APDIS > http://localhost:${port}`) });