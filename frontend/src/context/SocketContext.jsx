import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

const SocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userId } = useAuth();

    useEffect(() => {
        if (userId) {
            // Ensure you have this in your frontend .env file
            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

            const newSocket = io(SOCKET_URL, {
                query: { userId } // This sends the userId to the backend socket server
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [userId]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

