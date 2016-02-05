'use strict';

var $ = require('jquery');
var ko = require('knockout');
var io = require('socket.io-client');
var template = require('./templates').chat;

var socket = io();

function ChatModel(params) {
  this.sendMessage = this.sendMessage.bind(this);
}

ChatModel.prototype.sendMessage = function() {
  socket.emit('chat message', { 
    roomId: window.context.roomId, 
    userId: window.context.userId,
    message: $('#m').val() 
  }, function(res) {
    // $('#chat-messages').append($('<li>').text(res));
  });
  $('#m').val('');
  return false;  
};

module.exports = {
  viewModel: ChatModel,
  template: template
};