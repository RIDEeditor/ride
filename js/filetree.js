/* Initialise the file tree*/

"use strict";

const walk = require("fs-walk");
const path = require("path");
const fs = require("fs");

class FileTree {
  constructor(treeElement) {
    this.treeElement = treeElement;
    this.openDirs = [];
    // Create tree
    treeElement.jstree({
      core: {
        check_callback: true
      },
      plugins: [
        "contextmenu"
      ],
      contextmenu: {
        items: this.removeMenu.bind(this)
      }
    });

    // Setup callback that handles when a file is selected in the tree
    this.treeElement.on("dblclick.jstree", (function(event) {
      let node = this.treeElement.jstree("get_node", event.target.id);
      if (!node) {
        // Double clicked on something not a node, ignore event
        return;
      }
      if (node.original.type === "file") {
        var path = node.data;
        // Dispatch file open event
        var evt = new CustomEvent("fileToOpen", {detail: path});
        window.dispatchEvent(evt);
      }
    }).bind(this));

    // Setup tooltips to show full file path when hovered over
    this.treeElement.on("hover_node.jstree", function(e, data) {
      $("#" + data.node.id).prop("title", data.node.original.fullPath);
    });
  }

  removeMenu(node) {
    // TODO if files under this node are open in editor, should they be closed?
    if (node.original.type === "directory" && node.parent === "#") {
      var items = {
        remove: {
          label: "Remove from workspace",
          action: (function() {
            this.treeElement.jstree("delete_node", node);
            // Find index of this dir in openDirs and remove it
            let index = this.openDirs.indexOf(node.data);
            this.openDirs.splice(index, 1);
          }).bind(this)
        }
      };
      return items;
    } else {
      return null;
    }
  }

  addDirectoryToTree(dirname, expanded, pos) {
    if (typeof expanded === "undefined") { expanded = true; }
    this.openDirs.push(dirname);
    var node = this.buildNode(path.basename(dirname.toString()), dirname.toString(), "directory");
    node.state = {opened: expanded};
    if (typeof pos === "undefined") {
      pos = "last";
    }
    var rootNodeId = $("#treeview").jstree("create_node", "#", node, pos);
    this.recurseTree(rootNodeId, dirname);
  }

  /**
   * Recurses through a directory, adding files and subdirectories to the file tree
   *
   * @param {String} rootNode
   * @param {String} directory
   */
  recurseTree(rootNode, directory) {
    walk.walk(directory.toString(), (function(basedir, filename, stat, next) {
      // Check if is a file or directory
      var fullPath = path.join(basedir, filename);
      var stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        // Add directory to the tree
        var rootNodeId = $("#treeview").jstree("create_node", rootNode, this.buildNode(filename, fullPath, "directory"), "last");
        // Recurse into directory
        this.recurseTree(rootNodeId, fullPath);
      } else {
        // Add file to the tree
        var rootNodeId = $("#treeview").jstree("create_node", rootNode, this.buildNode(filename, fullPath, "file"), "last");
      }
    }).bind(this), function(err) {
      if (err) {
        console.log(err);
      }
    });
  }

  refreshDirectory(directoryPath) {
    let resolvedPath = path.resolve(directoryPath);
    let oldIndex = this.removeNode(resolvedPath);
    this.addDirectoryToTree(resolvedPath, true, oldIndex);
  }

  /**
   * Remove node from filetree that has given path
   * Returns the position that the directory was at in the tree
   *
   * @param {String} directoryPath
   */
  removeNode(directoryPath) {
    let index = -1;
    for (let i = 0; i < this.openDirs.length; i++) {
      if (directoryPath === path.resolve(this.openDirs[i][0])) {
        index = i;
        break;
      }
    }
    if (index != -1) {
      console.log("Index: " + index);
      // This directory is in filetree, so can remove it
      // Get the jstree node that corresponds to this path
      let treeNode = this.getNodeByPath(directoryPath);
      if (treeNode != null) {
        // Remove node from tree
        this.treeElement.jstree("delete_node", treeNode);
        // Remove directory from openDirs list
        this.openDirs.splice(index, 1);
        return index;
      }
    }
  }

  /**
   * Returns the toplevel jstree node that has given path.
   * If no such node exists, returns null
   *
   * @param {String} directoryPath
   */
  getNodeByPath(directoryPath) {
    let rootNode = this.treeElement.jstree("get_node", "#");
    let childNode = null;
    for (let i = 0; i < rootNode.children.length; i++) {
      childNode = this.treeElement.jstree("get_node", rootNode.children[i]);
      if (childNode.data === directoryPath) {
        return childNode;
      }
    }
  }

  buildNode(nameString, fullPath, type) {
    var icon = "";
    if (type === "file") {
      icon = "glyphicon glyphicon-file";
    } else {
      icon = "glyphicon glyphicon-folder-close";
    }
    var node = {
      text: nameString,
      data: fullPath,
      fullPath: fullPath,
      type: type,
      icon: icon
    };
    return node;
  }
}

exports.FileTree = FileTree;
