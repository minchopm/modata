'use strict';

import {sendPersonalData} from './personalData';

export default function (socketIO, callback) {

  var Sock = require('net');
  var netSocket = Sock.Socket();

  function initConnection() {
    netSocket.connect(5000, "localhost", function () {

      console.log('connecting to: ' + "localhost" + ':' + 5000);
    });
  }

  initConnection();

  callback({sendPersonalData});


  netSocket.on('connect', function () {
    console.log('connected');
    netSocket.write('I am Chuck Norris!');
  });

  netSocket.on('error', function (err) {
    setTimeout(()=> {
      // initConnection();
      Object.keys(socketIO.sockets.sockets).map(function (key) {
        let socket = socketIO.sockets.sockets[key];
        sendPersonalData(socket)
      });
    }, 3000);
    // console.log(arguments);
  });

  netSocket.on('end', function () {
    console.log('socket ended');
    setTimeout(()=> {
      // initConnection();
    }, 100)
  });

  netSocket.on('data', function (data) {
    console.log('recieved ' + data);
    Object.keys(socketIO.sockets.sockets).map(function (key) {
      let socket = socketIO.sockets.sockets[key];
      sendPersonalData(socket, data);
    });
    // netSocket.write('Chuck Norris: I will develop myself to the maximum of my potential in all ways.');
  });
}
