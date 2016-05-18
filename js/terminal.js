'use strict';

function setupTerminal() {
    var socket = io.connect("http://localhost:8000");
    console.log("Waiting to connect to socket");
    socket.on('connect', function() {
        console.log("Creating new terminal");
        var term = new Terminal({
            cols: 150,
            rows: 20,
            useStyle: true,
            screenKeys: true,
            cursorBlink: false
        });

        term.on('data', function(data) {
            socket.emit('data', data);
        });

        term.open(document.getElementById("console"));

        socket.on('data', function(data) {
            term.write(data);
        });

        socket.on('disconnect', function() {
            term.destroy();
        });
    });
}
