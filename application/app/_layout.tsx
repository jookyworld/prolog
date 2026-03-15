import "../global.css";
import { AuthProvider } from "@/contexts/auth-context";
import { WorkoutProvider } from "@/contexts/workout-context";
import { AuthGuard } from "@/components/AuthGuard";
import { COLORS } from "@/lib/constants";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.background,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={AppTheme}>
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
    </ThemeProvider>
  );
}
