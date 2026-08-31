import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';

export default function PaywallModal() {
  const upgradeToPro = useAuthStore((state) => state.upgradeToPro);
  const router = useRouter();

  const handleSubscribe = () => {
    upgradeToPro();
    router.back();
  };

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Feather name="zap" size={64} color="#FBBF24" style={styles.icon} />
          <Text style={styles.title}>Unlock AI Power</Text>
          <Text style={styles.subtitle}>Supercharge your personal finance with our intelligent features.</Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Feather name="check-circle" size={24} color="#4ade80" />
              <Text style={styles.featureText}>Automatic Receipt Parsing</Text>
            </View>
            <View style={styles.featureRow}>
              <Feather name="check-circle" size={24} color="#4ade80" />
              <Text style={styles.featureText}>AI Financial Advisor Chat</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubscribe} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Subscribe for $4.99/mo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  icon: { marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.white, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: Spacing.xxl },
  features: { width: '100%', marginBottom: Spacing.xxl },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  featureText: { color: Colors.white, fontSize: FontSize.md, marginLeft: Spacing.md, fontWeight: '500' },
  button: { backgroundColor: Colors.primaryAction, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: Spacing.md },
  buttonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '600' },
  cancelButton: { padding: 16 },
  cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.md },
});
