#!/bin/bash

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs

sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo chown -R $USER /usr/lib/node_modules

sudo npm i -g pm2
