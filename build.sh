#!/usr/bin/env bash

# lint (src)
eslint "$(pwd)/src/**/*.ts"

# clean tmp
if [[ -d "$(pwd)/tmp" ]]; then
  rm -r "$(pwd)/tmp"
fi

# clean dist
if [[ -d "$(pwd)/dist" ]]; then
  rm -r "$(pwd)/dist"
fi

# create tmp dir
mkdir "$(pwd)/tmp"

# concat ts files
find -s "$(pwd)/src" -type f -name '*.ts' -exec cat {} + >"$(pwd)/tmp/index.ts"
# drop imports, exports, comments
sed -i -e '/^import/d' -e '/^export {/d' -e '/^\/\//d' "$(pwd)/tmp/index.ts"

# compile TypeScript
tsc
tsc --module es2015 --target es2015 --outDir "$(pwd)/tmp" "$(pwd)/tmp/index.ts"
tsc --module es2015 --target es5 --outDir "$(pwd)/tmp/es5" "$(pwd)/tmp/index.ts"

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

# fix dist
while IFS= read -r -d '' file; do
  # fix istanbul ignore
  sed -i -e 's/\* @is/ is/' "$file"
  # fix codestyle (4 spaces to 2 spaces)
  sed -i -e 's/^/~/' -e ': r' -e 's/^\( *\)~    /\1  ~/' -e 't r' -e 's/~//' "$file"
  # drop TypeScript jsdoc
  sed -i -e '/@internal/d' "$file"
  # fix codestyle
  standard --fix "$file"
done < <(find "$(pwd)/dist" -type f -name '*.js' -print0)

# types (cjs)
tsc --module es2015 --target es2015 --stripInternal --emitDeclarationOnly --declaration --declarationDir "$(pwd)/lib" "$(pwd)/tmp/index.ts"

# flow (cjs)
flowgen --no-jsdoc --add-flow-header -o "$(pwd)/lib/index.js.flow" "$(pwd)/lib/index.d.ts"
sed -i -e '/^  -/d' "$(pwd)/lib/index.js.flow"

# cleanup
rm -r "$(pwd)/tmp"

# lint (lib)
eslint "$(pwd)/dist" "$(pwd)/lib/index.js" "$(pwd)/lib/index.mjs"
