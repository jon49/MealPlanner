#!/bin/bash

if [ "$1" != "" ]; then
   path=$(echo $1 | sed 's/^temp\///')
   node --experimental-modules "./$1" > ./build/${path::-3}
else
   cd ./temp &&
   find ./ -type f \
      -iname "*.html.js" \
      ! -iname "_*.js" \
      -not -path "./layouts/*" \
      -exec bash -c 'node --experimental-modules $0 > ../build/${0::-3}' {} \;
fi
