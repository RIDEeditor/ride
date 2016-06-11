/*Initialise the file tree*/

'use strict';

const walk = require('fs-walk');
const path = require('path');
const fs = require('fs');

class FileTree {
    constructor(tree_element) {
        this.tree_element = tree_element;
        this.open_dirs = [];
        // Create tree
        tree_element.jstree({
            'core' : {
                "check_callback" : true
            },
            "plugins" : [
                "contextmenu"
            ],
            'contextmenu' : {
                'items' : this.removeMenu.bind(this)
            },
        });

        // Setup callback that handles when a file is selected in the tree
        this.tree_element.on("dblclick.jstree", (function (event) {
            let node = this.tree_element.jstree("get_node", event.target.id);
            if (node.original.type == "file") {
                var path = node.data;
                // Dispatch file open event
                var evt = new CustomEvent('fileToOpen', { detail: path });
                window.dispatchEvent(evt);
            }
        }).bind(this));

        // Setup tooltips to show full file path when hovered over
        this.tree_element.on('hover_node.jstree',function(e,data){
            $("#"+data.node.id).prop('title', data.node.original.full_path);
        });
    }


    removeMenu(node) {
        // TODO if files under this node are open in editor, should they be closed?
        if (node.original.type == "directory" && node.parent == "#") {
            var items = {
                'remove' : {
                    'label' : 'Remove from workspace',
                    'action' : (function () {
                        this.tree_element.jstree("delete_node", node);
                        // Find index of this dir in open_dirs and remove it
                        let index = this.open_dirs.indexOf(node.data);
                        this.open_dirs.splice(index, 1);
                    }).bind(this)
                }
            }
            return items;
        } else {
            return null;
        }
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

exports.FileTree = FileTree;
