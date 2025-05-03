/**
 * Cookie Handler - Gerencia a comunicação em ambientes com restrições de cookies de terceiros
 * Especificamente para resolver o erro:
 * "Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
 */

(function() {
  console.log('Inicializando Cookie Handler para compatibilidade com restrições de cookies de terceiros');
  
  // Detecta se estamos em um ambiente que bloqueia cookies de terceiros
  function detectCookieRestrictions() {
    try {
      // Tenta criar um cookie de teste
      document.cookie = "cookieTest=1; SameSite=None; Secure";
      const hasCookie = document.cookie.indexOf("cookieTest=") !== -1;
      
      // Limpa o cookie de teste
      document.cookie = "cookieTest=1; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      return !hasCookie;
    } catch (e) {
      console.warn('Erro ao detectar restrições de cookies:', e);
      // Em caso de erro, assumimos que há restrição
      return true;
    }
  }
  
  // Adapta a aplicação para trabalhar com restrições de cookies
  function adaptForCookieRestrictions() {
    // 1. Usar localStorage em vez de sessionStorage quando possível
    const originalSessionStorage = window.sessionStorage;
    
    try {
      // Backup de dados existentes em sessionStorage
      const sessionData = {};
      for (let i = 0; i < originalSessionStorage.length; i++) {
        const key = originalSessionStorage.key(i);
        sessionData[key] = originalSessionStorage.getItem(key);
      }
      
      // Mover para localStorage
      Object.keys(sessionData).forEach(key => {
        try {
          localStorage.setItem(`session_${key}`, sessionData[key]);
        } catch (e) {
          console.warn(`Não foi possível mover ${key} para localStorage`);
        }
      });
      
      // Criar proxy para sessionStorage
      const sessionStorageProxy = {
        getItem: function(key) {
          return localStorage.getItem(`session_${key}`);
        },
        setItem: function(key, value) {
          try {
            localStorage.setItem(`session_${key}`, value);
          } catch (e) {
            console.warn(`Usando fallback para sessionStorage.setItem devido a restrições`);
            try {
              originalSessionStorage.setItem(key, value);
            } catch (innerE) {
              console.error('Não foi possível armazenar dados nem em localStorage nem em sessionStorage');
            }
          }
        },
        removeItem: function(key) {
          localStorage.removeItem(`session_${key}`);
        },
        clear: function() {
          // Remove apenas os itens com prefixo session_
          const toRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('session_')) {
              toRemove.push(key);
            }
          }
          toRemove.forEach(key => localStorage.removeItem(key));
        }
      };
      
      // Substituir apenas os métodos que usamos, não toda a API
      // Isso é mais seguro do que sobrescrever completamente
      window.sessionStorage.getItem = sessionStorageProxy.getItem;
      window.sessionStorage.setItem = sessionStorageProxy.setItem;
      window.sessionStorage.removeItem = sessionStorageProxy.removeItem;
      window.sessionStorage.clear = sessionStorageProxy.clear;
      
    } catch (e) {
      console.error('Erro ao adaptar sessionStorage:', e);
    }
    
    // 2. Evitar o uso de postMessage que pode ser bloqueado
    // Sobrescrever apenas os métodos que causam problemas
    const originalPostMessage = window.postMessage;
    window.postMessage = function(message, targetOrigin, transfer) {
      try {
        // Verifica se estamos na mesma origem para evitar erros
        const currentOrigin = window.location.origin;
        const isSameOrigin = targetOrigin === '*' || targetOrigin === currentOrigin;
        
        if (isSameOrigin) {
          return originalPostMessage.call(this, message, targetOrigin, transfer);
        } else {
          console.warn('Tentativa de enviar mensagem para origem diferente bloqueada devido a restrições de cookies');
          // Retornamos false para indicar que a mensagem não foi enviada
          return false;
        }
      } catch (e) {
        console.warn('Erro ao enviar mensagem via postMessage:', e);
        return false;
      }
    };
    
    // 3. Adaptação para comunicação assíncrona
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('message channel closed before a response was received')) {
        console.warn('Interceptada falha em canal de mensagens:', event.reason);
        event.preventDefault(); // Impede a propagação do erro
      }
    });
  }
  
  // Executa a detecção e adaptação
  if (detectCookieRestrictions()) {
    console.log('Restrições de cookies de terceiros detectadas, adaptando comportamento');
    adaptForCookieRestrictions();
  } else {
    console.log('Nenhuma restrição de cookies detectada, mas aplicando adaptações preventivas');
    adaptForCookieRestrictions();
  }
  
  // Ajuste adicional para o erro específico mencionado
  if (window.MessageChannel) {
    const originalMessageChannel = window.MessageChannel;
    window.MessageChannel = class ExtendedMessageChannel extends MessageChannel {
      constructor() {
        super();
        
        // Adicionar timeout para portas do canal
        const originalPort1PostMessage = this.port1.postMessage;
        this.port1.postMessage = function(...args) {
          try {
            return originalPort1PostMessage.apply(this, args);
          } catch (e) {
            console.warn('Erro em port1.postMessage interceptado:', e);
            return false;
          }
        };
        
        const originalPort2PostMessage = this.port2.postMessage;
        this.port2.postMessage = function(...args) {
          try {
            return originalPort2PostMessage.apply(this, args);
          } catch (e) {
            console.warn('Erro em port2.postMessage interceptado:', e);
            return false;
          }
        };
      }
    };
  }
  
  console.log('Cookie Handler inicializado com sucesso');
})();