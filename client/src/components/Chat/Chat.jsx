import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { UsernameContext } from '../../contexts/UsernameContext.jsx';
import { useNavigate } from 'react-router-dom';
// import { ConnectedUsersContext } from '../contexts/ConnectedUsersContext.jsx';
import Notification from '../Notification.jsx';
import UsersInRoom from './UsersInRoom.jsx';

const socket = io('http://localhost:3000');

function Chat() {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const { username } = useContext(UsernameContext);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [notification, setNotification] = useState();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

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
            };
        };

        const handleUserJoinedRoom = (userJoinRoom) => {
            if (userJoinRoom.username !== username) {
                setNotification(`${userJoinRoom.username} joined the room`);
            };
        };

        const handleUserLeftRoom = (userLeftRoom) => {
            setUsersInRoom(prevUsers => prevUsers.filter(user => user !== userLeftRoom));
            if (userLeftRoom !== username) {
                setNotification(`${userLeftRoom} left the room`);
            };
        };

        socket.on('usersConnected', handleUserJoinedChat);
        socket.on('userLeft', handleUserLeftChat);
        socket.on('userJoinedRoom', handleUserJoinedRoom);
        socket.on('userLeftRoom', handleUserLeftRoom);

        socket.on('usersInRoom', (users) => {
            setUsersInRoom(users);
        });

        socket.on('messageHistory', (history) => {
            setMessages(history);
        });

        socket.on('newMessage', (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = (event) => {
        event.preventDefault();
        const message = event.target.message.value;
        socket.emit('sendMessage', message, username, roomId);
        event.target.message.value = '';
    };

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

                    <div className='bg-slate-300 w-[70%] flex flex-col'>
                        <div className='flex justify-between'>
                            room name
                            <button
                                className='bg-red-500 p-1 w-8 h-7'
                                onClick={handleDisconnect}
                            >
                                X
                            </button>
                        </div>

                        <hr className='w-full my-4 border-b'/>

                        <div className='flex flex-col-reverse flex-grow overflow-y-auto p-2'>
                            <div className='flex flex-col'>
                                {messages.map((message, index) => (
                                    <div key={index}>
                                        {message.username} - {message.message}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage}
                            className='flex items-center p-2 border-t border-gray-400'>
                            <input
                                name="message"
                                id="message"
                                type="text"
                                className='p-2 flex-grow border border-gray-300 rounded mr-2'
                                placeholder="Type your message..."
                            />
                            <button type='submit' className='bg-blue-500 text-white p-2 rounded'>
                                Send
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;