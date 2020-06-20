#!/bin/sh

cd ./src
find . ! '(' -name '*.html.js' -o -path '*/layouts/*' ')' -name '*.js' -o -name '*.css' -o -name '*.svg' -o -name '*.html' -o -name '*.ico' | cpio -pdm ../public
cd ..
 