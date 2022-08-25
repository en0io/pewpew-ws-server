const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    perMessageDeflate: false
});
//Reqs for RabbitMQ consumer
const amqplib = require('amqplib/callback_api');
const queue = 'alert';
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});

//RabbitMQ Listener
amqplib.connect('amqp://localhost', (err, conn) => {
    if (err) throw err;
    conn.createChannel((err, ch2) => {
        if (err) throw err;
        ch2.assertQueue(queue);
        ch2.consume(queue, (msg) => {
            if (msg !== null) {
                io.emit('alert', { event_data: msg.content.toString() });
                console.log(msg.content.toString());
                ch2.ack(msg);
            } else {
                console.log('message was null');
            }
        });
    });
});
