#!/bin/sh
# sudo chmod +x ./scripts/install.sh

for f in "./scripts/build-html-builder.ts" "./scripts/build-html.ts"
do
    deno install --root . --allow-read --allow-write $f
done

cd ./scripts
chmod +x *.sh
find . ! '(' -name 'install.sh' ')' -name '*.sh' | cpio -dm -p ../bin 
cd ..
