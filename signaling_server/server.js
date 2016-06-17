values = function (obj) {
    var vals = [];
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            vals.push(obj[key]);
        }
    }
    return vals;
};

var start = function (port) {

    var app = require('express')()
    var http = require('http').Server(app);
    var io = require('socket.io')(http);
    var iceServers = require('./config/conf').iceServers;

    app.get('/', function (request, response) {
        response.sendFile(__dirname + '/index.html');
    });


    var users = {}; // socket.id => user
    var sockets = {}; // socket.id => socket

    io.on('connection', function (socket) {

        // user get online
        // send all the other user list
        // broadcast to all the others

        var user = {name: socket.handshake.query.name, id: socket.id};
        var userList = values(users);
        userList.unshift(user);
        users[user.id] = user;
        sockets[user.id] = socket;

        console.log('user get online : ' + user.name + ',' + user.id);

        socket.emit('initial', {
            user_list: userList,
            iceServers: iceServers
        });
        socket.broadcast.emit('new_user_online', user);

        // signal
        socket.on('signal', function (signal) {
            var receiver = signal.receiver;
            if (sockets.hasOwnProperty(receiver)) {
                sockets[receiver].emit('signal', signal);
            }

        });

        // user get offline , broadcast to all the other
        socket.on('disconnect', function () {
            if (users.hasOwnProperty(socket.id)) {
                socket.broadcast.emit('user_offline', users[socket.id]);
                console.log('user get offline :' + user.name + ',' + user.id)
                delete users[socket.id];
                delete sockets[socket.id];
            }
        });


    });

    http.listen(port, function () {
        console.log('listening on *:' + port);
    });
}


exports.start = start;

