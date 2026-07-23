import { COLORS } from "@/lib/constants";
import { Stack } from "expo-router";

export default function InquiriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
