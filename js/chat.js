"use strict";

const {ipcRenderer} = require("electron");

class Chat {

  sendConnectChatEvent(){
  	ipcRenderer.send("launch-chat", false);
  }

   sendNewChatEvent(){
  	ipcRenderer.send("launch-chat", true);
  }

}

exports.Chat = Chat;
