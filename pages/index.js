import { useEffect } from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';

// Esta função apenas serve o arquivo HTML diretamente
export default function Home({ htmlContent }) {
  useEffect(() => {
    // Script para injetar o HTML diretamente na página
    const root = document.getElementById('app-root');
    if (root) {
      root.innerHTML = htmlContent;
    }

    // Executar scripts que possam estar no HTML
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [htmlContent]);

  return (
    <>
      <Head>
        <title>VisioCar - Sistema de Gerenciamento de Vistorias</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div id="app-root"></div>
    </>
  );
}

// Obter o conteúdo HTML do arquivo estático
export async function getStaticProps() {
  const htmlPath = path.join(process.cwd(), 'attached_assets', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  return {
    props: {
      htmlContent,
    },
  };
}