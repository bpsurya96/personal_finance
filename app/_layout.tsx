import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { useEffect } from "react";
import { onAuthChange } from "../src/lib/authService";
import { getOrCreateUser } from "../src/lib/familyService";
import { useAuthStore } from "../src/store/useAuthStore";

function AuthWatcher() {
  const { setFirebaseUser, setUserRecord, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setFirebaseUser(user);
        const record = await getOrCreateUser(user);
        setUserRecord(record);
      } else {
        setFirebaseUser(null);
        setUserRecord(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthWatcher />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/onboarding" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="modals/add-expense" options={{ presentation: "modal" }} />
        <Stack.Screen name="modals/add-investment" options={{ presentation: "modal" }} />
        <Stack.Screen name="modals/add-liability" options={{ presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
