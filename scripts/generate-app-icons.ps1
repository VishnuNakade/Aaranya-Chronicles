$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$source = [System.Drawing.Image]::FromFile((Join-Path $root 'src/assets/logo/ARANYA_ Enchanted Forest Emblem.png'))
function Export-Icon($path, [int]$size, [double]$coverage) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(9, 20, 15))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $width = [int]($size * $coverage)
    $height = [int]($width * $source.Height / $source.Width)
    $graphics.DrawImage($source, [int](($size - $width) / 2), [int](($size - $height) / 2), $width, $height)
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $graphics.Dispose(); $bitmap.Dispose() }
}
try {
  foreach ($density in @(@('mdpi',48,108), @('hdpi',72,162), @('xhdpi',96,216), @('xxhdpi',144,324), @('xxxhdpi',192,432))) {
    $folder = Join-Path $root "android/app/src/main/res/mipmap-$($density[0])"
    Export-Icon (Join-Path $folder 'ic_launcher.png') $density[1] 0.92
    Export-Icon (Join-Path $folder 'ic_launcher_round.png') $density[1] 0.82
    # Keep the complete wide emblem within adaptive launchers' central safe area.
    Export-Icon (Join-Path $folder 'ic_launcher_foreground.png') $density[2] 0.55
  }
} finally { $source.Dispose() }
Write-Output 'Android launcher icons generated in all five densities.'
