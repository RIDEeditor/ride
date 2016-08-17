"use strict";

const electron = require("electron");
const {ipcMain} = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const childProcess = require("child_process");
const path = require("path");
const appDir = path.dirname(require.main.filename);
var termProc;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let railsdbWindow;
let railsDbPrc;

let chatWindow;
let visualisationWindow;

const request = require("request");

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minHeight: 600,
    minWidth: 1100,
    fullscreenable: true
  });

  setupTerminal();

  // Load the index.html of the app.
  mainWindow.loadURL(path.join("file://", __dirname, "/index.html"));

  // Maximize the window
  mainWindow.maximize();

  ipcMain.on("launch-chat",function(event){
    createChatWindow();
    chatWindow.show();
  });

  ipcMain.on("launch-visualisation", function(event, result, dialogTitle) {
    ipcMain.once("visualisation-ready", function(event) {
      // Send svg image to visualisation window
      event.sender.send('svg', result);
    });
    visualisationWindow = new BrowserWindow({
      title: dialogTitle,
      width: 800,
      height: 600,
      fullscreenable: true,
    });
    // Load window location
    visualisationWindow.loadURL(path.join("file://", __dirname, "/js/visualisation/index.html"));
    visualisationWindow.setMenu(null);
    visualisationWindow.show();
    visualisationWindow.maximize();
  });

  ipcMain.on("launch-rails-db", function(event, arg) {
    // Start rails_db
    railsDbPrc = launchRailsDb(arg);

    railsDbPrc.on("error", function(err) {
      if (err.code === "ENOENT") {
        // Rails_db command not found - should warn user
        electron.dialog.showErrorBox("title", "rails_db not found");
      }
    });

    railsDbPrc.stdout.on("data", function(data) {
      console.log(data.toString());
    });

    railsDbPrc.stderr.on("data", function(data) {
      console.log(data.toString());
    });

    createRailsdbWindow();
    railsdbWindow.show();

    // Wait 5 seconds and check if rails_db has loaded in window
    // If it hasn't refresh window, wait 1 second
    // Repeat until rails_db is loaded
    setTimeout(invokeAndProcessResponse, 5000);
    function invokeAndProcessResponse() {
      request("http://0.0.0.0:12345/rails/db", function(error, response, body) {
        if (!error && response.statusCode === 200) {
          railsdbWindow.reload();
          console.log("SUCCESSFULL");
        } else {
          console.log("ping");
          setTimeout(invokeAndProcessResponse, 1000);
        }
      });
    }
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (railsDbPrc) {
      // destroy _db process if it is running
      railsDbPrc.kill("SIGTERM");
    }
    if (railsdbWindow) {
      // Close db window if it's not yet been closed
      railsdbWindow.close();
    }
    if (termProc) {
      // Destory terminal process if it is running
      termProc.destroy();
    }
    railsdbWindow = null;
    mainWindow = null;
    app.quit();
  });
}

function createChatWindow(isNew){
  chatWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  });

  // TODO set menu to null to hide it
  //chatWindow.setMenu(null);

  chatWindow.loadURL(path.join("file://", __dirname, "/js/p2p/index.html"));
  chatWindow.on("closed", function() {
  });
}



function createRailsdbWindow() {
  railsdbWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  });

  railsdbWindow.setMenu(null);

  railsdbWindow.loadURL(path.join("file://", __dirname, "/js/rails_db/rails_db.html"));
  railsdbWindow.on("closed", function() {
    if (railsDbPrc) {
      railsDbPrc.kill("SIGTERM");
    }
    // Dereference the window object
    railsdbWindow = null;
  });
}

function launchRailsDb(projectLocation) {
  var prc = childProcess.spawn(path.join(appDir, "rails_db", "bin", "rails_db"), {stdio: "pipe", cwd: projectLocation}, function(error, stdout, stderr) {
    if (error === null) {
      console.log(stdout.toString());
    } else {
      console.log(error);
    }
  });
  return prc;
}

function setupTerminal() {
  var http = require("http");
  var express = require("express");
  var io = require("socket.io");
  var pty = require("ptyw.js");
  var terminal = require("term.js");

  /**
   * term.js
   */
  process.title = "term.js";

  /**
   * Dump
   */
  var stream;
  if (process.argv[2] === "--dump") {
    stream = require("fs").createWriteStream(path.join(__dirname, "dump.log"));
  }

  /**
   * Open Terminal
   */
  var buff = [];
  var socket;
  var term;

  term = pty.fork(process.env.SHELL || "sh", [], {
    name: require("fs").existsSync("/usr/share/terminfo/x/xterm-256color") ? "xterm-256color" : "xterm",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME
  });

  termProc = term;

  term.on("data", function(data) {
    if (stream) stream.write("OUT: " + data + "\n-\n");
    return !socket ? buff.push(data) : socket.emit("data", data);
  });

  console.log("Created shell with pty master/slave pair (master: %d, pid: %d)", term.fd, term.pid);

  /**
   * App & Server
   */
  var app = express();
  var server = http.createServer(app);

  app.use(function(req, res, next) {
    var setHeader = res.setHeader;
    res.setHeader = function(name) {
      switch (name) {
        case "Cache-Control":
        case "Last-Modified":
        case "ETag":
          return;
      }
      return setHeader.apply(res, arguments);
    };
    next();
  });

  app.use(express.static(__dirname));
  app.use(terminal.middleware());

  if (process.argv.indexOf("-n") !== -1) {
    server.on("connection", function(socket) {
      var address = socket.remoteAddress;
      if (address !== "127.0.0.1" && address !== "::1") {
        try {
          socket.destroy();
        } catch (e) {

        }
        console.log("Attempted connection from %s. Refused.", address);
      }
    });
  }

  server.listen(8000);
  console.log("listening");

  /**
   * Sockets
   */
  io = io.listen(server, {
    log: false
  });

  io.sockets.on("connection", function(sock) {
    socket = sock;

    socket.on("data", function(data) {
      if (stream) stream.write("IN: " + data + "\n-\n");
        // console.log(JSON.stringify(data));
      term.write(data);
    });

    socket.on("terminal-resize", function(size) {
      term.resize(size.cols, size.rows);
      socket.emit("terminal-resize", size);
    });

    socket.on("disconnect", function() {
      socket = null;
    });

    while (buff.length) {
      socket.emit("data", buff.shift());
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", function() {
  createMainWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    if (termProc) {
      termProc.destroy();
    }
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

