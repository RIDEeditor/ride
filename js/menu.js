/**
 * The electron sample apps provided a good basis for the functionality in this file
 * https://github.com/hokein/electron-sample-apps/blob/master/mini-code-edit/editor.js
 */

'use strict';

const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const fs = require("fs");
const dialog = remote.require('electron').dialog;

var themelist = ace.require("ace/ext/themelist");
//console.log(themelist.themes);
var arrayOfThemeNames = [];

for (var i = 0; i < themelist.themes.length ; i++) {
  arrayOfThemeNames[i] = themelist.themes[i].name;
}

console.log(arrayOfThemeNames);



/**
 * Should be called when the 'open file' menu option is selected
 *
 * See https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
 * for information on how the dialog works
 */
function handleFileOpenClicked() {
    dialog.showOpenDialog({properties: ['openFile'], title: "Choose file to open"}, function(filename) {
        if (filename) {
            // If a file was selected, open it in editor
            readFileIntoEditor(filename.toString());
        }
    });
}

/**
 * Opens dialog allowing user to choose file to save to
 */
function handleFileSaveAsClicked() {
    dialog.showSaveDialog({title: "Choose where to save file"}, function(filename) {
        if (filename) {
            // If a file was selected, save file to it
            writeEditorDataToFile(filename.toString());
            if (!fileEntry) {
                // If editor current path is not set, set it
                fileEntry = filename;
            }
        }
    });
}


/**
 * Saves the file currently in editor
 */
function handleSaveClicked() {
    if (fileEntry) {
        writeEditorDataToFile(fileEntry);
    } else {
        // handle case where this is a new file and so a file on disk must be chosen before saving
        handleFileSaveAsClicked();
    }
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
        click: handleSaveClicked
      },
      {
        label: 'Save as',
        accelerator: 'Shift+CmdOrCtrl+s',
        click: handleFileSaveAsClicked
      },
      {
        type: 'separator'
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+o',
        click: handleFileOpenClicked
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
  {
    label: 'Preferences',
    role: 'preferences',
    submenu: [
      {
        label: 'Themes',
        submenu: [

        ]
      },
    ]
  },

];

// Mac OSX menu integration
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
}

var menu = Menu.buildFromTemplate(template);

// Set the menu
Menu.setApplicationMenu(menu);

