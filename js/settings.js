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

var settings = {
    showTerminal: false,
    openFiles: [],
    openDirectories: []
}


function saveSettingsToDisk() {
    fs.writeFile(settingsPath, JSON.stringify(settings), function (err) {
        if (err) {
            console.log("Writing settings to file failed: " + err);
            dialog.showErrorBox("Error Saving", "There was an error saving the settings");
        }
    });
}

function loadSettingsFromDisk() {
    try {
        var data = fs.readFileSync(settingsPath);
        settings = JSON.parse(data);
    } catch (err) {
        if (err.code != "ENOENT") {
            console.log("Reading settings failed: " + err);
            dialog.showErrorBox("Error Opening", "There was an error opening the settings file");
        }
    }
    return settings;
}

// Create settings directory if it doesn't yet exist
mkdirp(settingsDir);

