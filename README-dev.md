# Developer documentation

## Supporting python keywords

## The getDocumenScroll problem in chromium/macOS

See test_getDocumenScroll.html

## Exlude file from linting

While trying to require blockly related javascript files, there were so many errors and warnings due to eslint that I had to disable this adding lines to .eslintigonre.

## Managing blockly and closure libraries

When requiring blockly, the closure-library is also needed but must be resolved. Unfortunately, the npm closure library is called 'google-closure-library' whereas blockly requires 'closure-library'.
One solution is to use module-alias or alias-module, not tested yet. Another solution is to use webpack resolve configuration.
Adding 

NB compilation seems to take forever.

