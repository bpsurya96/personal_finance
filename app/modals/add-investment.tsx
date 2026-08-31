import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useInvestmentStore } from '../../src/store/useInvestmentStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';
import { AssetType } from '../../src/types';

export default function AddInvestmentModal() {
  const { addInvestment } = useInvestmentStore();
  const { userRecord } = useAuthStore();

  const [name, setName] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [type, setType] = useState<AssetType>('mutual_fund');

  const handleSave = () => {
    if (!name || !investedAmount || !currentValue) return;
    if (!userRecord?.familyId) {
      Alert.alert("Error", "You must be in a family to add investments.");
      return;
    }
    
    addInvestment({
      name,
      investedAmount: parseFloat(investedAmount),
      currentValue: parseFloat(currentValue),
      type,
    }, userRecord.familyId);
    
    router.back();
  };

  const types: AssetType[] = ['mutual_fund', 'stock', 'fd', 'pf', 'gold', 'real_estate'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Investment</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>Investment Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. HDFC Index Fund"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Invested Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={investedAmount}
            onChangeText={setInvestedAmount}
          />

          <Text style={styles.label}>Current Value (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={currentValue}
            onChangeText={setCurrentValue}
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeGrid}>
            {types.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && { backgroundColor: `${Colors.emerald}20`, borderColor: Colors.emerald }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && { color: Colors.emerald }]}>
                  {t.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.bigSaveBtn} onPress={handleSave}>
            <Feather name="check" size={20} color={Colors.white} />
            <Text style={styles.bigSaveBtnText}>Save Investment</Text>
          </TouchableOpacity>
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
  saveBtn: { backgroundColor: Colors.emerald, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  typeText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  bigSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.emerald, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl },
  bigSaveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
});
