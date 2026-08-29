import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { Colors, Spacing, Radius, FontSize, INVESTMENT_TYPES } from '../../src/constants/theme';
import { formatCurrency, formatPercent } from '../../src/utils/calculations';
import { InvestmentType } from '../../src/types';

export default function InvestmentsScreen() {
  const { investments, deleteInvestment, getTotalCurrentValue, getTotalInvested, getAssetAllocation } = useInvestmentStore();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const totalInvested = getTotalInvested();
  const totalCurrent = getTotalCurrentValue();
  const gainLoss = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
  const allocation = getAssetAllocation();
  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', '*/*'] });
      if (result.canceled) return;
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;
          let count = 0;
          data.forEach((row: any) => {
            const amountStr = row['Amount'] || '';
            const pnlStr = row['P&L'] || '';
            const dateStr = row['Date'] || '';

            const amount = parseFloat(amountStr.toString().replace(/,/g, ''));
            const pnl = parseFloat(pnlStr.toString().replace(/,/g, ''));

            if (!isNaN(amount) && !isNaN(pnl)) {
              useInvestmentStore.getState().addInvestment({
                name: "Imported " + dateStr,
                type: 'mutual_fund',
                investedAmount: amount,
                currentValue: amount + pnl,
                addedBy: 'husband',
                details: row,
              });
              count++;
            }
          });
          Alert.alert('Success', "Imported " + count + " investments");
        },
        error: (error: any) => {
          Alert.alert('Error parsing CSV', error.message);
        }
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to read file');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Investment', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteInvestment(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
                <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.addBtn} onPress={handleImportCSV}>
              <Feather name="upload" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/modals/add-investment')}>
            <Feather name="plus" size={20} color={Colors.white} />
          </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Total Portfolio Value</Text>
          <Text style={styles.heroValue}>{formatCurrency(totalCurrent)}</Text>
          <View style={styles.gainRow}>
            <Feather
              name={gainLoss >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={gainLoss >= 0 ? Colors.emerald : Colors.red}
            />
            <Text style={[styles.gainText, { color: gainLoss >= 0 ? Colors.emerald : Colors.red }]}>
              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, true)} ({gainPct.toFixed(2)}%)
            </Text>
          </View>

          {/* Asset Allocation Bars */}
          <View style={styles.allocSection}>
            <Text style={styles.allocTitle}>Asset Allocation</Text>
            <View style={styles.allocBar}>
              <View style={[styles.allocFill, { flex: allocation.equity, backgroundColor: Colors.emerald }]} />
              <View style={[styles.allocFill, { flex: allocation.debt, backgroundColor: Colors.amber }]} />
              <View style={[styles.allocFill, { flex: allocation.alternative, backgroundColor: Colors.purple }]} />
            </View>
            <View style={styles.allocLegend}>
              <View style={styles.allocLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.emerald }]} />
                <Text style={styles.legendText}>Equity {allocation.equity.toFixed(0)}%</Text>
              </View>
              <View style={styles.allocLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.amber }]} />
                <Text style={styles.legendText}>Debt {allocation.debt.toFixed(0)}%</Text>
              </View>
              <View style={styles.allocLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.purple }]} />
                <Text style={styles.legendText}>Alt {allocation.alternative.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Investment Type Cards */}
        <Text style={styles.sectionTitle}>Holdings</Text>

        {investments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No investments yet</Text>
            <Text style={styles.emptySub}>Start tracking your portfolio</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/modals/add-investment')}
            >
              <Text style={styles.emptyBtnText}>+ Add Investment</Text>
            </TouchableOpacity>
          </View>
        )}

        {INVESTMENT_TYPES.map(type => {
          const typeInvs = investments.filter(i => i.type === type.id);
          if (typeInvs.length === 0) return null;

          const typeTotal = typeInvs.reduce((s, i) => s + i.currentValue, 0);
          const typeInvested = typeInvs.reduce((s, i) => s + i.investedAmount, 0);
          const typeGain = typeTotal - typeInvested;
          const typeGainPct = typeInvested > 0 ? (typeGain / typeInvested) * 100 : 0;
          const isExpanded = expandedType === type.id;

          return (
            <View key={type.id} style={[styles.typeCard, { borderLeftColor: type.color }]}>
              <TouchableOpacity
                style={styles.typeHeader}
                onPress={() => setExpandedType(isExpanded ? null : type.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconWrap, { backgroundColor: `${type.color}20` }]}>
                  <Feather name={type.icon as any} size={18} color={type.color} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Text style={styles.typeCount}>{typeInvs.length} holding{typeInvs.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.typeValueWrap}>
                  <Text style={styles.typeValue}>{formatCurrency(typeTotal, true)}</Text>
                  <Text style={[styles.typeGain, { color: typeGain >= 0 ? Colors.emerald : Colors.red }]}>
                    {typeGain >= 0 ? '+' : ''}{typeGainPct.toFixed(1)}%
                  </Text>
                </View>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16} color={Colors.textMuted} style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.typeItems}>
                  {typeInvs.map(inv => {
                    const g = inv.currentValue - inv.investedAmount;
                    const gp = inv.investedAmount > 0 ? (g / inv.investedAmount) * 100 : 0;
                    return (
                      <TouchableOpacity
                        key={inv.id}
                        style={styles.invItem}
                        onLongPress={() => handleDelete(inv.id, inv.name)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.invItemLeft}>
                          <Text style={styles.invName} numberOfLines={1}>{inv.name}</Text>
                          <Text style={styles.invInvested}>
                            Invested: {formatCurrency(inv.investedAmount, true)}
                          </Text>
                          {inv.notes ? <Text style={styles.invNotes} numberOfLines={1}>{inv.notes}</Text> : null}
                        </View>
                        <View style={styles.invItemRight}>
                          <Text style={styles.invCurrent}>{formatCurrency(inv.currentValue, true)}</Text>
                          <Text style={[styles.invGain, { color: g >= 0 ? Colors.emerald : Colors.red }]}>
                            {g >= 0 ? '+' : ''}{gp.toFixed(1)}%
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={styles.addMoreBtn}
                    onPress={() => router.push('/modals/add-investment')}
                  >
                    <Feather name="plus" size={14} color={type.color} />
                    <Text style={[styles.addMoreText, { color: type.color }]}>
                      Add {type.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-investment')}
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.emerald,
    alignItems: 'center', justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: `${Colors.emerald}30`,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -40, right: -40, width: 120, height: 120,
    borderRadius: 60, backgroundColor: Colors.emeraldAlpha,
  },
  heroLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  heroValue: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, marginVertical: 6 },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  gainText: { fontSize: FontSize.sm, fontWeight: '600' },
  allocSection: { backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, padding: Spacing.md },
  allocTitle: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginBottom: 8 },
  allocBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10, gap: 1 },
  allocFill: { borderRadius: 2 },
  allocLegend: { flexDirection: 'row', gap: Spacing.md },
  allocLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  typeCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, overflow: 'hidden',
  },
  typeHeader: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
  },
  typeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  typeInfo: { flex: 1 },
  typeLabel: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  typeCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  typeValueWrap: { alignItems: 'flex-end' },
  typeValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700' },
  typeGain: { fontSize: FontSize.xs, fontWeight: '600' },
  typeItems: { borderTopWidth: 1, borderTopColor: Colors.border },
  invItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  invItemLeft: { flex: 1, marginRight: Spacing.sm },
  invName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600' },
  invInvested: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  invNotes: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic', marginTop: 1 },
  invItemRight: { alignItems: 'flex-end' },
  invCurrent: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '700' },
  invGain: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  addMoreText: { fontSize: FontSize.sm, fontWeight: '600' },
  emptyState: {
    alignItems: 'center', padding: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: '700' },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  emptyBtn: {
    backgroundColor: Colors.emerald, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 82, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.emerald, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.emerald, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
});


