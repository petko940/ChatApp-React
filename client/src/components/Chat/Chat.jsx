import { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { UsernameContext } from '../../contexts/UsernameContext.jsx';
import { useNavigate } from 'react-router-dom';
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
        if (message.trim() === '') return;
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
            <div className='flex h-[90vh] w-5/6 mx-auto text-white select-none'>
                <UsersInRoom users={usersInRoom} />

                <div className='bg-slate-300 w-[80%] flex flex-col rounded-r-lg'>
                    <div className='flex justify-between items-center'>
                        <h1 className='pl-2 text-2xl p-2 text-black font-bold'>
                            {roomId[0].toUpperCase() + roomId.slice(1)}
                        </h1>
                        <button
                            onClick={handleDisconnect}
                        >
                            <i className="fa-solid fa-rectangle-xmark text-red-600 text-5xl pr-1"></i>
                        </button>
                    </div>

                    <hr className='w-full border-b' />

                    <div className='flex flex-col-reverse flex-grow overflow-y-auto p-2'>
                        <div className='flex flex-col gap-1 select-none'>
                            {messages.map((message, index) => (
                                message.username === username
                                    ?
                                    <div key={index} className='text-right'>
                                        <span className='text-black'>{message.username}</span>
                                        <span className='break-words leading-10 bg-blue-500 rounded-sm py-2 px-3 ml-1'>{message.message}</span>
                                    </div>
                                    :
                                    <div key={index}>
                                        <span className='break-words leading-10 bg-gray-500 rounded-sm py-2 px-3 mr-1'>{message.message}</span>
                                        <span className='text-black'>{message.username}</span>
                                    </div>

                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form onSubmit={handleSendMessage} autoComplete='off'
                        className='flex items-center p-2 border-t border-gray-400'>
                        <input
                            name="message"
                            id="message"
                            type="text"
                            className='text-black p-2 flex-grow border border-gray-300 rounded mr-2'
                            placeholder="Type message..."
                        />
                        <button type='submit' className='bg-blue-500 text-white p-2 rounded w-20'>
                            Send <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
}

export default Chat;