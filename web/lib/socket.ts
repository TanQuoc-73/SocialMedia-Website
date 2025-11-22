import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: {
            token: `Bearer ${token}`,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
        console.log('Socket.IO connected:', socket?.id);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Socket event helpers
export const emitSocketEvent = (event: string, data: any, callback?: (response: any) => void): void => {
    if (socket && socket.connected) {
        socket.emit(event, data, callback);
    } else {
        console.warn('Socket not connected');
    }
};

export const onSocketEvent = (event: string, handler: (...args: any[]) => void): void => {
    if (socket) {
        socket.on(event, handler);
    }
};

export const offSocketEvent = (event: string, handler?: (...args: any[]) => void): void => {
    if (socket) {
        if (handler) {
            socket.off(event, handler);
        } else {
            socket.off(event);
        }
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    emitSocketEvent,
    onSocketEvent,
    offSocketEvent,
};
