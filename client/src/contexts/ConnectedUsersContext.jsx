import { createContext, useState } from 'react';

export const ConnectedUsersContext = createContext();

export const ConnectedUsersProvider = ({ children }) => {
    const [connectedUsers, setConnectedUsers] = useState([]);

    return (
        <ConnectedUsersContext.Provider value={{ connectedUsers, setConnectedUsers }}>
            {children}
        </ConnectedUsersContext.Provider>
    );
};
