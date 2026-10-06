# Render the social preview with the bundled, licensed Bree Serif Regular font.
# Run on Windows: pwsh -File documentation/assets/social-preview/render.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$fonts = [System.Drawing.Text.PrivateFontCollection]::new()
$fonts.AddFontFile((Join-Path $PSScriptRoot 'BreeSerif-Regular.ttf'))
$family = $fonts.Families[0]
if ($family.Name -ne 'Bree Serif') { throw 'Expected Bree Serif font.' }
$bitmap = [System.Drawing.Bitmap]::new((Join-Path $PSScriptRoot 'background.png'))
$logo = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'combination-mark.png'))
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function Draw-Text([string]$Text, [single]$Size, [single]$X, [single]$Y, [string]$Color, [single]$MaxWidth) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $format = [System.Drawing.StringFormat]::GenericTypographic
    $path.AddString($Text, $family, 0, $Size, [System.Drawing.PointF]::new(0, 0), $format)
    $bounds = $path.GetBounds()
    if ($bounds.Width -gt $MaxWidth) { throw "Text exceeds its column: $Text ($($bounds.Width) px)" }
    $transform = [System.Drawing.Drawing2D.Matrix]::new()
    $transform.Translate($X - $bounds.X, $Y - $bounds.Y)
    $path.Transform($transform)
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($Color))
    $graphics.FillPath($brush, $path)
    $brush.Dispose()
    $transform.Dispose()
    $format.Dispose()
    $path.Dispose()
}

try {
    $logoWidth = 560
    $logoHeight = [int][Math]::Round($logoWidth * $logo.Height / $logo.Width)
    $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new(82, 100, $logoWidth, $logoHeight))
    Draw-Text 'Student projects.' 128 82 316 '#1f2a52' 950
    Draw-Text 'Real potential.' 128 82 438 '#1f2a52' 920
    Draw-Text 'Greater impact.' 128 82 560 '#3a52a6' 920
    Draw-Text 'Showcase ideas. Connect with opportunity.' 39 82 704 '#1f2a52' 890
    Draw-Text 'academy.iskolar.io' 30 84 818 '#1f2a52' 550
    $destination = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../public/og-academy.png'))
    $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Rendered $($bitmap.Width)x$($bitmap.Height) with $($family.Name) Regular: $destination"
} finally {
    $graphics.Dispose()
    $bitmap.Dispose()
    $logo.Dispose()
    $family.Dispose()
    $fonts.Dispose()
}
