import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, FlatList, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { Colors, Spacing, Radius, FontSize, EXPENSE_CATEGORIES } from '../../src/constants/theme';
import { formatCurrency } from '../../src/utils/calculations';

type FilterBy = 'all' | 'husband' | 'wife';

export default function ExpensesScreen() {
  const { expenses, budget, deleteExpense, getExpensesByMonth } = useExpenseStore();
  const { husband, wife } = useProfileStore();
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const monthExpenses = useMemo(
    () => getExpensesByMonth(selectedMonth.year, selectedMonth.month),
    [expenses, selectedMonth]
  );

  const filteredExpenses = useMemo(() => {
    if (filterBy === 'all') return monthExpenses;
    return monthExpenses.filter(e => e.addedBy === filterBy);
  }, [monthExpenses, filterBy]);

  const totalSpend = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
  }, [filteredExpenses]);

  const navigateMonth = (dir: -1 | 1) => {
    setSelectedMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const monthLabel = new Date(selectedMonth.year, selectedMonth.month).toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/modals/add-expense')}
          >
            <Feather name="plus" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navArrow}>
            <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navArrow}>
            <Feather name="chevron-right" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'husband', 'wife'] as FilterBy[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filterBy === f && styles.filterPillActive]}
              onPress={() => setFilterBy(f)}
            >
              <Text style={[styles.filterText, filterBy === f && styles.filterTextActive]}>
                {f === 'all' ? '👥 All' : f === 'husband' ? `👨 ${husband.name.split(' ')[0]}` : `👩 ${wife.name.split(' ')[0]}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalGlow} />
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalSpend)}</Text>
          <Text style={styles.totalSub}>{filteredExpenses.length} transactions</Text>
        </View>

        {/* Budget vs Actual */}
        <Text style={styles.sectionTitle}>Budget Overview</Text>
        {EXPENSE_CATEGORIES.map(cat => {
          const spent = categoryTotals[cat.id] || 0;
          const budgeted = budget[cat.id] || 0;
          const pct = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;
          const isOver = spent > budgeted && budgeted > 0;
          if (spent === 0 && budgeted === 0) return null;
          return (
            <View key={cat.id} style={styles.budgetRow}>
              <View style={[styles.catIcon, { backgroundColor: `${cat.color}20` }]}>
                <Feather name={cat.icon as any} size={14} color={cat.color} />
              </View>
              <View style={styles.budgetInfo}>
                <View style={styles.budgetTop}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={[styles.budgetAmt, isOver && { color: Colors.red }]}>
                    {formatCurrency(spent, true)} / {formatCurrency(budgeted, true)}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: isOver ? Colors.red : cat.color },
                  ]} />
                </View>
              </View>
            </View>
          );
        })}

        {/* Transaction List */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No expenses this month</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/modals/add-expense')}
            >
              <Text style={styles.emptyBtnText}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredExpenses.map(exp => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
            const isHusband = exp.addedBy === 'husband';
            return (
              <TouchableOpacity
                key={exp.id}
                style={styles.txRow}
                onLongPress={() => handleDelete(exp.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.txIcon, { backgroundColor: `${cat?.color || Colors.textMuted}20` }]}>
                  <Feather name={(cat?.icon || 'circle') as any} size={18} color={cat?.color || Colors.textMuted} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txNote} numberOfLines={1}>{exp.note || cat?.label}</Text>
                  <View style={styles.txMeta}>
                    <View style={[styles.txDot, { backgroundColor: isHusband ? Colors.husband : Colors.wife }]} />
                    <Text style={styles.txMetaText}>
                      {isHusband ? husband.name : wife.name} •{' '}
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.txAmount}>₹{exp.amount.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-expense')}
      >
        <Feather name="plus" size={26} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  navArrow: { padding: Spacing.sm },
  monthLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: Spacing.md },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  filterPill: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  filterPillActive: { backgroundColor: Colors.purpleAlpha, borderColor: Colors.purple },
  filterText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
  filterTextActive: { color: Colors.purple },
  totalCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: `${Colors.amber}30`,
    overflow: 'hidden',
  },
  totalGlow: {
    position: 'absolute', top: -30, right: -30, width: 100, height: 100,
    borderRadius: 50, backgroundColor: Colors.amberAlpha,
  },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  totalValue: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, marginVertical: 4 },
  totalSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  // Budget rows
  budgetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  catIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  budgetInfo: { flex: 1 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  budgetAmt: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: Colors.bgCardElevated, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  // Transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  txInfo: { flex: 1 },
  txNote: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
  txMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  txDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  txMetaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  txAmount: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700' },
  // Empty state
  emptyState: {
    alignItems: 'center', padding: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  emptyBtn: {
    backgroundColor: Colors.purple, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  fab: {
    position: 'absolute', bottom: 82, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.amber, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
});
