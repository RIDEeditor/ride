"use strict";
/**
 *Code for resizing terminal based on https://gist.github.com/coderaiser/8931194
 *
 */

const path = require("path");
const filetreeLib = require("./js/filetree");
const menuLib = require("./js/menu");
const terminalLib = require("./js/terminal");
const settingsLib = require("./js/settings");
const editorLib = require("./js/editor");
const stateLib = require("./js/state");
const {ipcRenderer} = require("electron");

var tabBar; // Represents the top tab bar
var editor; // 'Global' editor. New editor sessions are created for each tab
var terminalIsMaximised = false;
var terminalIsLoaded = false;
var terminalHeight = 200;

var currentState = new stateLib.State();

$(window).load(function() {
  var settings = new settingsLib.Settings();

  // Setup filetree
  var filetree = new filetreeLib.FileTree($("#treeview"));

  // Create menu
  var menu = new menuLib.Menu(currentState, filetree);

  $(window).on("switchTab", function(e) {
    switchTab(e.detail);
  });

  $(window).on("fileToOpen", function(e) {
    new editorLib.Editor("Untitled", currentState);
    currentState.currentEditor.readFileIntoEditor(e.detail);
  });

  $(window).on("dirToOpen", function(e) {
    filetree.addDirectoryToTree(e.detail);
  });

  $(window).on("dirToRefresh", function(e) {
    filetree.refreshDirectory(e.detail);
  });

  // Setup the tabs bar
  tabBar = new Tabs({
    shell: $(".tabs-shell"),
    minWidth: 45,
    maxWidth: 180
  });

  editor = ace.edit("code");
  editor.setValue("");
  editor.setTheme("ace/theme/monokai");
  editor.setAutoScrollEditorIntoView(true);

  // Set the correct colors based on the theme
  setTimeout(() => {
    menu.changeTheme();
  }, 100);

  // Define what the 'new tab' button does
  $(".new").on("click", function(ev) {
    new editorLib.Editor("Untitled", currentState);
  });

  // Read settings from disk
  // Open files from last session
  for (var i = 0; i < settings.openFiles.length; i++) {
    let file = settings.openFiles[i];
    new editorLib.Editor("Untitled", currentState);
    if (file) {
      currentState.currentEditor.readFileIntoEditor(settings.openFiles[i]);
    }
  }

  if (settings.openFiles.length === 0) {
    // Create a tab if no files from last session
    new editorLib.Editor("Untitled", currentState);
  }

  // Open directories from previous session in tree
  for (let i = 0; i < settings.openDirectories.length; i++) {
    filetree.addDirectoryToTree(settings.openDirectories[i], false);
  }

  // Set the editor theme from the settings
  editor.setTheme("ace/theme/" + settings.editor_theme);

  // Set the background color
  let setBackgroundColor = settings.background_color.toLowerCase();
  if (setBackgroundColor === "light") {
    menu.changeColorLight();
  } else if (setBackgroundColor === "medium") {
    menu.changeColorMedium();
  } else if (setBackgroundColor === "dark") {
    menu.changeColorDark();
  }

  // Create a simple status indicator
  var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
  var statusBar = new StatusBar(editor, document.getElementById("statusBar"));

  // Make left panel (file tree) resizable
  $(".panel-left").resizable({
    handles: "e",
    resizeHeight: false
  });

  // Make editor resizable
  $(".panel-right-top").resizable({
    handles: "s",
    resizeWidth: false
  });

  // Set callback that makes editor resize properly
  $(".panel-right-top").on("resize", function(event, ui) {
    editor.resize();
  });

  // Setup popup dialog
  $("#dialog").dialog({autoOpen: false, title: "Command Output", height: 500, width: 600});
  $("#statusIndicatorImage").click(function() {
    $("#dialog").dialog("open");
    $("#dialog").animate({scrollTop: $("#dialog-contentholder").height()}, 0);
  });

  // Setup popup dialog
  $("#database-dialog").dialog({autoOpen: false, title: "Database dialog", height: 200, width: 600,resizable:false});
  $("#opendb").click(function() {
    let pathToDirectorySelected = $("#selector option:selected").text();
    // run the rails command
    ipcRenderer.send("launch-rails-db", pathToDirectorySelected);
    // Close dialog
    $("#database-dialog").dialog("close");
  });

  // Setup rails dialog
  $("#create-rails-dialog").dialog({autoOpen: false, title: "Create Project", height: 250, width: 600,resizable:false});

  // setup bundle dialog
  $("#create-bundle-dialog").dialog({autoOpen: false, title: "Bundle Project", height: 200, width: 600,resizable:false});

  // setup visualisation dialog
  $("#visualisation-dialog").dialog({autoOpen: false, title: "Generate Model", height: 500, width: 600,resizable:false});

  // controller generate controller
  $("#create-rails-controller").dialog({autoOpen: false, title: "Generate Controller", height: 250, width: 600,resizable:false});

  // controller generate model
  $("#create-rails-model").dialog({autoOpen: false, title: "Generate Model", height: 250, width: 600,resizable:false});

   // rails destroy
  $("#rails-destroy").dialog({autoOpen: false, title: "Rails Destroy", height: 200, width: 600,resizable:false});

  // create scaffold dialog
  $("#create-scaffold-dialog").dialog({autoOpen: false, title: "Create Scaffold",width:600, minWidth: 600, minHeight:300});

  // create the rails server dialog
  $("#create-railsServer-dialog").dialog({autoOpen: false, title: "Rails Server", height: 200, width: 600,resizable:false});

  $("#rails-server-running").dialog({autoOpen: false, title: "Rails Servers Running", height: 200, width: 600,resizable:false});

  $("#gitClone").dialog({autoOpen: false, title: "Git Clone", height: 400, width: 600,resizable:false});

  $(window).on("toggleTerminal", function(e) {
    if (!terminalIsLoaded) {
      // Setup terminal
      var terminalDiv = document.getElementById("console");
      var myTerm = new terminalLib.CodeTerminal(terminalDiv, "http://localhost:8000");
    }
    toggleTerminal();
  });

  $(window).bind("resize", function() {
    $(".panel-right-top").height($(".panel-right").height());
    editor.resize();
    $(window).unbind("resize");
  });

  $(document).ready(function() {
    $(".panel-right-top").height($(".panel-right").height());
    editor.resize();
  });

  // Do stuff when user requests to exit
  window.onbeforeunload = function(e) {
    // TODO Check if files that are open need to be saved and warn user

    // Update settings
    settings.openFiles = [];
    for (var key in currentState.TabsList) {
      settings.openFiles.push(currentState.TabsList[key].fileEntry);
    }

    settings.openDirectories = filetree.openDirs;

    // Save the currently selected editor theme
    settings.editor_theme = path.basename(editor.getTheme());

    // Persist settings to disk
    settings.saveSettingsToDisk();
  };
});

/**
* Switches focus to the tab with the given id
*/
var switchTab = function(id) {
  var doc = currentState.TabsList[id];
  editor.setSession(doc.aceSession);
  editor.focus();
  currentState.currentEditor = doc;
};

function toggleTerminal() {
  if (terminalIsMaximised) {
    terminalHeight = $(".terminal").outerHeight() + 18;
    $(".panel-right-top").height($(".panel-right").height());
    editor.resize();
    terminalIsMaximised = false;
    // Set focus to editor
    $(".ace_text-input").focus();
  } else {
    // Resize editor
    $(".panel-right-top").height($(".panel-right-top").height() - terminalHeight);
    editor.resize();
    // Resize terminal
    $("#console").height($(window).height() - $(".panel-right-top").height() - 40);
    terminalIsMaximised = true;
    // Set focus to terminal
    $(".terminal").focus();
  }
  $(".panel-right-top").trigger("resize");
}
