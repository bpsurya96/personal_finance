import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, Radius } from "../../src/constants/theme";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useExpenseStore } from "../../src/store/useExpenseStore";
import { useInvestmentStore } from "../../src/store/useInvestmentStore";
import { useLiabilityStore } from "../../src/store/useLiabilityStore";
import { useIncomeStore } from "../../src/store/useIncomeStore";
import { useFIREStore } from "../../src/store/useFIREStore";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const userRecord = useAuthStore(s => s.userRecord);
  
  // Data from stores
  const expenses = useExpenseStore(s => s.expenses);
  const investments = useInvestmentStore(s => s.investments);
  const liabilities = useLiabilityStore(s => s.liabilities);
  const getTotalYearlySalary = useIncomeStore(s => s.getTotalYearlySalary);
  const totalYearlySalary = getTotalYearlySalary();
  const getTotalYearlyPassive = useIncomeStore(s => s.getTotalYearlyPassive);
  const totalYearlyPassive = getTotalYearlyPassive();
  
  const fireTarget = useFIREStore(s => s.targetCorpus) || 50000000;

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s, e) => s + e.amount, 0);

  const totalInvestments = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.totalAmount - l.paidAmount), 0);
  const netWorth = totalInvestments - totalLiabilities;
  const fireProgress = Math.min((netWorth / fireTarget) * 100, 100);
  
  const formatCurrency = (n: number) =>
    "₹" + (n >= 100000 ? (n / 100000).toFixed(2) + "L" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0));

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
        <TouchableOpacity onPress={() => router.push("/tabs/profile")}>
          <Feather name="user" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Net Worth Card */}
        <TouchableOpacity style={[styles.networthCard, { backgroundColor: '#1e3c72' }]} activeOpacity={0.9}>
          <View style={styles.networthContent}>
            <View>
              <Text style={styles.networthLabel}>Total Net Worth</Text>
              <View style={styles.networthValueRow}>
                <Text style={styles.networthValue}>{formatCurrency(netWorth)}</Text>
                <Feather name="shield" size={16} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
            <View style={styles.networthIconBg}>
              <Feather name="trending-up" size={24} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Data Grid */}
        <View style={styles.grid}>
          {/* Income block */}
          <TouchableOpacity 
            style={styles.gridCard} activeOpacity={0.7}
            onPress={() => router.push("/tabs/money?tab=Income")}
          >
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="briefcase" size={18} color="#0284C7" />
            </View>
            <Text style={styles.gridLabel}>Salary (Yearly)</Text>
            <Text style={styles.gridValue}>{formatCurrency(totalYearlySalary)}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} activeOpacity={0.7}
            onPress={() => router.push("/tabs/money?tab=Income")}
          >
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="refresh-cw" size={18} color="#16A34A" />
            </View>
            <Text style={styles.gridLabel}>Passive (Yearly)</Text>
            <Text style={styles.gridValue}>{formatCurrency(totalYearlyPassive)}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} activeOpacity={0.7}
            onPress={() => router.push("/tabs/money?tab=Invest")}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
              <FontAwesome5 name="chart-pie" size={16} color="#9333EA" />
            </View>
            <Text style={styles.gridLabel}>Total Investment</Text>
            <Text style={styles.gridValue}>{formatCurrency(totalInvestments)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.gridCard} activeOpacity={0.7}
            onPress={() => router.push("/tabs/liabilities")}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
              <Feather name="credit-card" size={18} color="#EA580C" />
            </View>
            <Text style={styles.gridLabel}>Total Liabilities</Text>
            <Text style={styles.gridValue}>{formatCurrency(totalLiabilities)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.9}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="shopping-bag" size={18} color="#DC2626" />
            </View>
            <Text style={styles.gridLabel}>Month Expenses</Text>
            <Text style={styles.gridValue}>{formatCurrency(currentMonthExpenses)}</Text>
          </TouchableOpacity>
        </View>

        {/* FIRE Forecast Card */}
        <Text style={styles.sectionTitle}>FIRE Journey</Text>
        <TouchableOpacity style={styles.fireCard} activeOpacity={0.9}>
          <View style={styles.fireHeader}>
            <View style={styles.fireHeaderLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="flag" size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.fireCardTitle}>FIRE Goal</Text>
                <Text style={styles.fireCardSubtitle}>Target: {formatCurrency(fireTarget)}</Text>
              </View>
            </View>
            <Text style={styles.firePercent}>{fireProgress.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.max(fireProgress, 2)}%` }]} />
          </View>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    
      {/* Floating AI Receipt Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9} 
        onPress={() => {
          if (isPro) {
            router.push('/modals/scan-receipt');
          } else {
            router.push('/modals/paywall');
          }
        }}
      >
        <Feather name="camera" size={24} color="#FFF" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgPrimary,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: "600", color: Colors.textPrimary },
  scroll: { padding: Spacing.lg },
  
  networthCard: {
    height: 140, borderRadius: Radius.lg, overflow: 'hidden',
    marginBottom: Spacing.lg, padding: Spacing.lg,
    justifyContent: 'center'
  },
  networthContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networthLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, fontWeight: '500', marginBottom: 4 },
  networthValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  networthValue: { color: Colors.white, fontSize: 40, fontWeight: '600', letterSpacing: -1 },
  networthIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'space-between', marginBottom: Spacing.xl },
  gridCard: {
    width: '47%', backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  iconBox: { width: 32, height: 32, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  gridLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  gridValue: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.md },
  
  fireCard: {
    backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  fireHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  fireHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fireCardTitle: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  fireCardSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  firePercent: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.primaryAction },
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryAction, borderRadius: 4 },
});
