// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:3000', {});

// const ConnectedUsers = () => {
//     const [users, setUsers] = useState([]);

//     // useEffect(() => {
//     //     socket.on('connectedUsers', (users) => {
//     //         setUsers(users);
//     //     });

//     //     socket.on('userJoined', (username) => {
//     //         console.log(`${username} has joined the chat`);
//     //     });

//     //     socket.on('userLeft', (username) => {
//     //         console.log(`${username} has left the chat`);
//     //     });

//     //     return () => {
//     //         socket.off('connectedUsers');
//     //         socket.off('userJoined');
//     //         socket.off('userLeft');
//     //     };
//     // }, []);

//     useEffect(() => {
//         // Ensure socket connection
//         if (!socket.connected) {
//             socket.connect();
//         }

//         // Listen for the connected users list
//         socket.on('connectedUsers', (users) => {
//             setUsers(users);
//             console.log('Connected users:', users);
//         });

//         // Log user join and leave events
//         socket.on('userJoined', (username) => {
//             console.log(`${username} has joined the chat`);
//             // Optionally, update the users list or fetch again
//             socket.emit('getConnectedUsers');
//             console.log('Connected users:', users);
//         });

//         socket.on('userLeft', (username) => {
//             console.log(`${username} has left the chat`);
//             // Optionally, update the users list or fetch again
//             socket.emit('getConnectedUsers');
//         });

//         // Clean up event listeners on unmount
//         return () => {
//             socket.off('connectedUsers');
//             socket.off('userJoined');
//             socket.off('userLeft');
//             socket.disconnect();
//         };
//     }, []);

//     return (
//         <>
//             <div className='flex flex-col'>
//                 <h1 className='text-2xl font-bold'>Connected Users</h1>
//                 <ul>
//                     {users.map((user) => (
//                         <li key={user}>{user}</li>
//                     ))}
//                 </ul>
//             </div>
//         </>
//     )

// };

// export default ConnectedUsers;

import { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Notification from './Notification';
import { UsernameContext } from '../contexts/UsernameContext';
const socket = io('http://localhost:3000');

const ConnectedUsers = () => {
    const [users, setUsers] = useState([]);
    const [notification, setNotification] = useState({ message: '', description: '' });
    const { username, setUsername } = useContext(UsernameContext);

    useEffect(() => {
        // Ensure socket connection
        if (!socket.connected) {
            socket.connect();
        }

        // Listen for the connected users list
        socket.on('connectedUsers', (users) => {
            setUsers(users);
            console.log('Connected users:', users);
        });

        socket.on('userJoined', (joinedUsername) => {
            setNotification({
                message: `${joinedUsername} Joined`
            });
        });

        // Log user join and leave events
        socket.on('userJoinedRoom', (username) => {
            console.log(`${username} has joined the chat`);
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

        // socket.on('disconnect', () => {
        //     console.log('Disconnected from server');
        // });

        // Clean up event listeners on unmount
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
            <Notification message={notification.message} description={notification.description} />
            <h1 className='text-2xl text-white font-bold pb-1'>Online Users</h1>
            <hr className='pb-6'/>
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
