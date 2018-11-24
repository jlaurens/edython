// Remove this file when done
// copy and override functions here.

Blockly.Workspace.prototype.fireChangeListener = function(event) {
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift();
    }
  }
  for (var i = 0, func; func = this.listeners_[i]; i++) {
    func(event);
  }
};
