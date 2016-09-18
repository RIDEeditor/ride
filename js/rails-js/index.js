"use strict";

var childProcess = require("child_process");

/* Wrapper around ruby on rails commands*/
class RailsWrapper {

  constructor(railsPath) {
    if (typeof railsPath === "undefined") {
      railsPath = null;
    }
    this.rvmSource = 'export PATH="$PATH:$HOME/.rvm/bin" && source "$HOME/.rvm/scripts/rvm"';
    this.railsPath = railsPath;
    this.searched = false;
    this.rubyVersion = "";
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

  getRubyVersion(projectDirectory) {
    let gemfile = path.join(projectDirectory, "Gemfile");
    //let gemfile = projectDirectory;
    this.rubyVersion = childProcess.execSync("grep -oP \"(ruby ')\\K[[:digit:]].[[:digit:]].[[:digit:]]\" " + gemfile, {encoding: "utf8"}).trim();
  }

  runCommand(args, callback, cwd) {
    let argObject = {};
    if (typeof cwd === "undefined") {
      argObject = {stdio: "pipe", shell: "/bin/bash"};
    } else {
      argObject = {stdio: "pipe", cwd: cwd, shell: "/bin/bash"}
    }
    var prc = childProcess.exec(this.rvmSource + "; rvm install " + this.rubyVersion +"; rvm use " + this.rubyVersion + "; " + args, argObject, function(error, stdout, stderr) {
      console.log("Finished running: " + args);
      if (callback != null) {
        callback(stdout, stderr);
      }
      if (error != null) {
      console.log(error);
      }
      return stdout.toString();
    });
    return prc;
  }

  bundle(pathToBundle, callback) {
    this.getRubyVersion(pathToBundle);
    let gemfile = path.join(pathToBundle, "Gemfile");
    if (this.findRails()) {
      return this.runCommand("bundle install --gemfile=" + gemfile, callback);
    }
  }

  bundleWithOptions(pathFinal, options, callback) {
    if (this.findRails()) {
      return this.runCommand("bundle install --gemfile=" + pathFinal + " " + options, callback);
    }
  }

  buildScaffold(pathFinal, resourceName, options, callback) {
    if (this.findRails()) {
      return this.runCommand("rails generate scaffold " + resourceName + " " + options, callback, pathFinal);
    }
  }

  bundleMigrate(file, callback) {
    if (this.findRails()) {
      return this.runCommand("bundle exec rake db:migrate", callback, file);
    }
  }

  newProject(name, version, optionsList, callback) {
    if (this.findRails()) {
      return this.runCommand("rails _" + version + "_  new " + name, callback);
    }
  }

  newController(project, controllerName, actions, callback) {
    this.getRubyVersion(project);
    if (this.findRails()) {
      return this.runCommand(this.railsPath + " generate controller " + controllerName + " " + actions, callback, project);
    }
  }

  newModel(project, modelName, attributesString, callback) {
    if (this.findRails()) {
      return this.runCommand(this.railsPath + " generate model " + modelName + " " + attributesString, callback, project);
    }
  }

  destroy(command, project, callback) {
    if (this.findRails()) {
      return this.runCommand("rails destroy " + command, callback, project);
    }
  }

}

exports.RailsWrapper = RailsWrapper;

