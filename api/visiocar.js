// API handler para Vercel
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Importações necessárias
const express = require('express');
const serverless = require('serverless-http');

// Setup da aplicação Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Função auxiliar para parsear datas
const parseDateParam = (dateStr) => {
  try {
    return new Date(dateStr);
  } catch (e) {
    return null;
  }
};

// Configuração da Vercel: conectar ao banco de dados
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Schema do banco de dados
const schema = {
  inspections: {
    $inferSelect: {},
    $inferInsert: {}
  },
  deposits: {
    $inferSelect: {},
    $inferInsert: {}
  },
  expenses: {
    $inferSelect: {},
    $inferInsert: {}
  }
};

// Para desenvolvimento, usamos dados na memória
// No ambiente de produção, isso será substituído por chamadas ao Supabase
let mockData = {
  inspections: [],
  deposits: [],
  expenses: []
};

// Classe Mock para operações com o banco
class MockStorage {
  constructor() {
    this.loadSampleData();
  }

  loadSampleData() {
    // Inicializa com alguns dados de exemplo
    const today = new Date().toISOString().split('T')[0];
    
    mockData.inspections = [
      {
        id: 1,
        placa: 'ABC1234',
        dataHora: new Date().toISOString(),
        cliente: 'Cliente Exemplo',
        tipo: 'carro',
        valor: 230,
        dinheiro: 230,
        pix: 0,
        observacoes: 'Exemplo de inspeção',
        dia: new Date().getDate()
      }
    ];
    
    mockData.deposits = [
      {
        id: 1,
        data: today,
        valor: 100,
        observacoes: 'Depósito de exemplo',
        dia: new Date().getDate()
      }
    ];
    
    mockData.expenses = [
      {
        id: 1,
        data: today,
        descricao: 'Despesa de exemplo',
        valor: 50,
        observacoes: 'Exemplo',
        dia: new Date().getDate()
      }
    ];
  }

  // Métodos para inspeções
  async getInspectionsByDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return mockData.inspections.filter(i => 
      i.dataHora.split('T')[0] === dateStr);
  }

  async getInspectionsByDateRange(startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return mockData.inspections.filter(i => {
      const iDate = i.dataHora.split('T')[0];
      return iDate >= startDateStr && iDate <= endDateStr;
    });
  }

  // Métodos para depósitos
  async getDepositsByDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return mockData.deposits.filter(d => d.data === dateStr);
  }

  async getDepositsByDateRange(startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return mockData.deposits.filter(d => 
      d.data >= startDateStr && d.data <= endDateStr);
  }

  // Métodos para despesas
  async getExpensesByDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return mockData.expenses.filter(e => e.data === dateStr);
  }

  async getExpensesByDateRange(startDate, endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    return mockData.expenses.filter(e => 
      e.data >= startDateStr && e.data <= endDateStr);
  }
}

// Criar instância do storage
const storage = new MockStorage();

// Rotas API

// Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'API VisioCar funcionando! (Vercel)',
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless'
  });
});

// Rotas para Inspeções
app.get('/api/inspections', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    if (date) {
      const parsedDate = parseDateParam(date);
      if (!parsedDate) {
        return res.status(400).json({ error: 'Data inválida' });
      }
      const inspections = await storage.getInspectionsByDate(parsedDate);
      return res.json(inspections);
    } else if (startDate && endDate) {
      const parsedStartDate = parseDateParam(startDate);
      const parsedEndDate = parseDateParam(endDate);
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

// Rotas para Depósitos
app.get('/api/deposits', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    if (date) {
      const parsedDate = parseDateParam(date);
      if (!parsedDate) {
        return res.status(400).json({ error: 'Data inválida' });
      }
      const deposits = await storage.getDepositsByDate(parsedDate);
      return res.json(deposits);
    } else if (startDate && endDate) {
      const parsedStartDate = parseDateParam(startDate);
      const parsedEndDate = parseDateParam(endDate);
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

// Rotas para Despesas
app.get('/api/expenses', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    if (date) {
      const parsedDate = parseDateParam(date);
      if (!parsedDate) {
        return res.status(400).json({ error: 'Data inválida' });
      }
      const expenses = await storage.getExpensesByDate(parsedDate);
      return res.json(expenses);
    } else if (startDate && endDate) {
      const parsedStartDate = parseDateParam(startDate);
      const parsedEndDate = parseDateParam(endDate);
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

// Exportar serverless handler
module.exports = (req, res) => {
  // Vercel envia a rota como "/api/visiocar" mas Express espera "/api/inspections" ou similar
  // Precisamos fazer essa correção no path com base nos headers
  const originalUrl = req.headers['x-forwarded-uri'] || req.url;
  
  if (originalUrl.includes('/api/inspections')) {
    req.url = '/api/inspections';
  } else if (originalUrl.includes('/api/deposits')) {
    req.url = '/api/deposits';
  } else if (originalUrl.includes('/api/expenses')) {
    req.url = '/api/expenses';
  } else if (originalUrl.includes('/api/status')) {
    req.url = '/api/status';
  }
  
  return serverless(app)(req, res);
};