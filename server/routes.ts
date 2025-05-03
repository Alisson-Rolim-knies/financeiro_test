import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import { 
  insertInspectionSchema, 
  insertDepositSchema, 
  insertExpenseSchema
} from "@shared/schema";

// Helper para validar datas nas requisições
const parseDateParam = (dateStr: string): Date | null => {
  try {
    return new Date(dateStr);
  } catch (e) {
    return null;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Para evitar problemas com path-to-regexp, vamos usar o Router do Express
  const inspectionRouter = express.Router();
  const depositRouter = express.Router();
  const expenseRouter = express.Router();
  const statusRouter = express.Router();
  
  // Registrar os routers na aplicação principal
  app.use('/api/inspections', inspectionRouter);
  app.use('/api/deposits', depositRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/status', statusRouter);

  // ******************************
  // Rotas da API para o VisioCar
  // ******************************

  // Rotas para Inspeções (Vistorias)
  app.get('/api/inspections', async (req: Request, res: Response) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      if (date) {
        const parsedDate = parseDateParam(date as string);
        if (!parsedDate) {
          return res.status(400).json({ error: 'Data inválida' });
        }
        const inspections = await storage.getInspectionsByDate(parsedDate);
        return res.json(inspections);
      } else if (startDate && endDate) {
        const parsedStartDate = parseDateParam(startDate as string);
        const parsedEndDate = parseDateParam(endDate as string);
        if (!parsedStartDate || !parsedEndDate) {
          return res.status(400).json({ error: 'Datas inválidas' });
        }
        const inspections = await storage.getInspectionsByDateRange(
          parsedStartDate,
          parsedEndDate
        );
        return res.json(inspections);
      } else {
        return res.status(400).json({ error: 'É necessário fornecer date ou startDate e endDate' });
      }
    } catch (error) {
      console.error('Erro ao buscar inspeções:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/inspections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspeção não encontrada' });
      }
      
      return res.json(inspection);
    } catch (error) {
      console.error('Erro ao buscar inspeção:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/inspections', async (req: Request, res: Response) => {
    try {
      const result = insertInspectionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: result.error.format() 
        });
      }
      
      const inspection = await storage.createInspection(result.data);
      return res.status(201).json(inspection);
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put('/api/inspections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      // Validação parcial dos dados para permitir atualizações parciais
      const validKeys = [
        'placa', 'dataHora', 'cliente', 'tipo', 'valor', 
        'dinheiro', 'pix', 'observacoes', 'dia'
      ];
      
      const updateData: Record<string, any> = {};
      
      for (const key of Object.keys(req.body)) {
        if (validKeys.includes(key)) {
          updateData[key] = req.body[key];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido para atualização' });
      }
      
      const updatedInspection = await storage.updateInspection(id, updateData);
      if (!updatedInspection) {
        return res.status(404).json({ error: 'Inspeção não encontrada' });
      }
      
      return res.json(updatedInspection);
    } catch (error) {
      console.error('Erro ao atualizar inspeção:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete('/api/inspections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const success = await storage.deleteInspection(id);
      if (!success) {
        return res.status(404).json({ error: 'Inspeção não encontrada' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir inspeção:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rotas para Depósitos
  app.get('/api/deposits', async (req: Request, res: Response) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      if (date) {
        const parsedDate = parseDateParam(date as string);
        if (!parsedDate) {
          return res.status(400).json({ error: 'Data inválida' });
        }
        const deposits = await storage.getDepositsByDate(parsedDate);
        return res.json(deposits);
      } else if (startDate && endDate) {
        const parsedStartDate = parseDateParam(startDate as string);
        const parsedEndDate = parseDateParam(endDate as string);
        if (!parsedStartDate || !parsedEndDate) {
          return res.status(400).json({ error: 'Datas inválidas' });
        }
        const deposits = await storage.getDepositsByDateRange(
          parsedStartDate,
          parsedEndDate
        );
        return res.json(deposits);
      } else {
        return res.status(400).json({ error: 'É necessário fornecer date ou startDate e endDate' });
      }
    } catch (error) {
      console.error('Erro ao buscar depósitos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/deposits/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const deposit = await storage.getDeposit(id);
      if (!deposit) {
        return res.status(404).json({ error: 'Depósito não encontrado' });
      }
      
      return res.json(deposit);
    } catch (error) {
      console.error('Erro ao buscar depósito:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/deposits', async (req: Request, res: Response) => {
    try {
      const result = insertDepositSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: result.error.format() 
        });
      }
      
      const deposit = await storage.createDeposit(result.data);
      return res.status(201).json(deposit);
    } catch (error) {
      console.error('Erro ao criar depósito:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put('/api/deposits/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const validKeys = ['data', 'valor', 'observacoes'];
      
      const updateData: Record<string, any> = {};
      
      for (const key of Object.keys(req.body)) {
        if (validKeys.includes(key)) {
          updateData[key] = req.body[key];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido para atualização' });
      }
      
      const updatedDeposit = await storage.updateDeposit(id, updateData);
      if (!updatedDeposit) {
        return res.status(404).json({ error: 'Depósito não encontrado' });
      }
      
      return res.json(updatedDeposit);
    } catch (error) {
      console.error('Erro ao atualizar depósito:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete('/api/deposits/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const success = await storage.deleteDeposit(id);
      if (!success) {
        return res.status(404).json({ error: 'Depósito não encontrado' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir depósito:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rotas para Despesas
  app.get('/api/expenses', async (req: Request, res: Response) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      if (date) {
        const parsedDate = parseDateParam(date as string);
        if (!parsedDate) {
          return res.status(400).json({ error: 'Data inválida' });
        }
        const expenses = await storage.getExpensesByDate(parsedDate);
        return res.json(expenses);
      } else if (startDate && endDate) {
        const parsedStartDate = parseDateParam(startDate as string);
        const parsedEndDate = parseDateParam(endDate as string);
        if (!parsedStartDate || !parsedEndDate) {
          return res.status(400).json({ error: 'Datas inválidas' });
        }
        const expenses = await storage.getExpensesByDateRange(
          parsedStartDate,
          parsedEndDate
        );
        return res.json(expenses);
      } else {
        return res.status(400).json({ error: 'É necessário fornecer date ou startDate e endDate' });
      }
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ error: 'Despesa não encontrada' });
      }
      
      return res.json(expense);
    } catch (error) {
      console.error('Erro ao buscar despesa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const result = insertExpenseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: result.error.format() 
        });
      }
      
      const expense = await storage.createExpense(result.data);
      return res.status(201).json(expense);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const validKeys = ['data', 'descricao', 'valor', 'observacoes'];
      
      const updateData: Record<string, any> = {};
      
      for (const key of Object.keys(req.body)) {
        if (validKeys.includes(key)) {
          updateData[key] = req.body[key];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido para atualização' });
      }
      
      const updatedExpense = await storage.updateExpense(id, updateData);
      if (!updatedExpense) {
        return res.status(404).json({ error: 'Despesa não encontrada' });
      }
      
      return res.json(updatedExpense);
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ error: 'Despesa não encontrada' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Removendo a rota específica para visiocar.html pois ela já está sendo 
  // servida pelo middleware de arquivos estáticos e pelo código em index.ts

  // Rota de status do sistema para verificar o funcionamento
  statusRouter.get('/', (req, res) => {
    try {
      res.json({
        status: 'online',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL conectado'
      });
    } catch (error) {
      console.error('Erro na rota /api/status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Servir os arquivos estáticos do diretório attached_assets
  app.use(express.static(path.join(process.cwd(), 'attached_assets')));

  // Rota para a página de login
  app.get('/login', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'attached_assets', 'index.html'));
  });

  // Rota para todas as outras requisições não atendidas
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'attached_assets', 'index.html'));
  });

  const httpServer = createServer(app);

  return httpServer;
}
