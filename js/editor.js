"use strict";

const modelist = ace.require("ace/ext/modelist");
// Load ace extras
const AceDocument = ace.require("ace/document");
const EditSession = ace.require("ace/edit_session");
const UndoManager = ace.require("ace/undomanager");
const dialog = require("electron").remote.dialog;
const path = require("path");
const fs = require("fs");

/**
 * Defines a Tab
 */
class Editor {

  constructor(tabTitle, currentState) {
    this.currentState = currentState;

    var self = this;
    this.idNumber = _.uniqueId(); // Unique id for this tab
    this.id = "document-" + this.idNumber;
    this.fileEntry = null; // Contains the path of the file currently open in the editor

    // Create actual tab and add it to the tab bar
    this.tab = tabBar.add({title: tabTitle});

    this.tab.data("id", this.id);

    this.currentState.currentEditor = self;

    // Define what happens when this tab is activated
    this.tab.on("activate", (function() {
      var evt = new CustomEvent("switchTab", {detail: this.id});
      window.dispatchEvent(evt);
      this.currentState.currentEditor = self;
    }).bind(this));

    // Define what happens when this tab is closed
    this.tab.on("close", (function() {
      delete this.currentState.TabsList[self.id]; // Remove this tab from list
      tabBar.closeTab(self.tab); // Remove tab from tab bar
      if (Object.keys(this.currentState.TabsList).length === 0) {
        // No more tabs are open, create new untitled tab
        new Editor("Untitled", this.currentState);
      }
    }).bind(this));

    // Create new ace document
    var aceDocument = new AceDocument.Document("");
    this.aceDocument = aceDocument;

    // Create new ace session
    this.aceSession = new EditSession.EditSession(this.aceDocument, "ace/mode/text");
    this.aceSession.setUndoManager(new UndoManager.UndoManager());

    // Add this tabs id to the list of tabs
    this.currentState.TabsList[this.id] = this;

    // Switch focus to this tab
    var evt = new CustomEvent("switchTab", {detail: this.id});
    window.dispatchEvent(evt);
  }
  /**
  * Writes the contents of the editor into a file
  *
  * @param {String} filePath
  */
  writeEditorDataToFile() {
    var editorContents = this.aceSession.getValue();
    fs.writeFile(this.fileEntry, editorContents, function(err) {
      if (err) {
        console.log("Writing to file failed: " + err);
        dialog.showErrorBox("Error Saving", "There was an error saving the file");
        return;
      }
    });
    console.log("Write to " + this.fileEntry + " completed.");
  }

  /**
  * Reads the contents of the file into the editor of this tab, and set the correct document type
  *
  * @param {String} filePath
  */
  readFileIntoEditor(filePath) {
    // Detect and set the type of file we are loading
    this.updateFileType(filePath);

    // Read file data
    fs.readFile(filePath.toString(), (function(err, data) {
      if (err) {
        console.log("Read failed: " + err);
        dialog.showErrorBox("Error Opening", "There was an error opening the file " + filePath.toString());
        return;
      }
      // Set the editor's contents to that of the file
      this.aceSession.setValue(String(data));
      // Set tab title to filename
      tabBar.updateTab(this.tab, {title: path.basename(filePath)});
      this.fileEntry = filePath;
    }).bind(this));
  }

  updateFileType(filePath) {
    if (typeof filePath === "undefined") { filePath = this.fileEntry; }
    let mode = modelist.getModeForPath(filePath).mode;
    this.aceSession.setMode(mode);
  }

}

exports.Editor = Editor;

