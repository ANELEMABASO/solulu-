$clientId = '62690900170-uk4jok60k0osas51hi14764ripl9dkc7.apps.googleusercontent.com'
$redirect = 'https://developers.google.com/oauthplayground'
$scope = [uri]::EscapeDataString('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly')
$authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=$clientId&redirect_uri=$([uri]::EscapeDataString($redirect))&response_type=code&scope=$scope&access_type=offline&prompt=consent&login_hint=vasqueelena2026@gmail.com"

Write-Host 'Opening Google consent for Gmail send + read-only access...'
Start-Process $authUrl
$url = Read-Host 'After Allow, paste the full URL from the Playground address bar'
$m = [regex]::Match($url, '[?&]code=([^&]+)')
if (-not $m.Success) { Write-Host 'No code found in that URL. Paste the whole address bar.' -ForegroundColor Red; return }
$code = [uri]::UnescapeDataString($m.Groups[1].Value)

$secret = (Read-Host 'Paste the client secret').Trim()

try {
  $r = Invoke-RestMethod -Method Post -Uri 'https://oauth2.googleapis.com/token' -Body @{
    code = $code; client_id = $clientId; client_secret = $secret
    redirect_uri = $redirect; grant_type = 'authorization_code'
  }
} catch {
  Write-Host 'Google rejected the request:' -ForegroundColor Red
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  Write-Host $reader.ReadToEnd()
  return
}

if (-not $r.refresh_token) { Write-Host 'No refresh token returned. Revoke access at myaccount.google.com/permissions and retry.' -ForegroundColor Red; return }

$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'
$lines = Get-Content $envPath
$lines = $lines | ForEach-Object {
  if ($_ -like 'GOOGLE_REFRESH_TOKEN=*') { "GOOGLE_REFRESH_TOKEN=$($r.refresh_token)" }
  elseif ($_ -like 'GOOGLE_CLIENT_SECRET=*') { "GOOGLE_CLIENT_SECRET=$secret" }
  elseif ($_ -like 'GOOGLE_REDIRECT_URI=*') { "GOOGLE_REDIRECT_URI=$redirect" }
  else { $_ }
}
Set-Content -Path $envPath -Value $lines
Write-Host 'SUCCESS: refresh token and secret were saved to .env' -ForegroundColor Green
