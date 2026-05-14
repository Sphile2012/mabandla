# Prince Math Academy — Deploy Script
# Usage: powershell -File scripts/deploy.ps1

$config = Get-Content "C:\Users\Phumeh\AppData\Roaming\netlify\Config\*" -Raw 2>&1 | Select-Object -Last 1
$json = $config | ConvertFrom-Json
$userId = $json.userId
$env:NETLIFY_AUTH_TOKEN = $json.users.$userId.auth.token
$env:NETLIFY_SITE_ID = "4865c8a1-71e8-4810-966a-45c6e9087905"

Write-Host "Building..."
npm run build

Write-Host "Deploying to Netlify..."
netlify deploy --dir dist --functions netlify/functions --prod --message "deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
