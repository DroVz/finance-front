// Types pour les entités du backend

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER'
}

export interface Account {
  id: number;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  currency: string;
  createdAt: string;
  transactionCount: number;
}

export interface AccountDTO {
  name: string;
  initialBalance: number;
  currency?: string;
  icon?: string;
}

export type CategoryType = 'CHARGES' | 'LOISIRS' | 'REVENUS'

export interface Category {
  id: number;
  name: string;
  color: string | null;
  parent: Category | null;
  defaultCategory: boolean;
  type: CategoryType | null;
}

export interface CategoryDTO {
  name: string;
  parentId?: number | null;
  color?: string;
  type?: CategoryType;
}

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  linkedTransactionId: number | null;
}

export interface TransactionDTO {
  accountId: number;
  categoryId: number | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  transactionDate: string;
}

export interface TransferDTO {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  description: string | null;
  transactionDate: string;
  objectiveId?: number | null;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  expensesByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

// Types pour les objectifs d'épargne

export interface Objective {
  id: number;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  accountId: number | null;
  accountName?: string;
  category: string | null;
  description: string | null;
  priority: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  currentAmount: number;
  progressPercentage: number;
  monthsRemaining?: number | null;
  monthlyEffortRequired?: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ObjectiveDTO {
  name: string;
  targetAmount: number;
  targetDate: string | null;
  accountId: number | null;
  category?: string | null;
  description?: string | null;
  priority?: number;
}

export interface FinancialStats {
  hasSufficientHistory: boolean;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  historyMonths: number;
}

export interface ActiveObjectivesCount {
  active_count: number;
  limit: number;
  remaining: number;
}

// Types pour le Cash Flow

export interface CashFlowStats {
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  savingsRate: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  expensesByType: Record<string, number>;
  incomeByType: Record<string, number>;
}

export interface MonthlyCashFlow {
  year: number;
  month: number;
  monthLabel: string;
  income: number;
  expenses: number;
  cashFlow: number;
}

// Types pour l'import CSV

export interface CsvPreviewLine {
  lineNumber: number;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  suggestedCategoryId: number | null;
  suggestedCategoryName: string | null;
  transferCandidate: boolean;
}

export interface CsvPreviewResponse {
  detectedFormat: string;
  totalLines: number;
  lines: CsvPreviewLine[];
}

export interface CsvImportLine {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  transfer: boolean;
  linkedAccountId: number | null;
}

export interface CsvImportRequest {
  accountId: number;
  lines: CsvImportLine[];
  learnCategories: boolean;
}

export interface CsvImportResult {
  importedCount: number;
  skippedCount: number;
}

// Types pour le Budget

export type BudgetRuleType = 'MAXIMUM' | 'MINIMUM' | 'TARGET';

export interface BudgetRule {
  id: number;
  name: string;
  description: string | null;
  ruleType: BudgetRuleType;
  percentage: number;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  monthlyIncome: number;
  ruleAmount: number;
  currentAmount: number;
  currentPercentage: number;
  difference: number;
  status: 'RESPECTED' | 'EXCEEDED';
  ruleStreak: number;
  createdAt: string;
}

export interface BudgetRuleDTO {
  name: string;
  description?: string | null;
  ruleType: BudgetRuleType;
  percentage: number;
  categoryId?: number | null;
}

export interface BudgetStreak {
  currentStreak: number;
  bestStreak: number;
  lastRespectedMonth: string | null;
}
