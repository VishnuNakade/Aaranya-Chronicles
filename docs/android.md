# Android Build

The Capacitor Android app bundles the Vite `dist` directory. No development server
or LAN URL is configured. Application ID: `com.aaranya.chronicles`.
Android 7.0/API 24 or newer is required. Phone orientation is sensor-landscape.

On this Windows machine, the build uses the compatible installed Java 23 at
`C:\Program Files\Java\jdk-23`; the SDK is under
`%LOCALAPPDATA%\Android\Sdk`.

Rebuild from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
This is a debug-signed testing APK, not a Play Store release. Release signing keys
and a signed AAB should be configured separately before publishing.
Browser localStorage saves are separate from the installed app's saves.
