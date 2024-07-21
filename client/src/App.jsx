import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css'
import Chat from './components/Chat'
import ConnectedUsers from './components/ConnectedUsers';
import Username from './components/Username';
import RoomSelector from './components/RoomSelector';
import { UsernameContext } from './contexts/UsernameContext';
import { useContext, useEffect } from 'react';
import Notification from './components/Notification';

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
            {username
                && <>
                    <h1 className='text-2xl font-bold text-center pt-2'>Welcome, {username}</h1>
                </>
            }

            {!isChatRoute && (
                <div className='flex justify-center gap-20 pt-14 h-[70%]'>
                    <ConnectedUsers />
                    <Routes>
                        <Route path="/" element={<Username />} />
                        <Route path="/rooms" element={<RoomSelector />} />
                        <Route path="/chat/:roomId" element={<Chat />} />
                        <Route path='*' element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            )}

            {isChatRoute && <Chat />}
            <Chat />
            <Notification />
        </>
    )
}

export default App;
