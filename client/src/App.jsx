import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css'
import Chat from './components/Chat/Chat';
import ConnectedUsers from './components/ConnectedUsers/ConnectedUsers';
import JoinChat from './components/JoinChat/JoinChat';
import RoomSelector from './components/RoomSelector/RoomSelector';
import { UsernameContext } from './contexts/UsernameContext';
import { useContext, useEffect } from 'react';
import Notification from './components/Notifications/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import { ConnectedUsersProvider } from './contexts/ConnectedUsersContext';

function App() {
    const { username } = useContext(UsernameContext);
    const location = useLocation();
    const navigate = useNavigate();
    const isChatRoute = location.pathname.startsWith('/chat/');

    useEffect(() => {
        if (!username && location.pathname !== '/') {
            navigate('/');
        }
    }, [username, location.pathname]);

    return (
        <>
            <ConnectedUsersProvider>

                {username && (
                    <>
                        <h1 className='text-2xl font-bold text-center pt-2'>Welcome, {username}</h1>
                    </>
                )}

                <div className='flex justify-center gap-20 pt-14 h-[70%]'>
                    {!isChatRoute && <ConnectedUsers />}
                    <Routes>
                        <Route path="/" element={<JoinChat />} />
                        <Route path="/rooms" element={
                            <ProtectedRoute>
                                <RoomSelector />
                            </ProtectedRoute>
                        } />
                        <Route path="/chat/:roomId" element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        } />
                        <Route path='*' element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                <Notification />

            </ConnectedUsersProvider>
        </>
    );

}

export default App;
