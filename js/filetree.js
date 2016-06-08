/*Initialise the file tree*/

'use strict';

class FileTree {
    constructor(tree_element) {
        this.tree_element = tree_element;
        this.open_dirs = [];
        // Create tree
        tree_element.jstree({ 'core' : {
            "check_callback" : true
        } });

        // Setup callback that handles when a file is selected in the tree
        tree_element.on("select_node.jstree", function (e, data) {
            for(var i = 0, j = data.selected.length; i < j; i++) {
                var node = data.instance.get_node(data.selected[i]);
                if (node.original.type == "file") {
                    var path = node.data;
                    // Dispatch file open event
                    var evt = new CustomEvent('fileToOpen', { detail: path });
                    window.dispatchEvent(evt);
                }
            }
        });

        // Setup tooltips to show full file path when hovered over
        tree_element.on('hover_node.jstree',function(e,data){
            $("#"+data.node.id).prop('title', data.node.original.full_path);
        });
    }


    addDirectoryToTree(dirname, expanded) {
        if (typeof expanded === 'undefined') { expanded = true; }
        this.open_dirs.push(dirname);
        var node = this.buildNode(path.basename(dirname.toString()), dirname.toString() , "directory");
        node["state"] = {"opened": expanded};
        var root_node_id = $("#treeview").jstree('create_node',  "#", node, 'last');
        this.recurseTree(root_node_id, dirname);
    }


    /**
     * Recurses through a directory, adding files and subdirectories to the file tree
     *
     * @param {String} root_node
     * @param {String} directory
     */
    recurseTree(root_node, directory) {
        walk.walk(directory.toString(), (function(basedir, filename, stat, next) {
            // Check if is a file or directory
            var full_path = path.join(basedir, filename);
            var stats = fs.lstatSync(full_path);
            if (stats.isDirectory()) {
                // Add directory to the tree
                var root_node_id = $("#treeview").jstree('create_node', root_node, this.buildNode(filename, full_path, "directory"), 'last');
                // Recurse into directory
                this.recurseTree(root_node_id, full_path);
            } else {
                // Add file to the tree
                var root_node_id = $("#treeview").jstree('create_node', root_node, this.buildNode(filename, full_path, "file"), 'last');
            }
        }).bind(this), function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

    buildNode(name_string, full_path, type) {
        var icon = "";
        if (type == "file") {
            icon = "glyphicon glyphicon-file";
        } else {
            icon = "glyphicon glyphicon-folder-close";
        }
        var node = {
            "text": name_string,
            "data": full_path,
            "full_path": full_path,
            "type": type,
            "icon": icon
        }
        return node;
    }
}
