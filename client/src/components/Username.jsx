import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsernameContext } from '../contexts/UsernameContext';
import { io } from 'socket.io-client';
import { Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';

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
        <div className='w-1/4'>
            <h1 className='text-2xl text-white text-center font-bold pb-1'>Enter Username</h1>
            {/* <input
                type="text"
                placeholder="Username"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                className='p-3'

            /> */}
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

export default Username;
