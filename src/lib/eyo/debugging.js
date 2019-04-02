// Remove this file when done
// copy and override functions here.

eYo.Consolidator.List.Target.prototype.getIO = function (block) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = io.max = -1
  io.annotatedInput = undefined
  io.subtype = block.eyo.subtype
  return io
}
