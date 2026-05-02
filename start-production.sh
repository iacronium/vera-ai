#!/bin/bash

# Script de inicio para producción - Vera AI
# Uso: ./start-production.sh

echo "=========================================="
echo "  Vera AI - Inicio en Modo Producción"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm --version)"

echo ""
echo "Verificando variables de entorno..."

# Verificar .env del servidor
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ Archivo server/.env no encontrado${NC}"
    echo "Copia server/.env.example a server/.env y configura las variables"
    exit 1
fi
echo -e "${GREEN}✓${NC} server/.env encontrado"

# Verificar variables críticas
REQUIRED_VARS=("JWT_SECRET" "GROQ_API_KEY" "MERCADOPAGO_ACCESS_TOKEN" "EMAIL_USER" "EMAIL_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" server/.env || grep -q "^${var}=your_" server/.env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Variables de entorno no configuradas:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Configura estas variables en server/.env antes de continuar"
    exit 1
fi
echo -e "${GREEN}✓${NC} Variables críticas configuradas"

echo ""
echo "Instalando dependencias..."

# Instalar dependencias del frontend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
else
    echo -e "${GREEN}✓${NC} Dependencias del frontend ya instaladas"
fi

# Instalar dependencias del backend
if [ ! -d "server/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd server && npm install && cd ..
else
    echo -e "${GREEN}✓${NC} Dependencias del backend ya instaladas"
fi

echo ""
echo "Construyendo frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir el frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Frontend construido exitosamente"

echo ""
echo "Verificando base de datos..."
if [ -f "server/agency.db" ]; then
    echo -e "${GREEN}✓${NC} Base de datos existente encontrada"
else
    echo -e "${YELLOW}⚠${NC} Base de datos se creará al iniciar el servidor"
fi

echo ""
echo "=========================================="
echo "  ✅ Verificaciones Completadas"
echo "=========================================="
echo ""
echo "Iniciando servidor backend..."
echo ""

# Iniciar servidor
cd server && NODE_ENV=production node index.js
