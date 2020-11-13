/*  #################################### *
 *  ############# SERVER ############### *
 *  #################################### */

const https = require('https');
const app = require('./app.js');
var jwt = require('jsonwebtoken');
const fs = require('fs');
const httpsPort = process.env.PORT || 443;
const SECRET = require('./config.json').SECRET;

/* Install you SSL permissions here. 
privkey.pem, fullchain.pem and chain.pem. */

const options = {
    key: fs.readFileSync(`.../privkey.pem`),
    cert: fs.readFileSync(`.../fullchain.pem`),
    ca: fs.readFileSync(`.../chain.pem`)
};

const httpsServer = https.createServer(options, app).listen(httpsPort, function () {
    console.log("Server is now listening... Port: " + httpsPort);
});

/* Implementation of addHours() function to
Date class to simplify adding or subtracting hours. */

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

var io = require('socket.io')(httpsServer);
let lastSender = '';

io.on('connection', (socket) => {
    
    socket.addedUser = false;

    /* If user was never added to room, so it is added.
    Also saves to socket object some information like
    room and username. 
    
    Returns: source, that works as idenfier.
    time, the time the user entered the room. 
    numUsers, the number of users inside the room. 
    show, informs to show username in chat message. 
    
    It sends these information to users in room. */

    socket.on('room', (data) => {

        jwt.verify(data.token, SECRET, function (err, decoded) {

            if (err) return res.status(200).send({ error: 1, result: false, message: 'Failed to authenticate token.' });

            socket.room = decoded.room;
            socket.join(decoded.room);
            socket.username = data.username;
            data.source = socket.id;

            let date = new Date().addHours(-3);
            data.time = `${date.getHours()}:${date.getMinutes()}`;
            
            data.numUsers = io.sockets.adapter.rooms[socket.room].length;
            data.show = true;
            
            io.sockets.in(socket.room).emit('joined', data);
        });
    });

    /* Receives text message from user. 
    Attachs to it some information like:
    id, identifier of the message.
    username,
    time, 
    ip, sender ip,
    source, indentifier of the socket, 
    show, it reffers to show username in chat message.
    type, indicates if it is text or image.

    It sends these information to users in room. */

    socket.on('message', (msg) => {

        let date = new Date().addHours(-3);
        msg.id = new Date().getTime();
        msg.username = socket.username;
        msg.time = `${date.getHours()}:${date.getMinutes()}`;
        msg.ip = socket.handshake.address;
        msg.source = socket.id;
        msg.show = true;
        msg.type = 'text';

        if (lastSender == msg.source){msg.show = false}
        lastSender = msg.source;
        
        io.sockets.in(socket.room).emit('chat', msg);

    });

    
   /* Receives image message from user. 
    Attachs to it some information like:
    id, identifier of the message.
    username,
    time, 
    ip, sender ip,
    source, indentifier of the socket, 
    show, it reffers to show username in chat message.
    type, indicates if it is text or image.
    
    It sends these informations to users in room. */

    socket.on('image', (msg) => {

        let date = new Date().addHours(-3);
        msg.id = new Date().getTime();
        msg.username = socket.username;
        msg.time = `${date.getHours()}:${date.getMinutes()}`;
        msg.ip = socket.handshake.address;
        msg.source = socket.id;
        msg.show = true;
        msg.type = 'image';

        if (lastSender == msg.source){msg.show = false}
        lastSender = msg.source;

        io.sockets.in(socket.room).emit('chat', msg);

    });

    /* Receives requisition to delete specific message.
    
    It sends this information to users in room. */

    socket.on('delMessage', (data) => {
        if(data.source == socket.id){
            io.sockets.in(socket.room).emit('delMessage', data);
        }

    });

    /* Receives disconnection message.
    
    It sends this information to users in room. */

    socket.on('disconnect', () => {

        let date = new Date().addHours(-3);
        let data = {};
        data.time = `${date.getHours()}:${date.getMinutes()}`;
        data.username = socket.username;
        data.numUsers = (io.sockets.adapter.rooms[socket.room] != undefined ? io.sockets.adapter.rooms[socket.room].length : 0);
        data.source = socket.id;
        data.show = true;

        io.sockets.in(socket.room).emit('disconnected', data);
    });

    /* Receives user is typing information.
    
    It sends this information to users in room. */

    socket.on('typing', (req) => {
        io.sockets.in(socket.room).emit('typing', { username: socket.username, source: socket.id});
    });

    /* Receives user has stopped typing information.
    
    It sends this information to users in room. */

    socket.on('stopTyping', () => {
        io.sockets.in(socket.room).emit('stopTyping', { username: socket.username, source: socket.id });
    });
});

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

