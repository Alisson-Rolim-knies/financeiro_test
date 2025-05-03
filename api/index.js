// Arquivo simplificado para a Vercel
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota específica para servir o arquivo visiocar.html
app.get('/visiocar.html', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'visiocar.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).send('Arquivo não encontrado');
  }
});

// Rota para redirecionamento
app.get('/app', (req, res) => {
  res.redirect('/visiocar.html');
});

// Rota de status
app.get('/app/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota padrão para o SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/index.html'));
});

// Exporta o módulo para a Vercel
module.exports = app;