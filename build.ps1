Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Installing dependencies..."
npm install

Write-Host "Building the project..."
npm run build

Write-Host "Build completed. The production files are available in the .next folder."