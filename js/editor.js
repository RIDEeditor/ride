'use strict';

const modelist = ace.require("ace/ext/modelist");
const fs = require("fs");

var Editor = function(div_element) {

    // This makes the dom element with id div_element an editor
    var editor = ace.edit(div_element);

    // Set the editor up
    editor.setTheme(current_theme);
    editor.setOptions({fontSize: "12pt", enableBasicAutocompletion: true, enableLiveAutocompletion: false, showPrintMargin: false});

    // Contains the path of the file currently open in the editor
    editor.fileEntry = null;
    // TODO Look into using fs.watchFile to be notified when file is modified outside of the editor

    /**
    * Writes the contents of the editor into a file
    *
    * @param {String} filePath
    */
    editor.writeEditorDataToFile = function() {
        var editorContents = this.getSession().getValue();
        fs.writeFile(this.fileEntry, editorContents, function (err) {
            if (err) {
                console.log("Writing to file failed: " + err);
                dialog.showErrorBox("Error Saving", "There was an error saving the file");
                return;
            }
        });
        console.log("Write to " + this.fileEntry + " completed.");
    }

    /**
    * Reads the contents of the file into the editor, and sets the correct document type
    *
    * @param {String} filePath
    */
    editor.readFileIntoEditor = function(filePath) {
        // Detect and set the type of file we are loading
        var mode = modelist.getModeForPath(filePath).mode;
        this.getSession().setMode(mode);

        // Read file data
        fs.readFile(filePath.toString(), function (err, data) {
            if (err) {
                console.log("Read failed: " + err);
                dialog.showErrorBox("Error Opening", "There was an error opening the file");
                return;
            }
            // Set the editor's contents to that of the file
            editor.getSession().setValue(String(data));
            editor.fileEntry = filePath;
        });
    }

    return editor;

};

