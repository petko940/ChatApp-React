import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css'
import Chat from './components/Chat'
import ConnectedUsers from './components/ConnectedUsers';
import Username from './components/Username';
import RoomSelector from './components/RoomSelector';
import { UsernameContext } from './contexts/UsernameContext';
import { useContext, useEffect } from 'react';

function App() {
    const { username } = useContext(UsernameContext);
    const location = useLocation();
    const navigate = useNavigate();

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

            <div className='flex justify-center gap-36 pt-20'>
                <ConnectedUsers />
                <Routes>
                    <Route path="/" element={<Username />} />
                    <Route path="/rooms" element={<RoomSelector />} />
                    <Route path="/chat/:roomId" element={<Chat />} />
                    <Route path='*' element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    )
}

export default App;
