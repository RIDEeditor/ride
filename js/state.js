"use strict";

class State {

  constructor() {
    this.current_editor = null;
    this.TabsList = {}; // Holds all tabs that have been created
  }

}

exports.State = State;
