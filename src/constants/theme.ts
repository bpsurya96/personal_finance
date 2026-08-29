export const Colors = {
  bgPrimary: '#0A0A14',
  bgCard: '#16162A',
  bgCardElevated: '#1E1E38',
  bgCardGlass: 'rgba(22, 22, 42, 0.85)',
  purple: '#7C3AED',
  purpleLight: '#9F67FF',
  purpleDark: '#5B21B6',
  purpleAlpha: 'rgba(124, 58, 237, 0.15)',
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldDark: '#059669',
  emeraldAlpha: 'rgba(16, 185, 129, 0.15)',
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  amberAlpha: 'rgba(245, 158, 11, 0.15)',
  red: '#EF4444',
  redLight: '#FCA5A5',
  redAlpha: 'rgba(239, 68, 68, 0.15)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  husband: '#818CF8',
  wife: '#F472B6',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const INVESTMENT_TYPES = [
  { id: 'mutual_fund', label: 'Mutual Funds', icon: 'trending-up', color: '#7C3AED', category: 'equity' },
  { id: 'stock', label: 'Indian Stocks', icon: 'bar-chart-2', color: '#10B981', category: 'equity' },
  { id: 'us_etf', label: 'US ETF', icon: 'globe', color: '#3B82F6', category: 'equity' },
  { id: 'non_us_etf', label: 'Non-US ETF', icon: 'map', color: '#06B6D4', category: 'equity' },
  { id: 'fd', label: 'Fixed Deposit', icon: 'credit-card', color: '#F59E0B', category: 'debt' },
  { id: 'rd', label: 'Recurring Deposit', icon: 'calendar', color: '#EF4444', category: 'debt' },
  { id: 'ppf', label: 'PPF', icon: 'shield', color: '#8B5CF6', category: 'debt' },
  { id: 'nps', label: 'NPS', icon: 'briefcase', color: '#EC4899', category: 'mixed' },
  { id: 'epfo', label: 'EPFO', icon: 'users', color: '#14B8A6', category: 'debt' },
  { id: 'bond', label: 'Bonds', icon: 'file-text', color: '#F97316', category: 'debt' },
  { id: 'chit', label: 'Chit Fund', icon: 'layers', color: '#A3E635', category: 'alternative' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'coffee', color: '#F97316' },
  { id: 'transport', label: 'Transport', icon: 'navigation', color: '#3B82F6' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#EC4899' },
  { id: 'health', label: 'Health', icon: 'heart', color: '#EF4444' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film', color: '#8B5CF6' },
  { id: 'utilities', label: 'Utilities', icon: 'zap', color: '#F59E0B' },
  { id: 'emi_rent', label: 'EMI / Rent', icon: 'home', color: '#10B981' },
  { id: 'education', label: 'Education', icon: 'book', color: '#06B6D4' },
  { id: 'travel', label: 'Travel', icon: 'map-pin', color: '#84CC16' },
  { id: 'gifts', label: 'Gifts', icon: 'gift', color: '#A78BFA' },
  { id: 'others', label: 'Others', icon: 'more-horizontal', color: '#64748B' },
];

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
export const FontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32, hero: 42 };
