import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Rota para servir o arquivo visiocar.html
  app.get('/visiocar.html', (req, res) => {
    const filePath = path.resolve('./public/visiocar.html');
    try {
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).send('Arquivo não encontrado');
      }
    } catch (err) {
      console.error('Erro ao acessar visiocar.html:', err);
      res.status(500).send('Erro ao acessar o arquivo');
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
