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
const walk = require('fs-walk');

var arrayOfThemeNames = [];
var ThemeList = ace.require("ace/ext/themelist");
for (var i = 0; i < ThemeList.themes.length ; i++) {
  arrayOfThemeNames[i] = ThemeList.themes[i].name;
}

var current_editor;
var current_theme;

/**
 * Should be called when the 'open file' menu option is selected
 *
 * See https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
 * for information on how the dialog works
 */
function handleFileOpenClicked() {
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], title: "Choose file to open"}, function(filenames) {
        for (var i in filenames) {
            // TODO check if this file is already open. If so, jump to that tab, rather than open the file again
            // Also, if the current editor is blank (user hasn;t typed anything), then open the file in this editor,
            // instead of creating a new tab
            handleNewClicked();
            // If a file was selected, open it in editor
            current_editor.readFileIntoEditor(filenames[i].toString());
        }
    });
}

/**
 * Should be called when the 'open directory' menu option is selected
 *
 */
function handleDirectoryOpenClicked() {
    dialog.showOpenDialog({properties: ['openDirectory'], title: "Choose directory to open"}, function(dirname) {
        if (dirname) {
            // Open directory in treeview
            var root_node_id = $("#treeview").jstree('create_node',  "#", buildNode(dirname.toString(), "directory"), 'first');
            recurseTree(root_node_id, dirname);
        }
    });
}

function recurseTree(root_node, directory) {
    walk.walk(directory.toString(), function(basedir, filename, stat, next) {
        // Check if is a file or directory
        var full_path = path.join(basedir, filename);
        var stats = fs.lstatSync(full_path);
        if (stats.isDirectory()) {
            // Recurse into directory
            var root_node_id = $("#treeview").jstree('create_node', root_node, buildNode(filename, full_path, "directory"), 'last');
            recurseTree(root_node_id, full_path);
        } else {
            var root_node_id = $("#treeview").jstree('create_node', root_node, buildNode(filename, full_path, "file"), 'last');
        }
    }, function(err) {
        if (err) console.log(err);
    });
}

function buildNode(name_string, full_path, type) {
    var icon = "";
    if (type == "file") {
        icon = "css/file.png";
    } else {
        icon = "css/directory.png";
    }
    var node = {
        "text": name_string,
        "data": full_path,
        "type": type,
        "icon": icon
    }
    return node;
}


/**
 * Opens dialog allowing user to choose file to save to
 */
function handleFileSaveAsClicked() {
    if (Object.keys(TabsList).length < 1) {
        // No editors are open, so nothing to save
        return;
    }
    dialog.showSaveDialog({title: "Choose where to save file"}, function(filename) {
        if (filename) {
            current_editor.fileEntry = filename;
            // If a file was selected, save file to it
            current_editor.writeEditorDataToFile();
            // Set tab title to filename
            setCurrentTabTitle(path.basename(filename));
        }
    });
}

/**
 * Sets the title of the currently selected tab to the provided string
 *
 * @param {String} title
 */
function setCurrentTabTitle(new_title) {
    tab_bar.updateTab(current_editor.tab, {title: new_title});
}

/**
 * Saves the file currently in editor
 */
function handleSaveClicked() {
    if (Object.keys(TabsList).length < 1) {
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
    new Tab("untitled");
}


// Defines the menu structure
var menu_template = [
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
        label: 'Open Directory',
        click: handleDirectoryOpenClicked
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
  menu_template.unshift({
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

function findMenuIndex(menuLabel) {
    for (var i = 0; i < menu_template.length; i++) {
        if(menu_template[i].label === menuLabel){
            return i;
        }
    }
}

/**
 * Function that is executed when a theme is selected
 * Iterates through all editors and sets their theme to the one selected
 */
function addThemes(label) {
  menu_template[findMenuIndex("Preferences")].submenu[0].submenu.push(
    {
      label: label,
      click: function() {
        current_theme = "ace/theme/" + label;
        // A single editor instance is used, so only need to set theme on it
        editor.setTheme(current_theme);
      }
    }
  );
}

for (var i = 0; i < arrayOfThemeNames.length; i++) {
    addThemes(arrayOfThemeNames[i]);
}

var menu = Menu.buildFromTemplate(menu_template);

// Set the menu
Menu.setApplicationMenu(menu);

