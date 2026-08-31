# ============================================================
# Dahua Camera System - All Services Starter
# Run this script to start go2rtc, backend & frontend
# ============================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Dahua Camera System - Starting All..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- 1. Stop any old processes ---
Write-Host "`n[1] Cleaning up old go2rtc processes..." -ForegroundColor Yellow
Get-Process -Name "go2rtc" -ErrorAction SilentlyContinue | Stop-Process -Force

# --- 2. Start go2rtc ---
Write-Host "[2] Starting go2rtc engine (RTSP/WebRTC)..." -ForegroundColor Yellow
$go2rtcPath = Join-Path $scriptDir "go2rtc.exe"
if (Test-Path $go2rtcPath) {
    Start-Process -FilePath $go2rtcPath -WorkingDirectory $scriptDir -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "  go2rtc running on :1984 (API), :8554 (RTSP), :8555 (WebRTC)" -ForegroundColor Green
} else {
    Write-Host "  ERROR: go2rtc.exe not found!" -ForegroundColor Red
}

# --- 2.5 Start RTSP Proxy ---
Write-Host "[2.5] Starting RTSP Proxy (Node on :8554)..." -ForegroundColor Yellow
$proxyPath = Join-Path $scriptDir "rtsp-proxy.js"
if (Test-Path $proxyPath) {
    Start-Process -FilePath "node" -ArgumentList "`"$proxyPath`"" -WindowStyle Minimized
    Write-Host "  RTSP Proxy running on :8554" -ForegroundColor Green
} else {
    Write-Host "  ERROR: rtsp-proxy.js not found!" -ForegroundColor Red
}

# --- 3. Start Backend (Wrangler) ---
Write-Host "[3] Starting Backend (Cloudflare Worker on :8787)..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptDir "backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendPath`" && npx wrangler dev --port 8787" -WindowStyle Normal
Write-Host "  Backend starting on http://localhost:8787" -ForegroundColor Green

# --- 4. Start Frontend (Nuxt) ---
Write-Host "[4] Starting Frontend (Nuxt on :3000)..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptDir "frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$frontendPath`" && npm run dev" -WindowStyle Normal
Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " All services started!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8787" -ForegroundColor White
Write-Host "  go2rtc   : http://localhost:1984" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
