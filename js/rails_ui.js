 
const rails = require('./rails-js'); // Note: This path is relative to where we are importing from
// See: https://stackoverflow.com/questions/16652620/node-js-require-cannot-find-custom-module/16652662#16652662
 
class RailsUI{

    constructor(){
         this.railsWrapper = new rails.railsWrapper();
    }


     generateNewRailsProject() {
            // TODO open dialog prompting user for project options
            this.setStatusIndicatorText("Generating new Rails project");
            this.setStatusIconVisibility(true);
            this.setStatusIcon("busy");
            var proc = this.railsWrapper.newProject("asd", "asd", (function(stdout, stderr) {
                // Open new project in file tree
                var evt = new CustomEvent('dirToOpen', { detail: "asd" });
                window.dispatchEvent(evt);
                this.setStatusIcon("done");
                this.setStatusIndicatorText("Done");
            }).bind(this));

            this.clearDialog();

            // Read from childprocess stdout
            // TODO handle stderr as well
            proc.stdout.on('data', (function(data){
                this.appendToDialogContents(data);
    	    }).bind(this));
        }

        generateNewController() {
            // TODO open dialog prompting user for options
            this.railsWrapper.newController("mycontroller");
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