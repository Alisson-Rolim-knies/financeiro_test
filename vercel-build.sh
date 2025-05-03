#!/bin/bash

# Esse arquivo não será utilizado na nova abordagem, mas o mantemos para compatibilidade

echo "Utilizando abordagem simplificada para deploy no Vercel..."
echo "Verificando a existência de arquivos importantes..."

if [ -f "public/visiocar.html" ]; then
  echo "✅ Arquivo visiocar.html encontrado em public/"
else
  echo "❌ Arquivo visiocar.html NÃO encontrado em public/"
fi

# Não fazemos mais a cópia de public/ para dist/
echo "Deploy simplificado - não é necessário fazer build"