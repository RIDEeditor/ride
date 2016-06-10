'use strict';

// TODO move this into a node.js module

var os = require('os');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
const dialog = require('electron').remote.dialog;


var settingsDir = path.join(os.homedir(), ".config", "ride");
var settingsFile = "config.json";
var settingsPath = path.join(settingsDir, settingsFile);

class Settings {

    constructor() {
        this.showTerminal = false;
        this.openFiles= []
        this.openDirectories= [];
        this.settings = null;
        // Create settings directory if it doesn't yet exist
        mkdirp(settingsDir);
        this.loadSettingsFromDisk();
    }




 saveSettingsToDisk() {
    fs.writeFile(settingsPath, JSON.stringify(settings), function (err) {
        if (err) {
            console.log("Writing settings to file failed: " + err);
            dialog.showErrorBox("Error Saving", "There was an error saving the settings");
        }
    });
}

 loadSettingsFromDisk() {
    try {
        var data = fs.readFileSync(settingsPath);
        this.settings = JSON.parse(data);
    } catch (err) {
        if (err.code != "ENOENT") {
            console.log("Reading settings failed: " + err);
            dialog.showErrorBox("Error Opening", "There was an error opening the settings file");
        }
    }
    }

}


exports.Settings = Settings;

