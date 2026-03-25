import { blockApi, type BlockedUser } from "@/lib/api/block";
import { COLORS } from "@/lib/constants";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const data = await blockApi.getBlockedUsers();
      setBlockedUsers(data);
    } catch {
      Alert.alert("목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert("차단 해제", `${user.nickname} 님의 차단을 해제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "해제",
        onPress: async () => {
          setUnblockingId(user.userId);
          try {
            await blockApi.unblockUser(user.userId);
            setBlockedUsers((prev) =>
              prev.filter((u) => u.userId !== user.userId),
            );
          } catch {
            Alert.alert("차단 해제에 실패했습니다. 잠시 후 다시 시도해주세요.");
          } finally {
            setUnblockingId(null);
          }
        },
      },
    ]);
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
          <Text className="text-2xl font-bold text-white">차단 목록</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : blockedUsers.length === 0 ? (
          <View className="flex-1 items-center justify-top mt-10">
            <Text className="text-sm text-white/40">
              차단한 사용자가 없습니다
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="overflow-hidden rounded-2xl bg-card">
              {blockedUsers.map((user, index) => (
                <View key={user.userId}>
                  {index > 0 && <View className="mx-5 h-px bg-white/5" />}
                  <View className="flex-row items-center px-5 py-4">
                    <Text className="flex-1 text-base text-white">
                      {user.nickname}
                    </Text>
                    <Pressable
                      onPress={() => handleUnblock(user)}
                      disabled={unblockingId === user.userId}
                      className="rounded-lg bg-white/10 px-3 py-1.5 active:opacity-70"
                    >
                      {unblockingId === user.userId ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text className="text-sm text-white/70">차단 해제</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
