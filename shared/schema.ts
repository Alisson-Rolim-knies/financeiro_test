import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  placa: text("placa").notNull(),
  dataHora: timestamp("data_hora").notNull().defaultNow(),
  cliente: text("cliente").notNull(),
  tipo: text("tipo").notNull(),
  valor: doublePrecision("valor").notNull(),
  dinheiro: doublePrecision("dinheiro"),
  pix: doublePrecision("pix"),
  observacoes: text("observacoes"),
  dia: date("dia").notNull(),
});

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  data: date("data").notNull(),
  valor: doublePrecision("valor").notNull(),
  observacoes: text("observacoes"),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  data: date("data").notNull(),
  descricao: text("descricao").notNull(),
  valor: doublePrecision("valor").notNull(),
  observacoes: text("observacoes"),
});

// Schemas para inserção
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

// Types para inserção
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Types para seleção
export type User = typeof users.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type Deposit = typeof deposits.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
