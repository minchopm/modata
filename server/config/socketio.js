/**
 * Socket.io configuration
 */
'use strict';

// When the user disconnects.. perform this
function onDisconnect(socket) {
}

/*
 var ps = require('ps-node');

 // A simple pid lookup
 ps.lookup({
 command: 'node',
 arguments: '--debug',
 }, function(err, resultList ) {
 if (err) {
 throw new Error( err );
 }

 resultList.forEach(function( process ){
 if( process ){

 console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
 }
 });
 });
 */

var exec = require('child_process').exec;
// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', data => {
    socket.log(JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/pid/pid.socket').register(socket);
  require('../api/thing/thing.socket').register(socket);

}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (socketio) {

  var initConnection;
  require('../socketClient').default(socketio, (data)=> {
    initConnection = data;
  });

  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {
    socket.address = socket.request.connection.remoteAddress +
      ':' + socket.request.connection.remotePort;

    socket.connectedAt = new Date();

    socket.log = function (...data) {
      console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    var getTasks = function () {

      let info = [{
        "imageName": "System Idle Process",
        "PID": "0",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "0"
      }, {
        "imageName": "System",
        "PID": "4",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "4"
      }, {
        "imageName": "smss.exe",
        "PID": "532",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "532"
      }, {
        "imageName": "csrss.exe",
        "PID": "684",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "684"
      }, {
        "imageName": "wininit.exe",
        "PID": "796",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "796"
      }, {
        "imageName": "csrss.exe",
        "PID": "804",
        "sessionName": "Console",
        "session": "1",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "804"
      }, {
        "imageName": "services.exe",
        "PID": "872",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "872"
      }, {
        "imageName": "lsass.exe",
        "PID": "880",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "880"
      }, {
        "imageName": "svchost.exe",
        "PID": "984",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "984"
      }, {
        "imageName": "svchost.exe",
        "PID": "384",
        "sessionName": "Services",
        "session": "0",
        "memUsage": getRandomIntInclusive(0, 100) + " K",
        "button": "384"
      }];

      socket.emit('pid:save', {info})
    };
    setInterval(getTasks, 1500);

    // Call onDisconnect.
    socket.on('disconnect', () => {
      onDisconnect(socket);
      socket.log('DISCONNECTED');
    });

    // Call onConnect.
    initConnection.sendPersonalData(socket);
    onConnect(socket);
    socket.log('CONNECTED');
  });
}
