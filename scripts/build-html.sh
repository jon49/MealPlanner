#!/bin/bash

if [ "$1" != "" ] && [[ ! "$1" =~ \/_* ]]
then
   path=$(echo $1 | sed 's/^build\///')
   node --experimental-modules "./$1" > ./public/${path::-3}
elif [[ ! "$1" =~ \/_* ]]
then
   cd ./build &&
   find ./ -type f \
      -iname "\$*.html.js" \
      -exec bash -c 'node $0 > ../public/${sed 0 s/\.js//}' {} \;
      # ! -iname "_*.js" \
      # -not -path "./layouts/*" \
      # -exec bash -c 'node --experimental-modules $0 > ../public/${0::-3}' {} \;
fi
