'use strict';
/**
 *Code for resizing terminal based on https://gist.github.com/coderaiser/8931194
 *
 */


const filetree_lib = require('./js/filetree');
const menu_lib = require('./js/menu');
const terminal_lib = require('./js/terminal');
const settings_lib = require('./js/settings');
const editor_lib = require('./js/editor');
const state_lib = require('./js/state');


var tab_bar; // Represents the top tab bar
var editor; // 'Global' editor. New editor sessions are created for each tab
var terminal_maximised = false;
var terminal_loaded = false;
var terminal_height = 200;

var current_state = new state_lib.State();

$(window).load(function() {

    var settings = new settings_lib.Settings();

    // Create menu
    var menu = new menu_lib.Menu(current_state);

    $(window).on('switchTab', function(e){
        //console.log(e);
        switchTab(e.detail);
    });

    $(window).on('fileToOpen', function (e) {
        new editor_lib.Editor("Untitled",current_state);
        current_state.current_editor.readFileIntoEditor(e.detail);
    });

    // Setup filetree
    var filetree = new filetree_lib.FileTree($('#treeview'));

    $(window).on('dirToOpen', function (e) {
        filetree.addDirectoryToTree(e.detail);
    })

    // Setup the tabs bar
    tab_bar = new Tabs({
        shell: $('.tabs-shell'),
        minWidth: 45,
        maxWidth: 180
    });

    editor = ace.edit('code');
    editor.setValue("");
    editor.setTheme("ace/theme/monokai");
    editor.setAutoScrollEditorIntoView(true);

    // Define what the 'new tab' button does
    $('.new').on('click', function(ev) {
        new editor_lib.Editor("Untitled",current_state);
    });

    // Read settings from disk

    // Open files from last session
    for (var i = 0; i < settings.openFiles.length; i++) {
        var file = settings.openFiles[i];
        new editor_lib.Editor("Untitled",current_state);
        if (file) {
            current_state.current_editor.readFileIntoEditor(settings.openFiles[i]);
        }
    }

    if (settings.openFiles.length == 0) {
        // Create a tab if no files from last session
        new editor_lib.Editor("Untitled",current_state);
    }

    // Open directories from previous session in tree
    for (var i = 0; i < settings.openDirectories.length; i++) {
        filetree.addDirectoryToTree(settings.openDirectories[i], false);
    }

    // Create a simple status indicator
    var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
    var statusBar = new StatusBar(editor, document.getElementById("statusBar"));

    // Make left panel (file tree) resizable
    $(".panel-left").resizable({
        handles: 'e',
        resizeHeight: false
    });

    // Make editor resizable
    $(".panel-right-top").resizable({
        handles: 's',
        resizeWidth: false
    });

    // Set callback that makes editor resize properly
    $(".panel-right-top").on("resize", function(event, ui) {
        editor.resize();
    });

    // Setup popup dialog
    $("#dialog").dialog({autoOpen: false, title: "Command Output", height: 500, width: 600});
    $('#statusIndicatorImage').click(function() {
        $('#dialog').dialog('open');
        $('#dialog').animate({scrollTop:$('#dialog-contentholder').height()}, 0);
    });

    $(window).on('toggleTerminal', function (e) {
        if (!terminal_loaded) {
            // Setup terminal
            var terminal_div = document.getElementById("console");
            var my_term = new terminal_lib.Code_Terminal(terminal_div, "http://localhost:8000");
        }
        toggleTerminal();
    })

    $(window).bind("resize", function() {
        $(".panel-right-top").height($(".panel-right").height());
        editor.resize();
        $(window).unbind("resize");
    });

    $(document).ready(function() {
        $(".panel-right-top").height($(".panel-right").height());
        editor.resize();
    });

    // Do stuff when user requests to exit
    window.onbeforeunload = function (e) {
        // TODO Check if files that are open need to be saved and warn user

        // Update settings
        settings.openFiles = [];
        for (var key in current_state.TabsList) {
            settings.openFiles.push(current_state.TabsList[key].fileEntry);
        }

        settings.openDirectories = filetree.open_dirs;

        settings.saveSettingsToDisk();
    }

});

/**
* Switches focus to the tab with the given id
*/
var switchTab = function(id) {
    var doc = current_state.TabsList[id];
    //console.log(current_state.TabsList);
    //console.log(id);
    editor.setSession(doc.aceSession);
    editor.focus();
    current_state.current_editor = doc;
}

function toggleTerminal() {
    if (terminal_maximised) {
        terminal_height = $(".terminal").outerHeight() + 18;
        $(".panel-right-top").height($(".panel-right").height());
        editor.resize();
        terminal_maximised = false;
        // Set focus to editor
        $(".ace_text-input").focus();
    } else {
        // Resize editor
        $(".panel-right-top").height($(".panel-right-top").height() - terminal_height);
        editor.resize();
        // Resize terminal
        $("#console").height($(window).height() - $(".panel-right-top").height() - 40);
        terminal_maximised = true;
        // Set focus to terminal
        $(".terminal").focus();
    }
    $(".panel-right-top").trigger("resize");
}
