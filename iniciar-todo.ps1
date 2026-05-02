# Script para iniciar todo el sistema de una vez
# Synthesized Ether - Inicio completo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Synthesized Ether - Inicio del Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Ejecuta este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Este script iniciara:" -ForegroundColor Yellow
Write-Host "  1. Backend (node index.js)" -ForegroundColor White
Write-Host "  2. Frontend (npm run dev)" -ForegroundColor White
Write-Host "  3. ngrok (para webhooks)" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Se abriran 3 ventanas de terminal" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continuar? (S/N)"
if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "[INFO] Cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Iniciar Backend
Write-Host "[1/3] Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; Write-Host '[Backend] Iniciando servidor...' -ForegroundColor Green; node index.js"
Start-Sleep -Seconds 2

# Iniciar Frontend
Write-Host "[2/3] Iniciando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '[Frontend] Iniciando Vite...' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 2

# Buscar ngrok
$ngrokPaths = @(
    "$env:USERPROFILE\.ngrok\ngrok.exe",
    "C:\ngrok\ngrok.exe"
)

$ngrokExe = $null
foreach ($path in $ngrokPaths) {
    if (Test-Path $path) {
        $ngrokExe = $path
        break
    }
}

if ($null -eq $ngrokExe) {
    try {
        $ngrokExe = (Get-Command ngrok -ErrorAction Stop).Source
    } catch {
        Write-Host "[WARN] ngrok no encontrado" -ForegroundColor Yellow
        Write-Host "        Ejecuta: .\setup-ngrok.ps1 para instalarlo" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[INFO] Backend y Frontend iniciados correctamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "URLs:" -ForegroundColor Cyan
        Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
        Write-Host "  - Backend: http://localhost:5000" -ForegroundColor White
        Write-Host ""
        exit 0
    }
}

# Iniciar ngrok
Write-Host "[3/3] Iniciando ngrok..." -ForegroundColor Cyan
$ngrokCommand = @"
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  ngrok - Webhook Tunnel' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '[INFO] Cuando veas la URL publica:' -ForegroundColor Yellow
Write-Host '  1. Copia la URL HTTPS' -ForegroundColor White
Write-Host '  2. Ve a: https://www.mercadopago.com.ar/developers/panel/app' -ForegroundColor White
Write-Host '  3. Configura webhook: https://TU_URL/api/webhooks/mercadopago' -ForegroundColor White
Write-Host ''
Write-Host 'Panel de ngrok: http://localhost:4040' -ForegroundColor Gray
Write-Host ''
& '$ngrokExe' http 5000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $ngrokCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend: http://localhost:5000" -ForegroundColor White
Write-Host "  - ngrok Panel: http://localhost:4040" -ForegroundColor White
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Copia la URL de ngrok de la ventana que se abrio" -ForegroundColor White
Write-Host "  2. Configurala en Mercado Pago como webhook" -ForegroundColor White
Write-Host "  3. Prueba un pago en: http://localhost:5173/plans" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar el sistema: .\check-system.ps1" -ForegroundColor Gray
Write-Host ""
