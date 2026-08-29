export type FamilyRole = 'husband' | 'wife';

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  email: string;
}

export interface Expense {
  id: string;
  familyId: string;
  amount: number;
  category: string;
  note: string;
  addedBy: FamilyRole;
  date: string;
  createdAt: string;
}

export interface Budget { [category: string]: number; }

export type InvestmentType =
  'mutual_fund' | 'stock' | 'us_etf' | 'non_us_etf' |
  'fd' | 'rd' | 'ppf' | 'nps' | 'epfo' | 'bond' | 'chit';

export interface Investment {
  id: string;
  familyId: string;
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  addedBy: FamilyRole;
  notes?: string;
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FIREConfig {
  currentAge: number;
  retirementAge: number;
  currentMonthlyExpenses: number;
  inflationRate: number;
  expectedReturn: number;
  currentCorpus: number;
  monthlySIP: number;
}

export interface FIREResult {
  leanFIRE: number;
  regularFIRE: number;
  fatFIRE: number;
  yearsToFIRE: { lean: number; regular: number; fat: number };
  progress: { lean: number; regular: number; fat: number };
  projectedCorpus: number[];
  projectedYears: number[];
}
