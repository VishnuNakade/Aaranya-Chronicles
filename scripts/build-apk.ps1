$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
npm.cmd run build
if ($LASTEXITCODE) { throw 'Web build failed' }
npx.cmd cap sync android
if ($LASTEXITCODE) { throw 'Android sync failed' }
Push-Location android
try {
  .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE) { throw 'APK build failed' }
} finally { Pop-Location }
Write-Output 'APK: android/app/build/outputs/apk/debug/app-debug.apk'
