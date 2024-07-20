import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsernameContext } from '../contexts/UsernameContext';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {});


const Username = () => {
    const [localUsername, setLocalUsername] = useState('1234');
    const [error, setError] = useState('');
    const { setUsername } = useContext(UsernameContext);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('usernameError', (errorMessage) => {
            setError(errorMessage);
        });

        return () => {
            socket.off('usernameError');
        };
    }, []);

    const handleUserConnect = () => {
        if (localUsername.trim() !== '') {
            setUsername(localUsername);
            socket.emit('userConnect', localUsername);
            navigate('/rooms');
        } else {
            alert('Please enter a username');
        }
    };

    return (
        <div>
            <h2>Join Chat</h2>
            <input
                type="text"
                placeholder="Username"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
            />
            <button onClick={handleUserConnect}>Join</button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Username;
