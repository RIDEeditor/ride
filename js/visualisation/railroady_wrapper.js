
const childProcess = require("child_process");
const Viz = require("viz.js");
require("svg-pan-zoom");


class railroadyWrapper {

  constructor(filetree) {
    this.filetree = filetree;

    // Setup onclick event for needed buttons
    $("#gen-model").click((function() {
      let pathToDirectorySelected = $("#model-project-selector option:selected").text();
      this.generateModelDiagram(pathToDirectorySelected, null, null);
      // Close dialog
      $("#visualisation-dialog").dialog('close');
    }).bind(this));
  }


  runCommand(working_dir, args, callback) {
    console.log("Running: " + "railroady", args);
    var prc = childProcess.exec(args, {stdio: "pipe", cwd: working_dir}, function(error, stdout, stderr) {
      if (error == null) {
        console.log("Finished running: " + args);
        if (callback != null) {
          callback(stdout, stderr);
        }
        return stdout.toString();
      } else {
        console.log(error)
      }
    });
    return prc;
  }


  generateModelDiagram(project_directory, options_list, callback) {
    let result = this.runCommand(project_directory, "railroady --models --all", (function(stdout, error) {
      this.drawDiagram(stdout);
    }).bind(this));
  }


  drawDiagram(dot_syntax) {
    // Create parser
    var parser = new DOMParser();

    // Convert dot input to svgXML
    var result = Viz(dot_syntax);

    // Parse svgXML
    var svg = parser.parseFromString(result, "image/svg+xml");
    // Append svg image to dialog
    $("#svg-dialog").append(svg.documentElement);
    // Set svg id
    document.getElementsByTagName("svg")[0].id = "svg-diagram";
    // Make svg image zoomable and pannable
    var panZoomTiger = svgPanZoom("#svg-diagram");

    // Show dialog
    $("#svg-dialog").dialog({autoOpen: true, title: "Model Diagram", height: 600, width: 1000});
  }

  showModelDialog() {
    // TODO update status icon and status text to show progress
    $("#model-project-selector").empty();
    for(let i = 0; i < this.filetree.open_dirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML =this.filetree.open_dirs[i];
      if(i === 0) {
        option.selected = "selected";
      }
      $("#model-project-selector").append(option);
    }
    $("#visualisation-dialog").dialog({autoOpen: true, title: "Generate Model", height: 200, width: 600});
  }


}


exports.railroadyWrapper = railroadyWrapper;
