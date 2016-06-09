const remote = require('electron').remote;
const electronMenu = remote.Menu;
const MenuItem = remote.MenuItem;
const walk = require('fs-walk');
const rails = require('./rails-js'); // Note: This path is relative to where we are importing from
// See: https://stackoverflow.com/questions/16652620/node-js-require-cannot-find-custom-module/16652662#16652662


class Menu {
    constructor() {
        this.railsWrapper = new rails.railsWrapper();
        this.arrayOfThemeNames = [];
        this.current_editor = null;
        this.current_theme = null;
        var ThemeList = ace.require("ace/ext/themelist");
        for (var i = 0; i < ThemeList.themes.length ; i++) {
            this.arrayOfThemeNames[i] = ThemeList.themes[i].name;
        }

        // Set the menu
        electronMenu.setApplicationMenu(this.buildMenu.bind(this)());
    }

    buildMenu() {      
        // Defines the menu structure
        var menu_template = [
          {
            label: 'File',
            submenu: [
              {
                label: 'New rails project',
                click: this.generateNewRailsProject.bind(this)
              },
              {
                label: 'New file',
                accelerator: 'CmdOrCtrl+n',
                click: function () {new Tab("untitled");}
              },
              {
                label: 'Save',
                accelerator: 'CmdOrCtrl+s',
                click: this.handleSaveClicked.bind(this)
              },
              {
                label: 'Save as',
                accelerator: 'Shift+CmdOrCtrl+s',
                click: this.handleFileSaveAsClicked.bind(this)
              },
              {
                type: 'separator'
              },
              {
                label: 'Open',
                accelerator: 'CmdOrCtrl+o',
                click: this.handleFileOpenClicked.bind(this)
              },
              {
                label: 'Open Directory',
                click: this.handleDirectoryOpenClicked.bind(this)
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
            label: 'Generate',
            submenu: [
              {
                label: 'New controller',
                click: this.generateNewController.bind(this)
              }
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
                label: 'Show Terminal',
                accelerator: 'Shift+CmdOrCtrl+t',
                click: this.toggleTerminal

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
              {
                label: 'Set Font Size',
                click: function(){console.log(editor.getFontSize()); editor.setFontSize('14')}
              }
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

        var menu = electronMenu.buildFromTemplate(menu_template);
        return menu;
    }


    /**
    * Should be called when the 'open file' menu option is selected
    *
    * See https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
    * for information on how the dialog works
    */
    handleFileOpenClicked() {
        dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], title: "Choose file to open"}, (function(filenames) {
            for (var i in filenames) {
                // TODO check if this file is already open. If so, jump to that tab, rather than open the file again
                // Also, if the current editor is blank (user hasn;t typed anything), then open the file in this editor,
                // instead of creating a new tab
                // If a file was selected, open it in editor
                var evt = new CustomEvent('fileToOpen', { detail: filenames[i].toString() });
                window.dispatchEvent(evt);
            }
        }).bind(this));
    }


    /**
     * Should be called when the 'open directory' menu option is selected
     */
    handleDirectoryOpenClicked() {
        dialog.showOpenDialog({properties: ['openDirectory'], title: "Choose directory to open"}, (function(dirname) {
            if (dirname) {
                // Open directory in treeview
                var evt = new CustomEvent('dirToOpen', { detail: dirname });
                window.dispatchEvent(evt);
            }
        }).bind(this));
    }

    /**
     * Opens dialog allowing user to choose file to save to
     */
    handleFileSaveAsClicked() {
        if (Object.keys(TabsList).length < 1) {
            // No editors are open, so nothing to save
            return;
        }
        dialog.showSaveDialog({title: "Choose where to save file"}, (function(filename) {
            if (filename) {
                current_editor.fileEntry = filename;
                // If a file was selected, save file to it
                current_editor.writeEditorDataToFile();
                // Set tab title to filename
                this.setCurrentTabTitle(path.basename(filename));
            }
        }).bind(this));
    }

    toggleTerminal() {
        var evt = new CustomEvent('toggleTerminal', {});
        window.dispatchEvent(evt);
    }

    /**
     * Sets the title of the currently selected tab to the provided string
     *
     * @param {String} title
     */
    setCurrentTabTitle(new_title) {
        tab_bar.updateTab(current_editor.tab, {title: new_title});
    }

    /**
     * Saves the file currently in editor
     */
    handleSaveClicked() {
        if (Object.keys(TabsList).length < 1) {
            // No editors are open, so nothing to save
            return;
        }
        if (current_editor.fileEntry) {
            current_editor.writeEditorDataToFile();
        } else {
            // Handle case where this is a new file and so a file on disk must be chosen before saving
            this.handleFileSaveAsClicked();
        }
    }

    generateNewRailsProject() {
        // TODO open dialog prompting user for project options
        this.setStatusIndicatorText("Generating new Rails project");
        this.setStatusIconVisibility(true);
        this.setStatusIcon("busy");
        var proc = this.railsWrapper.newProject("asd", "asd", (function(stdout, stderr) {
            // Open new project in file tree
            var evt = new CustomEvent('dirToOpen', { detail: "asd" });
            window.dispatchEvent(evt);
            this.setStatusIcon("done");
            this.setStatusIndicatorText("Done");
        }).bind(this));

        clearDialog();

        // Read from childprocess stdout
        // TODO handle stderr as well
        proc.stdout.on('data', (function(data){
            this.appendToDialogContents(data);
	    }).bind(this));
    }

    generateNewController() {
        // TODO open dialog prompting user for options
        this.railsWrapper.newController("mycontroller");
    }

    setStatusIndicatorText(text) {
        $("#statusIndicatorText").text(text);
    }

    setStatusIconVisibility(shouldShow) {
       $("#statusIndicatorImage").toggle(shouldShow);
    }

    setStatusIcon(icon) {
        if (icon == "busy") {
            $("#statusIndicatorImage").attr("src", "css/throbber2.gif");
        } else if (icon == "done") {
            $("#statusIndicatorImage").attr("src", "css/tick.png");
        }
    }

    appendToDialogContents(text) {
        $("#dialog-contentholder").append(nl2br_js(text));
        $('#dialog').animate({scrollTop:$('#dialog-contentholder').height()}, 0);
    }

}

function clearDialog() {
    $("#dialog-contentholder").text("");
}

function nl2br_js(myString){
        return myString.replace( /\n/g, '<br />\n' );
    }

exports.Menu = Menu;

