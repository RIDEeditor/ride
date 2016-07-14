"use strict";

class CodeTerminal {
  constructor(terminalDiv, url) {
    this.element = terminalDiv;
    this.cell = this.createCell(this.element);
    this.url = url;
    this.socket = io.connect(this.url);
    this.socket.on("connect", this.initTerminal.bind(this));
  }

  initTerminal() {
    var size = this.getSize();

    this.term = new Terminal({
      cols: 150,
      rows: 20,
      useStyle: true,
      screenKeys: true,
      cursorBlink: false
    });

    this.term.open(this.element);

    this.term.on("data", function(data) {
      this.socket.emit("data", data);
    }.bind(this));

    this.socket.on("data", function(data) {
      this.term.write(data);
    }.bind(this));

    this.socket.on("terminal-resize", function(size) {
      this.term.resize(size.cols, size.rows);
    }.bind(this));

    this.socket.emit("terminal-resize", size);

    this.socket.on("disconnect", function() {
      this.term.destroy();
    }.bind(this));

    $(".panel-right-top").on("resize", function(event, ui) {
      var size = this.getSize();
      this.socket.emit("terminal-resize", size);
    }.bind(this));

    $(".panel-left").on("resize", function(event, ui) {
      var size = this.getSize();
      this.socket.emit("terminal-resize", size);
    }.bind(this));
  }

  getSize() {
    var elementBox = this.element.getBoundingClientRect();
    var w = elementBox.width;
    var h = $(window).height() - $(".panel-right-top").height() - 40;

    var cellBox = this.cell.getBoundingClientRect();
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

  createCell(element) {
    var cell = document.createElement("div");

    cell.innerHTML = "&nbsp";
    cell.style.position = "absolute";
    // TODO font parameters should be set dynamically
    cell.style.fontSize = "11px";
    cell.style.fontFamily = "DejaVu Sans Mono, Liberation Mono, monospace";
    cell.style.top = "-1000px";

    element.appendChild(cell);

    return cell;
  }
}

exports.CodeTerminal = CodeTerminal;
