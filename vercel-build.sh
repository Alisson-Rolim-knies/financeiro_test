#!/bin/bash

# Executar o build padrão
npm run build

# Garantir que o diretório public seja copiado
mkdir -p dist/public
cp -r public/* dist/public/

# Mensagem de conclusão
echo "✅ Build concluído com sucesso!"