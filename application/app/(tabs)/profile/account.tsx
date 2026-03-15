import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import { useRouter } from "expo-router";
import { ChevronLeft, LogOut } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { logout, deleteAccount, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("오류", "로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert(
                "오류",
                "회원 탈퇴에 실패했습니다. 다시 시도해주세요.",
              );
            }
          },
        },
      ],
    );
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
          <Text className="text-2xl font-bold text-white">계정</Text>
        </View>

        {/* 이메일 */}
        <View className="mb-2 flex-row items-center justify-between px-1">
          <Text className="text-sm text-white/50">{user?.email}</Text>
        </View>
        <View className="mb-6 overflow-hidden rounded-2xl bg-card">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center px-5 py-4 active:opacity-70"
          >
            <View className="mr-3 rounded-xl bg-white/5 p-2.5">
              <LogOut size={18} color={COLORS.white} />
            </View>
            <Text className="flex-1 text-base text-white">로그아웃</Text>
          </Pressable>
        </View>

        {/* 회원 탈퇴 */}
        <Pressable
          onPress={handleDeleteAccount}
          className="items-center py-2 active:opacity-50"
        >
          <Text className="text-sm text-white/25">회원 탈퇴</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
