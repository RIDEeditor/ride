
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

	showDir(){
		let d = dialog.showOpenDialog({properties: ['openDirectory','createDirectory'], title: "Choose directory to generate rails application in"});

		this.directory = d;

		document.getElementById('dirChosen').innerHTML = "Directory: " + this.directory;
	}

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

	runBundleWithOptions(){

		console.log("bundling with options");

		this.bundleOptions = document.getElementById('enterOptions').value;
		this.projectChosenToBundle = $( "#bundle option:selected" ).text();
	}


}


exports.CreateDialog = CreateDialog;