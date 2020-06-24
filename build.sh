#!/usr/bin/env bash

# lint (src)
eslint "$(pwd)/src/**/*.ts"

# clean tmp
if [[ -d "$(pwd)/tmp" ]]; then
  rm -r "$(pwd)/tmp"
fi

# create tmp dir
mkdir "$(pwd)/tmp"

# concat ts files
find "$(pwd)/src" -type f -name '*.ts' -exec cat {} + >"$(pwd)/tmp/index.ts"
# drop imports, exports, comments
sed -i -e '/^import/d' -e '/^export {/d' -e '/^\/\//d' "$(pwd)/tmp/index.ts"

# compile TypeScript
tsc
tsc --target es5 --outDir "$(pwd)/tmp/es5"

# fix codestyle (4 spaces to 2 spaces)
sed -i -e 's/^/~/' -e ': r' -e 's/^\( *\)~    /\1  ~/' -e 't r' -e 's/~//' "$(pwd)/tmp/index.js"
# drop TypeScript jsdoc
sed -i -e '/@internal/d' "$(pwd)/tmp/index.js"

# build CommonJS, ES Modules, IIFE
rollup -c

# fix istanbul ignore (cjs)
sed -i -e 's/\* @is/ is/' "$(pwd)/lib/index.js"
# fix istanbul ignore (mjs)
sed -i -e 's/\* @is/ is/' "$(pwd)/lib/index.mjs"

# fix codestyle
standard --fix "$(pwd)/lib/index.js" "$(pwd)/lib/index.mjs"

# types (cjs)
tsc --emitDeclarationOnly --declaration --declarationDir "$(pwd)/lib"

# flow (cjs)
flowgen --no-jsdoc --add-flow-header -o "$(pwd)/lib/index.js.flow" "$(pwd)/lib/index.d.ts"
sed -i -e '/^  -/d' "$(pwd)/lib/index.js.flow"

# cleanup
rm -r "$(pwd)/tmp"

# jsdoc (cjs)
# jsdoc --pedantic -d ./doc ./lib/index.js

# typedoc (src)
# typedoc

# lint (lib)
eslint "$(pwd)/lib/index.js" "$(pwd)/lib/index.mjs"
