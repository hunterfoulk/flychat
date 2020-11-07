const express = require('express');
const app = express();
const server = require('http').createServer(app);
const ioUtils = require('./utils/socket');


const io = require('socket.io')(server, {
    path: '/socket',
    serveClient: false,
});

const PORT = 8000;

app.get('/test', (req, res, next) => {
    res.send({ message: 'test' });
});

ioUtils.setupIO(io);

server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));