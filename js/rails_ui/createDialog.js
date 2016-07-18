"use strict";

const dialog = require("electron").remote.dialog;
var fs = require("fs");
const path = require("path");

class CreateDialog {

  constructor(versions, filetree) {
    this.versions = versions;
    this.directory = "";
    this.projectName = "";
    this.versionChosen = "";
    this.filetree = filetree;
    this.bundleOptions = "";
    this.projectChosenToBundle = "";
    this.projectToScaffold = "";
    this.scaffoldOptions = "";
  }

  // for creating new rails project
  showDialog() {
    document.getElementById("railsv").innerHTML = "";

    // create the form
    for (let i in this.versions) {
      let option = document.createElement("option");
      option.innerHTML = this.versions[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#railsv").append(option);
    }

    $("#create-rails-dialog").dialog("open");
  }

  // for creating new rails project
  showDir() {
    let d = dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      title: "Choose directory to generate rails application in"
    });
    this.directory = d[0];
    document.getElementById("dirChosen").innerHTML = "Directory: " + this.directory;
  }

  // for creating new rails project
  getNameAndVersion() {
    this.projectName = document.getElementById("enterName").value;
    let dir = this.directory + path.sep + this.projectName;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      // make this dir the same as the dir in the getName function so when things are created in rails_ui.js they are put in the folder
      // of the proejct name
      this.directory = dir;
    }

    this.versionChosen = $("#railsv option:selected").text();
  }

  // for bundle with options
  bundle() {
    document.getElementById("bundle").innerHTML = "";

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#bundle").append(option);
    }

    $("#create-bundle-dialog").dialog("open");
  }

  // for bundle with options
  runBundleWithOptions() {
    console.log("bundling with options");

    this.bundleOptions = document.getElementById("enterOptions").value;
    this.projectChosenToBundle = $("#bundle option:selected").text();
  }

  // for creating a scaffold
  setupScaffold() {
    document.getElementById("scaffold").innerHTML = "";

    document.getElementById("attributes").innerHTML = "";
    this.addNewAction();

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#scaffold").append(option);
    }

        // $("#addAction").click(()=>{
        //	this.addNewAction();
        // });

    $("#create-scaffold-dialog").dialog("open");
  }

  addNewAction() {
    // get last of the div element attributes
    let lastElement = $("#attributes div:last");

    // console.log(lastElement[0].id);

    // let buttonElement = $("#addAction");

    // remove the button from wherever it is
    $("#addAction").remove();

    let lastElementId = 0;

    if ($("#attributes div:last").length !== 0) {
      lastElementId = parseInt(lastElement[0].id.slice(-1), 10);
    }

    // console.log(lastElementId);

    // add 2 br elements
    $("#attributes").append("<br>");
    $("#attributes").append("<br>");

        // add a new attribute div with the plus button
    let attribute = document.createElement("div");
    let newId = lastElementId + 1;
    attribute.id = "attribute_" + newId;

    let lbl = document.createElement("label");
    lbl.innerHTML = "Attribute:";

    let lbl2 = document.createElement("label");
    lbl2.innerHTML = "Type:";

    let b = document.createElement("button");
    b.id = "addAction";
    b.type = "button";

    let s = document.createElement("span");
    s.className = "glyphicon glyphicon-plus";

    b.appendChild(s);

    let inputName = document.createElement("input");
    inputName.id = attribute.id + "_name";
    inputName.type = "text";
    inputName.name = "attributeName";

    let inputType = document.createElement("input");
    inputType.id = attribute.id + "_type";
    inputType.type = "text";
    inputType.name = "attributeType";

    // alert("#" + attribute.id);

    $("#attributes").append(attribute);

    $("#" + attribute.id).append(lbl);
    $("#" + attribute.id).append(inputName);
    $("#" + attribute.id).append(" ");
    $("#" + attribute.id).append(lbl2);
    $("#" + attribute.id).append(inputType);
    $("#" + attribute.id).append(" ");
    $("#" + attribute.id).append(b);

    $("#addAction").click(() => {
      this.addNewAction();
    });
  }

  scaffold() {
    this.scaffoldOptions = "";
    // get the chosen project
    this.projectToScaffold = $("#scaffold option:selected").text();

    // get the inputs and the types

    // number of children of the attributes div
    // console.log($("#attributes > div").length);

    let numberOfAttributes = $("#attributes > div").length;

    for (var i = 0; i < numberOfAttributes; i++) {
      let index = i + 1;
      let attributeValue = $("#attribute_" + index + "_name").val();
      let attributeType = $("#attribute_" + index + "_type").val();
      this.scaffoldOptions = this.scaffoldOptions + " " + attributeValue + ":" + attributeType;
    }
  }

  setupRailsServer() {
    document.getElementById("projectRun").innerHTML = "";

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#projectRun").append(option);
    }

        /* $("#railsServer").click(function(){
            $("#create-railsServer-dialog").dialog('close');
            $("#rails-server-running").dialog('open');
        });*/

    $("#create-railsServer-dialog").dialog("open");
  }

  setupGenerateController() {
    document.getElementById("projectController").innerHTML = "";

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#projectController").append(option);
    }

    $("#create-rails-controller").dialog("open");
  }

  setupGenerateModel() {
    document.getElementById("projectModel").innerHTML = "";

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#projectModel").append(option);
    }


    $("#create-rails-model").dialog("open");
  }

	setupRailsDestory(){
		document.getElementById('projectDestroy').innerHTML = "";

		for(let i=0;i<this.filetree.openDirs.length;i++){
			let option = document.createElement("option");
			option.innerHTML =this.filetree.openDirs[i];
			if(i === 0){
				option.selected = "selected";
			}
			$("#projectDestroy").append(option);
		}

		$("#rails-destroy").dialog('open');
	}

}

exports.CreateDialog = CreateDialog;
