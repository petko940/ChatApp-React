// const express = require('express');
// const path = require('path');
// const app = express();
// const http = require('http').createServer(app);
// const cors = require('cors');
// const { Server } = require('socket.io');

// const PORT = process.env.PORT || 3000;

// // const allowedOrigins = ['http://localhost:5173', 'https://chat-app-react-client-jet.vercel.app/'];
// const allowedOrigins = ['https://chat-app-react-client-seven.vercel.app', 'http://localhost:5173'];

// app.use(cors({
//     origin: allowedOrigins,
//     credentials: true
// }));

// const io = new Server(http, {
//     cors: {
//         origin: allowedOrigins,
//         methods: ['GET', 'POST'],
//         credentials: true
//     }
// });

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// let connectedUsers = {};

// let rooms = {
//     'general': [],
//     'room1': [],
//     'room2': []
// };

// const messageHistory = {
//     'general': [],
//     'room1': [],
//     'room2': []
// };

// const MAX_MESSAGES_PER_ROOM = 1500;

// const emitConnectedUsers = () => {
//     const users = Object.values(connectedUsers).map(user => user.username);
//     io.emit('connectedUsers', users);
// };

// const emitUsersInRoom = (room) => {
//     const usersInRoom = Object.values(connectedUsers)
//         .filter(user => user.room === room)
//         .map(user => user.username);
//     io.to(room).emit('usersInRoom', usersInRoom);
// };

// io.on('connection', (socket) => {
//     emitConnectedUsers();

//     socket.on('userConnect', (username) => {
//         if (!username) {
//             console.error('Username is required');
//             return;
//         };

//         for (let id in connectedUsers) {
//             if (connectedUsers[id].username === username) {
//                 socket.emit('usernameError', 'Username is already taken');
//                 return;
//             };
//         };

//         connectedUsers[socket.id] = { username, room: null };

//         console.log(`User ${username} connected with ID: ${socket.id}`);
//         console.log(connectedUsers);

//         io.emit('userConnected', username);
//         emitConnectedUsers();
//     });

//     socket.on('joinRoom', (username, room) => {
//         let targetSocketId;
//         for (let socketId in connectedUsers) {
//             if (connectedUsers[socketId].username === username) {
//                 targetSocketId = socketId;
//                 break;
//             };
//         };

//         connectedUsers[targetSocketId] = { username, room };
//         socket.join(room);
//         rooms[room].push(username);

//         console.log(`${username} has joined the ${room} room`);

//         socket.emit('messageHistory', messageHistory[room]);
//         io.to(room).emit('userJoinedRoom', { username, room });
//         emitUsersInRoom(room);
//     });

//     socket.on('leaveRoom', (username, room) => {
//         let targetSocketId;
//         for (let socketId in connectedUsers) {
//             if (connectedUsers[socketId].username === username) {
//                 targetSocketId = socketId;
//                 break;
//             };
//         };

//         socket.leave(room);
//         rooms[room] = rooms[room].filter(user => user !== username);
//         io.to(room).emit('userLeftRoom', username);

//         connectedUsers[targetSocketId].room = null;
//         console.log(`${username} has left ${room}`);

//         // clear message history if room is empty
//         if (rooms[room].length === 0 && room !== 'general') {
//             console.log(`Clearing message history for room ${room}`);
//             messageHistory[room] = [];
//         };

//         emitUsersInRoom(room);
//         emitConnectedUsers();
//     });

//     socket.on('sendMessage', (message, username, roomId) => {
//         const newMessage = { username, message, timestamp: new Date().toISOString() };
//         messageHistory[roomId].push(newMessage);

//         if (messageHistory[roomId].length > MAX_MESSAGES_PER_ROOM) {
//             messageHistory[roomId].shift();
//         };

//         io.to(roomId).emit('newMessage', newMessage);
//     });

//     socket.on('disconnect', () => {
//         const user = connectedUsers[socket.id];
//         if (user) {
//             const room = user.room;
//             if (room) {
//                 rooms[room] = rooms[room].filter(username => username !== user.username);
//                 io.to(room).emit('userLeftRoom', user.username);
//             };

//             console.log(`User ${user.username} has disconnected`);
//             delete connectedUsers[socket.id];
//             console.log(connectedUsers);
//             socket.broadcast.emit('userLeft', user.username);

//             emitUsersInRoom(room);
//             emitConnectedUsers();
//         }
//     });
// });

// http.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });


const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const Ably = require('ably');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const ABLY_API_KEY = process.env.ABLY_API_KEY;
console.log(ABLY_API_KEY);
// Initialize Ably
const ably = new Ably.Realtime(ABLY_API_KEY);

// Define allowed origins for CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173/'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

let connectedUsers = {};

let rooms = {
    'general': [],
    'room1': [],
    'room2': []
};

const messageHistory = {
    'general': [],
    'room1': [],
    'room2': []
};

const MAX_MESSAGES_PER_ROOM = 1500;

const emitConnectedUsers = () => {
    const users = Object.values(connectedUsers).map(user => user.username);
    ably.channels.get('connectedUsers').publish('update', users);
};

const emitUsersInRoom = (room) => {
    const usersInRoom = Object.values(connectedUsers)
        .filter(user => user.room === room)
        .map(user => user.username);
    ably.channels.get(room).publish('usersInRoom', usersInRoom);
};

// Event Handlers
const handleUserConnect = (username, clientId) => {
    if (!username) {
        console.error('Username is required');
        return;
    }

    for (let id in connectedUsers) {
        if (connectedUsers[id].username === username) {
            ably.channels.get('errors').publish('usernameError', 'Username is already taken');
            return;
        }
    }

    connectedUsers[clientId] = { username, room: null };

    console.log(`User ${username} connected with ID: ${clientId}`);
    console.log(connectedUsers);

    ably.channels.get('userConnected').publish('connect', username);
    emitConnectedUsers();
};

const handleJoinRoom = (username, room, clientId) => {
    connectedUsers[clientId] = { username, room };
    rooms[room].push(username);

    console.log(`${username} has joined the ${room} room`);

    ably.channels.get(room).publish('messageHistory', messageHistory[room]);
    ably.channels.get(room).publish('userJoinedRoom', { username, room });
    emitUsersInRoom(room);
};

const handleLeaveRoom = (username, room, clientId) => {
    rooms[room] = rooms[room].filter(user => user !== username);

    ably.channels.get(room).publish('userLeftRoom', username);

    connectedUsers[clientId].room = null;
    console.log(`${username} has left ${room}`);

    // Clear message history if room is empty
    if (rooms[room].length === 0 && room !== 'general') {
        console.log(`Clearing message history for room ${room}`);
        messageHistory[room] = [];
    }

    emitUsersInRoom(room);
    emitConnectedUsers();
};

const handleSendMessage = (message, username, roomId) => {
    const newMessage = { username, message, timestamp: new Date().toISOString() };
    messageHistory[roomId].push(newMessage);

    if (messageHistory[roomId].length > MAX_MESSAGES_PER_ROOM) {
        messageHistory[roomId].shift();
    }

    ably.channels.get(roomId).publish('newMessage', newMessage);
};

const handleDisconnect = (clientId) => {
    const user = connectedUsers[clientId];
    if (user) {
        const room = user.room;
        if (room) {
            rooms[room] = rooms[room].filter(username => username !== user.username);
            ably.channels.get(room).publish('userLeftRoom', user.username);
        }

        console.log(`User ${user.username} has disconnected`);
        delete connectedUsers[clientId];
        console.log(connectedUsers);
        ably.channels.get('userLeft').publish('disconnect', user.username);

        emitUsersInRoom(room);
        emitConnectedUsers();
    }
};

// Ably Channel Subscriptions
ably.connection.on('connected', () => {
    console.log('Connected to Ably');
    ably.connection.clientId = 'server'; // Set a unique clientId for the server

    ably.channels.get('userConnect').subscribe((message) => handleUserConnect(message.data.username, message.clientId));
    ably.channels.get('joinRoom').subscribe((message) => handleJoinRoom(message.data.username, message.data.room, message.clientId));
    ably.channels.get('leaveRoom').subscribe((message) => handleLeaveRoom(message.data.username, message.data.room, message.clientId));
    ably.channels.get('sendMessage').subscribe((message) => handleSendMessage(message.data.message, message.data.username, message.data.roomId));
    ably.channels.get('disconnect').subscribe((message) => handleDisconnect(message.clientId));
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
