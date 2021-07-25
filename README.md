
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
```

Create certificates

```
sudo certbot --nginx
```

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

Restart nginx (test to make sure it is OK then restart)

```
sudo nginx -t
sudo nginx -s reload
```


