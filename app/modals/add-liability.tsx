import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useLiabilityStore } from '../../src/store/useLiabilityStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

export default function AddLiabilityModal() {
  const { addLiability } = useLiabilityStore();
  const { userRecord } = useAuthStore();

  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [emi, setEmi] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const handleSave = () => {
    if (!name || !totalAmount) return;
    if (!userRecord?.familyId) {
      Alert.alert("Error", "You must be in a family to add liabilities.");
      return;
    }
    
    addLiability({
      name,
      totalAmount: parseFloat(totalAmount),
      paidAmount: 0,
      emiAmount: parseFloat(emi) || 0,
      interestRate: parseFloat(interestRate) || 0,
      type: "home_loan"
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
          <Text style={styles.headerTitle}>Add Liability</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>Liability Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Home Loan"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Total Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={totalAmount}
            onChangeText={setTotalAmount}
          />

          <Text style={styles.label}>Monthly EMI (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={emi}
            onChangeText={setEmi}
          />

          <Text style={styles.label}>Interest Rate (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={interestRate}
            onChangeText={setInterestRate}
          />

          <TouchableOpacity style={styles.bigSaveBtn} onPress={handleSave}>
            <Feather name="check" size={20} color={Colors.white} />
            <Text style={styles.bigSaveBtnText}>Save Liability</Text>
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
  saveBtn: { backgroundColor: Colors.red, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border },
  bigSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.red, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl },
  bigSaveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
});
