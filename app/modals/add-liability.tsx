import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useLiabilityStore } from '../../src/store/useLiabilityStore';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AddLiabilityModal() {
  const addLiability = useLiabilityStore(state => state.addLiability);
  
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');

  const handleSave = () => {
    if (!name || !totalAmount) return;
    
    addLiability({
      name,
      totalAmount: parseFloat(totalAmount) || 0,
      paidAmount: parseFloat(paidAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      termMonths: parseInt(termMonths, 10) || 0,
    });
    
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Liability</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Loan Name (e.g. Car Loan)</Text>
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} placeholder="Name" value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Total Amount</Text>
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} placeholder="0.00" keyboardType="numeric" value={totalAmount} onChangeText={setTotalAmount} />
        
        <Text style={styles.label}>Amount Paid (Optional)</Text>
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} placeholder="0.00" keyboardType="numeric" value={paidAmount} onChangeText={setPaidAmount} />
        
        <Text style={styles.label}>Interest Rate (%)</Text>
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} placeholder="5.5" keyboardType="numeric" value={interestRate} onChangeText={setInterestRate} />
        
        <Text style={styles.label}>Term (Months)</Text>
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} placeholder="60" keyboardType="numeric" value={termMonths} onChangeText={setTermMonths} />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Liability</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  form: { padding: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md },
  saveButton: { backgroundColor: Colors.purple, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: 32 },
  saveButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' }
});
