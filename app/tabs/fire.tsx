import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFIREStore } from '../../src/store/useFIREStore';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';
import { formatCurrency } from '../../src/utils/calculations';

type FIRETier = 'lean' | 'regular' | 'fat';

const TIERS: { id: FIRETier; label: string; emoji: string; color: string; desc: string; multiplier: string }[] = [
  { id: 'lean', label: 'Lean FIRE', emoji: '🌱', color: '#84CC16', desc: 'Minimalist lifestyle', multiplier: '20x' },
  { id: 'regular', label: 'Regular FIRE', emoji: '🏠', color: Colors.emerald, desc: 'Current lifestyle', multiplier: '25x' },
  { id: 'fat', label: 'Fat FIRE', emoji: '🛥️', color: Colors.purple, desc: 'Upgraded lifestyle', multiplier: '33x' },
];

export default function FIREScreen() {
  const { config, result, updateConfig, calculate } = useFIREStore();
  const { getTotalCurrentValue } = useInvestmentStore();
  const [activeTier, setActiveTier] = useState<FIRETier>('regular');
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    calculate(getTotalCurrentValue());
  }, []);

  const handleUpdate = (key: keyof typeof config, value: string) => {
    const num = parseFloat(value) || 0;
    const updated = { ...localConfig, [key]: num };
    setLocalConfig(updated);
    updateConfig(updated);
    calculate(getTotalCurrentValue());
  };

  const tier = TIERS.find(t => t.id === activeTier)!;
  const fireNumber = result
    ? activeTier === 'lean' ? result.leanFIRE : activeTier === 'regular' ? result.regularFIRE : result.fatFIRE
    : 0;
  const yearsToFIRE = result ? result.yearsToFIRE[activeTier] : 20;
  const progress = result ? result.progress[activeTier] : 0;

  // Corpus projection chart data (last 10 data points)
  const chartData = result ? result.projectedCorpus.slice(-10) : [];
  const chartMax = chartData.length > 0 ? Math.max(...chartData) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>FIRE Calculator</Text>
        <Text style={styles.subtitle}>Financial Independence, Retire Early</Text>

        {/* Tier Selector */}
        <View style={styles.tierRow}>
          {TIERS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tierBtn, activeTier === t.id && { backgroundColor: `${t.color}20`, borderColor: t.color }]}
              onPress={() => setActiveTier(t.id)}
            >
              <Text style={styles.tierEmoji}>{t.emoji}</Text>
              <Text style={[styles.tierLabel, activeTier === t.id && { color: t.color }]}>{t.label}</Text>
              <Text style={styles.tierMult}>{t.multiplier}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FIRE Number Hero */}
        <View style={[styles.heroCard, { borderColor: `${tier.color}40` }]}>
          <View style={[styles.heroGlow, { backgroundColor: `${tier.color}15` }]} />
          <Text style={styles.heroLabel}>{tier.label} Number</Text>
          <Text style={[styles.heroValue, { color: tier.color }]}>{formatCurrency(fireNumber)}</Text>
          <Text style={styles.heroDesc}>{tier.desc} • {tier.multiplier} annual expenses</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressPct, { color: tier.color }]}>{progress.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: tier.color }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressMeta}>
                Current: {formatCurrency(config.currentCorpus || getTotalCurrentValue(), true)}
              </Text>
              <Text style={styles.progressMeta}>
                Target: {formatCurrency(fireNumber, true)}
              </Text>
            </View>
          </View>

          {/* Years to FIRE */}
          <View style={[styles.yearsCard, { borderColor: `${tier.color}30` }]}>
            <Text style={styles.yearsValue}>{yearsToFIRE <= 0 ? '🎉' : yearsToFIRE}</Text>
            <Text style={styles.yearsLabel}>
              {yearsToFIRE <= 0 ? 'You can retire NOW!' : `years to ${tier.label}`}
            </Text>
          </View>
        </View>

        {/* Mini Chart (Bar visualization) */}
        {chartData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Corpus Growth Projection</Text>
            <View style={styles.chartBars}>
              {chartData.map((val, i) => (
                <View key={i} style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, {
                    height: Math.max(4, (val / chartMax) * 100),
                    backgroundColor: val >= fireNumber ? tier.color : Colors.bgCardElevated,
                  }]} />
                </View>
              ))}
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>Now</Text>
              <Text style={styles.chartLabel}>
                Age {(config.currentAge || 30) + (result?.projectedYears.length || 0)}
              </Text>
            </View>
            <Text style={styles.chartNote}>
              Projected corpus at retirement: {formatCurrency(result?.projectedCorpus[result.projectedCorpus.length - 1] ?? 0, true)}
            </Text>
          </View>
        )}

        {/* Config Inputs */}
        <Text style={styles.sectionTitle}>Your Details</Text>
        <View style={styles.inputGrid}>
          {[
            { key: 'currentAge', label: 'Current Age', suffix: 'yrs', icon: 'user' },
            { key: 'retirementAge', label: 'Target Retire Age', suffix: 'yrs', icon: 'calendar' },
            { key: 'currentMonthlyExpenses', label: 'Monthly Expenses', suffix: '₹', icon: 'shopping-cart', prefix: true },
            { key: 'monthlySIP', label: 'Monthly SIP/Savings', suffix: '₹', icon: 'repeat', prefix: true },
            { key: 'currentCorpus', label: 'Current Corpus', suffix: '₹', icon: 'briefcase', prefix: true },
            { key: 'inflationRate', label: 'Inflation Rate', suffix: '%', icon: 'percent' },
            { key: 'expectedReturn', label: 'Expected Returns', suffix: '%', icon: 'trending-up' },
          ].map(field => (
            <View key={field.key} style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Feather name={field.icon as any} size={14} color={Colors.textMuted} />
                <Text style={styles.inputLabel}>{field.label}</Text>
              </View>
              <View style={styles.inputRow}>
                {field.prefix && <Text style={styles.inputPrefix}>₹</Text>}
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(localConfig[field.key as keyof typeof localConfig] || '')}
                  onChangeText={v => handleUpdate(field.key as any, v)}
                  placeholderTextColor={Colors.textMuted}
                  placeholder="0"
                />
                {!field.prefix && <Text style={styles.inputSuffix}>{field.suffix}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* All 3 FIRE Numbers Summary */}
        <Text style={styles.sectionTitle}>All FIRE Targets</Text>
        {TIERS.map(t => {
          const fn = result ? (t.id === 'lean' ? result.leanFIRE : t.id === 'regular' ? result.regularFIRE : result.fatFIRE) : 0;
          const yrs = result ? result.yearsToFIRE[t.id] : 0;
          const prog = result ? result.progress[t.id] : 0;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.summaryCard, activeTier === t.id && { borderColor: t.color }]}
              onPress={() => setActiveTier(t.id)}
            >
              <Text style={styles.sumEmoji}>{t.emoji}</Text>
              <View style={styles.sumInfo}>
                <Text style={styles.sumLabel}>{t.label}</Text>
                <Text style={styles.sumDesc}>{t.desc}</Text>
              </View>
              <View style={styles.sumNumbers}>
                <Text style={[styles.sumValue, { color: t.color }]}>{formatCurrency(fn, true)}</Text>
                <Text style={styles.sumYears}>{yrs <= 0 ? '🎉 Now!' : `${yrs}y`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  tierRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  tierBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  tierEmoji: { fontSize: 18 },
  tierLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  tierMult: { fontSize: FontSize.xs, color: Colors.textMuted },
  heroCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.md, borderWidth: 1, overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: 65,
  },
  heroLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  heroValue: { fontSize: 34, fontWeight: '800', marginVertical: 6 },
  heroDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  progressSection: { marginBottom: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  progressPct: { fontSize: FontSize.sm, fontWeight: '700' },
  progressBar: { height: 10, backgroundColor: Colors.bgPrimary, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  yearsCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1,
  },
  yearsValue: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  yearsLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  // Chart
  chartCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  chartTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  chartBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 100 },
  chartBar: { width: '100%', borderRadius: 2 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  chartLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  chartNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  // Inputs
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  inputGrid: { gap: Spacing.sm },
  inputCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  inputLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputPrefix: { fontSize: FontSize.md, color: Colors.textSecondary, marginRight: 4 },
  input: { flex: 1, fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: '700', paddingVertical: 0 },
  inputSuffix: { fontSize: FontSize.md, color: Colors.textSecondary, marginLeft: 4 },
  // Summary cards
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  sumEmoji: { fontSize: 24, marginRight: Spacing.md },
  sumInfo: { flex: 1 },
  sumLabel: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  sumDesc: { fontSize: FontSize.xs, color: Colors.textMuted },
  sumNumbers: { alignItems: 'flex-end' },
  sumValue: { fontSize: FontSize.md, fontWeight: '700' },
  sumYears: { fontSize: FontSize.xs, color: Colors.textMuted },
});
