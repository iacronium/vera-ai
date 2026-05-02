# Script rapido para iniciar ngrok
# Asume que ngrok ya esta instalado y configurado

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando ngrok para Webhooks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar ngrok en ubicaciones comunes
$ngrokPaths = @(
    "$env:USERPROFILE\.ngrok\ngrok.exe",
    "C:\ngrok\ngrok.exe",
    "ngrok.exe"  # Si esta en el PATH
)

$ngrokExe = $null
foreach ($path in $ngrokPaths) {
    if (Test-Path $path) {
        $ngrokExe = $path
        break
    }
}

# Si no se encuentra, intentar ejecutar desde PATH
if ($null -eq $ngrokExe) {
    try {
        $ngrokExe = (Get-Command ngrok -ErrorAction Stop).Source
    } catch {
        Write-Host "[ERROR] ngrok no encontrado" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opciones:" -ForegroundColor Yellow
        Write-Host "  1. Ejecuta: .\setup-ngrok.ps1" -ForegroundColor White
        Write-Host "  2. Descarga manual de: https://ngrok.com/download" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

Write-Host "[OK] ngrok encontrado: $ngrokExe" -ForegroundColor Green
Write-Host ""

# Verificar backend
Write-Host "[INFO] Verificando backend..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "[OK] Backend corriendo" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Backend no esta corriendo" -ForegroundColor Yellow
    Write-Host "       Inicia el backend: cd server && node index.js" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "ngrok se iniciara ahora. Cuando veas la URL publica:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Copia la URL HTTPS (ej: https://abc123.ngrok-free.app)" -ForegroundColor White
Write-Host "  2. Ve a: https://www.mercadopago.com.ar/developers/panel/app" -ForegroundColor White
Write-Host "  3. Configura el webhook con:" -ForegroundColor White
Write-Host "     https://TU_URL.ngrok-free.app/api/webhooks/mercadopago" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Gray
Write-Host ""

# Iniciar ngrok
& $ngrokExe http 5000
