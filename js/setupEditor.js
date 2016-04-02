// this makes the dom element with id "editor" as the editor
var editor = ace.edit("editor");

var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
var modelist = ace.require("ace/ext/modelist");

// Create a simple selection status indicator. AT THE BOTTOM
var statusBar = new StatusBar(editor, document.getElementById("statusBar"));

var modeDiv = document.createElement("div");
modeDiv.id = "modeDiv";
document.getElementById("statusBar").insertBefore(modeDiv, document.querySelector("#statusBar > div"));

// set the editor up
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/ruby");
editor.setOptions({fontSize: "12pt", enableBasicAutocompletion: true, enableLiveAutocompletion: false});
editor.focus();

function setFileType(filePath) {
    // Get the type of file that has been opened and set it the editor to that mode,
    // and display it in the status bar
    var mode = modelist.getModeForPath(filePath).mode;
    editor.session.setMode(mode);
    document.getElementById("modeDiv").innerHTML = mode;
}
