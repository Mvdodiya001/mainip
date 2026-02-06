import socketIO from 'socket.io-client';

const server = 'http://localhost:8000';
const socket = socketIO.connect(server, { transports: ['websocket'] });

socket.on('disconnect', () => {
    console.log('Disconnected');
});

export {socket};