/*Initialise the file tree*/

'use strict';

$(document).ready(function() {
    // Create tree
    $('#treeview').jstree({ 'core' : {
        "check_callback" : true
    } });

    // Setup callback that handles when a file is selected in the tree
    $('#treeview').on("select_node.jstree", function (e, data) {
        for(var i = 0, j = data.selected.length; i < j; i++) {
            var node = data.instance.get_node(data.selected[i]);
            if (node.original.type == "file") {
                var path = node.data;
                handleNewClicked();
                current_editor.readFileIntoEditor(path);
            }
        }
    });

    // Setup tooltips to show full file path when hovered over
    $("#treeview").on('hover_node.jstree',function(e,data){
        $("#"+data.node.id).prop('title', data.node.original.full_path);
    });
});
