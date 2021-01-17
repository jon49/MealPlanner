#!/bin/bash

cd ./Server
pm2 start index.ts --watch --name="Server" --interpreter="deno" --interpreter-args="run --allow-net"
cd ..
cd ./Public
pm2 start ./config.toml --name="Public" --interpreter="hugo" --interpreter-args="server -p 3333"
cd ..
cd ./Proxy
pm2 start ./meal-planner-proxy.cfg --watch --name="Proxy" --interpreter="haproxy" --interpreter-args="-f"
cd ..
