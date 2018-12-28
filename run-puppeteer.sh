#!/bin/bash

echo "Running Puppeteer"

file=`cat main.js`

set -x # debug on
docker run --rm -it -p 8080:8080 --cap-add=SYS_ADMIN \
  --name puppeteer-chrome puppeteer-chrome-linux
set +x # debug off
