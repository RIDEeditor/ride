"use strict";

const remote = require("electron").remote;
const electronMenu = remote.Menu;
const path = require("path");
const dialog = require("electron").remote.dialog;

const editorLib = require("./editor");
const RailsUiLib = require("./rails_ui/rails_ui");
const databaseLib = require("./database");
const chatLib = require("./chat");
const railroadyLib = require("./visualisation/railroady_wrapper");

class Menu {
  constructor(currentState, filetree) {
    this.arrayOfThemeNames = [];
    this.currentTheme = null;
    this.currentState = currentState;
    this.RailsUI = new RailsUiLib.RailsUI(currentState, filetree);
    this.database = new databaseLib.Database(filetree);
    this.railroady = new railroadyLib.RailroadyWrapper(filetree);
    this.chat = new chatLib.Chat();
    this.background_color = "dark";

    // Set the menu
    electronMenu.setApplicationMenu(this.buildMenu.bind(this)());
  }

  changeColorLight() {
    $(".panel-left").css("background-color", "#e6e6e6");
    $(".panel-left").css("color", "black");
    this.background_color = "light";
  }

  changeColorDark() {
    $(".panel-left").css("background-color", "#161712");
    $(".panel-left").css("color", "white");
    this.background_color = "dark";
  }

  changeColorMedium(){
    $(".panel-left").css("background-color", "#808080");
    $(".panel-left").css("color", "black");
    this.background_color = "medium";
  }

  buildMenu() {
    // Defines the menu structure
    var menuTemplate = [
      {
        label: "File",
        submenu: [
          {
            label: "New file",
            accelerator: "CmdOrCtrl+n",
            click: (function() {new editorLib.Editor("Untitled", this.currentState);}).bind(this)
          },
          {
            label: "Save",
            accelerator: "CmdOrCtrl+s",
            click: this.handleSaveClicked.bind(this)
          },
          {
            label: "Save as",
            accelerator: "Shift+CmdOrCtrl+s",
            click: this.handleFileSaveAsClicked.bind(this)
          },
          {
            type: "separator"
          },
          {
            label: "Open",
            accelerator: "CmdOrCtrl+o",
            click: this.handleFileOpenClicked.bind(this)
          },
          {
            label: "Open Directory",
            accelerator: "CmdOrCtrl+Shift+o",
            click: this.handleDirectoryOpenClicked.bind(this)
          },
          {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            role: "copy"
          },
          {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            role: "paste"
          },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectall"
          },
          {
            label: "Git Clone",
            accelerator: "CmdOrCtrl+Shift+F",
            click: this.RailsUI.gitClone.bind(this.RailsUI)
          }
        ]
      },
      {
        label: "Rails",
        submenu:
        [ 
                    {
            label: "Rails Generate",
            submenu: [
          {
            label: "New rails project",
            click: this.RailsUI.generateNewRailsProject.bind(this.RailsUI),
            accelerator: "CmdOrCtrl+Shift+n"
          },
          {
            label: "New rails controller",
            click: this.RailsUI.generateNewController.bind(this.RailsUI),
            accelerator: "CmdOrCtrl+Shift+c"
          },
          {
            label: "New rails model",
            click: this.RailsUI.generateNewModel.bind(this.RailsUI),
            accelerator: "CmdOrCtrl+Shift+m"
          },
          {
            label: "New rails scaffold",
            click: this.RailsUI.generateScaffold.bind(this.RailsUI)
          }
          ]
         },
          {
            label: "Rails server",
            accelerator: "CmdOrCtrl+Shift+S",
            click: this.RailsUI.startRailsServer.bind(this.RailsUI)
          },
          {
            label: "Rails Servers Running",
            accelerator: "CmdOrCtrl+Shift+R",
            click: this.RailsUI.showRunningServers.bind(this.RailsUI)
          },
          {
            label: "Rails Destroy",
            accelerator: "CmdOrCtrl+Shift+W",
            click: this.RailsUI.railsDestroy.bind(this.RailsUI)
          },
        ]
      },
      {
        label: "Bundle",
        submenu: [
          {
            label: "bundle install",
            accelerator: "CmdOrCtrl+Shift+B",
            click: this.RailsUI.bundleInstall.bind(this.RailsUI)
          },
          {
            label: "bundle Install with options",
            accelerator: "CmdOrCtrl+Shift+H",
            click: this.RailsUI.bundleInstallOptions.bind(this.RailsUI)
          },
          {
            label: "bundle exec rake db:migrate",
            accelerator: "CmdOrCtrl+Shift+J",
            click: this.RailsUI.bundleMigrate.bind(this.RailsUI)
          }
        ]
      },
      {
        label: "Visualisation",
        submenu: [
          {
            label: "Generate Model Diagram",
            click: this.railroady.showModelDialog.bind(this.railroady)
          },
          {
            label: "Generate Controller Diagram",
            click: this.railroady.showControllerDialog.bind(this.railroady)
          },
          {
            label: "Generate Routes Diagram",
            click: this.railroady.showRoutesDialog.bind(this.railroady)
          }
        ]
      },
      {
        label: "Database",
        submenu: [
          {
            label: "Select database to open",
            click: this.database.showDatabaseDialog.bind(this.database)
          }
        ]
      },
      {
        label: "View",
        submenu: [
          {
            label: "Reload",
            accelerator: "CmdOrCtrl+R",
            click: function(item, focusedWindow) {
              if (focusedWindow)
                focusedWindow.reload();
            }
          },
          {
            label: "Show Terminal",
            accelerator: "Shift+CmdOrCtrl+t",
            click: this.toggleTerminal
          },
          {
            label: "Toggle Full Screen",
            accelerator: (function() {
              if (process.platform === "darwin") {
                return "Ctrl+Command+F";
              } else {
                return "F11";
              }
            })(),
            click: function(item, focusedWindow) {
              if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          },
          {
            label: "Toggle Developer Tools",
            accelerator: (function() {
              if (process.platform === "darwin") {
                return "Alt+Command+I";
              } else {
                return "Ctrl+Shift+I";
              }
            })(),
            click: function(item, focusedWindow) {
              if (focusedWindow)
                focusedWindow.toggleDevTools();
            }
          }
        ]
      },
      {
        label: "Window",
        role: "window",
        submenu: [
          {
            label: "Minimize",
            accelerator: "CmdOrCtrl+M",
            role: "minimize"
          },
          {
            label: "Close",
            accelerator: "CmdOrCtrl+W",
            role: "close"
          }
        ]
      },
      {
        label: "Help",
        role: "help",
        submenu: [
          {
            label: "Learn More",
            click: function() { require("electron").shell.openExternal("http://electron.atom.io"); }
          }
        ]
      },
      {
        label: "Preferences",
        role: "preferences",
        submenu: [
          {
            label: "Themes",
            submenu: []
          },
          {
            label: "Increase Font Size",
            click: function() {editor.setFontSize(editor.getFontSize() + 1);},
            accelerator: "CmdOrCtrl+Plus"
          },
          {
            label: "Decrease Font Size",
            click: function() {editor.setFontSize(editor.getFontSize() - 1);},
            accelerator: "CmdOrCtrl+_"
          },
          {
            label: "Set Background Colour",
            submenu: [
               {label: "Light",
                click: this.changeColorLight.bind(this)
                },
                {label: "Medium",
                  click: this.changeColorMedium.bind(this)
                },
                {label: "Dark",
                click: this.changeColorDark.bind(this)
                }
            ]
          }
        ]
      },
      {
        label: "P2P",
        role: "peertopeer",
        submenu: [
          {
            label: "Chat",
            click: this.chat.sendNewChatEvent
          }
        ]
      }

    ];

    // Mac OSX menu integration
    if (process.platform === "darwin") {
      var name = require("electron").remote.app.getName();
      menuTemplate.unshift({
        label: name,
        submenu: [
          {
            label: "About " + name,
            role: "about"
          },
          {
            type: "separator"
          },
          {
            label: "Services",
            role: "services",
            submenu: []
          },
          {
            type: "separator"
          },
          {
            label: "Hide " + name,
            accelerator: "Command+H",
            role: "hide"
          },
          {
            label: "Hide Others",
            accelerator: "Command+Alt+H",
            role: "hideothers"
          },
          {
            label: "Show All",
            role: "unhide"
          },
          {
            type: "separator"
          }
        ]
      });
    }

    let ThemeList = ace.require("ace/ext/themelist");
    for (var i = 0; i < ThemeList.themes.length; i++) {
      this.arrayOfThemeNames[i] = ThemeList.themes[i].name;
      this.addThemes(menuTemplate, this.arrayOfThemeNames[i]);
    }
    var menu = electronMenu.buildFromTemplate(menuTemplate);
    return menu;
  }

  addThemes(menuTemplate, label) {
    function findMenuIndex(menuLabel) {
      for (var i = 0; i < menuTemplate.length; i++) {
        if (menuTemplate[i].label === menuLabel) {
          return i;
        }
      }
    }

    menuTemplate[findMenuIndex("Preferences")].submenu[0].submenu.push(
      {
        label: label,
        click: () => {
          // A single editor instance is used, so only need to set theme on it
          editor.setTheme("ace/theme/" + label);

          let delay = 100;

          setTimeout(() => {
              this.changeTheme();
          }, delay);
        }

      }
        );
  }


  changeTheme() {
    let cssModify = require("./cssModify");
    let selectedTabClass = cssModify.getCSSRule(".tabs .tab.current, .tabs .tab.current::before");
    let tabTitleClass = cssModify.getCSSRule(".tabs .tab .title");

    // your code to be executed after 1 second
    var tinycolor = require("tinycolor2");
    let code_col = $("#code").css("background-color");
    let button_col = $(".new").css("color");
    selectedTabClass.style.background = code_col;
    tabTitleClass.style.color = $("#code").css("color");

    let col1 = tinycolor(code_col);
    let col2 = tinycolor(button_col);
    if (col1.isLight()) {
      col1.darken(10);
      col1.darken(20);
    } else {
      col1.lighten(10);
      col1.lighten(20);
    }
    $(".tabs-shell").css("background-color", col1.toString());
    $(".new").css("color", col2.toString());
  }

  /**
  * Should be called when the 'open file' menu option is selected
  *
  * See https://github.com/atom/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
  * for information on how the dialog works
  */
  handleFileOpenClicked() {
    dialog.showOpenDialog({properties: ["openFile", "multiSelections"], title: "Choose file to open"}, (function(filenames) {
      for (var i in filenames) {
        // TODO check if this file is already open. If so, jump to that tab, rather than open the file again
        // Also, if the current editor is blank (user hasn;t typed anything), then open the file in this editor,
        // instead of creating a new tab
        // If a file was selected, open it in editor
        var evt = new CustomEvent("fileToOpen", {detail: filenames[i].toString()});
        window.dispatchEvent(evt);
      }
    }).bind(this));
  }

  /**
   * Should be called when the 'open directory' menu option is selected
   */
  handleDirectoryOpenClicked() {
    dialog.showOpenDialog({properties: ["openDirectory"], title: "Choose directory to open"}, (function(dirname) {
      if (dirname) {
        // Open directory in treeview
        var evt = new CustomEvent("dirToOpen", {detail: dirname});
        window.dispatchEvent(evt);
      }
    }).bind(this));
  }

  /**
   * Opens dialog allowing user to choose file to save to
   */
  handleFileSaveAsClicked() {
    if (Object.keys(this.currentState.TabsList).length < 1) {
      // No editors are open, so nothing to save
      return;
    }
    dialog.showSaveDialog({title: "Choose where to save file"}, (function(filename) {
      if (filename) {
        this.currentState.currentEditor.fileEntry = filename;
        // If a file was selected, save file to it
        this.currentState.currentEditor.writeEditorDataToFile();
        // Set tab title to filename
        this.setCurrentTabTitle(path.basename(filename));
        // Detect file type
        this.currentState.currentEditor.updateFileType(filename);
      }
    }).bind(this));
  }

  toggleTerminal() {
    var evt = new CustomEvent("toggleTerminal", {});
    window.dispatchEvent(evt);
  }

  /**
   * Sets the title of the currently selected tab to the provided string
   *
   * @param {String} newTitle
   */
  setCurrentTabTitle(newTitle) {
    tabBar.updateTab(this.currentState.currentEditor.tab, {title: newTitle});
  }

  /**
   * Saves the file currently in editor
   */
  handleSaveClicked() {
    if (Object.keys(this.currentState.TabsList).length < 1) {
      // No editors are open, so nothing to save
      return;
    }
    if (this.currentState.currentEditor.fileEntry) {
      this.currentState.currentEditor.writeEditorDataToFile();
    } else {
      // Handle case where this is a new file and so a file on disk must be chosen before saving
      this.handleFileSaveAsClicked();
    }
  }

}

exports.Menu = Menu;

