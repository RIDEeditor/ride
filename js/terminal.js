'use strict';

function setupTerminal() {
    var socket = io.connect("http://localhost:8000");
    console.log("Waiting to connect to socket");
    socket.on('connect', function() {
        console.log("Creating new terminal");

        var element = document.getElementById("console");
        var cell = createCell(element);
        var size = getSize(element, cell);

        var term = new Terminal({
            cols: 150,
            rows: 20,
            useStyle: true,
            screenKeys: true,
            cursorBlink: false
        });

        term.open(element);

        term.on('data', function(data) {
            socket.emit('data', data);
        });

        socket.on('data', function(data) {
            term.write(data);
        });

        socket.on('terminal-resize', function (size) {
            term.resize(size.cols, size.rows);
        });

        socket.emit('terminal-resize', size);

        socket.on('disconnect', function() {
            term.destroy();
        });

        $(".panel-right-top").on("resize", function(event, ui) {
            var size = getSize(element, cell);
            socket.emit('terminal-resize', size);
        });

        $(".panel-left").on("resize", function(event, ui) {
            var size = getSize(element, cell);
            socket.emit('terminal-resize', size);
        });

    });

    function getSize(element, cell) {
        var elementBox = element.getBoundingClientRect();
        var w = elementBox.width;
        var h = $(window).height() - $(".panel-right-top").height() - 40;

        var cellBox = cell.getBoundingClientRect();
        var x = cellBox.width;
        var y = cellBox.height;

        var cols = Math.max(Math.floor(w / x), 10);
        var rows = Math.max(Math.floor(h / y), 10);

        var size = {
            cols: cols,
            rows: rows
        };

        return size;
    }

    function createCell(element) {
        var cell = document.createElement('div');

        cell.innerHTML = '&nbsp';
        cell.style.position = 'absolute';
        // TODO font parameters should be set dynamically
        cell.style.fontSize = '11px';
        cell.style.fontFamily = "DejaVu Sans Mono, Liberation Mono, monospace";
        cell.style.top = '-1000px';

        element.appendChild(cell);

        return cell;
    }

}
