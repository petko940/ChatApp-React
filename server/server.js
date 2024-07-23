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

const emitConnectedUsers = () => {
    const users = Object.values(connectedUsers).map(user => user.username);
    io.emit('connectedUsers', users);
};

const emitUsersInRoom = (room) => {
    const usersInRoom = Object.values(connectedUsers)
        .filter(user => user.room === room)
        .map(user => user.username);
    io.to(room).emit('usersInRoom', usersInRoom);
};


io.on('connection', (socket) => {
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

        connectedUsers[socket.id] = { username, room: null };
        console.log(connectedUsers);
        console.log(`User ${username} connected with ID: ${socket.id}`);
        io.emit('userConnected', username);
        emitConnectedUsers();
    });

    socket.on('joinRoom', (username, room) => {
        let targetSocketId;
        for (let socketId in connectedUsers) {
            if (connectedUsers[socketId].username === username) {
                targetSocketId = socketId;
                break;
            };
        }
        console.log("targetSocketId: ", targetSocketId);

        connectedUsers[targetSocketId] = { username, room };
        socket.join(room);
        rooms[room].push(username);

        console.log(`${username} has joined the ${room} room`);

        socket.emit('chatHistory', messageHistory);
        io.to(room).emit('userJoinedRoom', { username, room });
        emitUsersInRoom(room);
    });

    socket.on('leaveRoom', (username, room) => {
        let targetSocketId;
        for (let socketId in connectedUsers) {
            if (connectedUsers[socketId].username === username) {
                targetSocketId = socketId;
                break;
            };
        }

        socket.leave(room);
        rooms[room] = rooms[room].filter(user => user !== username);
        io.to(room).emit('userLeftRoom', username);

        connectedUsers[targetSocketId].room = null;
        console.log(`${username} has left ${room}`);
        console.log(connectedUsers);
        emitUsersInRoom(room);
        console.log(`rooms`, rooms);
        emitConnectedUsers();
    });

    // TODO Edit
    socket.on('sendMessage', ({ message, room }) => {
        const user = connectedUsers[socket.id];
        console.log(user);
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
            const room = user.room;
            if (room) {
                rooms[room] = rooms[room].filter(username => username !== user.username);
                io.to(room).emit('userLeftRoom', user.username);
            }

            console.log(`User ${user.username} has disconnected`);
            delete connectedUsers[socket.id];
            console.log(connectedUsers);
            socket.broadcast.emit('userLeft', user.username);
            emitUsersInRoom(room);

            emitConnectedUsers();
        }
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});