// Arquivo simplificado para a Vercel - Serverless Function
const fs = require('fs');
const path = require('path');

// Função de manipulação de requisições para Vercel Serverless
module.exports = (req, res) => {
  const { url } = req;
  
  // Rota para o arquivo visiocar.html
  if (url === '/visiocar.html' || url === '/app') {
    try {
      const htmlPath = path.join(__dirname, '..', 'public', 'visiocar.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(html);
    } catch (error) {
      return res.status(404).end('Arquivo visiocar.html não encontrado');
    }
  }
  
  // Rota para verificação de status
  if (url === '/app/status') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'online',
      timestamp: new Date().toISOString()
    }));
  }
  
  // Redirecionamento para visiocar.html
  return res.writeHead(302, { Location: '/visiocar.html' }).end();
};