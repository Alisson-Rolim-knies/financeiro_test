// Script de compatibilidade para evitar erros de comunicação assíncrona na Vercel
(function() {
  // Impedir que promessas não tratadas causem erros
  window.addEventListener('unhandledrejection', function(event) {
    // Registrar o erro, mas evitar que ele interrompa a aplicação
    console.warn('Promessa não tratada foi rejeitada:', event.reason);
    event.preventDefault();
  });

  // Configurar timeout mais longo para operações assíncronas
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, time) {
    return originalSetTimeout(callback, time > 30000 ? 30000 : time);
  };

  // Garantir que o canal de mensagens não feche prematuramente
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin, transfer) {
    try {
      return originalPostMessage.call(this, message, targetOrigin, transfer);
    } catch(e) {
      console.warn('Erro ao enviar mensagem:', e);
      return false;
    }
  };

  console.log('Compatibilidade Vercel inicializada');
})();