import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { UsernameContext } from '../../contexts/UsernameContext.jsx';
import { useNavigate } from 'react-router-dom';
// import { ConnectedUsersContext } from '../contexts/ConnectedUsersContext.jsx';
import Notification from '../Notifications/Notification.jsx';
import UsersInRoom from './UsersInRoom.jsx';
import Messages from './Messages.jsx';

const socket = io('http://localhost:3000');

function Chat() {
    const { roomId } = useParams();
    // const [username, setUsername] = useState('');
    // const [messages, setMessages] = useState([]);
    // const [currentMessage, setCurrentMessage] = useState('');
    // const [isConnected, setIsConnected] = useState(false);
    const { username } = useContext(UsernameContext);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [notification, setNotification] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('joinRoom', username, roomId);

        const handleUserJoinedChat = (userJoinChat) => {
            if (userJoinChat !== username) {
                setNotification(`${userJoinChat} joined chat`);
            };
        };

        const handleUserLeftChat = (userLeftChat) => {
            if (userLeftChat !== username) {
                setNotification(`${userLeftChat} left chat`);
            }
        };

        const handleUserJoinedRoom = (userJoinRoom) => {
            if (userJoinRoom.username !== username) {
                setNotification(`${userJoinRoom.username} joined the room`);
            }
        };

        const handleUserLeftRoom = (userLeftRoom) => {
            setUsersInRoom(prevUsers => prevUsers.filter(user => user !== userLeftRoom));
            if (userLeftRoom !== username) {
                setNotification(`${userLeftRoom} left the room`);
            }
        };

        socket.on('usersConnected', handleUserJoinedChat);
        socket.on('userLeft', handleUserLeftChat);
        socket.on('userJoinedRoom', handleUserJoinedRoom);
        socket.on('userLeftRoom', handleUserLeftRoom);

        socket.on('usersInRoom', (users) => {
            setUsersInRoom(users);
        });

        // TODO: do 
        socket.on('newMessage', (message) => {
            if (message.room === roomId) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off('joinRoom');
            socket.off('usersConnected');
            socket.off('userLeft');
            socket.off('userJoinedRoom');
            socket.off('userLeftRoom');
            socket.off('usersInRoom');
            socket.off('newMessage');
        };
    }, [roomId, username]);

    const handleDisconnect = () => {
        socket.emit('leaveRoom', username, roomId);
        setUsersInRoom(users => users.filter(user => user !== username));
        navigate('/rooms');
    };

    return (
        <>
            <Notification
                message={notification}
            />
            <div className='w-4/5 mx-auto text-white'>
                <div className='flex h-[85vh]'>
                    <UsersInRoom users={usersInRoom} />

                    <div className='bg-slate-300 w-[70%] flex justify-between'>
                        <Messages />
                        <button
                            className='bg-red-500 p-1 w-8 h-7'
                            onClick={handleDisconnect}
                        >
                            X
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;
