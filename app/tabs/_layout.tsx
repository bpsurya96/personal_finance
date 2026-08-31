import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../src/constants/theme";
import { StyleSheet, Platform, View } from "react-native";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useExpenseStore } from "../../src/store/useExpenseStore";
import { useInvestmentStore } from "../../src/store/useInvestmentStore";
import { useLiabilityStore } from "../../src/store/useLiabilityStore";
import { useIncomeStore } from "../../src/store/useIncomeStore";
import { useEffect } from "react";

export default function TabLayout() {
  const userRecord = useAuthStore((s) => s.userRecord);
  const subExpenses = useExpenseStore((s) => s.subscribeToFamily);
  const subInvestments = useInvestmentStore((s) => s.subscribeToFamily);
  const subLiabilities = useLiabilityStore((s) => s.subscribeToFamily);
  const subIncomes = useIncomeStore((s) => s.subscribeToFamily);

  useEffect(() => {
    if (!userRecord?.familyId) return;
    const u1 = subExpenses(userRecord.familyId);
    const u2 = subInvestments(userRecord.familyId);
    const u3 = subLiabilities(userRecord.familyId);
    const u4 = subIncomes(userRecord.familyId);
    return () => { u1(); u2(); u3(); u4(); };
  }, [userRecord?.familyId]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: Colors.bgCardElevated }],
        tabBarActiveTintColor: Colors.primaryAction, // Dark color for active tab
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: "Money",
          tabBarIcon: ({ color, size }) => <Feather name="plus-square" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="liabilities"
        options={{
          title: "Liabilities",
          tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute", borderTopWidth: 1, borderTopColor: Colors.border, elevation: 0,
    backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.bgCardElevated,
    height: Platform.OS === "ios" ? 85 : 70, paddingBottom: Platform.OS === "ios" ? 25 : 10,
  },
});
