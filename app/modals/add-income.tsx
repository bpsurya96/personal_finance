import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, Radius } from "../../src/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useIncomeStore } from "../../src/store/useIncomeStore";
import { router } from "expo-router";

export default function AddIncomeModal() {
  const [type, setType] = useState<"salary" | "passive">("salary");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "yearly" | "one-time">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRecord = useAuthStore((s) => s.userRecord);
  const addIncome = useIncomeStore((s) => s.addIncome);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Please enter an income name");
    if (!amount || isNaN(Number(amount))) return Alert.alert("Error", "Please enter a valid amount");
    if (!userRecord?.familyId) return Alert.alert("Error", "No family found");

    setIsSubmitting(true);
    try {
      await addIncome({
        type,
        name: name.trim(),
        amount: Number(amount),
        frequency
      }, userRecord.familyId);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.label}>Income Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, type === "salary" && styles.typeBtnActive]}
              onPress={() => setType("salary")}
            >
              <Text style={[styles.typeBtnText, type === "salary" && styles.typeBtnTextActive]}>Salary</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, type === "passive" && styles.typeBtnActive]}
              onPress={() => setType("passive")}
            >
              <Text style={[styles.typeBtnText, type === "passive" && styles.typeBtnTextActive]}>Passive Income</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name / Source</Text>
          <TextInput
            style={styles.input}
            placeholder={type === "salary" ? "e.g. Monthly Salary" : "e.g. Rental Income"}
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.freqSelector}>
            {["monthly", "yearly", "one-time"].map(f => (
              <TouchableOpacity 
                key={f}
                style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                onPress={() => setFrequency(f as any)}
              >
                <Text style={[styles.freqBtnText, frequency === f && styles.freqBtnTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>{isSubmitting ? "Saving..." : "Save Income"}</Text>
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
  closeBtn: { padding: Spacing.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  
  form: { padding: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  
  input: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary
  },
  
  typeSelector: { flexDirection: 'row', gap: Spacing.md },
  typeBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  typeBtnActive: { borderColor: Colors.primaryAction, backgroundColor: Colors.borderLight },
  typeBtnText: { color: Colors.textSecondary, fontSize: FontSize.md },
  typeBtnTextActive: { color: Colors.textPrimary, fontWeight: '500' },

  freqSelector: { flexDirection: 'row', gap: Spacing.sm },
  freqBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  freqBtnActive: { backgroundColor: Colors.primaryAction, borderColor: Colors.primaryAction },
  freqBtnText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  freqBtnTextActive: { color: Colors.white, fontWeight: '500' },

  submitBtn: {
    backgroundColor: Colors.primaryAction, padding: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', marginTop: Spacing.xl
  },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' }
});
