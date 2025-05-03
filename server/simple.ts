import express from "express";
import path from "path";
import { createServer } from "http";
import { storage } from "./storage";
import { 
  insertInspectionSchema, 
  insertDepositSchema, 
  insertExpenseSchema
} from "@shared/schema";

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), "public")));

// Rota de status
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "Servidor VisioCar funcionando!",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL conectado"
  });
});

// Helper para validar datas nas requisições
const parseDateParam = (dateStr: string): Date | null => {
  try {
    return new Date(dateStr);
  } catch (e) {
    return null;
  }
};

// Rotas para Inspeções
app.get('/api/inspections', async (req, res) => {
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

app.get('/api/inspections/:id', async (req, res) => {
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

app.post('/api/inspections', async (req, res) => {
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

app.put('/api/inspections/:id', async (req, res) => {
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

app.delete('/api/inspections/:id', async (req, res) => {
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

// Rotas para Depósitos - Implementação similar
app.get('/api/deposits', async (req, res) => {
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
      const deposits = await storage.getDepositsByDateRange(parsedStartDate, parsedEndDate);
      return res.json(deposits);
    } else {
      return res.status(400).json({ error: 'É necessário fornecer date ou startDate e endDate' });
    }
  } catch (error) {
    console.error('Erro ao buscar depósitos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Post, put, delete para depósitos
app.post('/api/deposits', async (req, res) => {
  try {
    const result = insertDepositSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.format() });
    }
    
    const deposit = await storage.createDeposit(result.data);
    return res.status(201).json(deposit);
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Despesas - Implementação similar
app.get('/api/expenses', async (req, res) => {
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
      const expenses = await storage.getExpensesByDateRange(parsedStartDate, parsedEndDate);
      return res.json(expenses);
    } else {
      return res.status(400).json({ error: 'É necessário fornecer date ou startDate e endDate' });
    }
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Post, put, delete para despesas
app.post('/api/expenses', async (req, res) => {
  try {
    const result = insertExpenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: result.error.format() });
    }
    
    const expense = await storage.createExpense(result.data);
    return res.status(201).json(expense);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar o servidor
const server = createServer(app);
const port = Number(process.env.PORT || 5000);

// Versão mais simples do listen para evitar erros de tipagem
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});