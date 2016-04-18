/**
 * The electron sample apps provided a good basis for the functionality in this file
 * https://github.com/hokein/electron-sample-apps/blob/master/mini-code-edit/editor.js
 */

'use strict';

const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const dialog = remote.require('electron').dialog;
const path = require("path");

var themelist = ace.require("ace/ext/themelist");
var arrayOfThemeNames = [];

for (var i = 0; i < themelist.themes.length ; i++) {
  arrayOfThemeNames[i] = themelist.themes[i].name;
}

var editors = [];
var tab_counter = 0;
var current_editor;
var current_theme;

var default_theme = "ace/theme/tomorrow_night";


/**
 * Should be called when the 'open file' menu option is selected
 *
 * See https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
 * for information on how the dialog works
 */
function handleFileOpenClicked() {
    dialog.showOpenDialog({properties: ['openFile'], title: "Choose file to open"}, function(filename) {
        if (filename) {
            if (editors.length < 1) {
                // No editors are open, new one must be created
                handleNewClicked();
            }
            // If a file was selected, open it in editor
            current_editor.readFileIntoEditor(filename.toString());
            // Set tab title to filename
            setCurrentTabTitle(path.basename(filename))
        }
    });
}

/**
 * Opens dialog allowing user to choose file to save to
 */
function handleFileSaveAsClicked() {
    if (editors.length < 1) {
        // No editors are open, so nothing to save
        return;
    }
    dialog.showSaveDialog({title: "Choose where to save file"}, function(filename) {
        if (filename) {
            current_editor.fileEntry = filename;
            // If a file was selected, save file to it
            current_editor.writeEditorDataToFile();
            // Set tab title to filename
            setCurrentTabTitle(path.basename(filename))
        }
    });
}

/**
 * Sets the title of the currently selected tab to the provided string
 *
 * @param {String} title
 */
function setCurrentTabTitle(title) {
    $('#tabs .ui-tabs-active a').text(title);
}

/**
 * Saves the file currently in editor
 */
function handleSaveClicked() {
    if (editors.length < 1) {
        // No editors are open, so nothing to save
        return;
    }
    if (current_editor.fileEntry) {
        current_editor.writeEditorDataToFile();
    } else {
        // Handle case where this is a new file and so a file on disk must be chosen before saving
        handleFileSaveAsClicked();
    }
}

function handleNewClicked() {
    // Find the tabs div
    var tabsElement = $('#tabs');
    var tabsUlElement = tabsElement.find('ul');

    // Increment the counter used for unique id
    tab_counter += 1;
    var tabUniqueId = "editor_" + tab_counter;

    // Create a navigation bar item for the new panel
    var newTabNavElement = $('<li id="panel_nav_' + tabUniqueId + '"><a href="#editor_' + tabUniqueId + '">new file</a></li>');

    // Add the new nav item to the DOM
    tabsUlElement.append(newTabNavElement);

    // Create the editor dom
    var newEditorElement = $('<div id="editor_' + tabUniqueId + '"></div>');
    tabsElement.append(newEditorElement);

    // Initialize the editor in the tab
    editor = Editor('editor_' + tabUniqueId)

    // set the default theme
    editor.setTheme(default_theme);
    
    // Refresh the tabs widget
    tabsElement.tabs('refresh');

    var tabIndex = $('#tabs ul li').index($('#panel_nav_' + tabUniqueId));

    // Activate the new tab
    tabsElement.tabs('option', 'active', tabIndex);

    newEditorElement.height("90%");
    // Resize the editor
    editor.resize();
    editor.focus();

    editors.push(editor);
    // When a new editor is created, it gets focus, so it it the current editor
    current_editor = editor;
}


// Defines the menu structure
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+n',
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

// find the id of the menu as it differs in OSX, linux
function findMenuIndex(menuLabel) {
    for (var i = 0; i < template.length; i++) {
        if(template[i].label === menuLabel){
            return i;
        }
    }
}

// add the themes to the preferences menu
function addThemes(label) {
  template[findMenuIndex("Preferences")].submenu[0].submenu.push(
    {
      label: label, // the label is 'Theme'
      click: function() {
        current_theme = "ace/theme/" + label;
        for (var i = 0; i < editors.length; i++) {
            editors[i].setTheme(current_theme);
        }
      }
    }
  );
}

// get all the themes available
for (var i = 0; i < arrayOfThemeNames.length; i++) {
    addThemes(arrayOfThemeNames[i]);
}

// build the menu
var menu = Menu.buildFromTemplate(template);

// Set the menu
Menu.setApplicationMenu(menu);

