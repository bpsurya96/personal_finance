import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, Radius, INVESTMENT_TYPES } from "../../src/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useIncomeStore } from "../../src/store/useIncomeStore";
import { useInvestmentStore } from "../../src/store/useInvestmentStore";

export default function MoneyScreen() {
  const { tab } = useLocalSearchParams<{ tab: string }>();
  const [activeTab, setActiveTab] = useState<'Income' | 'Invest'>('Income');
  const userRecord = useAuthStore(s => s.userRecord);
  
  useEffect(() => {
    if (tab === 'Invest') {
      setActiveTab('Invest');
    } else if (tab === 'Income') {
      setActiveTab('Income');
    }
  }, [tab]);

  const incomes = useIncomeStore(s => s.incomes);
  const getTotalYearlySalary = useIncomeStore(s => s.getTotalYearlySalary);
  const totalYearlySalary = getTotalYearlySalary();
  const deleteIncome = useIncomeStore(s => s.deleteIncome);
  
  const investments = useInvestmentStore(s => s.investments);
  const getTotalCurrentValue = useInvestmentStore(s => s.getTotalCurrentValue);
  const totalInvestments = getTotalCurrentValue();
  const getAssetAllocation = useInvestmentStore(s => s.getAssetAllocation);
  const assetAllocation = getAssetAllocation();
  
  const formatCurrency = (n: number) =>
    "₹" + (n >= 100000 ? (n / 100000).toFixed(2) + "L" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0));

  const handleDeleteIncome = (id: string) => {
    Alert.alert("Delete Income", "Are you sure you want to remove this income source?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        if (userRecord?.familyId) deleteIncome(id, userRecord.familyId);
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Money</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Income' && styles.tabActive]}
            onPress={() => setActiveTab('Income')}
          >
            <Text style={[styles.tabText, activeTab === 'Income' && styles.tabTextActive]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Invest' && styles.tabActive]}
            onPress={() => setActiveTab('Invest')}
          >
            <Text style={[styles.tabText, activeTab === 'Invest' && styles.tabTextActive]}>Invest</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content: Income */}
        {activeTab === 'Income' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Income Sources</Text>
              <TouchableOpacity onPress={() => router.push("/modals/add-income")}>
                <Feather name="plus" size={24} color={Colors.primaryAction} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.incomeCard}>
              <View style={styles.incomeCardLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Feather name="briefcase" size={20} color="#0284C7" />
                </View>
                <View>
                  <Text style={styles.incomeCardTitle}>Primary Salary</Text>
                  <Text style={styles.incomeCardSub}>Yearly</Text>
                </View>
              </View>
              <Text style={styles.incomeCardAmount}>{formatCurrency(totalYearlySalary)}</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, fontSize: FontSize.lg }]}>Passive Income</Text>
            {incomes.filter(i => i.type === 'passive').length === 0 ? (
              <Text style={styles.emptyText}>No passive income added yet.</Text>
            ) : (
              incomes.filter(i => i.type === 'passive').map(inc => (
                <View key={inc.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={[styles.iconBoxSmall, { backgroundColor: '#DCFCE7' }]}>
                      <Feather name="refresh-cw" size={14} color="#16A34A" />
                    </View>
                    <View>
                      <Text style={styles.listItemTitle}>{inc.name}</Text>
                      <Text style={styles.listItemSub}>{inc.frequency}</Text>
                    </View>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemAmount}>{formatCurrency(inc.amount)}</Text>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteIncome(inc.id)}>
                      <Feather name="trash-2" size={16} color={Colors.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab Content: Invest */}
        {activeTab === 'Invest' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Investments</Text>
              <TouchableOpacity onPress={() => router.push("/modals/add-investment")}>
                <Feather name="plus" size={24} color={Colors.primaryAction} />
              </TouchableOpacity>
            </View>

            {investments.length === 0 ? (
              <Text style={styles.emptyText}>No investments tracked yet.</Text>
            ) : (
              <View style={styles.investmentList}>
                {INVESTMENT_TYPES.map(typeInfo => {
                  const typeInvestments = investments.filter(inv => inv.type === typeInfo.id);
                  if (typeInvestments.length === 0) return null;
                  
                  const typeTotal = typeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                  const allocPercent = totalInvestments > 0 ? (typeTotal / totalInvestments) * 100 : 0;

                  return (
                    <TouchableOpacity 
                      key={typeInfo.id} 
                      style={styles.invCard}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/investments/${typeInfo.id}`)}
                    >
                      <View style={styles.invCardLeft}>
                        <View style={[styles.iconBox, { backgroundColor: `${typeInfo.color}20` }]}>
                          <Feather name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                        </View>
                        <View>
                          <Text style={styles.invCardTitle}>{typeInfo.label}</Text>
                          <Text style={styles.invCardSub}>{typeInvestments.length} Asset{typeInvestments.length > 1 ? 's' : ''} • {allocPercent.toFixed(1)}% Allocation</Text>
                        </View>
                      </View>
                      <View style={styles.invCardRight}>
                        <Text style={styles.invCardAmount}>{formatCurrency(typeTotal)}</Text>
                        <Feather name="chevron-right" size={20} color={Colors.textMuted} style={{ marginLeft: Spacing.sm }} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgPrimary,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: "600", color: Colors.textPrimary },
  scroll: { padding: Spacing.lg },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.xl },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primaryAction },
  tabText: { fontSize: FontSize.md, color: Colors.textSecondary },
  tabTextActive: { color: Colors.textPrimary, fontWeight: '600' },

  tabContent: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary },
  
  incomeCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  incomeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  incomeCardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  incomeCardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  incomeCardAmount: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },

  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, fontStyle: 'italic', marginTop: Spacing.md },

  listItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBoxSmall: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  listItemTitle: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  listItemSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  listItemAmount: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },

  investmentList: { gap: Spacing.md },
  invCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  invCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  invCardTitle: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  invCardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  invCardRight: { flexDirection: 'row', alignItems: 'center' },
  invCardAmount: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  
  actionBtn: { padding: 6, backgroundColor: Colors.borderLight, borderRadius: Radius.sm, marginLeft: Spacing.sm }
});
