Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not available in PATH. Install Git first and run this script again."
    exit 1
}

$repoName = "pathshala-coaching"
$gitStatus = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Initializing git repository..."
    git init
}

Write-Host "Checking remote origin..."
$remoteOrigin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or -not $remoteOrigin) {
    $defaultUrl = "https://github.com/<your-github-username>/$repoName.git"
    $remoteUrl = Read-Host "Enter GitHub remote URL (or press Enter to use $defaultUrl)"
    if (-not $remoteUrl) { $remoteUrl = $defaultUrl }
    git remote add origin $remoteUrl
}

Write-Host "Staging changes..."
git add .

Write-Host "Committing changes..."
git commit -m "Deploy Pathshala coaching website" 2>$null

Write-Host "Pushing to GitHub..."
git branch -M main
git push -u origin main

Write-Host "Your code is pushed to GitHub. Next, deploy the repository on Vercel to get a public URL."