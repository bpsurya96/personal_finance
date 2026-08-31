import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, Radius } from "../../src/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useLiabilityStore } from "../../src/store/useLiabilityStore";

export default function LiabilitiesScreen() {
  const userRecord = useAuthStore((s) => s.userRecord);
  const liabilities = useLiabilityStore((s) => s.liabilities);
  const removeLiability = useLiabilityStore((s) => s.removeLiability);
  
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.totalAmount - l.paidAmount), 0);
  
  const formatCurrency = (n: number) =>
    "₹" + (n >= 100000 ? (n / 100000).toFixed(2) + "L" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0));

  const handleDelete = (id: string) => {
    Alert.alert("Delete Liability", "Are you sure you want to remove this loan?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        if (userRecord?.familyId) removeLiability(id, userRecord.familyId);
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liabilities</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Outstanding</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalLiabilities)}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Loans</Text>
          <TouchableOpacity onPress={() => router.push("/modals/add-liability")}>
            <Feather name="plus" size={24} color={Colors.primaryAction} />
          </TouchableOpacity>
        </View>

        {liabilities.length === 0 ? (
          <Text style={styles.emptyText}>No liabilities tracked yet.</Text>
        ) : (
          <View style={styles.list}>
            {liabilities.map((loan) => {
              const outstanding = loan.totalAmount - loan.paidAmount;
              const progress = loan.totalAmount > 0 ? (loan.paidAmount / loan.totalAmount) * 100 : 0;
              
              return (
                <View key={loan.id} style={styles.loanCard}>
                  <View style={styles.loanCardHeader}>
                    <View style={styles.loanCardHeaderLeft}>
                      <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="credit-card" size={20} color="#DC2626" />
                      </View>
                      <View>
                        <Text style={styles.loanTitle}>{loan.name}</Text>
                        <Text style={styles.loanSub}>{loan.interestRate}% Interest</Text>
                      </View>
                    </View>
                    <View style={styles.loanCardHeaderRight}>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.loanAmount}>{formatCurrency(outstanding)}</Text>
                        <Text style={styles.loanSub}>Outstanding</Text>
                      </View>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(loan.id)}>
                        <Feather name="trash-2" size={16} color={Colors.red} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.max(progress, 2)}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabel}>Paid: {formatCurrency(loan.paidAmount)}</Text>
                      <Text style={styles.progressLabel}>Total: {formatCurrency(loan.totalAmount)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
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
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgPrimary,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: "600", color: Colors.textPrimary },
  scroll: { padding: Spacing.lg },

  summaryCard: {
    backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    marginBottom: Spacing.xl, alignItems: 'center'
  },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.sm },
  summaryValue: { fontSize: 36, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -1 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary },
  
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, fontStyle: 'italic' },
  
  list: { gap: Spacing.md },
  loanCard: {
    backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  loanCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  loanCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  loanCardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBox: { width: 44, height: 44, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  loanTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  loanSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  loanAmount: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  
  actionBtn: { padding: 6, backgroundColor: Colors.borderLight, borderRadius: Radius.sm, marginLeft: Spacing.sm },

  progressContainer: {},
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.xs },
  progressFill: { height: '100%', backgroundColor: Colors.red, borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textSecondary }
});
