import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { useFIREStore } from '../../src/store/useFIREStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { Colors, Spacing, Radius, FontSize, INVESTMENT_TYPES } from '../../src/constants/theme';
import { formatCurrency } from '../../src/utils/calculations';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { expenses, getExpensesByMonth } = useExpenseStore();
  const { investments, getTotalCurrentValue, getTotalInvested } = useInvestmentStore();
  const { config, result, calculate } = useFIREStore();
  const { husband, wife, familyName } = useProfileStore();

  const now = new Date();
  const monthExpenses = getExpensesByMonth(now.getFullYear(), now.getMonth());
  const totalThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const husbandTotal = monthExpenses.filter(e => e.addedBy === 'husband').reduce((s, e) => s + e.amount, 0);
  const wifeTotal = monthExpenses.filter(e => e.addedBy === 'wife').reduce((s, e) => s + e.amount, 0);

  const totalInvested = getTotalInvested();
  const totalCurrentValue = getTotalCurrentValue();
  const netWorth = totalCurrentValue;
  const gainLoss = totalCurrentValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  // FIRE progress
  const fireProgress = result?.progress.regular ?? 0;
  const fireYears = result?.yearsToFIRE.regular ?? 20;

  // Recalculate FIRE with current corpus
  React.useEffect(() => {
    calculate(totalCurrentValue);
  }, [totalCurrentValue]);

  const recentExpenses = expenses.slice(0, 5);

  const greetingHour = now.getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.familyName}>{familyName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/tabs/profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>💜</Text>
          </TouchableOpacity>
        </View>

        {/* Net Worth Hero Card */}
        <View style={styles.netWorthCard}>
          <View style={styles.netWorthGlow} />
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <Text style={styles.netWorthValue}>{formatCurrency(netWorth)}</Text>
          <View style={styles.netWorthBadge}>
            <Feather
              name={gainLoss >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={gainLoss >= 0 ? Colors.emerald : Colors.red}
            />
            <Text style={[styles.netWorthChange, { color: gainLoss >= 0 ? Colors.emerald : Colors.red }]}>
              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, true)} ({gainPercent.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.netWorthMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Invested</Text>
              <Text style={styles.metaValue}>{formatCurrency(totalInvested, true)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Investments</Text>
              <Text style={styles.metaValue}>{investments.length}</Text>
            </View>
          </View>
        </View>

        {/* This Month Card */}
        <View style={styles.sectionRow}>
          <View style={[styles.smallCard, { flex: 1.2 }]}>
            <View style={styles.cardHeader}>
              <Feather name="credit-card" size={16} color={Colors.amber} />
              <Text style={styles.cardTitle}>This Month</Text>
            </View>
            <Text style={styles.cardValue}>{formatCurrency(totalThisMonth, true)}</Text>
            <View style={styles.splitRow}>
              <View style={styles.splitItem}>
                <View style={[styles.splitDot, { backgroundColor: Colors.husband }]} />
                <Text style={styles.splitName}>{husband.name.split(' ')[0]}</Text>
                <Text style={styles.splitAmt}>{formatCurrency(husbandTotal, true)}</Text>
              </View>
              <View style={styles.splitItem}>
                <View style={[styles.splitDot, { backgroundColor: Colors.wife }]} />
                <Text style={styles.splitName}>{wife.name.split(' ')[0]}</Text>
                <Text style={styles.splitAmt}>{formatCurrency(wifeTotal, true)}</Text>
              </View>
            </View>
          </View>

          {/* FIRE Mini Card */}
          <View style={[styles.smallCard, { flex: 1, marginLeft: Spacing.sm }]}>
            <View style={styles.cardHeader}>
              <Feather name="zap" size={16} color={Colors.red} />
              <Text style={styles.cardTitle}>FIRE</Text>
            </View>
            <Text style={styles.cardValue}>{fireProgress.toFixed(0)}%</Text>
            <View style={styles.fireBar}>
              <View style={[styles.fireBarFill, { width: `${Math.min(fireProgress, 100)}%` }]} />
            </View>
            <Text style={styles.fireEta}>
              {fireYears <= 0 ? '🎉 You can retire!' : `~${fireYears}y to go`}
            </Text>
          </View>
        </View>

        {/* Investment Snapshot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Investments</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/investments')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.investRow}>
            {INVESTMENT_TYPES.map(type => {
              const invs = investments.filter(i => i.type === type.id);
              if (invs.length === 0) return null;
              const total = invs.reduce((s, i) => s + i.currentValue, 0);
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.investChip, { borderColor: `${type.color}40` }]}
                  onPress={() => router.push('/tabs/investments')}
                >
                  <Text style={styles.investChipIcon}>{getTypeEmoji(type.id)}</Text>
                  <Text style={styles.investChipLabel}>{type.label}</Text>
                  <Text style={[styles.investChipValue, { color: type.color }]}>
                    {formatCurrency(total, true)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {investments.length === 0 && (
              <TouchableOpacity
                style={styles.addInvestPrompt}
                onPress={() => router.push('/tabs/investments')}
              >
                <Feather name="plus-circle" size={20} color={Colors.purple} />
                <Text style={styles.addInvestText}>Add your first investment</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/expenses')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {recentExpenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyText}>No expenses yet this month</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
            </View>
          ) : (
            recentExpenses.map(exp => (
              <View key={exp.id} style={styles.expenseRow}>
                <View style={[styles.expenseDot, {
                  backgroundColor: exp.addedBy === 'husband' ? Colors.husband : Colors.wife,
                }]} />
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseNote} numberOfLines={1}>
                    {exp.note || exp.category}
                  </Text>
                  <Text style={styles.expenseMeta}>
                    {exp.addedBy === 'husband' ? husband.name : wife.name} •{' '}
                    {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>{formatCurrency(exp.amount, true)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-expense')}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    mutual_fund: '📈', stock: '📊', us_etf: '🇺🇸',
    non_us_etf: '🌍', fd: '🏦', rd: '📅',
    ppf: '🛡️', nps: '💼', epfo: '👔', bond: '📜', chit: '🎱',
  };
  return emojis[type] ?? '💰';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  familyName: { fontSize: FontSize.xl, color: Colors.textPrimary, fontWeight: '800' },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  // Net Worth Card
  netWorthCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.purple}30`,
    overflow: 'hidden',
  },
  netWorthGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.purpleAlpha,
  },
  netWorthLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  netWorthValue: { fontSize: 38, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  netWorthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  netWorthChange: { fontSize: FontSize.sm, fontWeight: '600' },
  netWorthMeta: {
    flexDirection: 'row', backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.md, padding: Spacing.sm,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  metaValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700' },
  metaDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  // Small cards
  sectionRow: { flexDirection: 'row', marginBottom: Spacing.md },
  smallCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  cardValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  splitRow: { gap: 4 },
  splitItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  splitDot: { width: 8, height: 8, borderRadius: 4 },
  splitName: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  splitAmt: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  fireBar: {
    height: 6, backgroundColor: Colors.bgPrimary, borderRadius: 3, marginBottom: 8, overflow: 'hidden',
  },
  fireBarFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: Colors.red,
  },
  fireEta: { fontSize: FontSize.xs, color: Colors.textMuted },
  // Sections
  section: { marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.purple, fontWeight: '600' },
  // Investment chips
  investRow: { flexDirection: 'row' },
  investChip: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    marginRight: Spacing.sm, borderWidth: 1, minWidth: 110,
  },
  investChipIcon: { fontSize: 20, marginBottom: 4 },
  investChipLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  investChipValue: { fontSize: FontSize.sm, fontWeight: '700' },
  addInvestPrompt: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.purple}30`, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', width: 160, gap: 8,
  },
  addInvestText: { fontSize: FontSize.sm, color: Colors.purple, fontWeight: '600', textAlign: 'center' },
  // Recent expenses
  emptyCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  expenseDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  expenseInfo: { flex: 1 },
  expenseNote: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
  expenseMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  expenseAmount: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700' },
  // FAB
  fab: {
    position: 'absolute', bottom: 90, right: Spacing.lg,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
});
