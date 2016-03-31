'use strict';

const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const fs = remote.require('fs');
const dialog = remote.require('electron').dialog;;

function openFileDialog() {
    var file = dialog.showOpenDialog()[0];
    console.log("File: '" + file + "' selected");
    loadFile(file);
}

function loadFile(fileName) {
fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, "r", function(error, fd) {
                var buffer = new Buffer(stats.size);

                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString("utf8", 0, buffer.length);

                    // Load data into editor
                    editor.setValue(data);
                    setFileType(fileName);
                    fs.close(fd);
                });
            });
        });
    }
});
}

// Defines the menu structure
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        role: 'new',
        submenu: [
          {
            label:  'Project',
            accelerator: 'Shift+CmdOrCtrl+p',
          }
        ]
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+s',
        role: 'save'
      },
      {
        label: 'Save as',
        accelerator: 'Shift+CmdOrCtrl+s',
        role: 'save_as'
      },
      {
        type: 'separator'
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+o',
        click: openFileDialog
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
      },
    ]
  },
];

// Mac OSX maenu integration
if (process.platform == 'darwin') {
  var name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });

  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

var menu = Menu.buildFromTemplate(template);

// Set the menu
Menu.setApplicationMenu(menu);

