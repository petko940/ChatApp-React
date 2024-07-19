import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {});

const ConnectedUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('connectedUsers', (users) => {
            setUsers(users);
        });

        socket.on('userJoined', (username) => {
            console.log(`${username} has joined the chat`);
        });

        socket.on('userLeft', (username) => {
            console.log(`${username} has left the chat`);
        });

        return () => {
            socket.off('connectedUsers');
            socket.off('userJoined');
            socket.off('userLeft');
        };
    }, []);

    return (
        <>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-bold'>Connected Users</h1>
                <ul>
                    {users.map((user) => (
                        <li key={user}>{user}</li>
                    ))}
                </ul>
            </div>
        </>
    )

};

export default ConnectedUsers;