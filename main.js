'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const tty = require('tty.js');
var termProc;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        'minHeight': 600,
        'minWidth': 1100,
        'fullscreenable': true
    });

    bootup();

    // Load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Maximize the window
    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        termProc.destroy();
    });

}

function bootup() {
    var http = require('http')
      , express = require('express')
      , io = require('socket.io')
      , pty = require('pty.js')
      , terminal = require('term.js');

    /**
     * term.js
     */
    process.title = 'term.js';

    /**
     * Dump
     */
    var stream;
    if (process.argv[2] === '--dump') {
      stream = require('fs').createWriteStream(__dirname + '/dump.log');
    }

    /**
     * Open Terminal
     */
    var buff = []
      , socket
      , term;

    term = pty.fork(process.env.SHELL || 'sh', [], {
      name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
        ? 'xterm-256color'
        : 'xterm',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME
    });

    termProc = term;

    term.on('data', function(data) {
      if (stream) stream.write('OUT: ' + data + '\n-\n');
      return !socket
        ? buff.push(data)
        : socket.emit('data', data);
    });

    console.log(''
      + 'Created shell with pty master/slave'
      + ' pair (master: %d, pid: %d)',
      term.fd, term.pid);

    /**
     * App & Server
     */
    var app = express(), server = http.createServer(app);

    app.use(function(req, res, next) {
      var setHeader = res.setHeader;
      res.setHeader = function(name) {
        switch (name) {
          case 'Cache-Control':
          case 'Last-Modified':
          case 'ETag':
            return;
        }
        return setHeader.apply(res, arguments);
      };
      next();
    });

    app.use(express.static(__dirname));
    app.use(terminal.middleware());

    if (!~process.argv.indexOf('-n')) {
      server.on('connection', function(socket) {
        var address = socket.remoteAddress;
        if (address !== '127.0.0.1' && address !== '::1') {
          try {
            socket.destroy();
          } catch (e) {
            ;
          }
          console.log('Attempted connection from %s. Refused.', address);
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

    io.sockets.on('connection', function(sock) {
      socket = sock;

      socket.on('data', function(data) {
        if (stream) stream.write('IN: ' + data + '\n-\n');
        //console.log(JSON.stringify(data));
        term.write(data);
      });

        socket.on('terminal-resize', function (size) {
            term.resize(size.cols, size.rows);
            socket.emit('terminal-resize', size);
        });

      socket.on('disconnect', function() {
        socket = null;
      });

      while (buff.length) {
        socket.emit('data', buff.shift());
      }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        termProc.destroy();
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

