/**
 * Created by witwolf on 1/5/16.
 */


var start = function(port){
    var express = require('express');
    var app = express()
    var http = require('http').Server(app);

    app.get('/',function(request,response){
        response.sendFile(__dirname + '/index.html');
    });

    app.use('/bower_components',express.static(__dirname + '/bower_components'));
    app.use('/css',express.static(__dirname + '/css'));
    app.use('/js',express.static(__dirname + '/js'));
    app.use('/images',express.static(__dirname + '/images'));

    http.listen(port,function(){
       console.log('listening on *:' + port);
    });

}

exports.start = start;