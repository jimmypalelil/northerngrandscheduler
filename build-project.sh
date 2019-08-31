#!/usr/bin/env bash

# Delete old Angular build
(cd *node; rm -rf dist/*)

# Build New and copy into node folder
(
cd *Angular;
ng build --prod;
cp -rv dist/ ../*node/;
)

# git push
[ $? -eq 0 ] &&

echo "Build Successful!!!"

