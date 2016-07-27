"use strict";

const {ipcRenderer} = require("electron");

class Chat {

  sendChatEvent(){
  	ipcRenderer.send("launch-chat");
  }

}

exports.Chat = Chat;