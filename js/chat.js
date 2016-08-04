"use strict";

const {ipcRenderer} = require("electron");

class Chat {

  sendNewChatEvent() {
    ipcRenderer.send("launch-chat");
  }

}

exports.Chat = Chat;
