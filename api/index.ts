// Arquivo para o Vercel Serverless Functions
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();

// Servir arquivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'dist')));

// Rota para visiocar.html
app.get('/visiocar.html', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'visiocar.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Tenta encontrar na pasta dist/public
  const distFilePath = path.join(process.cwd(), 'dist', 'public', 'visiocar.html');
  if (fs.existsSync(distFilePath)) {
    return res.sendFile(distFilePath);
  }
  
  return res.status(404).send('Arquivo visiocar.html não encontrado');
});

// Rota /app para redirecionar para visiocar.html
app.get('/app', (req, res) => {
  res.redirect('/visiocar.html');
});

// Rota de status para verificar a saúde da aplicação
app.get('/app/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Rota padrão para o SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Exporta o aplicativo Express para ser usado pelo Vercel
export default app;