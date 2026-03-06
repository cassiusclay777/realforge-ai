# PowerShell script to test ZIP upload
$ErrorActionPreference = "Stop"

Write-Host "📁 Testing ZIP upload endpoint..." -ForegroundColor Cyan

# Najdeme malý ZIP soubor
$uploadsDir = Join-Path $PWD "public\uploads"
$zipFiles = Get-ChildItem -Path $uploadsDir -Filter "*.zip" | Select-Object -First 1
$zipFile = $zipFiles[0]

if (-not $zipFile) {
    Write-Host "❌ No ZIP files found in uploads directory" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Using file: $($zipFile.Name) ($([math]::Round($zipFile.Length/1KB, 2)) KB)" -ForegroundColor Yellow

# Vytvoříme dočasný soubor s testovacími daty
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$fileContent = [System.IO.File]::ReadAllBytes($zipFile.FullName)
$enc = [System.Text.Encoding]::GetEncoding("iso-8859-1")

$bodyLines = @()

# Přidáme zipFile
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"zipFile`"; filename=`"$($zipFile.Name)`""
$bodyLines += "Content-Type: application/zip"
$bodyLines += ""
$bodyLines += $enc.GetString($fileContent)

# Přidáme další pole
$fields = @{
    "title" = "Test Listing - PowerShell Test"
    "address" = "Test Address 456"
    "type" = "APARTMENT"
    "price" = "7500000"
    "area" = "85"
    "rooms" = "4"
}

foreach ($key in $fields.Keys) {
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"$key`""
    $bodyLines += ""
    $bodyLines += $fields[$key]
}

$bodyLines += "--$boundary--"
$bodyLines += ""

$body = $bodyLines -join $LF
$bodyBytes = $enc.GetBytes($body)

try {
    Write-Host "📤 Sending upload request to http://localhost:3003/api/upload/zip..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:3003/api/upload/zip" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyBytes `
        -UseBasicParsing
    
    Write-Host "📥 Response status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Response body:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Green
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Upload successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Upload failed!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "💥 Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}