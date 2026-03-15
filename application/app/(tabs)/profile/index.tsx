import { useAuth } from "@/contexts/auth-context";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Dumbbell,
  Settings,
  Share2,
  Swords,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const age = user?.birthYear
    ? new Date().getFullYear() - user.birthYear + 1
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
        }}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-2xl font-bold text-white">
            {user?.nickname ?? "사용자"}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/profile/settings")}
            className="h-10 w-10 items-center justify-center"
          >
            <Settings size={22} color={COLORS.mutedForeground} />
          </Pressable>
        </View>

        {/* 신체 정보 */}
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl bg-card py-4">
            <Text className="text-xl font-bold text-white">
              {age ?? "-"}
              {age && (
                <Text className="text-sm font-normal text-white/40"> 세</Text>
              )}
            </Text>
            <Text className="mt-1 text-xs text-white/40">나이</Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-card py-4">
            <Text className="text-xl font-bold text-white">
              {user?.height ?? "-"}
              {user?.height && (
                <Text className="text-sm font-normal text-white/40"> cm</Text>
              )}
            </Text>
            <Text className="mt-1 text-xs text-white/40">키</Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-card py-4">
            <Text className="text-xl font-bold text-white">
              {user?.weight ?? "-"}
              {user?.weight && (
                <Text className="text-sm font-normal text-white/40"> kg</Text>
              )}
            </Text>
            <Text className="mt-1 text-xs text-white/40">체중</Text>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View className="rounded-2xl bg-card">
          <Pressable
            onPress={() => router.push("/(tabs)/profile/history")}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Dumbbell size={18} color={COLORS.white} />
            </View>
            <Text className="ml-3 flex-1 text-base text-white">운동 기록</Text>
            <ChevronRight size={18} color={COLORS.iconMuted} />
          </Pressable>

          <View className="mx-5 h-px bg-white/5" />

          <Pressable
            onPress={() => router.push("/(tabs)/profile/exercises")}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Swords size={18} color={COLORS.white} />
            </View>
            <Text className="ml-3 flex-1 text-base text-white">종목 관리</Text>
            <ChevronRight size={18} color={COLORS.iconMuted} />
          </Pressable>

          <View className="mx-5 h-px bg-white/5" />

          <Pressable
            onPress={() => router.push("/(tabs)/profile/shared")}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Share2 size={18} color={COLORS.white} />
            </View>
            <Text className="ml-3 flex-1 text-base text-white">공유 기록</Text>
            <ChevronRight size={18} color={COLORS.iconMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
