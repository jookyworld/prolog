import { COLORS } from "@/lib/constants";
import { Stack } from "expo-router";

export default function ExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
