const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const { log } = require('console');

app.use(cors({ origin: 'http://localhost:5173' }));

const io = new Server(http, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(express.static('public'));

let connectedUsers = {};
let messageHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected!');
    const emitConnectedUsers = () => {
        const users = Object.values(connectedUsers).map(user => user.username);
        io.emit('connectedUsers', users);
    };

    emitConnectedUsers();

    socket.on('joinChat', (username) => {
        // TODO check edit
        if (!username) {
            console.error('Username is required');
            return;
        }

        for (let id in connectedUsers) {
            if (connectedUsers[id].username === username) {
                socket.emit('usernameError', 'Username is already taken');
                return;
            }
        }
        connectedUsers[socket.id] = { username };
        console.log(`User ${username} joined the chat`);

        socket.emit('chatHistory', messageHistory);
        socket.broadcast.emit('userJoined', username);
        emitConnectedUsers(); 
    });

    socket.on('sendMessage', (message) => {
        const user = connectedUsers[socket.id];
        if (!user) {
            console.error('User not found for socket ID:', socket.id);
            return;
        }
        const timestamp = new Date().toISOString();
        const newMessage = { username: user.username, message, timestamp };
        messageHistory.push(newMessage);
        if (messageHistory.length > 100) { // TODO check edit
            messageHistory.shift();
        }
        io.emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
        const user = connectedUsers[socket.id];
        if (user) {
            socket.broadcast.emit('userLeft', user.username);
            console.log(`${user.username} has left the chat`);
            delete connectedUsers[socket.id];
            emitConnectedUsers(); 
        }

    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
