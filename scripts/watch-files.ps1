param([string][alias("d")] $Directory, [switch][alias("w")] $Watch, [switch] $Watching)

if (!$Watching) {
    $root = (Get-Location).Path
    $Directory = Join-Path -Path $root $Directory
}

if ($Watch -and !$Watching) {
    pwsh -NoExit -File $PSCommandPath -d $Directory -Watching
    return
}

$removeExportPath = Join-Path -Path $PSScriptRoot "remove-emptyExport.ps1"

Get-ChildItem -Path $Directory -Filter *.js -Recurse | ForEach-Object {
    Invoke-Expression "$removeExportPath -Path $_"
}

Write-Host "Watching directory $Directory"

$filewatcher = New-Object System.IO.FileSystemWatcher
$filewatcher.Path = $Directory
$filewatcher.Filter = "*.js"
$filewatcher.IncludeSubdirectories = $true
$filewatcher.EnableRaisingEvents = $true

$writeaction = {
    $changeType = $Event.SourceEventArgs.ChangeType
    $path = $Event.SourceEventArgs.FullPath
    Write-Host $path $changeType
    Invoke-Expression "$removeExportPath -Path $path"
}

Register-ObjectEvent $filewatcher "Created" -Action $writeaction
Register-ObjectEvent $filewatcher "Changed" -Action $writeaction
