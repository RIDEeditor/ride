
const path = require('path');

class Database{

	constructor(filetree){
		this.filetree = filetree;
	}

	showDatabaseDialog(){
		$("#database-dialog-contentholder").text("");
		$('#database-dialog').dialog('open');


		for(let i=0;i<this.filetree.open_dirs.length;i++){
			let div = document.createElement("div");
			div.innerHTML = path.basename(this.filetree.open_dirs[i]);
			$("#database-dialog-contentholder").append(div);
		}

        $('#database-dialog').animate({scrollTop:$('#database-dialog-contentholder').height()}, 0);
	}

}

exports.Database = Database;