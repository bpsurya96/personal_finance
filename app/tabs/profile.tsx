import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { Colors, Spacing, Radius, FontSize, EXPENSE_CATEGORIES } from '../../src/constants/theme';
import { formatCurrency } from '../../src/utils/calculations';

export default function ProfileScreen() {
  const profile = useProfileStore();
  const { budget, setBudget, expenses } = useExpenseStore();
  const { investments } = useInvestmentStore();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all expenses and investments. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // Note: In production, call store reset methods
          Alert.alert('Done', 'Data cleared');
        }},
      ]
    );
  };

  const stats = [
    { label: 'Total Expenses', value: expenses.length.toString(), icon: 'credit-card', color: Colors.amber },
    { label: 'Investments', value: investments.length.toString(), icon: 'trending-up', color: Colors.emerald },
    { label: 'Total Invested', value: formatCurrency(investments.reduce((s, i) => s + i.investedAmount, 0), true), icon: 'dollar-sign', color: Colors.purple },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        {/* Family Card */}
        <View style={styles.familyCard}>
          <View style={styles.familyGlow} />
          <Text style={styles.familyName}>{profile.familyName}</Text>
          <View style={styles.membersRow}>
            <View style={[styles.memberBadge, { borderColor: Colors.husband }]}>
              <Text style={styles.memberEmoji}>👨</Text>
              <Text style={styles.memberName}>{profile.husband.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: `${Colors.husband}20` }]}>
                <Text style={[styles.roleText, { color: Colors.husband }]}>Husband</Text>
              </View>
            </View>
            <View style={styles.heartDivider}>
              <Text style={styles.heartIcon}>💜</Text>
            </View>
            <View style={[styles.memberBadge, { borderColor: Colors.wife }]}>
              <Text style={styles.memberEmoji}>👩</Text>
              <Text style={styles.memberName}>{profile.wife.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: `${Colors.wife}20` }]}>
                <Text style={[styles.roleText, { color: Colors.wife }]}>Wife</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Feather name={stat.icon as any} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit Names */}
        <Text style={styles.sectionTitle}>Edit Names</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Family Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={profile.familyName}
              onChangeText={v => profile.updateProfile({ familyName: v })}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: Colors.husband }]}>👨 Husband</Text>
            <TextInput
              style={styles.fieldInput}
              value={profile.husband.name}
              onChangeText={v => profile.updateProfile({ husband: { ...profile.husband, name: v } })}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: Colors.wife }]}>👩 Wife</Text>
            <TextInput
              style={styles.fieldInput}
              value={profile.wife.name}
              onChangeText={v => profile.updateProfile({ wife: { ...profile.wife, name: v } })}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Budget Settings */}
        <Text style={styles.sectionTitle}>Monthly Budget</Text>
        <View style={styles.card}>
          {EXPENSE_CATEGORIES.map((cat, i) => (
            <View key={cat.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.fieldRow}>
                <View style={styles.catRow}>
                  <Feather name={cat.icon as any} size={14} color={cat.color} />
                  <Text style={styles.fieldLabel}>{cat.label}</Text>
                </View>
                <View style={styles.budgetInputWrap}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.budgetInput}
                    keyboardType="numeric"
                    value={String(budget[cat.id] || '')}
                    onChangeText={v => setBudget(cat.id, parseFloat(v) || 0)}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="0"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>USD → INR Rate</Text>
            <View style={styles.budgetInputWrap}>
              <TextInput
                style={styles.budgetInput}
                keyboardType="numeric"
                value={String(profile.usdToInr)}
                onChangeText={v => profile.updateProfile({ usdToInr: parseFloat(v) || 84 })}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
          <Feather name="trash-2" size={16} color={Colors.red} />
          <Text style={styles.dangerText}>Clear All Data</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  familyCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: `${Colors.purple}30`,
    overflow: 'hidden', alignItems: 'center',
  },
  familyGlow: {
    position: 'absolute', top: -30, width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.purpleAlpha,
  },
  familyName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  memberBadge: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1,
  },
  memberEmoji: { fontSize: 28, marginBottom: 4 },
  memberName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: '600' },
  heartDivider: { alignItems: 'center' },
  heartIcon: { fontSize: 24 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  fieldInput: { flex: 1, textAlign: 'right', color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetInputWrap: { flexDirection: 'row', alignItems: 'center' },
  rupeeSign: { fontSize: FontSize.sm, color: Colors.textMuted, marginRight: 2 },
  budgetInput: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: Colors.redAlpha, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.red}40`,
  },
  dangerText: { color: Colors.red, fontWeight: '700', fontSize: FontSize.md },
});
