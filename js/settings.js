"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const dialog = require("electron").remote.dialog;

var settingsDir = path.join(os.homedir(), ".config", "ride");
var settingsFile = "config.json";
var settingsPath = path.join(settingsDir, settingsFile);

class Settings {

  constructor() {
    this.showTerminal = false;
    this.openFiles = [];
    this.openDirectories = [];
    this.editor_theme = "monokai" // Default theme if not set in settings file
    this.background_color = "dark"; // Default background color
    // Create settings directory if it doesn't yet exist
    mkdirp(settingsDir);
    this.loadSettingsFromDisk();
  }

  bundleSettings() {
    let json = {};
    json.showTerminal = this.showTerminal;
    json.openFiles = this.openFiles;
    json.openDirectories = this.openDirectories;
    json.editor_theme = this.editor_theme;
    json.background_color = this.background_color;
    return JSON.stringify(json);
  }

  saveSettingsToDisk() {
    fs.writeFile(settingsPath, this.bundleSettings(), function(err) {
      if (err) {
        console.log("Writing settings to file failed: " + err);
        dialog.showErrorBox("Error Saving", "There was an error saving the settings");
      }
    });
  }

  loadSettingsFromDisk() {
    try {
      var data = fs.readFileSync(settingsPath);
      let json = JSON.parse(data);
      for (let setting in json) {
        this[setting.toString()] = json[setting];
      }
    } catch (err) {
      if (err.code != "ENOENT") {
        console.log("Reading settings failed: " + err);
        console.log(err);
        dialog.showErrorBox("Error Opening", "There was an error opening the settings file");
      }
    }
  }

}

exports.Settings = Settings;

