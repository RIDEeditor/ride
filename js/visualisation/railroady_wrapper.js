"use strict";

const childProcess = require("child_process");
const Viz = require("viz.js");
require("svg-pan-zoom");

class railroadyWrapper {

  constructor(filetree) {
    this.filetree = filetree;

    $("#visualisation-dialog").on("dialogclose", function(event, ui) {
      // Clear options from dialog
      $("#visualisation-dialog-options").empty();
    });
  }

  runCommand(workingDir, args, callback) {
    console.log("Running: railroady", args);
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
    this.runCommand(projectDirectory, "railroady --models --all" + optionsList, (function(stdout, error) {
      this.drawDiagram(stdout, "Models Diagram");
    }).bind(this));
  }

  generateControllerDiagram(projectDirectory, optionsList, callback) {
    this.runCommand(projectDirectory, "railroady --controllers" + optionsList, (function(stdout, error) {
      this.drawDiagram(stdout, "Controllers Diagram");
    }).bind(this));
  }

  drawDiagram(dotSyntax, dialogTitle) {
    // Create parser
    var parser = new DOMParser();

    // Convert dot input to svgXML
    var result = Viz(dotSyntax);

    // Parse svgXML
    var svg = parser.parseFromString(result, "image/svg+xml");
    // Append svg image to dialog
    $("#svg-dialog").append(svg.documentElement);
    // Set svg id
    document.getElementsByTagName("svg")[0].id = "svg-diagram";
    // Make svg image zoomable and pannable
    svgPanZoom("#svg-diagram");

    var svgElement = document.getElementById("svg-diagram");
    var rect = svgElement.getBoundingClientRect();

    let dialogHeight = Math.min($(window).height() - 10, rect.height + 100);
    let dialogWidth = Math.min($(window).width() - 10, rect.width + 100);

    // Show dialog
    $("#svg-dialog").dialog({
      autoOpen: true, title: dialogTitle,
      close: function(event, ui) {
        $(this).dialog("destroy");
        $("#svg-dialog").empty();
      },
      height: dialogHeight, width: dialogWidth});
  }

  showModelDialog() {
    // TODO update status icon and status text to show progress
    $("#model-project-selector").empty();
    for (let i = 0; i < this.filetree.open_dirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.open_dirs[i];
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
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Model", modal: true, height: 500, width: 600});
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
    for (let i = 0; i < this.filetree.open_dirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.open_dirs[i];
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
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Controller Diagram", modal: true, height: 350, width: 600});
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

exports.railroadyWrapper = railroadyWrapper;
