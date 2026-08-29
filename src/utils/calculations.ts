import { FIREConfig, FIREResult } from '../types';

export const formatCurrency = (amount: number, compact = false): string => {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value: number, decimals = 2): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

export const calculateFIRE = (config: FIREConfig): FIREResult => {
  const {
    currentAge, retirementAge, currentMonthlyExpenses, inflationRate,
    expectedReturn, currentCorpus, monthlySIP,
  } = config;

  const annualExpenses = currentMonthlyExpenses * 12;
  const yearsToRetirement = retirementAge - currentAge;

  // Inflation-adjusted expenses at retirement
  const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // FIRE numbers (Safe Withdrawal Rate based)
  const leanFIRE = futureAnnualExpenses * 20;    // 5% SWR
  const regularFIRE = futureAnnualExpenses * 25;  // 4% SWR
  const fatFIRE = futureAnnualExpenses * 33;      // 3% SWR

  // Project corpus growth year by year
  const monthlyReturn = expectedReturn / 100 / 12;
  const projectedCorpus: number[] = [];
  const projectedYears: number[] = [];

  let corpus = currentCorpus;
  for (let year = 0; year <= yearsToRetirement; year++) {
    projectedCorpus.push(Math.round(corpus));
    projectedYears.push(currentAge + year);
    // Compound monthly SIP for 12 months
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlySIP;
    }
  }

  const finalCorpus = corpus;

  // Calculate years to each FIRE target from now
  const yearsToFIRE = (target: number) => {
    let c = currentCorpus;
    for (let yr = 0; yr <= 50; yr++) {
      if (c >= target) return yr;
      for (let m = 0; m < 12; m++) {
        c = c * (1 + monthlyReturn) + monthlySIP;
      }
    }
    return 50;
  };

  return {
    leanFIRE,
    regularFIRE,
    fatFIRE,
    yearsToFIRE: {
      lean: yearsToFIRE(leanFIRE),
      regular: yearsToFIRE(regularFIRE),
      fat: yearsToFIRE(fatFIRE),
    },
    progress: {
      lean: Math.min(100, (currentCorpus / leanFIRE) * 100),
      regular: Math.min(100, (currentCorpus / regularFIRE) * 100),
      fat: Math.min(100, (currentCorpus / fatFIRE) * 100),
    },
    projectedCorpus,
    projectedYears,
  };
};

export const calculateCAGR = (invested: number, current: number, years: number): number => {
  if (invested <= 0 || years <= 0) return 0;
  return (Math.pow(current / invested, 1 / years) - 1) * 100;
};

export const calculateFDMaturity = (
  principal: number, rate: number, tenureMonths: number
): number => {
  const years = tenureMonths / 12;
  return principal * Math.pow(1 + rate / 100 / 4, 4 * years);
};

export const calculateRDMaturity = (
  monthlyAmount: number, rate: number, tenureMonths: number
): number => {
  const monthlyRate = rate / 100 / 12;
  return monthlyAmount * ((Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate) * (1 + monthlyRate);
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

export const groupExpensesByMonth = (expenses: any[]) => {
  const groups: Record<string, any[]> = {};
  expenses.forEach(exp => {
    const key = getMonthName(new Date(exp.date));
    if (!groups[key]) groups[key] = [];
    groups[key].push(exp);
  });
  return groups;
};
