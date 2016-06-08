'use strict';
/**
 *Code for resizing terminal based on https://gist.github.com/coderaiser/8931194
 *
 */

var TabsList = {}; // Holds all tabs that have been created
var tab_bar; // Represents the top tab bar
var editor; // 'Global' editor. New editor sessions are created for each tab
var terminal_maximised = true;

$(document).ready(function() {

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
        new Tab();
    });


    // Read settings from disk
    var settings = loadSettingsFromDisk();

    // Open files from last session
    for (var i = 0; i < settings.openFiles.length; i++) {
        var file = settings.openFiles[i];
        new Tab();
        if (file) {
            current_editor.readFileIntoEditor(settings.openFiles[i]);
        }
    }
    if (settings.openFiles.length == 0) {
        // Create a tab if no files from last session
        new Tab("untitled");
    }

    for (var i = 0; i < settings.openDirectories.length; i++) {
        addDirectoryToTree(settings.openDirectories[i], false);
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

    // Make terminal visibile
    toggleTerminal();

    // Setup popup dialog
    $("#dialog").dialog({autoOpen: false, title: "Command Output", height: 500, width: 600});
    $('#statusIndicatorImage').click(function() {
        $('#dialog').dialog('open');
        $('#dialog').animate({scrollTop:$('#dialog-contentholder').height()}, 0);
    });

    // Do stuff when user requests to exit
    window.onbeforeunload = function (e) {
        // TODO Check if files that are open need to be saved and warn user

        // Update settings
        settings.openFiles = [];
        for (var key in TabsList) {
            settings.openFiles.push(TabsList[key].fileEntry);
        }

        settings.openDirectories = open_dirs;

        saveSettingsToDisk();
    }


});

// Load ace extras
var AceDocument = ace.require("ace/document");
var EditSession = ace.require("ace/edit_session");
var UndoManager = ace.require("ace/undomanager");

/**
* Switches focus to the tab with the given id
*/
var switchTab = function(id) {
    var doc = TabsList[id];
    editor.setSession(doc.aceSession);
    editor.focus();
    current_editor = doc;
}

function toggleTerminal() {
    if (terminal_maximised) {
        $(".panel-right-top").height($(".panel-right").height());
        editor.resize();
        terminal_maximised = false;
        // Set focus to editor
        $(".ace_text-input").focus();
    } else {
        // Resize editor
        $(".panel-right-top").height($(".panel-right-top").height() - 300);
        editor.resize();
        // Resize terminal
        $("#console").height($(window).height() - $(".panel-right-top").height() - 40);
        terminal_maximised = true;
        // Set focus to terminal
        $(".terminal").focus();
    }
}
