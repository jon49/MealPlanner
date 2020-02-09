#!/bin/bash

cd ./src &&
find ./ -type d \
   \( ! -name layouts \) \
   -links 2 \
-exec mkdir -p "../build/{}" \;
