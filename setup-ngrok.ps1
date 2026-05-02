# Script automatizado para configurar e iniciar ngrok
# Synthesized Ether - Webhook Setup

param(
    [string]$AuthToken = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuracion de ngrok para Webhooks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Directorio de instalacion
$ngrokDir = "$env:USERPROFILE\.ngrok"
$ngrokExe = "$ngrokDir\ngrok.exe"

# Verificar si ngrok ya esta instalado
if (Test-Path $ngrokExe) {
    Write-Host "[OK] ngrok encontrado en: $ngrokExe" -ForegroundColor Green
} else {
    Write-Host "[INFO] ngrok no encontrado. Descargando..." -ForegroundColor Yellow
    
    # Crear directorio
    if (-not (Test-Path $ngrokDir)) {
        New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
    }
    
    # Descargar ngrok
    $downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    $zipPath = "$ngrokDir\ngrok.zip"
    
    Write-Host "[INFO] Descargando desde: $downloadUrl" -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
        Write-Host "[OK] Descarga completada" -ForegroundColor Green
        
        # Extraer ZIP
        Write-Host "[INFO] Extrayendo archivos..." -ForegroundColor Yellow
        Expand-Archive -Path $zipPath -DestinationPath $ngrokDir -Force
        Remove-Item $zipPath
        Write-Host "[OK] ngrok instalado en: $ngrokDir" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] No se pudo descargar ngrok: $_" -ForegroundColor Red
        Write-Host "[INFO] Descarga manual desde: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Configurar authtoken
if ($AuthToken -eq "") {
    Write-Host "[INFO] Ingresa tu authtoken de ngrok:" -ForegroundColor Yellow
    Write-Host "       (Lo puedes obtener en: https://dashboard.ngrok.com/get-started/your-authtoken)" -ForegroundColor Gray
    $AuthToken = Read-Host "Authtoken"
}

if ($AuthToken -ne "") {
    Write-Host "[INFO] Configurando authtoken..." -ForegroundColor Yellow
    try {
        & $ngrokExe config add-authtoken $AuthToken 2>&1 | Out-Null
        Write-Host "[OK] Authtoken configurado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] No se pudo configurar el authtoken: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERROR] Authtoken requerido" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando ngrok..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend este corriendo
Write-Host "[INFO] Verificando que el backend este corriendo..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "[OK] Backend corriendo en http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Backend no esta corriendo en http://localhost:5000" -ForegroundColor Yellow
    Write-Host "       Asegurate de iniciar el backend antes de usar ngrok" -ForegroundColor Gray
    Write-Host "       Comando: cd server && node index.js" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[INFO] Iniciando ngrok en http://localhost:5000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""

# Iniciar ngrok
& $ngrokExe http 5000

# Nota: El script se quedara aqui mientras ngrok este corriendo
# Presiona Ctrl+C para detener ngrok
