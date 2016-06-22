
const dialog = require('electron').remote.dialog;
var fs = require('fs');
const path = require('path');

class CreateDialog{

	constructor(versions,filetree){
		this.versions = versions;
		this.directory = "";
		this.projectName = "";
		this.versionChosen = "";
		this.filetree = filetree;
		this.bundleOptions = "";
		this.projectChosenToBundle = "";
	}

	// for creating new rails project
	showDialog(){

		document.getElementById('railsv').innerHTML = "";

		// create the form 
		for(let i=0;i<this.versions.length;i++){

			let option = document.createElement("option");
			option.innerHTML =this.versions[i];
			if(i === 0){
				option.selected = "selected";
			}
			$("#railsv").append(option);
		}


		$("#create-rails-dialog").dialog('open');
	}

	// for creating new rails project
	showDir(){
		let d = dialog.showOpenDialog({properties: ['openDirectory','createDirectory'], title: "Choose directory to generate rails application in"});

		this.directory = d;

		document.getElementById('dirChosen').innerHTML = "Directory: " + this.directory;
	}

	// for creating new rails project
	getNameAndVersion(){
		this.projectName = document.getElementById('enterName').value;
		let dir = this.directory + path.sep + this.projectName;
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);

		    // make this dir the same as the dir in the getName function so when things are created in rails_ui.js they are put in the folder 
		    // of the proejct name
		    this.directory = dir;
		}

		this.versionChosen = $( "#railsv option:selected" ).text();

	}

	// for bundle with options
	bundle(){

		document.getElementById('bundle').innerHTML = "";

		for(let i=0;i<this.filetree.open_dirs.length;i++){
			let option = document.createElement("option");
			option.innerHTML =this.filetree.open_dirs[i];
			if(i === 0){
				option.selected = "selected";
			}
			$("#bundle").append(option);
		}

		$("#create-bundle-dialog").dialog('open');
	}

	// for bundle with options
	runBundleWithOptions(){

		console.log("bundling with options");

		this.bundleOptions = document.getElementById('enterOptions').value;
		this.projectChosenToBundle = $( "#bundle option:selected" ).text();
	}

	// for creating a scaffold 
	setupScaffold(){

		document.getElementById('scaffold').innerHTML = "";

		for(let i=0;i<this.filetree.open_dirs.length;i++){
			let option = document.createElement("option");
			option.innerHTML =this.filetree.open_dirs[i];
			if(i === 0){
				option.selected = "selected";
			}
			$("#scaffold").append(option);
		}

		$("#addAction").click(()=>{
			this.addNewAction();
		});

		$("#create-scaffold-dialog").dialog('open');

	}

	addNewAction(){
		//get last of the div element attributes
		let lastElement = $("#attributes div:last");
		//console.log(lastElement);

		//console.log(lastElement[0].id);

		//let buttonElement = $("#addAction");

		// remove the button from wherever it is
		$("#addAction").remove();

		let lastElementId = parseInt(lastElement[0].id.slice(-1));
		//console.log(lastElementId);

		// add 2 br elements
		$("#attributes").append("<br>");
		$("#attributes").append("<br>");

		// add a new attribute div with the plus button 
		let attribute = document.createElement("div");
		let newId = lastElementId = lastElementId + 1;
		attribute.id = "attribute_" + newId;

		let lbl = document.createElement("label");
		lbl.innerHTML = "Attribute:";


		let lbl2 = document.createElement("label");
		lbl2.innerHTML = "Type:";

		let b = document.createElement("button");
		b.id = "addAction";
		b.type="button";

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

		//alert("#" + attribute.id);

		$("#attributes").append(attribute);

		$("#" + attribute.id).append(lbl);
		$("#" + attribute.id).append(inputName);
		$("#" + attribute.id).append(" ");
		$("#" + attribute.id).append(lbl2);
		$("#" + attribute.id).append(inputType);
		$("#" + attribute.id).append(" ");
		$("#" + attribute.id).append(b);

		$("#addAction").click(()=>{
			this.addNewAction();
		});

		

	}


}


exports.CreateDialog = CreateDialog;