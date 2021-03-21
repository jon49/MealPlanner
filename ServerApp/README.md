
## [Server Set up](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-5.0)

Install SDK on server:  
<https://docs.microsoft.com/en-us/dotnet/core/install/linux-debian>  

```
adduser <user>
usermod -aG sudo <user>
```

Login under the new user name.

```
sudo apt install rsync
sudo mkdir -p /var/www/meal-planner
sudo chown -R <user>:<user> /var/www
sudo chmod -R /var/www
sudo apt install haproxy
```

[**Setting up HAProxy**](https://adoltech.com/blog/installing-haproxy-on-ubuntu-18-04/#:~:text=%20Installing%20HAProxy%20on%20Ubuntu%2018.04%20%201,installing%20HAProxy%20using%20the%20command%3A%0Asudo%20apt-get...%20More%20)

## [Publishing](https://docs.microsoft.com/en-us/dotnet/core/deploying/#framework-dependent-deployments-fdd)

Run at solution level

```
dotnet publish -c Release -r linux-x64 --self-contained false
```

[**rsync**](https://blog.fortrabbit.com/deploying-code-with-rsync)

Run from WSL2. Add `n` to list for a dry-run and see what will be synced

```
rsync -av ./path/to/app <username>@<ip-address>:<target directory>
```


