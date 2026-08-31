import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Colors, FontSize, Spacing, Radius } from "../../src/constants/theme";
import { signInWithGoogle, configureGoogleSignIn } from "../../src/lib/authService";
import { getOrCreateUser, getPendingInvites, acceptInvite } from "../../src/lib/familyService";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useProfileStore } from "../../src/store/useProfileStore";

configureGoogleSignIn();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setFirebaseUser, setUserRecord } = useAuthStore();
  const { onboardingComplete } = useProfileStore();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const firebaseUser = await signInWithGoogle();
      const userRecord = await getOrCreateUser(firebaseUser);

      // Check for pending family invites
      const invites = await getPendingInvites(firebaseUser.email ?? "");
      if (invites.length > 0) {
        const invite = invites[0];
        Alert.alert(
          "Family Invite 👨‍👩‍👧",
          `${invite.fromName} has invited you to join their family group. Accept?`,
          [
            {
              text: "Decline",
              style: "destructive",
              onPress: async () => {
                setFirebaseUser(firebaseUser);
                setUserRecord(userRecord);
                router.replace(onboardingComplete ? "/tabs" : "/auth/onboarding");
              },
            },
            {
              text: "Accept",
              onPress: async () => {
                await acceptInvite(invite, userRecord);
                const updatedRecord = { ...userRecord, familyId: invite.familyId };
                setFirebaseUser(firebaseUser);
                setUserRecord(updatedRecord);
                router.replace(onboardingComplete ? "/tabs" : "/auth/onboarding");
              },
            },
          ]
        );
        return;
      }

      setFirebaseUser(firebaseUser);
      setUserRecord(userRecord);
      router.replace(onboardingComplete ? "/tabs" : "/auth/onboarding");
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      Alert.alert("Sign-in Failed", err?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decorations */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <View style={styles.content}>
        {/* Logo / Icon area */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💜</Text>
          </View>
        </View>

        <Text style={styles.title}>FamilyFinance</Text>
        <Text style={styles.subtitle}>
          Track wealth together.{"\n"}Save, invest, and grow as one.
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {["📊 Smart tracking", "🔄 Real-time sync", "👨‍👩‍👧 Family sharing"].map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.bgPrimary} size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Your data is encrypted and synced securely via Firebase.{"\n"}
          We never store passwords.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  orb1: {
    position: "absolute", top: -100, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(124, 58, 237, 0.18)",
  },
  orb2: {
    position: "absolute", bottom: 50, left: -100,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  orb3: {
    position: "absolute", top: "40%", left: "60%",
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(124, 58, 237, 0.08)",
  },
  content: {
    flex: 1, paddingHorizontal: Spacing.xl,
    justifyContent: "center", alignItems: "center",
  },
  logoWrap: { marginBottom: Spacing.lg },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.purpleAlpha,
    borderWidth: 1.5, borderColor: `${Colors.purple}50`,
    justifyContent: "center", alignItems: "center",
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  logoEmoji: { fontSize: 48 },
  title: {
    fontSize: 36, fontWeight: "800", color: Colors.textPrimary,
    letterSpacing: -0.5, marginBottom: Spacing.sm, textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: "center", lineHeight: 24, marginBottom: Spacing.xl,
  },
  pills: { flexDirection: "column", gap: 10, marginBottom: Spacing.xl, width: "100%" },
  pill: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    paddingVertical: 10, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center",
  },
  pillText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: "600" },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFFFFF", borderRadius: Radius.lg,
    paddingVertical: 16, paddingHorizontal: Spacing.xl,
    width: "100%", marginBottom: Spacing.lg,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    gap: 12,
  },
  googleIcon: {
    fontSize: 20, fontWeight: "800",
    color: "#4285F4", fontFamily: "serif",
  },
  googleBtnText: {
    fontSize: FontSize.md, fontWeight: "700", color: "#1A1A2E",
  },
  footnote: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textAlign: "center", lineHeight: 18,
  },
});
