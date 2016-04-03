var Editor = function(div_element) {

    // Contains the path of the file currently open in the editor
    this.fileEntry;

    // This makes the dom element with id div_element an editor
    editor = ace.edit(div_element);

    var modelist = ace.require("ace/ext/modelist");

    // Set the editor up
    editor.setTheme(current_theme);
    editor.getSession().setMode("ace/mode/ruby");
    editor.setOptions({fontSize: "12pt", enableBasicAutocompletion: true, enableLiveAutocompletion: false,showPrintMargin: false});
    editor.focus();
    editor.resize();

};

Editor.prototype = new ace.edit();


/**
 * Writes the contents of the editor into a file
 *
 * @param {String} filePath
 */
Editor.prototype.writeEditorDataToFile = function(filePath) {
    var editorContents = this.getValue();
    console.log(this.getValue());
    fs.writeFile(filePath, editorContents, function (err) {
        if (err) {
            console.log("Writing to file failed: " + err);
            dialog.showErrorBox("Error Saving", "There was an error saving to " + filePath);
            return;
        }
        console.log("Write completed.");
    });
}


/**
 * Reads the contents of the file into the editor, and sets the correct document type
 *
 * @param {String} filePath
 */
Editor.prototype.readFileIntoEditor = function(filePath) {
    // Detect and set the type of file we are loading
    var mode = modelist.getModeForPath(filePath).mode;
    this..session.setMode(mode);

    // Read file data
    fs.readFile(filePath.toString(), function (err, data) {
        if (err) {
            console.log("Read failed: " + err);
            dialog.showErrorBox("Error Opening", "There was an error opening file " + filePath);
            return;
        }
        // Set the editor's contents to that of the file
        editor.setValue(String(data));
        this.fileEntry = filePath;
    });
}

