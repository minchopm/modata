'use strict';

var Socket;

var personalData = {
  getSocket: function () {
    return Socket;
  },
  sendPersonalData: function (socket, message) {
    if (socket) {
      Socket = socket;
    }
  }
};

module.exports = personalData;
