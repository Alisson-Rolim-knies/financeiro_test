#!/bin/bash

# Script para iniciar o VisioCar na plataforma Render
echo "Iniciando VisioCar no Render..."

# Definir variáveis de ambiente
export NODE_ENV=production
export RENDER=true
export PORT=${PORT:-10000}

# Copiar arquivos estáticos
echo "Copiando arquivos estáticos..."
mkdir -p public
if [ -d "attached_assets" ]; then
  cp -r attached_assets/* public/
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "Instalando dependências..."
  npm install
fi

# Iniciar o servidor
echo "Iniciando servidor na porta $PORT..."

# Verificar se temos tsx instalado
if command -v tsx &> /dev/null; then
  echo "Usando tsx para iniciar o servidor..."
  tsx server/index.ts
else
  echo "Usando node para iniciar o servidor..."
  # Verificar se temos server/index.js (compilado) ou precisamos usar server/index.ts
  if [ -f "server/index.js" ]; then
    node server/index.js
  else
    echo "AVISO: Tentando usar node com TypeScript. Isso pode falhar se o TypeScript não estiver configurado corretamente."
    node -r ts-node/register server/index.ts
  fi
fi