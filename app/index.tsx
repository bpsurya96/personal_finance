import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/useAuthStore";
import { useProfileStore } from "../src/store/useProfileStore";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../src/constants/theme";

export default function Index() {
  const { firebaseUser, isLoading } = useAuthStore();
  const { onboardingComplete } = useProfileStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={Colors.purple} size="large" />
      </View>
    );
  }

  if (!firebaseUser) return <Redirect href="/auth/login" />;
  if (!onboardingComplete) return <Redirect href="/auth/onboarding" />;
  return <Redirect href="/tabs" />;
}
