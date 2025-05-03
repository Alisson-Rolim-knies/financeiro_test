import fs from 'fs';
import path from 'path';

export default function Home({ htmlContent }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

export async function getStaticProps() {
  let htmlContent = '';
  
  try {
    // Tenta ler o arquivo HTML da pasta attached_assets para servi-lo como conteúdo estático
    const htmlPath = path.join(process.cwd(), 'attached_assets', 'index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Adiciona tratamento de erros assíncronos diretamente no HTML
    htmlContent = htmlContent.replace(
      '</head>',
      `
      <!-- Script de tratamento de erros assíncronos para Vercel -->
      <script>
        window.addEventListener('unhandledrejection', function(event) {
          console.warn('Promessa não tratada foi rejeitada:', event.reason);
          event.preventDefault();
        });
        
        // Garantir que todas as operações assíncronas tenham timeout
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const controller = new AbortController();
          const { signal } = controller;
          
          // Se já houver um signal na requisição, respeitá-lo
          const hasSignal = args[1] && args[1].signal;
          if (!hasSignal && args[1]) {
            args[1].signal = signal;
          } else if (!args[1]) {
            args[1] = { signal };
          }
          
          // Configurar timeout de 15 segundos
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          // Fazer a requisição e limpar o timeout quando terminar
          return originalFetch.apply(this, args)
            .finally(() => clearTimeout(timeoutId));
        };
      </script>
      </head>`
    );

  } catch (error) {
    console.error('Erro ao ler arquivo HTML:', error);
    htmlContent = '<h1>Erro ao carregar o aplicativo VisioCar</h1><p>Por favor, tente novamente mais tarde.</p>';
  }

  return {
    props: {
      htmlContent,
    },
    // Revalidar a cada hora para garantir conteúdo atualizado
    revalidate: 3600,
  };
}