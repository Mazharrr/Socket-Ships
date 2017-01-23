'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const {resolve} = require('path')
const app = express()
const fs = require('fs')
const socketio = require('socket.io');
var server = require('http').createServer(app)


const io = socketio(server);



  module.exports = app
  .use(require('volleyball'))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(resolve(__dirname, 'public')))
  .use(express.static(resolve(__dirname, 'node_modules/phaser/build/')))
  .get('/*', (_, res) => res.sendFile(resolve(__dirname, 'public', 'index.html')))



  server.listen(1337, function () {
      console.log('The server is listening on port 1337!');
  });



var users = [];
var bullets = [];

io.on('connection', function(socket){
    var me = false;

    socket.on('new_player', function(user){
        me = user;

        for (var k in users){
            socket.emit('new_player', users[k]);
        }

        users[me.id] = me;
        socket.broadcast.emit('new_player', user);
    });


    socket.on('move_player', function(user){
        users[me.id] = user;
        socket.broadcast.emit('move_player', user);
    });

    socket.on('fire', function(data){
      io.emit('fire', data)
    })

    socket.on('hit', function(data){
      io.emit('hit', data)
    })


    socket.on('kill_player', function(enemy){
        delete users[enemy.id];
        io.emit('kill_player', enemy);
    });

    socket.on('disconnect', function(){
        if(!me){
            return false;
        }
        delete users[me.id];
        socket.broadcast.emit('logout', me.id);
    });

});


// function randomIntInc (low, high) {
//     return Math.floor(Math.random() * (high - low + 1) + low);
// }
