import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLiabilityStore } from '../../src/store/useLiabilityStore';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LiabilitiesScreen() {
  const liabilities = useLiabilityStore(state => state.liabilities);
  const removeLiability = useLiabilityStore(state => state.removeLiability);

  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.totalAmount - item.paidAmount, 0);

  const renderItem = ({ item }: { item: any }) => {
    const remaining = item.totalAmount - item.paidAmount;
    const progress = item.totalAmount > 0 ? (item.paidAmount / item.totalAmount) * 100 : 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeLiability(item.id)}>
            <Feather name="trash-2" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Remaining Balance:</Text>
          <Text style={styles.value}>{'\u20b9'}{remaining.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Interest Rate:</Text>
          <Text style={styles.value}>{item.interestRate}% p.a.</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Term:</Text>
          <Text style={styles.value}>{item.termMonths} months</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: progress + '%' }]} />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(1)}% Paid</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loans & Liabilities</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/modals/add-liability')}>
          <Feather name="plus" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Remaining Debt</Text>
        <Text style={styles.summaryValue}>{'\u20b9'}{totalLiabilities.toLocaleString('en-IN')}</Text>
      </View>

      {liabilities.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="briefcase" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No loans or liabilities added yet.</Text>
          <Text style={styles.emptySubText}>Tap + to add your first loan</Text>
        </View>
      ) : (
        <FlatList
          data={liabilities}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.purple, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { margin: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 8 },
  summaryValue: { fontSize: 36, fontWeight: '800', color: Colors.error },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm },
  value: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  progressContainer: { height: 6, backgroundColor: Colors.bgSecondary, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.success },
  progressText: { fontSize: 10, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: Colors.textPrimary, marginTop: 16, fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },
  emptySubText: { color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
});
