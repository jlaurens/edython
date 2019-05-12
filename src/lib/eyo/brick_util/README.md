# Folder contents

This folder contains extensions of Blockly objects.

## Note on block visual design

The visual has changed. It is now flat with no shadow effect.
The is a shape path and a contour path. The shape path knows about the background
whereas the contour knows about the ... contour.

Each block is represented by different svg objects to manage the order in
rendering the elements.
The main problem is that a contour of an inner block is below the contour of an
outer block, whereas the selection path is above. It means that the contour of
an inner block should be drawn before the contour of its parent but its selection
path must be drawn after the contour of its parent.

As there is no `z-index` support in browsers (this is a SVG2 feature) we have to
split the svg elements in what comes before the contour and what comes after.


| child\parent | shape | inline | contour | highlight |
|--------------|-------|--------|---------|-----------|
| shape        | >     | <      | <       | <         |
| inline       | >     | <      | <       | <         |
| contour      | >     | >      | <       | <         |
| highlight    | >     | >      | >       | >         |

In the above table, the various child paths are ordered relatively to their
parent's. Within a given block, the paths are ordered according to the row index.

connection and highlight path are drown on the same z-index, whether collapsed
or not, the path is at the same level too.
