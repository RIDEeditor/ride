"use strict";

const childProcess = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const Viz = require("viz.js");
const {ipcRenderer} = require("electron");
require("svg-pan-zoom");

class RailroadyWrapper {

  constructor(filetree) {
    this.filetree = filetree;
    this.railroadyPath = path.join(__dirname, "../../railroady/bin/", "railroady");

    $("#visualisation-dialog").on("dialogclose", function(event, ui) {
      // Clear options from dialog
      $("#visualisation-dialog-options").empty();
    });
  }

  runCommand(workingDir, args, callback) {
    console.log("Running: " + args);
    var prc = childProcess.exec(args, {stdio: "pipe", cwd: workingDir}, function(error, stdout, stderr) {
      if (error === null) {
        console.log("Finished running: " + args);
        if (callback != null) {
          callback(stdout, stderr);
        }
        return stdout.toString();
      } else {
        console.log(error);
      }
    });
    return prc;
  }

  generateModelDiagram(projectDirectory, optionsList, callback) {
    this.runCommand(projectDirectory, this.railroadyPath + " --models --all" + optionsList, (function(stdout, error) {
      this.drawDiagram(stdout, "Models Diagram");
    }).bind(this));
  }

  generateControllerDiagram(projectDirectory, optionsList, callback) {
    this.runCommand(projectDirectory, this.railroadyPath + " --controllers" + optionsList, (function(stdout, error) {
      this.drawDiagram(stdout, "Controllers Diagram");
    }).bind(this));
  }

  generateRoutesDiagram(projectDirectory, callback) {
    this.injectVizRakeTask(projectDirectory);
    this.runCommand(projectDirectory, "rake viz:visualizer", (function(stdout, stderr) {
      this.drawDiagram(stdout, "Routes Diagram");
    }).bind(this));
  }

  injectVizRakeTask(projectDirectory) {
    // Add the visualizer rake task to this projects lib/task directory so we can generate routes diagrams
    let destinationFile = path.join(projectDirectory, "lib/tasks/viz.rake");
    try {
      let stats = fs.statSync(destinationFile);
      stats.isFile();
    } catch (err) {
      if (err.code === "ENOENT") {
        let rakeFile = path.join(__dirname, "routes.rake");
        fs.copySync(rakeFile, destinationFile)
      } else {
        console.error(err);
      }
    }
  }

  drawDiagram(dotSyntax, dialogTitle) {
    // Convert dot input to svgXML
    var result = Viz(dotSyntax);

    // Send svg to main process to open in a new window
    ipcRenderer.send("launch-visualisation", result, dialogTitle);

  }

  showRoutesDialog() {
    $("#model-project-selector").empty();
    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#model-project-selector").append(option);
    }
    $("#gen-model").val("Generate Routes Diagram");
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Routes Diagram", modal: true, width: 600, autoResize:true, resizable: false});
    $("#gen-model").one("click", (function() {
      let pathToDirectorySelected = $("#model-project-selector option:selected").text();
      this.generateRoutesDiagram(pathToDirectorySelected);
      // Close dialog
      $("#visualisation-dialog").dialog("close");
    }).bind(this));
  }

  showModelDialog() {
    // TODO update status icon and status text to show progress
    $("#model-project-selector").empty();
    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#model-project-selector").append(option);
      let options = [
        {
          value: "inheritance",
          label: "Include inheritance relations"
        },
        {
          value: "show-belongs_to",
          label: "Show belongs_to associations"
        },
        {
          value: "hide-through",
          label: "Hide through associations"
        },
        {
          value: "all-columns",
          label: "Show all columns (not just content columns)"
        },
        {
          value: "hide-magic",
          label: "Hide magic field names"
        },
        {
          value: "hide-types",
          label: "Hide attributes type"
        },
        {
          value: "join",
          label: "Concentrate edges"
        },
        {
          value: "modules",
          label: "Include modules"
        },
        {
          value: "plugins-models",
          label: "Include plugins models"
        },
        {
          value: "engine-models",
          label: "Include engine models"
        },
        {
          value: "include-concerns",
          label: "Include models in concerns subdirectory"
        },
        {
          value: "transitive",
          label: "Include transitive associations (through inheritance)"
        }
      ];
      for (let x in options) {
        let option = options[x];
        let input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", option.value);
        let label = document.createElement("Label");
        label.innerHTML = option.label;
        $("#visualisation-dialog-options").append(input);
        $("#visualisation-dialog-options").append(label);
        $("#visualisation-dialog-options").append("<br>");
      }
      $("#gen-model").val("Generate Model diagram");
    }
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Model", modal: true, width: 600, autoResize:true, resizable: false});
    $("#gen-model").one("click", (function() {
      let pathToDirectorySelected = $("#model-project-selector option:selected").text();
      let inputs = $("#visualisation-dialog-options :input[type=checkbox]:checked");
      let cmdOptions = "";
      for (let i = 0; i < inputs.length; i++) {
        cmdOptions += " --" + inputs[i].value;
      }
      this.generateModelDiagram(pathToDirectorySelected, cmdOptions, null);
      // Close dialog
      $("#visualisation-dialog").dialog("close");
    }).bind(this));
  }

  showControllerDialog() {
    // TODO update status icon and status text to show progress
    $("#model-project-selector").empty();
    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#model-project-selector").append(option);
      let options = [
        {
          value: "inheritance",
          label: "Include inheritance relations"
        },
        {
          value: "hide-public",
          label: "Hide public methods"
        },
        {
          value: "hide-protected",
          label: "Hide protected methods"
        },
        {
          value: "hide-private",
          label: "Hide private methods"
        }
      ];
      for (let x in options) {
        let option = options[x];
        let input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", option.value);
        let label = document.createElement("Label");
        label.innerHTML = option.label;
        $("#visualisation-dialog-options").append(input);
        $("#visualisation-dialog-options").append(label);
        $("#visualisation-dialog-options").append("<br>");
      }
    }

    $("#gen-model").val("Generate Controller diagram");
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Controller Diagram", modal: true, width: 600, autoResize:true, resizable: false});
    $("#gen-model").one("click", (function() {
      let pathToDirectorySelected = $("#model-project-selector option:selected").text();
      let inputs = $("#visualisation-dialog-options :input[type=checkbox]:checked");
      let cmdOptions = "";
      for (let i = 0; i < inputs.length; i++) {
        cmdOptions += " --" + inputs[i].value;
      }
      this.generateControllerDiagram(pathToDirectorySelected, cmdOptions, null);
      // Close dialog
      $("#visualisation-dialog").dialog("close");
    }).bind(this));
  }

}

exports.RailroadyWrapper = RailroadyWrapper;
