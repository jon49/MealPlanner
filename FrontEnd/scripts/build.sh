#!/bin/sh

./bin/clean.sh
npx tsc
./bin/build-html & ./bin/build-html-builder & ./bin/build-static.sh
