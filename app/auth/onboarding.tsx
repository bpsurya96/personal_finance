import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '../../src/store/useProfileStore';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';

export default function OnboardingScreen() {
  const { updateProfile, setOnboardingComplete } = useProfileStore();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState('');
  const [husbandName, setHusbandName] = useState('');
  const [wifeName, setWifeName] = useState('');

  const steps = [
    {
      title: "Welcome to\nFamilyFinance 💜",
      subtitle: "Your personal finance companion for building wealth together",
      content: null,
    },
    {
      title: "What's your\nfamily name?",
      subtitle: "This helps personalize your experience",
      content: (
        <TextInput
          style={styles.input}
          placeholder="e.g. The Sharma Family"
          placeholderTextColor={Colors.textMuted}
          value={familyName}
          onChangeText={setFamilyName}
          autoFocus
        />
      ),
    },
    {
      title: "Who's in the\nfamily?",
      subtitle: "Enter names for both members",
      content: (
        <View>
          <View style={styles.memberCard}>
            <Text style={styles.memberEmoji}>👨</Text>
            <View style={styles.memberInputWrap}>
              <Text style={styles.memberLabel}>Husband's name</Text>
              <TextInput
                style={styles.memberInput}
                placeholder="Enter name"
                placeholderTextColor={Colors.textMuted}
                value={husbandName}
                onChangeText={setHusbandName}
              />
            </View>
          </View>
          <View style={[styles.memberCard, { borderColor: `${Colors.wife}30`, marginTop: 12 }]}>
            <Text style={styles.memberEmoji}>👩</Text>
            <View style={styles.memberInputWrap}>
              <Text style={[styles.memberLabel, { color: Colors.wife }]}>Wife's name</Text>
              <TextInput
                style={styles.memberInput}
                placeholder="Enter name"
                placeholderTextColor={Colors.textMuted}
                value={wifeName}
                onChangeText={setWifeName}
              />
            </View>
          </View>
        </View>
      ),
    },
  ];

  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      updateProfile({
        familyName: familyName || 'My Family',
        husband: { name: husbandName || 'Husband', emoji: '👨' },
        wife: { name: wifeName || 'Wife', emoji: '👩' },
      });
      setOnboardingComplete();
      router.replace('/tabs');
    }
  };

  const current = steps[step];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Progress dots */}
          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          {/* Gradient circle decoration */}
          <View style={styles.decorCircle} />
          <View style={styles.decorCircle2} />

          <View style={styles.textSection}>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </View>

          {current.content && (
            <View style={styles.inputSection}>{current.content}</View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.buttonText}>
              {isLastStep ? "Let's Get Started 🚀" : "Continue"}
            </Text>
          </TouchableOpacity>

          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { flexGrow: 1, padding: Spacing.lg, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  dotActive: { width: 24, backgroundColor: Colors.purple },
  decorCircle: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.purpleAlpha,
  },
  decorCircle2: {
    position: 'absolute', bottom: 100, left: -80,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  textSection: { marginBottom: Spacing.xl },
  title: {
    fontSize: 36, fontWeight: '800', color: Colors.textPrimary,
    lineHeight: 44, marginBottom: Spacing.sm,
  },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  inputSection: { marginBottom: Spacing.xl },
  input: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    color: Colors.textPrimary, fontSize: FontSize.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.husband}30`,
  },
  memberEmoji: { fontSize: 32, marginRight: Spacing.md },
  memberInputWrap: { flex: 1 },
  memberLabel: { fontSize: FontSize.sm, color: Colors.husband, fontWeight: '600', marginBottom: 4 },
  memberInput: { color: Colors.textPrimary, fontSize: FontSize.md },
  button: {
    backgroundColor: Colors.purple, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md,
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  buttonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  backBtn: { alignItems: 'center', padding: Spacing.sm },
  backText: { color: Colors.textMuted, fontSize: FontSize.md },
});
