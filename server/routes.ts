import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  
  // Servir arquivos estáticos da pasta public
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Rota específica para servir o arquivo visiocar.html
  app.get('/visiocar.html', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'visiocar.html');
    console.log('Tentando acessar visiocar.html em:', filePath);
    
    try {
      if (fs.existsSync(filePath)) {
        console.log('Arquivo encontrado, enviando...');
        return res.sendFile(filePath);
      } else {
        console.log('Arquivo não encontrado');
        return res.status(404).send('Arquivo não encontrado');
      }
    } catch (err) {
      console.error('Erro ao acessar visiocar.html:', err);
      return res.status(500).send('Erro ao acessar o arquivo');
    }
  });
  
  // Adicionar rota para redirecionamento em caso de login
  app.get('/app', (req, res) => {
    res.redirect('/visiocar.html');
  });

  // Rota de status do sistema para verificar o funcionamento
  app.get('/app/status', (req, res) => {
    const publicFiles = fs.readdirSync(path.join(process.cwd(), 'public'));
    
    res.json({
      status: 'online',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      publicFiles: publicFiles,
      visiocarHtmlExists: fs.existsSync(path.join(process.cwd(), 'public', 'visiocar.html'))
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
