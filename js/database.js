"use strict";

class Database {

  constructor(filetree) {
    this.filetree = filetree;
  }

  showDatabaseDialog() {
		// set the content to nothing
		// $("#database-dialog-contentholder").text("");

		// delete all the option elements for selector
    document.getElementById("selector").innerHTML = "";

    $("#database-dialog").dialog("open");

    for (let i = 0; i < this.filetree.open_dirs.length; i++) {
      let option = document.createElement("option");
      option.innerHTML = this.filetree.open_dirs[i];
      if (i === 0) {
        option.selected = "selected";
      }
      $("#selector").append(option);
    }
    $("#database-dialog").animate({scrollTop: $("#database-dialog-contentholder").height()}, 0);
  }

}

exports.Database = Database;
