import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, Image, ActivityIndicator, Linking
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useProfileStore } from "../../src/store/useProfileStore";
import { useExpenseStore } from "../../src/store/useExpenseStore";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Colors, FontSize, Spacing, Radius, EXPENSE_CATEGORIES } from "../../src/constants/theme";
import {
  inviteFamilyMember, getFamilyMembers, removeFamilyMember, UserRecord,
} from "../../src/lib/familyService";
import { signOut } from "../../src/lib/authService";
import { router } from "expo-router";

export default function ProfileScreen() {
  const profile = useProfileStore();
  const { budget, setBudget } = useExpenseStore();
  const { firebaseUser, userRecord, clear } = useAuthStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<UserRecord[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const loadMembers = () => {
    if (userRecord?.familyId) {
      setLoadingMembers(true);
      getFamilyMembers(userRecord.familyId)
        .then(setFamilyMembers)
        .finally(() => setLoadingMembers(false));
    }
  };

  useEffect(() => { loadMembers(); }, [userRecord?.familyId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !userRecord) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setInviting(true);
    try {
      const email = inviteEmail.trim();
      const result = await inviteFamilyMember(userRecord, email);
      if (result.success) {
        setInviteEmail("");
        Alert.alert(
          "Invite Created! 🎉", 
          "Would you like to open your email app to send them a message?",
          [
            { text: "No", style: "cancel" },
            { 
              text: "Send Email", 
              onPress: () => {
                const subject = encodeURIComponent("Join my family on FamilyFinance");
                const body = encodeURIComponent(
                  `Hi,\n\nI've invited you to track our finances together on FamilyFinance!\n\nJust download the app and sign in with your Google account (${email}). The invite will automatically pop up.`
                );
                Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
              }
            }
          ]
        );
      } else {
        Alert.alert("Already Invited", result.error ?? "This person already has a pending invite.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = (uid: string, name: string) => {
    if (!userRecord?.familyId) return;
    Alert.alert("Remove Member", `Are you sure you want to remove ${name} from your family? They will no longer have access to this data.`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Remove", 
        style: "destructive",
        onPress: async () => {
          await removeFamilyMember(userRecord.familyId, uid);
          loadMembers(); // Refresh the list
        }
      }
    ]);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          clear();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const isOwner = userRecord?.role === "owner";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile & Settings</Text>

        {/* ── Signed-In User Card ── */}
        {firebaseUser && (
          <View style={styles.userCard}>
            <View style={styles.userCardGlow} />
            {firebaseUser.photoURL ? (
              <Image source={{ uri: firebaseUser.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{firebaseUser.displayName?.[0] ?? "U"}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{firebaseUser.displayName}</Text>
              <Text style={styles.userEmail}>{firebaseUser.email}</Text>
              <View style={styles.syncBadge}>
                <View style={styles.syncDot} />
                <Text style={styles.syncText}>Synced to Cloud</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Feather name="log-out" size={18} color={Colors.red} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Family Sharing ── */}
        <Text style={styles.sectionTitle}>Family Sharing 👨‍👩‍👧</Text>
        <View style={styles.card}>
          {loadingMembers ? (
            <View style={styles.fieldRow}>
              <ActivityIndicator color={Colors.purple} size="small" />
              <Text style={[styles.fieldLabel, { marginLeft: 8 }]}>Loading members...</Text>
            </View>
          ) : familyMembers.length > 0 ? (
            familyMembers.map((member, i) => (
              <View key={member.uid}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.fieldRow}>
                  {member.photoURL ? (
                    <Image source={{ uri: member.photoURL }} style={styles.memberAvatar} />
                  ) : (
                    <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                      <Text style={styles.memberAvatarInitial}>{member.displayName?.[0]}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fieldLabel}>{member.displayName}</Text>
                    <Text style={styles.memberEmailText}>{member.email}</Text>
                  </View>
                  
                  <View style={styles.roleActions}>
                    <View style={[styles.roleTag, { backgroundColor: member.role === "owner" ? `${Colors.purple}20` : `${Colors.emerald}20` }]}>
                      <Text style={[styles.roleText, { color: member.role === "owner" ? Colors.purple : Colors.emerald }]}>
                        {member.role === "owner" ? "Owner" : "Member"}
                      </Text>
                    </View>
                    
                    {/* Only Owner can remove members (and can't remove themselves here) */}
                    {isOwner && member.uid !== userRecord?.uid && (
                      <TouchableOpacity 
                        style={styles.removeBtn} 
                        onPress={() => handleRemoveMember(member.uid, member.displayName)}
                      >
                        <Feather name="user-x" size={16} color={Colors.red} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : null}

          {/* Invite input (Only owner can invite) */}
          {isOwner && (
            <>
              <View style={styles.divider} />
              <View style={styles.inviteRow}>
                <TextInput
                  style={styles.inviteInput}
                  placeholder="Invite by email (spouse's Gmail)"
                  placeholderTextColor={Colors.textMuted}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.inviteBtn, inviting && { opacity: 0.6 }]}
                  onPress={handleInvite}
                  disabled={inviting}
                >
                  {inviting ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Feather name="send" size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── Edit Local Profile Names ── */}
        <Text style={styles.sectionTitle}>Dashboard Display Names</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: Colors.husband }]}>👨 Partner 1</Text>
            <TextInput
              style={styles.fieldInput}
              value={profile.husband.name}
              onChangeText={(v) => profile.updateProfile({ husband: { ...profile.husband, name: v } })}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: Colors.wife }]}>👩 Partner 2</Text>
            <TextInput
              style={styles.fieldInput}
              value={profile.wife.name}
              onChangeText={(v) => profile.updateProfile({ wife: { ...profile.wife, name: v } })}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* ── Budget Settings ── */}
        <Text style={styles.sectionTitle}>Monthly Budgets</Text>
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
                    value={String(budget[cat.id] || "")}
                    onChangeText={(v) => setBudget(cat.id, parseFloat(v) || 0)}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="0"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { padding: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: "800", color: Colors.textPrimary, marginBottom: Spacing.md },

  userCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.purple}30`, overflow: "hidden",
  },
  userCardGlow: {
    position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.purpleAlpha,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: Spacing.md },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, marginRight: Spacing.md,
    backgroundColor: Colors.purpleAlpha, justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 20, fontWeight: "800", color: Colors.purple },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: "700", color: Colors.textPrimary },
  userEmail: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  syncBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.emerald },
  syncText: { fontSize: FontSize.xs, color: Colors.emerald, fontWeight: "600" },
  signOutBtn: { padding: Spacing.sm },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: "hidden",
  },
  fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: "500" },
  fieldInput: { flex: 1, textAlign: "right", color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  budgetInputWrap: { flexDirection: "row", alignItems: "center" },
  rupeeSign: { fontSize: FontSize.sm, color: Colors.textMuted, marginRight: 2 },
  budgetInput: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: "700", minWidth: 70, textAlign: "right" },

  memberAvatar: { width: 36, height: 36, borderRadius: 18 },
  memberAvatarPlaceholder: { backgroundColor: Colors.purpleAlpha, justifyContent: "center", alignItems: "center" },
  memberAvatarInitial: { fontSize: 14, fontWeight: "700", color: Colors.purple },
  memberEmailText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  roleActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: "600" },
  removeBtn: { padding: 4 },
  
  inviteRow: { flexDirection: "row", alignItems: "center", padding: Spacing.md, gap: 10 },
  inviteInput: {
    flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm,
    backgroundColor: Colors.bgPrimary, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  inviteBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.purple,
    justifyContent: "center", alignItems: "center",
  },
});
