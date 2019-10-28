# Handling mouse, pointer and touch events in Edython

Mouse events are used to select, unselect or drag objects. Dragging concerns bricks and other dom objects.
Pointers are managed just like mouses.
The touch events are managed separately.

## Status of the document

In progress.

## Javascript events

The javascript events considered here are limited to the mouse and mouse like devices events. See [documentation](https://developer.mozilla.org/en-US/docs/Web/Events) and other pages from there on.

| Event Name      | Fired When |
| ----------- | ----------- |
|mousedown	|A pointing device button is pressed on an element.|
|mousemove	|A pointing device is moved over an element. (Fired continously as the mouse moves.)|
|mouseup	|A pointing device button is released over an element.|

|Touch events| Fired When |
|---|---|
|touchstart|one or more touch points are placed on the touch surface|
|touchmove|one or more touch points are moved along the touch surface
|touchend|one or more touch points are removed from the touch surface|
|touchcancel|one or more touch points have been disrupted in an implementation-specific manner (for example, too many touch points are created)|

|Pointer events| Fired When |
|---|---|
|pointerdown|a pointer becomes active|
|pointermove|a pointer changes coordinates|
|pointerup|a pointer is no longer active|
|pointercancel|the pointer will no longer be able to generate events (eg device powered off) |

Non standard events only available on WebKit:

|Gesture event types| Fired When |
|---|---|
|gesturestart| multiple fingers contact the touch surface|
|gesturechange|digits move|
|gestureend|there are no longer multiple fingers contacting the touch surface|

## Motion description

Dragging starts by a mouse down, a pointer down or a single touch start on a previously selected object, followed by a move sufficiently large.
It ends by a mouse up, pointer up or touch end.

Multiple click is not a dragging. It starts by a mouse down, followed by a mouse up in the neighbourhood in time and space, followed by another mouse down and another mouse up, one near the other, and so on.

Single click is not a dragging nor a multiple click. It starts by a mouse down, followed by a mouse up in the neighbourhood in time and space.
It may be followed by a mouse down but this should just be the next motion.

## Motion switch

The latency between two consecutive mouse/pointer/touch down events is governed by `eYo.Motion.LATENCY`.

## Motion handling

Such javascript starting events are catched by the fields, the bricks and the various boards. They are passed to the desktop's motion object, which handles the event.

### Initiating a motion

Let us assume that no motion has been created yet,
then a dom object receives an event of type in `mousedown`, `pointerdown` or `touchstart`. In its listening event handler, it passes control to
the desktop's motion object's `captureStart` method.

### the motion's `captureStart ` method

The `captureStart` method can be called many times during the same motion capture. However its content changes after the very first call.

## Remark

The term **gesture** being in use by WebKit, we use **motion** to gather mouse, pointer, touch and gesture events.

## See

[How to detect multitouch on trackpads](https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e)
