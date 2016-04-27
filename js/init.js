'use strict';

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

    // Create a tab
    new Tab("untitled");

    // Create a simple status indicator
    var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
    var statusBar = new StatusBar(editor, document.getElementById("statusBar"));

    // Make left panel (file tree) resizable
    $(".panel-left").resizable({
        handles: 'e',
        resizeHeight: false,
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
    setupTerminal();
    toggleTerminal();

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
