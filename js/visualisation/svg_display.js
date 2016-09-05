window.$ = window.jQuery = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;
const {ipcRenderer} = require("electron");
require("svg-pan-zoom");

$(document).ready(function() {
  //ipcRenderer.send("launch-visualisation");
  ipcRenderer.once("svg", function(event, result) {
    // Create parser
    var parser = new DOMParser();
    // Parse svgXML
    let svg = parser.parseFromString(result, "image/svg+xml");
    // Append svg image to dialog
    $("#svg-dialog").append(svg.documentElement);
    // Set svg id
    document.getElementsByTagName("svg")[0].id = "svg-diagram";
    // Make svg image zoomable and pannable
    svgPanZoom("#svg-diagram");

    // Calculate size taken up by diagram
    let svgElement = document.getElementById("svg-diagram");
    let rect = svgElement.getBoundingClientRect();
    let dialogHeight = Math.min($(window).height() - 10, rect.height + 100);
    let dialogWidth = Math.min($(window).width() - 10, rect.width + 100);

    $("#save").on("click", function() {
      dialog.showSaveDialog({title: "Choose where to save file"}, function(filename) {
        if (filename) {
          fs.writeFile(filename, result, function(err) {
            if (err) {
              console.log("Writing to file failed: " + err);
              dialog.showErrorBox("Error Saving", "There was an error saving the file");
              return;
            }
          });
        }
      });
    });
  });
  ipcRenderer.send("visualisation-ready");

});
