"use strict";

class Database {

  constructor(filetree) {
    this.filetree = filetree;
  }

  showDatabaseDialog() {
	// delete all the option elements for selector
    document.getElementById("selector").innerHTML = "";

    $("#database-dialog").dialog("open");

    for (let i = 0; i < this.filetree.openDirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.openDirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#selector").append(option);
    }
    $("#database-dialog").animate({scrollTop: $("#database-dialog-contentholder").height()}, 0);
  }

}

exports.Database = Database;
