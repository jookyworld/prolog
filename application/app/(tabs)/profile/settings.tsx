import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import { TERMS_URLS } from "@/lib/constants/terms";
import { userApi } from "@/lib/api/user";
import { ChevronLeft, ChevronRight, FileText, Pencil, Shield, UserCog } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking, Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [marketing, setMarketing] = useState(!!user?.marketingConsentedAt);

  const handleMarketingToggle = async (value: boolean) => {
    setMarketing(value);
    try {
      const updated = await userApi.updateMarketingConsent({ marketingConsent: value });
      updateUser(updated);
    } catch {
      setMarketing(!value);
      Alert.alert("설정을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

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
        <View className="mb-6 overflow-hidden rounded-2xl bg-card">
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

        {/* 알림 */}
        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/30">
          알림
        </Text>
        <View className="mb-6 overflow-hidden rounded-2xl bg-card">
          <View className="flex-row items-center px-5 py-4">
            <Text className="flex-1 text-base text-white">마케팅 수신 동의</Text>
            <Switch
              value={marketing}
              onValueChange={handleMarketingToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* 서비스 정보 */}
        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/30">
          서비스 정보
        </Text>
        <View className="overflow-hidden rounded-2xl bg-card">
          <Pressable
            onPress={() => Linking.openURL(TERMS_URLS.terms)}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="mr-3 rounded-xl bg-white/5 p-2.5">
              <FileText size={18} color={COLORS.white} />
            </View>
            <Text className="flex-1 text-base text-white">서비스 이용약관</Text>
            <ChevronRight size={18} color={COLORS.mutedForeground} />
          </Pressable>
          <View className="mx-5 h-px bg-white/5" />
          <Pressable
            onPress={() => Linking.openURL(TERMS_URLS.privacy)}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="mr-3 rounded-xl bg-white/5 p-2.5">
              <Shield size={18} color={COLORS.white} />
            </View>
            <Text className="flex-1 text-base text-white">개인정보 처리방침</Text>
            <ChevronRight size={18} color={COLORS.mutedForeground} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
