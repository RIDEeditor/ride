var process = require("process");
var fs = require("fs");
var childProcess = require("child_process");

/*Wrapper around ruby on rails commands*/
function railsWrapper() {
    self = this;
    this.rails_path = null;
    this.searched = false;

    /**
     * Attempts to find the path to the rails command
     */
    this.findRails = function() {
        // TODO handle OSX and Windows
        try {
            var output = childProcess.execSync('which rails');
            // Found rails path
            console.log("Found rails path");
            // Need to remove trailing newline
            self.rails_path = output.toString("utf-8", 0, output.length-1);
            return true;
        } catch(error) {
            console.log("Failed to find rails path");
            return false;
        } finally {
            this.searched = true;
        }
    };

    this.runCommand = function(args, callback) {
        var prc = childProcess.exec(args, {"stdio": "pipe"}, function(error, stdout, stderr) {
        if (error == null) {
            console.log("Finished running: " + args);
            if (callback != null) {
                callback();
            }
            return stdout.toString();
        } else {
            console.log(error)
        }
    });
    }

}


railsWrapper.prototype.newProject = function(name, options_list, callback) {
    if (this.findRails()) {
        this.runCommand(this.rails_path + " new " + name, callback);
    }

};

railsWrapper.prototype.newController = function(name, options_list, callback) {
    if (this.findRails()) {
        this.runCommand(this.rails_path + " generate controller " + name, callback);
    }
};


exports.railsWrapper = railsWrapper;

