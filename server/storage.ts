import { 
  users, type User, type InsertUser,
  inspections, type Inspection, type InsertInspection,
  deposits, type Deposit, type InsertDeposit,
  expenses, type Expense, type InsertExpense
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inspection operations
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspectionsByDate(date: Date): Promise<Inspection[]>;
  getInspectionsByDateRange(startDate: Date, endDate: Date): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  deleteInspection(id: number): Promise<boolean>;
  
  // Deposit operations
  getDeposit(id: number): Promise<Deposit | undefined>;
  getDepositsByDate(date: Date): Promise<Deposit[]>;
  getDepositsByDateRange(startDate: Date, endDate: Date): Promise<Deposit[]>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  updateDeposit(id: number, deposit: Partial<InsertDeposit>): Promise<Deposit | undefined>;
  deleteDeposit(id: number): Promise<boolean>;
  
  // Expense operations
  getExpense(id: number): Promise<Expense | undefined>;
  getExpensesByDate(date: Date): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Inspection operations
  async getInspection(id: number): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection;
  }

  async getInspectionsByDate(date: Date): Promise<Inspection[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const dateStr = date.toISOString().split('T')[0];
    return db.select().from(inspections).where(
      eq(inspections.dia, dateStr as any)
    );
  }

  async getInspectionsByDateRange(startDate: Date, endDate: Date): Promise<Inspection[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db.select().from(inspections).where(
      and(
        gte(inspections.dia, startDateStr as any),
        lte(inspections.dia, endDateStr as any)
      )
    );
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db.insert(inspections).values(inspection).returning();
    return newInspection;
  }

  async updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const [updatedInspection] = await db
      .update(inspections)
      .set(inspection)
      .where(eq(inspections.id, id))
      .returning();
    return updatedInspection;
  }

  async deleteInspection(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(inspections)
      .where(eq(inspections.id, id))
      .returning({ id: inspections.id });
    return !!deleted;
  }

  // Deposit operations
  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit;
  }

  async getDepositsByDate(date: Date): Promise<Deposit[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const dateStr = date.toISOString().split('T')[0];
    return db.select().from(deposits).where(
      eq(deposits.data, dateStr as any)
    );
  }

  async getDepositsByDateRange(startDate: Date, endDate: Date): Promise<Deposit[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db.select().from(deposits).where(
      and(
        gte(deposits.data, startDateStr as any),
        lte(deposits.data, endDateStr as any)
      )
    );
  }

  async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
    const [newDeposit] = await db.insert(deposits).values(deposit).returning();
    return newDeposit;
  }

  async updateDeposit(id: number, deposit: Partial<InsertDeposit>): Promise<Deposit | undefined> {
    const [updatedDeposit] = await db
      .update(deposits)
      .set(deposit)
      .where(eq(deposits.id, id))
      .returning();
    return updatedDeposit;
  }

  async deleteDeposit(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(deposits)
      .where(eq(deposits.id, id))
      .returning({ id: deposits.id });
    return !!deleted;
  }

  // Expense operations
  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async getExpensesByDate(date: Date): Promise<Expense[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const dateStr = date.toISOString().split('T')[0];
    return db.select().from(expenses).where(
      eq(expenses.data, dateStr as any)
    );
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    // Converte para string de data no formato ISO para compatibilidade com o banco
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db.select().from(expenses).where(
      and(
        gte(expenses.data, startDateStr as any),
        lte(expenses.data, endDateStr as any)
      )
    );
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(expense)
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning({ id: expenses.id });
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();
