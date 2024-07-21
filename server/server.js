const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');

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
let rooms = {
    'room1': [],
    'room2': [],
    'room3': []
}

io.on('connection', (socket) => {
    const emitConnectedUsers = () => {
        const users = Object.values(connectedUsers).map(user => user.username);
        io.emit('connectedUsers', users);
    };

    emitConnectedUsers();

    socket.on('userConnect', (username) => {
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
        console.log(`User ${username} has joined`);
        io.emit('userJoined', username);
        emitConnectedUsers();
    });

    socket.on('joinRoom', (username, room) => {
        // TODO check edit
        // if (!username) {
        //     console.error('Username is required');
        //     return;
        // }

        // for (let id in connectedUsers) {
        //     if (connectedUsers[id].username === username) {
        //         socket.emit('usernameError', 'Username is already taken');
        //         return;
        //     }
        // }
        connectedUsers[socket.id] = { username, room };
        console.log(room);
        socket.join(room);
        rooms[room].push(username);
        console.log(`${username} has joined the ${room} room`);

        socket.emit('chatHistory', messageHistory);
        socket.broadcast.emit('userJoinedRoom', username);
        emitConnectedUsers();
    });

    socket.on('sendMessage', ({ message, room }) => {
        const user = connectedUsers[socket.id];
        // if (!user) {
        //     console.error('User not found for socket ID:', socket.id);
        //     return;
        // }
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