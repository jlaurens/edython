The python script parses the two files expressions.html and simple_stmts.html
to extract the grammar objects
Those html file are based on

https://docs.python.org/3/reference/expressions.html
https://docs.python.org/3/reference/simple_stmts.html

They have been altered to create more types that appear
extended in alternations.
See for example the target definition.
In order to keep the original file as is,
some extensions are added in `expressions_xtd.html` and
`simple_stmts_xtd.html` respectively.
Both must be loaded after the original file, and in that order.

The result is a `T3.js` file that should be copied in folder
`.../edy/blockly/edy/`


