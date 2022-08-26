#!/usr/bin/env node

//WS init
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 4000});

//Reqs for RabbitMQ consumer
const amqplib = require('amqplib/callback_api');
const queue = 'alert';

wss.on('connection', function connection(ws) {
    wss.on('connection', function connection(ws, req) {
        const ip = req.socket.remoteAddress;
        console.log(ip + " connected!")
    });

});

//Broadcast to all clients
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};

//RabbitMQ Listener
amqplib.connect('amqp://localhost', (err, conn) => {
    if (err) throw err;
    conn.createChannel((err, ch2) => {
        if (err) throw err;
        ch2.assertQueue(queue);
        ch2.consume(queue, (msg) => {
            if (msg !== null) {
                wss.broadcast(msg.content.toString());
                console.log(msg.content.toString());
                ch2.ack(msg);
            } else {
                console.log('message was null');
                ch2.ack(msg);

            }
        });
    });
});
