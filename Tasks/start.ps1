
cd ./Server
Start-Process -FilePath ./tasks/start.cmd
cd ../Public
Start-Process -FilePath hugo.exe -ArgumentList ("server", "-p", "3333")
Start-Process -FilePath hugo.exe -ArgumentList ("--help")
cd ../
haproxy -f ./Proxy/meal-planner-proxy.cfg

