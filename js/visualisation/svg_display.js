window.$ = window.jQuery = require("jquery");
require("svg-pan-zoom");
const {ipcRenderer} = require("electron");

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
  });
  ipcRenderer.send("visualisation-ready");
});
