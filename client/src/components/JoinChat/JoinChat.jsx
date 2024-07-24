import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsernameContext } from '../../contexts/UsernameContext';
import { io } from 'socket.io-client';
import { Input } from 'antd';
import { ConnectedUsersContext } from '../../contexts/ConnectedUsersContext';

const socket = io('http://localhost:3000', {});

const JoinChat = () => {
    const [localUsername, setLocalUsername] = useState('1234');
    const [error, setError] = useState('');
    const { connectedUsers } = useContext(ConnectedUsersContext);
    const { setUsername } = useContext(UsernameContext);
    const navigate = useNavigate();

    const handleUserConnect = () => {
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
        <div className='w-1/4'>
            <h1 className='text-2xl text-white text-center font-bold pb-1'>Enter Username</h1>
            
            <Input
                size="large"
                placeholder="Username"
                className='p-3 pl-7 placeholder:text-red-500 placeholder:text-center'
                onChange={(e) => setLocalUsername(e.target.value)}
                value={localUsername}
                maxLength={30}
            />

            <button
                onClick={handleUserConnect}
                className='text-white text-center border-2 w-full p-2 mt-3'
            >
                Join
            </button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default JoinChat;
