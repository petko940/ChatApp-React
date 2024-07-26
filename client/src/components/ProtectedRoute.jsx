import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UsernameContext } from '../contexts/UsernameContext';

const ProtectedRoute = ({ children }) => {
    const { username } = useContext(UsernameContext);

    if (!username) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
