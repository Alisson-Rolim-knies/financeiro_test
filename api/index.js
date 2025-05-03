// Arquivo simplificado para a Vercel - Serverless Function
const fs = require('fs');
const path = require('path');

// Função de manipulação de requisições para Vercel Serverless
module.exports = async (req, res) => {
  // Permitir solicitações CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder imediatamente a solicitações OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { url, method } = req;
    
    // Log da requisição para depuração
    console.log(`Recebida requisição ${method} para ${url}`);
    
    // Rota para o arquivo visiocar.html
    if (url === '/visiocar.html' || url === '/app') {
      try {
        const htmlPath = path.join(__dirname, '..', 'public', 'visiocar.html');
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, 'utf8');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(html);
        } else {
          console.log(`Arquivo não encontrado: ${htmlPath}`);
          return res.status(404).send('Arquivo visiocar.html não encontrado');
        }
      } catch (error) {
        console.error(`Erro ao servir visiocar.html: ${error.message}`);
        return res.status(500).send(`Erro interno: ${error.message}`);
      }
    }
    
    // Rota para verificação de status
    if (url === '/app/status') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        serverInfo: 'VisioCar API v1.0'
      });
    }
    
    // Verificar se existem outros arquivos estáticos sendo solicitados
    if (url.includes('.') && !url.includes('..')) {
      const filePath = path.join(__dirname, '..', 'public', url);
      if (fs.existsSync(filePath)) {
        const file = fs.readFileSync(filePath);
        // Determinar o tipo MIME adequado
        const ext = path.extname(url).toLowerCase();
        let contentType = 'text/plain';
        if (ext === '.html') contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'application/javascript';
        if (ext === '.json') contentType = 'application/json';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        
        res.setHeader('Content-Type', contentType);
        return res.status(200).send(file);
      }
    }
    
    // Servir a página de índice para qualquer outra rota
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
    
    // Fallback final - redirecionamento
    return res.writeHead(302, { Location: '/visiocar.html' }).end();
  } catch (error) {
    console.error(`Erro não tratado: ${error.message}`);
    return res.status(500).send(`Erro interno do servidor: ${error.message}`);
  }
};