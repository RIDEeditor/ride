

class Database{

	constructor(){

	}

	showDatabaseDialog(){
		$('#database-dialog').dialog('open');
        $('#database-dialog').animate({scrollTop:$('#database-dialog-contentholder').height()}, 0);
	}

}

exports.Database = Database;