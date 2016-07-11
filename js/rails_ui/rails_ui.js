const dialog = require('electron').remote.dialog;
const path = require('path');
const rails = require('../rails-js'); // Note: This path is relative to where we are importing from
// See: https://stackoverflow.com/questions/16652620/node-js-require-cannot-find-custom-module/16652662#16652662

const createDialog = require("./createDialog");

var childProcess = require("child_process")

const openurl = require("openurl");

const {ipcRenderer} = require('electron');

let running_processes = new Map();
 
class RailsUI{

    constructor(current_state,filetree){
         this.railsWrapper = new rails.railsWrapper();

         this.current_state = current_state;
         this.filetree = filetree;
            
            // run the sync to find rails versions
            let railsVersions = String(childProcess.execSync("gem list '^rails$' --local"));

            if(railsVersions === null){
                alert("Ruby on Rails is not installed. Please install to continue.");
                return;
            }

            let found = railsVersions.match(/\(([^)]+)\)/)[1];
            let versions = found.split(",");
            //console.log(versions);

            // create dialog box and get stuff
            this.createdDialog = new createDialog.CreateDialog(versions,filetree);
    }


     generateNewRailsProject() {

            let createdDialog = this.createdDialog;

            // this just allows it to close. It does nothing else as the state is stored in this class as variables
            $("#createProject").click(()=>{
                createdDialog.getNameAndVersion();

                //console.log("closed");
                
                let dir = createdDialog.directory;
                let version = createdDialog.versionChosen;
                if (!dir) {
                    return;
                }
                this.setStatusIndicatorText("Generating new Rails project '" + path.basename(dir) + "'");
                this.setStatusIconVisibility(true);
                this.setStatusIcon("busy");
                var proc = this.railsWrapper.newProject(dir,version, "options_go_here", (function(stdout, stderr) {
                    // Open new project in file tree
                    var evt = new CustomEvent('dirToOpen', { detail: dir });
                    window.dispatchEvent(evt);
                    this.setStatusIcon("done");
                    this.setStatusIndicatorText("Done");
                }).bind(this));

                this.clearDialog();

                if (proc != null) {
                    // Read from childprocess stdout
                    // TODO handle stderr as well
                    proc.stdout.on('data', (function(data){
                        this.appendToDialogContents(data);
                    }).bind(this));
                }
                $("#create-rails-dialog").dialog('close');
            });

            $("#selectDirectory").click(function(){
                createdDialog.showDir();
            });

            createdDialog.showDialog();

            // TODO open dialog prompting user for project options
            //let dir = dialog.showOpenDialog({properties: ['openDirectory','createDirectory'], title: "Choose directory to generate rails application in"});
            
            // everything happens after this dialog box closes 
            //$("#create-rails-dialog").on('dialogclose', (event) => {


            //}); 
        }

        bundleInstall(){
            // this gets the file path to the currently open file
            //console.log(current_state.current_editor.fileEntry);
            //console.log(this.filetree.open_dirs);

            // run bundle install --gemfile=path/To/Gemfile

            // go up the directory and check if it has gemfile. if it does then 
            // do the bundle install there, else keep moving up

            // for loop all open directories and then if they are a substring of the current file entry
            // do the bundle install on that open dir


            let fileOpenPath = current_state.current_editor.fileEntry;

            let fileToCallBundle = "" ;

            if(fileOpenPath !== null){

                for (let i = 0; i < this.filetree.open_dirs.length; i++) {
                       let n = fileOpenPath.includes(this.filetree.open_dirs[i]);
                       if(n){
                        //console.log(this.filetree.open_dirs[i]);
                        fileToCallBundle = this.filetree.open_dirs[i];
                       }
                }

            }

            if(fileToCallBundle === ""){
                return 
            }

            fileToCallBundle = fileToCallBundle + path.sep + "Gemfile";

            this.setStatusIndicatorText("Bundling Rails project '" + fileToCallBundle + "'");
            this.setStatusIconVisibility(true);
            this.setStatusIcon("busy");
            var proc = this.railsWrapper.bundle(fileToCallBundle, (function(stdout, stderr) {
                // Open new project in file tree
                this.setStatusIcon("done");
                this.setStatusIndicatorText("Done");
            }).bind(this));

            this.clearDialog();

            if (proc != null) {
                // Read from childprocess stdout
                // TODO handle stderr as well
                proc.stdout.on('data', (function(data){
                this.appendToDialogContents(data);
                }).bind(this));
            }

        }

        bundleInstallOptions(){

            let createdDialog = this.createdDialog;

            // this just allows it to close. It does nothing else as the state is stored in this class as variables
            $("#bundleProject").click(()=>{
                createdDialog.runBundleWithOptions();

                let folderToBundle = this.createdDialog.projectChosenToBundle;
                let options = this.createdDialog.bundleOptions;

                let finalPathToBundle = folderToBundle + path.sep + "Gemfile";

                this.setStatusIndicatorText("Bundling Rails project with options '" + finalPathToBundle + "'");
                this.setStatusIconVisibility(true);
                this.setStatusIcon("busy");
                var proc = this.railsWrapper.bundleWithOptions(finalPathToBundle,options, (function(stdout, stderr) {
                    // Open new project in file tree
                    this.setStatusIcon("done");
                    this.setStatusIndicatorText("Done");
                }).bind(this));

                this.clearDialog();

                if (proc != null) {
                    // Read from childprocess stdout
                    // TODO handle stderr as well
                    proc.stdout.on('data', (function(data){
                    this.appendToDialogContents(data);
                    }).bind(this));
                }
                $("#create-bundle-dialog").dialog('close');
            });
            
            // create the bundle dialog
            this.createdDialog.bundle();

            //$("#create-bundle-dialog").on('dialogclose', (event) => {


            //}); 
        }

        generateScaffold(){

            let createdDialog = this.createdDialog;

            // this just allows it to close. It does nothing else as the state is stored in this class as variables
            $("#createScaffold").click(()=>{

                createdDialog.scaffold();

                let resourceName = $("#resource_name_input").val();
                let options = this.createdDialog.scaffoldOptions;

                let project = $( "#scaffold option:selected" ).text();

                this.setStatusIndicatorText("Building Rails scaffold");
                this.setStatusIconVisibility(true);
                this.setStatusIcon("busy");
                var proc = this.railsWrapper.buildScaffold(project,resourceName,options, (function(stdout, stderr) {
                    // Open new project in file tree
                    this.setStatusIcon("done");
                    this.setStatusIndicatorText("Done");
                }).bind(this));

                this.clearDialog();

                if (proc != null) {
                    // Read from childprocess stdout
                    // TODO handle stderr as well
                    proc.stdout.on('data', (function(data){
                    this.appendToDialogContents(data);
                    }).bind(this));
                }
                $("#create-scaffold-dialog").dialog('close');
            });
            
            // create the bundle dialog
            this.createdDialog.setupScaffold();


           // $("#create-scaffold-dialog").on('dialogclose', (event) => {
            //});
            
        }


        bundleMigrate(){


            let fileOpenPath = current_state.current_editor.fileEntry;

            let fileToCallBundle = "" ;

            if(fileOpenPath !== null){

                for (let i = 0; i < this.filetree.open_dirs.length; i++) {
                       let n = fileOpenPath.includes(this.filetree.open_dirs[i]);
                       if(n){
                        //console.log(this.filetree.open_dirs[i]);
                        fileToCallBundle = this.filetree.open_dirs[i];
                       }
                }

            }

            if(fileToCallBundle === ""){
                return 
            }

            fileToCallBundle = fileToCallBundle + path.sep;

            this.setStatusIndicatorText("Bundle exec rake db:migrate Rails project '" + fileToCallBundle + "'");
            this.setStatusIconVisibility(true);
            this.setStatusIcon("busy");
            var proc = this.railsWrapper.bundleMigrate(fileToCallBundle, (function(stdout, stderr) {
                // Open new project in file tree
                this.setStatusIcon("done");
                this.setStatusIndicatorText("Done");
            }).bind(this));

            this.clearDialog();

            if (proc != null) {
                // Read from childprocess stdout
                // TODO handle stderr as well
                proc.stdout.on('data', (function(data){
                this.appendToDialogContents(data);
                }).bind(this));
            }


        }

        startRailsServer(){

            let createdDialog = this.createdDialog;

            createdDialog.setupRailsServer();

            $("#railsServer").one('click',()=>{

                $("#create-railsServer-dialog").dialog('close');
                $("#rails-server-running").dialog('open');

                // get the port from the dialog
                let port = document.getElementById('railsServerPort').value;

                // get the project path
                let projectToRun = $("#projectRun option:selected").text() + path.sep;

                // gives undefined : console.log(running_processes.get('hey'));

                let lastDir = path.basename(projectToRun);

                if(running_processes.get(lastDir) !== undefined){
                    alert("Sorry, " + lastDir + " already running a rails server. Please choose another project to run.");
                    return;
                }

                let rails_process = this.startServer(port,projectToRun);

                rails_process.on('error', function(err) {
                      if (err.code === "ENOENT") {
                          // Rails_db command not found - should warn user
                          console.log(err);
                          electron.dialog.showErrorBox("title", "rails server not found");
                      }
                    });


                rails_process.stdout.on('data', function(data){
                      console.log(data.toString());
                });

                rails_process.stderr.on('data', function(data){
                      console.log(data.toString());
                });

                //console.log(path.basename(projectToRun));

                

                // add process to a global array for this class
                running_processes.set(lastDir,rails_process);


                  // create a div with a stop button and then add it to the rails server running window
                  // listener on stop button so it sends sig kill to the process related to it.

                let process_div = document.createElement('div');
                process_div.id = lastDir;

                let l = document.createElement("label");
                l.innerHTML = "<b>" + lastDir + "</b> (Port: " + port + ")";
                //l.style.marginRight = "50px";

                let b = document.createElement("button");
                b.id = "kill_" + process_div.id;
                b.type="button";
                var t = document.createTextNode("Stop");       // Create a text node
                b.appendChild(t);                                // Append the text to <button>
                
                b.style.float = "right";
                //b.innerHTML = "Kill " + projectToRun;

                $("#allProcesses").append("<br>");
                $("#allProcesses").append("<br>");

                $("#allProcesses").append(process_div);

                $("#" + process_div.id).append(l);
                $("#" + process_div.id).append(b);

                //console.log(b.id);

                /*$("#" + b.id).on('click',function(){
                    console.log("happened");
                    let prc_found = running_processes.get((b.id).substring(5));
                    prc_found.kill('SIGTERM');
                    running_processes.delete((b.id).substring(5));
                });

                */

               
                b.onclick = function(){
                    //console.log("happened");
                    let prc_found = running_processes.get((b.id).substring(5));
                    // kill the process
                    prc_found.kill('SIGTERM');

                    // delete from process array
                    running_processes.delete((b.id).substring(5));

                    let divId = (b.id).substring(5);
                    console.log(divId);
                    $("#" + divId).remove();

                    // remove the div from the "allProcesses" element
                };

                openurl.open("http://localhost:" + port + "/");

            });


            //openurl.open("http://localhost:3000/");
        }

        startServer(port,projectToRun){
            let prc = childProcess.exec('rails server -p ' + port, {stdio:"pipe",cwd: projectToRun}, function(error, stdout, stderr) {
                if (error == null) {
                    console.log(stdout.toString());
                } else {
                    console.log(error)
                }
            });
            return prc;
        }

        showRunningServers(){
             $("#rails-server-running").dialog('open');
        }

        generateNewController() {
            let createdDialog = this.createdDialog;

            createdDialog.setupGenerateController();
            
            $("#generateController").click(()=>{

                let actions = (document.getElementById('enterActions').value).split(',');

                let project = $("#projectController option:selected").text() + path.sep;

                let controllerName = document.getElementById('controllerName').value;

                let actionString = "";

                for(let i=0;i<actions.length;i++){
                    actionString = actionString + actions[i] + " ";
                }

                // TODO open dialog prompting user for options
                this.clearDialog();
                this.setStatusIndicatorText("Generating controller");
                this.setStatusIconVisibility(true);
                this.setStatusIcon("busy");
                var proc = this.railsWrapper.newController(project,controllerName, actionString, (function(stdout, stderr) {
                    // TODO update filetree to show new file generated
                    this.setStatusIcon("done");
                    this.setStatusIndicatorText("Done");
                }).bind(this));
                if (proc != null) {
                    // Read from childprocess stdout
                    // TODO handle stderr as well
                    proc.stdout.on('data', (function(data){
                        this.appendToDialogContents(data);
                    }).bind(this));
                }

                $("#create-rails-controller").dialog('close');
            });
        }

        generateNewModel(){
            let createdDialog = this.createdDialog;

            createdDialog.setupGenerateModel();


        }

        setStatusIndicatorText(text) {
            $("#statusIndicatorText").text(text);
        }

        setStatusIconVisibility(shouldShow) {
           $("#statusIndicatorImage").toggle(shouldShow);
        }

        setStatusIcon(icon) {
            if (icon == "busy") {
                $("#statusIndicatorImage").attr("src", "css/throbber2.gif");
            } else if (icon == "done") {
                $("#statusIndicatorImage").attr("src", "css/tick.png");
            }
        }

        appendToDialogContents(text) {
            $("#dialog-contentholder").append(this.nl2br_js(text));
            $('#dialog').animate({scrollTop:$('#dialog-contentholder').height()}, 0);
        }

        clearDialog() {
        $("#dialog-contentholder").text("");
      }

        nl2br_js(myString){
            return myString.replace( /\n/g, '<br />\n' );
      }

}

exports.RailsUI = RailsUI;
