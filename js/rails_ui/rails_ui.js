const dialog = require('electron').remote.dialog;
const path = require('path');
const rails = require('../rails-js'); // Note: This path is relative to where we are importing from
// See: https://stackoverflow.com/questions/16652620/node-js-require-cannot-find-custom-module/16652662#16652662

const createDialog = require("./createDialog");

var childProcess = require("child_process")

const openurl = require("openurl");
 
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

        railsServer(){

            let createdDialog = this.createdDialog;

            $("#railsServer").click(()=>{
               
                // get the port from the dialog

                // get the project path

                // run the rails server command 

                // open the local host using openurl

                // call the ipc and pass the process object 


            });

             createdDialog.setupRailsServer();

            



            //openurl.open("http://localhost:3000/");
        }

        generateNewController() {
            // TODO open dialog prompting user for options
            this.clearDialog();
            this.setStatusIndicatorText("Generating controller");
            this.setStatusIconVisibility(true);
            this.setStatusIcon("busy");
            var proc = this.railsWrapper.newController("mycontroller", "options_go_here", (function(stdout, stderr) {
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
