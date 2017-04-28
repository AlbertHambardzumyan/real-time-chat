"use strict";

const mongodb = require('mongodb').MongoClient,
    client = require('socket.io').listen(9000).sockets;

const whiteSpaceRegEx = /^\s*$/;


function _sendStatus(socket, msg) {
    socket.emit('status', msg);
}


mongodb.connect('mongodb://127.0.0.1/chat', (err, db) => {
    if (err) throw err;
    const messagesCollection = db.collection('messages');

    client.on('connection', (socket) => {
        console.log(`Socket id: ${socket.id}`);

        // Emit All messages
        messagesCollection.find().limit(50).sort({_id: 1}).toArray(function (err, res) {
            if (err) throw err;
            socket.emit('message', res);
        });


        // Wait for input
        socket.on('data', (data) => {
            console.log(`Received data: ${JSON.stringify(data)}`);

            const name = data.name,
                message = data.message;

            if (whiteSpaceRegEx.test(name) || whiteSpaceRegEx.test(message)) {
                _sendStatus(socket, "Both name & message required!");
            }
            else {
                messagesCollection.insert({name: name, message: message}, (err) => {
                    if (err)
                        _sendStatus(socket, "Server Internal Error!");
                    else {
                        _sendStatus(socket, {message: 'Message sent!', clear: true});

                        // Emit last message to All Clients
                        client.emit('message', [data]);
                    }
                });
            }
        });
    });
});
