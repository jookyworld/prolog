import { COLORS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Pencil, UserCog } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-5">
        {/* 헤더 */}
        <View className="flex-row items-center py-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </Pressable>
          <Text className="text-2xl font-bold text-white">설정</Text>
        </View>

        {/* 프로필 관리 */}
        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/30">
          프로필 관리
        </Text>
        <View className="mb-6 overflow-hidden rounded-2xl bg-card">
          <Pressable
            onPress={() => router.push("/(tabs)/profile/edit")}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="mr-3 rounded-xl bg-white/5 p-2.5">
              <Pencil size={18} color={COLORS.white} />
            </View>
            <Text className="flex-1 text-base text-white">프로필 수정</Text>
            <ChevronRight size={18} color={COLORS.mutedForeground} />
          </Pressable>
        </View>

        {/* 계정 */}
        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/30">
          계정
        </Text>
        <View className="overflow-hidden rounded-2xl bg-card">
          <Pressable
            onPress={() => router.push("/(tabs)/profile/account")}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="mr-3 rounded-xl bg-white/5 p-2.5">
              <UserCog size={18} color={COLORS.white} />
            </View>
            <Text className="flex-1 text-base text-white">계정 관리</Text>
            <ChevronRight size={18} color={COLORS.mutedForeground} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
