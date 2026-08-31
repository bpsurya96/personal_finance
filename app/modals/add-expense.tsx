import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useExpenseStore } from '../../src/store/useExpenseStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Colors, Spacing, Radius, FontSize, EXPENSE_CATEGORIES } from '../../src/constants/theme';
import { FamilyRole } from '../../src/types';

export default function AddExpenseModal() {
  const { addExpense } = useExpenseStore();
  const { husband, wife } = useProfileStore();
  const { userRecord } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [addedBy, setAddedBy] = useState<FamilyRole>('husband');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!userRecord?.familyId) {
      Alert.alert("Error", "You must be in a family to add expenses.");
      return;
    }
    addExpense({
      amount: parseFloat(amount),
      category,
      description: note,
      addedBy,
      date: new Date(date).toISOString(),
    }, userRecord.familyId);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Who spent?</Text>
          <View style={styles.personRow}>
            <TouchableOpacity
              style={[styles.personBtn, addedBy === 'husband' && { backgroundColor: `${Colors.husband}20`, borderColor: Colors.husband }]}
              onPress={() => setAddedBy('husband')}
            >
              <Text style={styles.personEmoji}>👨</Text>
              <Text style={[styles.personName, addedBy === 'husband' && { color: Colors.husband }]}>{husband.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.personBtn, addedBy === 'wife' && { backgroundColor: `${Colors.wife}20`, borderColor: Colors.wife }]}
              onPress={() => setAddedBy('wife')}
            >
              <Text style={styles.personEmoji}>👩</Text>
              <Text style={[styles.personName, addedBy === 'wife' && { color: Colors.wife }]}>{wife.name}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, category === cat.id && { backgroundColor: `${cat.color}20`, borderColor: cat.color }]}
                onPress={() => setCategory(cat.id)}
              >
                <Feather name={cat.icon as any} size={16} color={category === cat.id ? cat.color : Colors.textMuted} />
                <Text style={[styles.catLabel, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity style={styles.bigSaveBtn} onPress={handleSave}>
            <Feather name="check" size={20} color={Colors.white} />
            <Text style={styles.bigSaveBtnText}>Save Expense</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.purple, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  amountCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  amountLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  rupeeSign: { fontSize: 32, color: Colors.textSecondary, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '800', color: Colors.textPrimary, minWidth: 100 },
  sectionLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  personRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  personBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  personEmoji: { fontSize: 20 },
  personName: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  catLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  noteInput: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border },
  bigSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.purple, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl, shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  bigSaveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
});
