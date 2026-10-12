param([switch]$Build)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$adb = Join-Path $env:LOCALAPPDATA 'Android/Sdk/platform-tools/adb.exe'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
& $adb reverse tcp:5173 tcp:5173
if ($LASTEXITCODE) { throw 'Connect and authorize exactly one Android device first.' }
if ($Build) {
  $original = [IO.File]::ReadAllText((Join-Path $PWD 'capacitor.config.json'))
  try {
    $config = $original | ConvertFrom-Json
    $config | Add-Member server @{ url = 'http://localhost:5173'; cleartext = $true }
    [IO.File]::WriteAllText((Join-Path $PWD 'capacitor.config.json'), ($config | ConvertTo-Json -Depth 10))
    npx.cmd cap sync android
    if ($LASTEXITCODE) { throw 'Live Android sync failed' }
    Push-Location android
    try {
      .\gradlew.bat assembleDebug --no-daemon
      if ($LASTEXITCODE) { throw 'Live APK build failed' }
    } finally { Pop-Location }
    Copy-Item android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/aaranya-live-debug.apk -Force
  } finally {
    [IO.File]::WriteAllText((Join-Path $PWD 'capacitor.config.json'), $original)
    npx.cmd cap sync android
  }
  & $adb install -r android/app/build/outputs/apk/debug/aaranya-live-debug.apk
  if ($LASTEXITCODE) { throw 'Phone installation failed; check its permission prompt.' }
}
& $adb shell am force-stop com.aaranya.chronicles
& $adb shell am start -n com.aaranya.chronicles/.MainActivity
Write-Output 'Keep Vite running on port 5173 and USB connected. Edit src/, not dist/.'
