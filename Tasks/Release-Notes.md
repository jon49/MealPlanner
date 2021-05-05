
# Release Notes

**Upload**:

```
rsync -av --exclude "appsettings*.json" {repo directory}/MealPlanner.App/bin/Release/net5.0/linux-x64/publish/ jon@{IP Address}:/var/www/{website}
```

**Log in server**:

```
ssh {name}@{IP Address}
```

**Restart**:

```
sudo systemctl restart meal-planner.service
```

