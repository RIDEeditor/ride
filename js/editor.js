// This makes the dom element with id "editor" as the editor
var editor = ace.edit("editor");

// Contains the path of the file currently open in the editor
var fileEntry;

//var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
var modelist = ace.require("ace/ext/modelist");

// Create a simple selection status indicator. AT THE BOTTOM
//var statusBar = new StatusBar(editor, document.getElementById("statusBar"));

//var modeDiv = document.createElement("div");
//modeDiv.id = "modeDiv";
//document.getElementById("statusBar").insertBefore(modeDiv, document.querySelector("#statusBar > div"));

// Set the editor up
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/ruby");
editor.setOptions({fontSize: "12pt", enableBasicAutocompletion: true, enableLiveAutocompletion: false});
editor.focus();
editor.resize();


window.onload = function() {
    console.log("Resizing!");
    editor.resize();
    console.log("Done!");
};

/**
 * Reads the contents of the file into the editor, and sets the correct document type
 *
 * @param {String} filePath
 */
function readFileIntoEditor(filePath) {
    // Detect and set the type of file we are loading
    var mode = modelist.getModeForPath(filePath).mode;
    editor.session.setMode(mode);

    // Read file data
    fs.readFile(filePath.toString(), function (err, data) {
        if (err) {
            console.log("Read failed: " + err);
            dialog.showErrorBox("Error Opening", "There was an error opening file " + filePath);
            return;
        }
        // Set the editor's contents to that of the file
        editor.setValue(String(data));
        fileEntry = filePath;
    });
}

/**
 * Writes the contents of the editor into a file
 *
 * @param {String} filePath
 */
function writeEditorDataToFile(filePath) {
    var editorContents = editor.getValue();
    fs.writeFile(filePath, editorContents, function (err) {
        if (err) {
            console.log("Writing to file failed: " + err);
            dialog.showErrorBox("Error Saving", "There was an error saving to " + filePath);
            return;
        }
        console.log("Write completed.");
    });
}
