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
var arrayOfThemeNames = [];

for (var i = 0; i < themelist.themes.length ; i++) {
  arrayOfThemeNames[i] = themelist.themes[i].name;
}

var editors = [];
var tab_counter = 0;
var current_editor;
var current_theme;

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

function handleNewClicked() {
    console.log('add a tab with an ace editor instance');

    var tabsElement = $('#tabs');
    var tabsUlElement = tabsElement.find('ul');

    tab_counter += 1;
    console.log(tab_counter);

    // the panel id is a timestamp plus a random number from 0 to 10000
    var tabUniqueId = "editor_" + tab_counter;

    // create a navigation bar item for the new panel
    var newTabNavElement = $('<li id="panel_nav_' + tabUniqueId + '"><a href="#editor_' + tabUniqueId + '">new file</a></li>');

    // add the new nav item to the DOM
    tabsUlElement.append(newTabNavElement);

    // create the editor dom
    var newEditorElement = $('<div id="editor_' + tabUniqueId + '"></div>');

    tabsElement.append(newEditorElement);

    // initialize the editor in the tab
    editor = Editor('editor_' + tabUniqueId)
    
    // refresh the tabs widget
    tabsElement.tabs('refresh');

    var tabIndex = $('#tabs ul li').index($('#panel_nav_' + tabUniqueId));

    console.log('tabIndex: ' + tabIndex);

    // activate the new tab
    tabsElement.tabs('option', 'active', tabIndex);

    newEditorElement.height("100%");
    // resize the editor
    editor.resize();

    editors.push(editor);
}


// Defines the menu structure
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        role: 'new',
        click: handleNewClicked
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

function findMenuIndex(menuLabel){
  //console.log("template is " + template[5].label);
  for (var i = 0; i < template.length; i++) {
    if(template[i].label === menuLabel){
      return i;
    }
  }
}

function addThemes(label){
  template[findMenuIndex("Preferences")].submenu[0].submenu.push(
    {
      label: label,
      click: function() {
        current_theme = "ace/theme/" + label;
        for (var i = 0; i < editors.length; i++) {
            editors[i].setTheme(current_theme);
        }
      }
    }
  );
}

for (var i = 0; i < arrayOfThemeNames.length; i++) {
  addThemes(arrayOfThemeNames[i]);
}

var menu = Menu.buildFromTemplate(template);

// Set the menu
Menu.setApplicationMenu(menu);


