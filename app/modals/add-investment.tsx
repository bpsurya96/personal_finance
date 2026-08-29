import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { Colors, Spacing, Radius, FontSize, INVESTMENT_TYPES } from '../../src/constants/theme';
import { FamilyRole, InvestmentType } from '../../src/types';

export default function AddInvestmentModal() {
  const { addInvestment } = useInvestmentStore();
  const { husband, wife } = useProfileStore();

  const [selectedType, setSelectedType] = useState<InvestmentType>('mutual_fund');
  const [addedBy, setAddedBy] = useState<FamilyRole>('husband');
  const [name, setName] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'type' | 'details'>('type');

  // Extra fields per type
  const [extra, setExtra] = useState<Record<string, string>>({});
  const updateExtra = (key: string, value: string) => setExtra(prev => ({ ...prev, [key]: value }));

  const selectedTypeInfo = INVESTMENT_TYPES.find(t => t.id === selectedType);

  const handleSave = () => {
    if (!name || !investedAmount) return;
    const invested = parseFloat(investedAmount) || 0;
    const current = parseFloat(currentValue) || invested;

    addInvestment({
      familyId: 'local',
      type: selectedType,
      name,
      investedAmount: invested,
      currentValue: current,
      addedBy,
      notes,
      details: extra,
    });
    router.back();
  };

  const extraFields = getExtraFields(selectedType);

  if (step === 'type') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Investment</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionLabel}>Choose investment type</Text>
          <View style={styles.typeGrid}>
            {INVESTMENT_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` },
                ]}
                onPress={() => setSelectedType(type.id as InvestmentType)}
              >
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                  <Feather name={type.icon as any} size={20} color={type.color} />
                </View>
                <Text style={[styles.typeLabel, selectedType === type.id && { color: type.color }]}>
                  {type.label}
                </Text>
                {selectedType === type.id && (
                  <View style={styles.selectedCheck}>
                    <Feather name="check-circle" size={16} color={type.color} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: selectedTypeInfo?.color }]}
            onPress={() => setStep('details')}
          >
            <Text style={styles.nextBtnText}>Continue with {selectedTypeInfo?.label} →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('type')} style={styles.closeBtn}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedTypeInfo?.label}</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: selectedTypeInfo?.color }]}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Who added */}
          <Text style={styles.sectionLabel}>Added by</Text>
          <View style={styles.personRow}>
            {(['husband', 'wife'] as FamilyRole[]).map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.personBtn, addedBy === role && {
                  backgroundColor: `${role === 'husband' ? Colors.husband : Colors.wife}20`,
                  borderColor: role === 'husband' ? Colors.husband : Colors.wife,
                }]}
                onPress={() => setAddedBy(role)}
              >
                <Text style={styles.personEmoji}>{role === 'husband' ? '👨' : '👩'}</Text>
                <Text style={[styles.personName, addedBy === role && {
                  color: role === 'husband' ? Colors.husband : Colors.wife,
                }]}>
                  {role === 'husband' ? husband.name : wife.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Core fields */}
          <Text style={styles.sectionLabel}>Name / Description</Text>
          <TextInput
            style={styles.input}
            placeholder={getNamePlaceholder(selectedType)}
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.amountRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Amount Invested (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={investedAmount}
                onChangeText={setInvestedAmount}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Current Value (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Same as invested"
                placeholderTextColor={Colors.textMuted}
                value={currentValue}
                onChangeText={setCurrentValue}
              />
            </View>
          </View>

          {/* Extra fields per type */}
          {extraFields.map(field => (
            <View key={field.key}>
              <Text style={styles.sectionLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                keyboardType={field.numeric ? 'numeric' : 'default'}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={extra[field.key] || ''}
                onChangeText={v => updateExtra(field.key, v)}
              />
            </View>
          ))}

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Any additional details..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity
            style={[styles.bigSaveBtn, { backgroundColor: selectedTypeInfo?.color }]}
            onPress={handleSave}
          >
            <Feather name="check" size={20} color={Colors.white} />
            <Text style={styles.bigSaveBtnText}>Save {selectedTypeInfo?.label}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getNamePlaceholder(type: InvestmentType): string {
  const map: Record<InvestmentType, string> = {
    mutual_fund: 'e.g. Parag Parikh Flexi Cap',
    stock: 'e.g. RELIANCE',
    us_etf: 'e.g. VTI, QQQ',
    non_us_etf: 'e.g. MCHI (China ETF)',
    fd: 'e.g. SBI FD - 7.5%',
    rd: 'e.g. HDFC RD - 6%',
    ppf: 'e.g. PPF Account',
    nps: 'e.g. NPS Tier I',
    epfo: 'e.g. EPFO',
    bond: 'e.g. REC Bond 7.5%',
    chit: 'e.g. Margadarsi Chit',
  };
  return map[type] || 'Name';
}

function getExtraFields(type: InvestmentType): { key: string; label: string; placeholder: string; numeric: boolean }[] {
  switch (type) {
    case 'mutual_fund': return [
      { key: 'units', label: 'Units', placeholder: '100.5', numeric: true },
      { key: 'nav', label: 'Current NAV (₹)', placeholder: '50.25', numeric: true },
      { key: 'sipAmount', label: 'SIP Amount (₹/month)', placeholder: '5000', numeric: true },
      { key: 'folioNumber', label: 'Folio Number', placeholder: '12345', numeric: false },
    ];
    case 'stock': return [
      { key: 'symbol', label: 'Stock Symbol', placeholder: 'RELIANCE', numeric: false },
      { key: 'quantity', label: 'Quantity (shares)', placeholder: '10', numeric: true },
      { key: 'avgBuyPrice', label: 'Avg Buy Price (₹)', placeholder: '2450', numeric: true },
      { key: 'cmp', label: 'Current Market Price (₹)', placeholder: '2600', numeric: true },
      { key: 'exchange', label: 'Exchange (NSE/BSE)', placeholder: 'NSE', numeric: false },
    ];
    case 'us_etf': case 'non_us_etf': return [
      { key: 'symbol', label: 'ETF Symbol', placeholder: 'VTI', numeric: false },
      { key: 'units', label: 'Units', placeholder: '5', numeric: true },
      { key: 'buyPriceUSD', label: 'Buy Price (USD)', placeholder: '220', numeric: true },
      { key: 'currentPriceUSD', label: 'Current Price (USD)', placeholder: '245', numeric: true },
      { key: 'usdToInr', label: 'USD → INR Rate', placeholder: '84', numeric: true },
    ];
    case 'fd': return [
      { key: 'bank', label: 'Bank Name', placeholder: 'SBI', numeric: false },
      { key: 'interestRate', label: 'Interest Rate (%)', placeholder: '7.5', numeric: true },
      { key: 'tenureMonths', label: 'Tenure (months)', placeholder: '12', numeric: true },
      { key: 'maturityDate', label: 'Maturity Date (YYYY-MM-DD)', placeholder: '2025-08-01', numeric: false },
      { key: 'maturityAmount', label: 'Maturity Amount (₹)', placeholder: '110000', numeric: true },
    ];
    case 'rd': return [
      { key: 'bank', label: 'Bank Name', placeholder: 'HDFC', numeric: false },
      { key: 'monthlyAmount', label: 'Monthly Amount (₹)', placeholder: '5000', numeric: true },
      { key: 'interestRate', label: 'Interest Rate (%)', placeholder: '6.5', numeric: true },
      { key: 'tenureMonths', label: 'Tenure (months)', placeholder: '24', numeric: true },
    ];
    case 'ppf': return [
      { key: 'annualContribution', label: 'Annual Contribution (₹)', placeholder: '150000', numeric: true },
      { key: 'accountYear', label: 'Account Year (1-15)', placeholder: '5', numeric: true },
    ];
    case 'nps': return [
      { key: 'tier', label: 'Tier (I or II)', placeholder: 'I', numeric: false },
      { key: 'equityPercent', label: 'Equity %', placeholder: '75', numeric: true },
    ];
    case 'epfo': return [
      { key: 'monthlyEmployeeContrib', label: 'Employee Contribution (₹/month)', placeholder: '1800', numeric: true },
      { key: 'monthlyEmployerContrib', label: 'Employer Contribution (₹/month)', placeholder: '1800', numeric: true },
    ];
    case 'bond': return [
      { key: 'issuer', label: 'Issuer', placeholder: 'REC', numeric: false },
      { key: 'faceValue', label: 'Face Value (₹)', placeholder: '1000', numeric: true },
      { key: 'couponRate', label: 'Coupon Rate (%)', placeholder: '7.5', numeric: true },
      { key: 'maturityDate', label: 'Maturity Date (YYYY-MM-DD)', placeholder: '2030-01-01', numeric: false },
      { key: 'quantity', label: 'No. of Bonds', placeholder: '10', numeric: true },
    ];
    case 'chit': return [
      { key: 'organiser', label: 'Organiser', placeholder: 'Margadarsi', numeric: false },
      { key: 'chitValue', label: 'Chit Value (₹)', placeholder: '500000', numeric: true },
      { key: 'monthlyAmount', label: 'Monthly Payment (₹)', placeholder: '10000', numeric: true },
      { key: 'durationMonths', label: 'Duration (months)', placeholder: '50', numeric: true },
      { key: 'currentMonth', label: 'Current Month #', placeholder: '6', numeric: true },
    ];
    default: return [];
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: { borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeCard: {
    width: '47%', backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'flex-start', position: 'relative',
  },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  typeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  selectedCheck: { position: 'absolute', top: 8, right: 8 },
  nextBtn: {
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xl,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  nextBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  personRow: { flexDirection: 'row', gap: Spacing.sm },
  personBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  personEmoji: { fontSize: 20 },
  personName: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    color: Colors.textPrimary, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border,
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end' },
  bigSaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  bigSaveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
});
