/*  #################################### *
 *  ########### APP/EXPRESS ############ *
 *  #################################### */

const express = require('express');
const app = express();
var jwt = require('jsonwebtoken');
const SECRET = require('./config.json').SECRET;

const classRoutes = require('./api/routes/class.js');

app.use('/class', classRoutes);

/* Trying to access root domain will 
return link for creating access link to chat. */

app.get('/', async function (req, res) {
    return res.status(200).send({message: 'Generate a new chat accessing: https://' + req.headers['host'] + '/class/link' });
});


/* Receives the access link to chat
and validate if the link is correct 
and is not expired. */

app.get('/class/:token', async function (req, res) {

    jwt.verify(req.params.token, SECRET, function(err, decoded) {
        
        if (err) return res.status(200).send({error: 1, result: false, message: 'Failed to authenticate token.' });
        
        res.sendFile(`${__dirname}/public/pod/chat/index.html`);
    });
});

/* Redirec server to serve files in public directory. */

app.use(express.static(__dirname + '/public'));

module.exports = app;