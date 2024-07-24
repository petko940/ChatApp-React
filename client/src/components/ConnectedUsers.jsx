import { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Notification from './Notification';
import { UsernameContext } from '../contexts/UsernameContext';
import { ConnectedUsersContext } from '../contexts/ConnectedUsersContext';


const socket = io('http://localhost:3000');

const ConnectedUsers = () => {
    const [users, setUsers] = useState([]);
    const { connectedUsers, setConnectedUsers } = useContext(ConnectedUsersContext);
    const [notification, setNotification] = useState({ message: '', description: '' });
    const { username, setUsername } = useContext(UsernameContext);

    useEffect(() => {
        // Ensure socket connection
        // if (!socket.connected) {
        //     socket.connect();
        // };
        socket.connect();

        // Listen for the connected users list
        socket.on('connectedUsers', (users) => {
            setUsers(users);
            setConnectedUsers(users);
            console.log('Connected users:', users);
        });

        socket.on('userConnected', (joinedUsername) => {
            if (joinedUsername !== username) {
                setNotification({
                    message: `${joinedUsername} Joined`
                });
            }
        });

        // Log user join and leave events
        socket.on('userJoinedRoom', (roomUsers) => {
            setUsers(roomUsers);
            setConnectedUsers(roomUsers);
            console.log('Room users:', roomUsers);
        });

        socket.on('userLeftRoom', (username) => {
            console.log(`${username} has left the chat`);
            socket.emit('userLeft');
        });

        socket.on('userLeft', (leftUsername) => {
            console.log(`${leftUsername} has left the chat`);
            setNotification({
                message: `${leftUsername} Left`,
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.off('connectedUsers');
            socket.off('userJoined');
            socket.off('userJoinedRoom');
            socket.off('userLeftRoom');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, []);

    return (
        <div className='flex flex-col border-2 px-16 pt-3'>
            <Notification
                message={notification.message}
                description={notification.description}
            />
            <h1 className='text-2xl text-white font-bold pb-1'>Online Users</h1>
            <hr className='pb-6' />
            <ul>
                {users.map((user) => (
                    <li key={user}
                        className='px-2 text-xl text-slate-50 overflow-auto'
                    >
                        <div className='flex items-center'>
                            <i className="fa-solid fa-circle text-[10px] text-green-500 pr-1"></i>
                            <span className='truncate max-w-[120px]'>{user}</span>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default ConnectedUsers;
