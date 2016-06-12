
const path = require('path');

class Database{

	constructor(filetree){
		this.filetree = filetree;
	}

	showDatabaseDialog(){
		$("#database-dialog-contentholder").text("");
		$('#database-dialog').dialog('open');


		for(let i=0;i<this.filetree.open_dirs.length;i++){
			let option = document.createElement("option");
			option.innerHTML = path.basename(this.filetree.open_dirs[i]);
			if(i === 0){
				option.selected = "selected";
			}
			$("#selector").append(option);
		}

        $('#database-dialog').animate({scrollTop:$('#database-dialog-contentholder').height()}, 0);
	}

}

exports.Database = Database;