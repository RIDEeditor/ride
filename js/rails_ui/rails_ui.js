const dialog = require('electron').remote.dialog;
const path = require('path');
const rails = require('../rails-js'); // Note: This path is relative to where we are importing from
// See: https://stackoverflow.com/questions/16652620/node-js-require-cannot-find-custom-module/16652662#16652662

const createDialog = require("./createDialog");

var childProcess = require("child_process")
 
class RailsUI{

    constructor(){
         this.railsWrapper = new rails.railsWrapper();
                     // run the sync to find rails versions
            let railsVersions = String(childProcess.execSync("gem list '^rails$' --local"));
            let found = railsVersions.match(/\(([^)]+)\)/)[1];
            let versions = found.split(",");
            //console.log(versions);

            // create dialog box and get stuff
            this.createdDialog = new createDialog.CreateDialog(versions);
    }


     generateNewRailsProject() {

            let createdDialog = this.createdDialog;

            // this just allows it to close. It does nothing else as the state is stored in this class as variables
            $("#createProject").click(function(){
                createdDialog.getNameAndVersion();
                $("#create-rails-dialog").dialog('close');
            });

            $("#selectDirectory").click(function(){
                createdDialog.showDir();
            });

            createdDialog.showDialog();

            // TODO open dialog prompting user for project options
            //let dir = dialog.showOpenDialog({properties: ['openDirectory','createDirectory'], title: "Choose directory to generate rails application in"});
            
            // everything happens after this dialog box closes 
            $("#create-rails-dialog").on('dialogclose', (event) => {
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

            }); 
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
