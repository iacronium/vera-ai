# Script de verificacion del sistema Synthesized Ether
# Verifica que todos los servicios esten corriendo correctamente

Write-Host "[*] Verificando el sistema Synthesized Ether..." -ForegroundColor Cyan
Write-Host ""

# Verificar Backend
Write-Host "[Backend] Verificando http://localhost:5000..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($backend.StatusCode -eq 200) {
        Write-Host "[OK] Backend funcionando correctamente" -ForegroundColor Green
        $backendData = $backend.Content | ConvertFrom-Json
        Write-Host "     Timestamp: $($backendData.timestamp)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Backend NO esta corriendo" -ForegroundColor Red
    Write-Host "        Solucion: Abre una terminal y ejecuta:" -ForegroundColor Yellow
    Write-Host "        cd server" -ForegroundColor White
    Write-Host "        node index.js" -ForegroundColor White
}

Write-Host ""

# Verificar Frontend
Write-Host "[Frontend] Verificando http://localhost:5173..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host "[OK] Frontend funcionando correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Frontend NO esta corriendo" -ForegroundColor Red
    Write-Host "        Solucion: Abre una terminal y ejecuta:" -ForegroundColor Yellow
    Write-Host "        npm run dev" -ForegroundColor White
}

Write-Host ""

# Verificar ngrok
Write-Host "[ngrok] Verificando ngrok..." -ForegroundColor Yellow
try {
    $ngrok = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing -TimeoutSec 5
    $ngrokData = $ngrok.Content | ConvertFrom-Json
    
    if ($ngrokData.tunnels.Count -gt 0) {
        Write-Host "[OK] ngrok funcionando correctamente" -ForegroundColor Green
        $publicUrl = $ngrokData.tunnels[0].public_url
        Write-Host "     URL publica: $publicUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[IMPORTANTE] Configura esta URL en Mercado Pago:" -ForegroundColor Yellow
        Write-Host "             $publicUrl/api/webhooks/mercadopago" -ForegroundColor White
        Write-Host ""
        Write-Host "             Panel de ngrok: http://localhost:4040" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] ngrok NO esta corriendo" -ForegroundColor Red
    Write-Host "        Solucion: Abre una terminal y ejecuta:" -ForegroundColor Yellow
    Write-Host "        ngrok http 5000" -ForegroundColor White
    Write-Host ""
    Write-Host "        Si no tienes ngrok instalado:" -ForegroundColor Yellow
    Write-Host "        1. Descarga de: https://ngrok.com/download" -ForegroundColor White
    Write-Host "        2. Extrae ngrok.exe a C:\ngrok\" -ForegroundColor White
    Write-Host "        3. Ejecuta: ngrok config add-authtoken TU_TOKEN" -ForegroundColor White
    Write-Host "        4. Ejecuta: ngrok http 5000" -ForegroundColor White
}

Write-Host ""

# Verificar credenciales de Mercado Pago
Write-Host "[Credenciales] Verificando Mercado Pago..." -ForegroundColor Yellow
$envPath = "server\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "MERCADOPAGO_PUBLIC_KEY=APP_USR-") {
        Write-Host "[OK] Public Key configurada" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Public Key no encontrada o invalida" -ForegroundColor Yellow
    }
    
    if ($envContent -match "MERCADOPAGO_ACCESS_TOKEN=APP_USR-") {
        Write-Host "[OK] Access Token configurado" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Access Token no encontrado o invalido" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Archivo server\.env no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""

# Resumen
Write-Host "[Resumen] Estado del sistema:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para que el sistema funcione completamente, necesitas:" -ForegroundColor White
Write-Host "  1. Backend corriendo (node index.js)" -ForegroundColor White
Write-Host "  2. Frontend corriendo (npm run dev)" -ForegroundColor White
Write-Host "  3. ngrok corriendo (ngrok http 5000)" -ForegroundColor White
Write-Host "  4. Webhook configurado en Mercado Pago" -ForegroundColor White
Write-Host ""
Write-Host "[Guias] Documentacion disponible:" -ForegroundColor Cyan
Write-Host "  - WEBHOOK_SETUP_GUIDE.md (Configuracion de webhooks)" -ForegroundColor White
Write-Host "  - MERCADOPAGO_SETUP.md (Configuracion general)" -ForegroundColor White
Write-Host "  - README.md (Documentacion completa)" -ForegroundColor White
Write-Host ""
Write-Host "[URLs] Enlaces importantes:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend: http://localhost:5000" -ForegroundColor White
Write-Host "  - ngrok Panel: http://localhost:4040" -ForegroundColor White
Write-Host "  - Mercado Pago: https://www.mercadopago.com.ar/developers/panel/app" -ForegroundColor White
Write-Host ""
