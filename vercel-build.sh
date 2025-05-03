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

# Verificar se temos o cookie-handler.js e copiá-lo para public
if [ -f "public/cookie-handler.js" ]; then
  echo "Script de tratamento de cookies encontrado."
else
  echo "Criando script para tratamento de cookies de terceiros..."
  cat > public/cookie-handler.js << 'EOF'
// Script para tratamento de restrições de cookies de terceiros
(function() {
  console.log('Inicializando tratador de cookies de terceiros');

  // Detecta o navegador e suas configurações
  function detectBrowserSettings() {
    const ua = navigator.userAgent;
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    
    console.log('Navegador detectado:', 
      isChrome ? 'Chrome' : 
      isFirefox ? 'Firefox' : 
      isSafari ? 'Safari' : 'Outro');
    
    return { isChrome, isFirefox, isSafari };
  }

  // Resolve o problema de mensagens assíncronas
  function fixMessageChannelIssue() {
    if (window.MessageChannel) {
      try {
        // Substitui o MessageChannel com uma versão que não falha silenciosamente
        const OriginalMessageChannel = window.MessageChannel;
        window.MessageChannel = function() {
          const channel = new OriginalMessageChannel();
          
          // Adiciona tratamento de erros ao postMessage da port1
          const originalPort1PostMessage = channel.port1.postMessage;
          channel.port1.postMessage = function() {
            try {
              return originalPort1PostMessage.apply(this, arguments);
            } catch (e) {
              console.warn('Erro interceptado em MessageChannel.port1.postMessage:', e);
              return false;
            }
          };
          
          // Adiciona tratamento de erros ao postMessage da port2
          const originalPort2PostMessage = channel.port2.postMessage;
          channel.port2.postMessage = function() {
            try {
              return originalPort2PostMessage.apply(this, arguments);
            } catch (e) {
              console.warn('Erro interceptado em MessageChannel.port2.postMessage:', e);
              return false;
            }
          };
          
          return channel;
        };
        
        console.log('MessageChannel ajustado para prevenir erros de canal fechado');
      } catch (e) {
        console.error('Não foi possível ajustar MessageChannel:', e);
      }
    }
  }

  // Detecta as configurações do navegador
  const browserSettings = detectBrowserSettings();
  
  // Aplica as correções
  fixMessageChannelIssue();
  
  // Se for Chrome, que é onde o problema ocorre mais frequentemente
  if (browserSettings.isChrome) {
    // Adicionar gatilho para interceptar erros de mensagens
    window.addEventListener('error', function(event) {
      if (event.message && event.message.includes('message channel closed')) {
        console.warn('Erro de canal de mensagem interceptado:', event);
        event.preventDefault();
        return false;
      }
    }, true);
  }
  
  console.log('Tratador de cookies de terceiros inicializado com sucesso');
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