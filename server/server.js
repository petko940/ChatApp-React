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
let messageHistory = []; // Array to store chat messages

io.on('connection', (socket) => {
    console.log('A user connected!');

    socket.on('joinChat', (username) => {
        if (!username) {
            console.error('Username is required');
            return;
        }
        // Check if username is already taken
        for (let id in connectedUsers) {
            if (connectedUsers[id].username === username) {
                socket.emit('usernameError', 'Username is already taken');
                return;
            }
        }
        connectedUsers[socket.id] = { username };
        console.log(`User ${username} joined the chat`);
        socket.emit('chatHistory', messageHistory); // Send message history to the new user
        socket.broadcast.emit('userJoined', username);
    });

    socket.on('sendMessage', (message) => {
        const user = connectedUsers[socket.id];
        if (!user) {
            console.error('User not found for socket ID:', socket.id);
            return;
        }
        const timestamp = new Date().toISOString();
        const newMessage = { username: user.username, message, timestamp };
        messageHistory.push(newMessage); // Save the message to history
        if (messageHistory.length > 100) {
            messageHistory.shift(); // Remove the oldest message if the array exceeds 100 messages
        }
        io.emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
        const user = connectedUsers[socket.id];
        if (user) {
            socket.broadcast.emit('userLeft', user.username);
            console.log(`${user.username} has left the chat`);
            delete connectedUsers[socket.id];
        }
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
