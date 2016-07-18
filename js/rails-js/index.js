"use strict";

var childProcess = require("child_process");

/* Wrapper around ruby on rails commands*/
class RailsWrapper {

  constructor(railsPath) {
    if (typeof railsPath === "undefined") {
      railsPath = null;
    }
    this.railsPath = railsPath;
    this.searched = false;
  }

  /**
   * Attempts to find the path to the rails command
   */
  findRails() {
    // TODO handle OSX and Windows
    try {
      var output = childProcess.execSync("which rails");
      // Found rails path
      console.log("Found rails path");
      // Need to remove trailing newline
      this.railsPath = output.toString("utf-8", 0, output.length - 1);
      return true;
    } catch (error) {
      console.log("Failed to find rails path");
      return false;
    } finally {
      this.searched = true;
    }
  }

  runCommand(args, callback) {
    var prc = childProcess.exec(args, {stdio: "pipe"}, function(error, stdout, stderr) {
      if (error === null) {
        console.log("Finished running: " + args);
        if (callback != null) {
          callback(stdout, stderr);
        }
        return stdout.toString();
      } else {
        console.log(error);
      }
    });
    return prc;
  }

  runCommandWithCwd(args, cwd, callback) {
    console.log("Arg: " + args);
    console.log("Dir: " + cwd);
    var prc = childProcess.exec(args, {stdio: "pipe", cwd: cwd}, function(error, stdout, stderr) {
      if (error === null) {
        console.log("Finished running: " + args);
        if (callback != null) {
          callback(stdout, stderr);
        }
        return stdout.toString();
      } else {
        console.log(error);
      }
    });
    return prc;
  }

  bundle(pathToBundle, callback) {
    if (this.findRails()) {
      return this.runCommand("bundle install --gemfile=" + pathToBundle, callback);
    }
  }

  bundleWithOptions(pathFinal, options, callback) {
    if (this.findRails()) {
      return this.runCommand("bundle install --gemfile=" + pathFinal + " " + options, callback);
    }
  }

  buildScaffold(pathFinal, resourceName, options, callback) {
    if (this.findRails()) {
      return this.runCommandWithCwd("rails generate scaffold " + resourceName + " " + options, pathFinal, callback);
    }
  }

  bundleMigrate(file, callback) {
    if (this.findRails()) {
      return this.runCommandWithCwd("bundle exec rake db:migrate", file, callback);
    }
  }

  newProject(name, version, optionsList, callback) {
    if (this.findRails()) {
      return this.runCommand("rails _" + version + "_  new " + name, callback);
    }
  }

  newController(project, controllerName, actions, callback) {
    if (this.findRails()) {
      return this.runCommandWithCwd(this.railsPath + " generate controller " + controllerName + " " + actions, project, callback);
    }
  }

    newModel(project,modelName, attributesString,callback){
        if (this.findRails()) {
            return this.runCommandWithCwd(this.railsPath + " generate model " + modelName + " " + attributesString,project, callback);
        }
    }

    destroy(command,project,callback){

        if(this.findRails()){
            return this.runCommandWithCwd("rails destroy " + command,project,callback);
        }

    }

}

exports.RailsWrapper = RailsWrapper;

