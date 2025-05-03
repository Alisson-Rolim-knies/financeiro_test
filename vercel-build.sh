#!/bin/bash

# Este script prepara o ambiente para deploy na Vercel

echo "Iniciando preparação para deploy na Vercel..."

# Verificar qual ambiente de runtime estamos
if [ -d "/var/task" ]; then
  echo "Ambiente Vercel detectado."
else
  echo "Ambiente local detectado."
fi

# Garantir que a pasta public existe
mkdir -p public

# Copiar todos os assets para a pasta public
if [ -d "attached_assets" ]; then
  echo "Copiando arquivos de attached_assets para public..."
  cp -r attached_assets/* public/
fi

# Verificar se temos o vercel-compat.js e copiá-lo para public
if [ -f "public/vercel-compat.js" ]; then
  echo "Script de compatibilidade Vercel encontrado."
else
  echo "Criando script de compatibilidade para Vercel..."
  cat > public/vercel-compat.js << 'EOF'
// Script de compatibilidade para evitar erros na Vercel
(function() {
  // Tratamento para promessas não resolvidas
  window.addEventListener('unhandledrejection', function(event) {
    console.warn('Promessa não tratada:', event.reason);
    event.preventDefault();
  });

  // Timeout para todas as requisições fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Adicionar signal à requisição
    if (args[1] && !args[1].signal) {
      args[1].signal = signal;
    } else if (!args[1]) {
      args[1] = { signal };
    }
    
    // Configurar timeout
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    return originalFetch.apply(this, args)
      .finally(() => clearTimeout(timeoutId));
  };

  console.log('Script de compatibilidade Vercel inicializado');
})();
EOF
fi

# Verificar se precisamos criar next.config.js
if [ -f "next.config.js" ]; then
  echo "next.config.js encontrado."
else
  echo "Criando next.config.js..."
  cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}
EOF
fi

# Terminar sem executar o build real (o Next.js da Vercel fará isso)
echo "Preparação concluída. Vercel irá continuar com o build."
exit 0