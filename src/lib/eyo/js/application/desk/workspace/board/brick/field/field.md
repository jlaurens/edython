# Edython's board

The board is the place where bricks are displayed.
It corresponds to the code editor.
It maintains a list of owned bricks.

Bricks are tiled vertically such that there is only one column of bricks.

There can be scrollers.

The various boards are

* the main board in a workspace
* the board in the search flyout section
* the board in the draft flyout section
* the board(s) in each library section

To be continued.

## Metrics

The board maintains a `eYo.Metrics` instance to keep track of the various metrics of the board: what is visible, what is the scale, what are the dimensions...

