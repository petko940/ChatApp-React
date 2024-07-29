import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsernameContext } from '../contexts/UsernameContext.jsx';
import { io } from 'socket.io-client';
import { Input } from 'antd';
import { ConnectedUsersContext } from '../contexts/ConnectedUsersContext';
import { SOCKET_URL } from '../config.js';

const socket = io(SOCKET_URL,
    {
        transports: ['websocket'],
        withCredentials: true
    }
);

const JoinChat = () => {
    const [localUsername, setLocalUsername] = useState('');
    const [error, setError] = useState('');
    const { connectedUsers } = useContext(ConnectedUsersContext);
    const { setUsername } = useContext(UsernameContext);
    const navigate = useNavigate();

    const handleUserConnect = (event) => {
        event.preventDefault();
        for (let user of connectedUsers) {
            if (localUsername === user) {
                setError('Username already in use');
                return;
            }
        }

        if (localUsername.trim() !== '') {
            setUsername(localUsername);
            setError('');
            socket.emit('userConnect', localUsername);
            navigate('/rooms');

        } else {
            alert('Please enter a username');
        }
    };

    return (
        <div className='w-1/4 max-sm:w-1/2'>
            <h1 className='text-2xl text-white text-center font-bold pb-1'>Enter Username</h1>

            <form onSubmit={handleUserConnect}>
                <Input
                    size="large"
                    placeholder="Username"
                    className='p-3 pl-7 placeholder:text-black'
                    onChange={(e) => setLocalUsername(e.target.value)}
                    value={localUsername}
                    maxLength={30}
                />

                <button
                    className='text-white text-center border-2 w-full p-2 mt-3'
                >
                    Join
                </button>
            </form>
            {error && <p className='text-red-500 text-center'>{error}</p>}
        </div>
    );
};

export default JoinChat;
