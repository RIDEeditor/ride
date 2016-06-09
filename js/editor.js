'use strict';

const modelist = ace.require("ace/ext/modelist");
// Load ace extras
const AceDocument = ace.require("ace/document");
const EditSession = ace.require("ace/edit_session");
const UndoManager = ace.require("ace/undomanager");

/**
 * Defines a Tab
 */
var Tab = function(tab_title) {
    var self = this;
    var id = 'document-' + _.uniqueId(); // Unique id for this tab
    this.id = id;
    this.fileEntry = null; // Contains the path of the file currently open in the editor

    // Create actual tab and add it to the tab bar
    this.tab = tab_bar.add({title: tab_title});

    this.tab.data('id', id);

    // Define what happens when this tab is activated
    this.tab.on('activate', function() {
        switchTab($(this).data('id'));
        current_editor = self;
    });

    // Define what happens when this tab is closed
    this.tab.on('close', function() {
        delete TabsList[self.id]; // Remove this tab from list
        tab_bar.closeTab(self.tab); // Remove tab from tab bar
    });

    // Create new ace document
    var aceDocument = new AceDocument.Document('');
    this.aceDocument = aceDocument;

    // Create new ace session
    this.aceSession = new EditSession.EditSession(this.aceDocument, 'ace/mode/text');
    this.aceSession.setUndoManager(new UndoManager.UndoManager());

    // Add this tabs id to the list of tabs
    TabsList[this.id] = this;

    /**
    * Writes the contents of the editor into a file
    *
    * @param {String} filePath
    */
    this.writeEditorDataToFile = function() {
        var editorContents = this.aceSession.getValue();
        fs.writeFile(this.fileEntry, editorContents, function (err) {
            if (err) {
                console.log("Writing to file failed: " + err);
                dialog.showErrorBox("Error Saving", "There was an error saving the file");
                return;
            }
        });
        console.log("Write to " + this.fileEntry + " completed.");
    };

    /**
    * Reads the contents of the file into the editor of this tab, and set the correct document type
    *
    * @param {String} filePath
    */
    this.readFileIntoEditor = function(filePath) {
        // Detect and set the type of file we are loading
        var mode = modelist.getModeForPath(filePath).mode;
        this.aceSession.setMode(mode);

        // Read file data
        fs.readFile(filePath.toString(), function (err, data) {
            if (err) {
                console.log("Read failed: " + err);
                dialog.showErrorBox("Error Opening", "There was an error opening the file");
                return;
            }
            // Set the editor's contents to that of the file
            self.aceSession.setValue(String(data));
            // Set tab title to filename
            tab_bar.updateTab(self.tab, {title: path.basename(filePath)});
            self.fileEntry = filePath;
        });
    };

    // Switch focus to this tab
    switchTab(this.id);

};

