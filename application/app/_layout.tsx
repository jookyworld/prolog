import "../global.css";
import { AuthProvider } from "@/contexts/auth-context";
import { WorkoutProvider } from "@/contexts/workout-context";
import { AuthGuard } from "@/components/AuthGuard";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        </AuthGuard>
      </WorkoutProvider>
    </AuthProvider>
  );
}
