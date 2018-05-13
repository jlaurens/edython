#!/usr/bin/env bash
# this does not work, closurebuilder.py opens binary files where it writes text...
# More symbols should be exported.
cd "$(dirname "$0")/.."
pwd
src/lib/closure-library/closure/bin/build/closurebuilder.py \
  --root=src/lib/closure-library/ \
  --root=src/lib/blockly/core/ \
  --root=src/lib/eyo/ \
  --namespace="eYo" \
  --output_file="build/edython.js"
