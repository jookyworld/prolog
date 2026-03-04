import { communityApi } from "@/lib/api/community";
import { routineApi } from "@/lib/api/routine";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type { RoutineDetail } from "@/lib/types/routine";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, EllipsisVertical, Play, Share2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [routine, setRoutine] = useState<RoutineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");

  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + 16;

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await routineApi.getRoutineDetail(Number(id));
      setRoutine(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail]),
  );

  const handleDelete = () => {
    Alert.alert("루틴 삭제", "이 루틴을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await routineApi.deleteRoutine(Number(id));
            router.back();
          } catch {
            Alert.alert("오류", "삭제에 실패했습니다.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      await routineApi.archiveRoutine(Number(id));
      router.back();
    } catch {
      Alert.alert("오류", "보관에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await routineApi.activateRoutine(Number(id));
      router.back();
    } catch {
      Alert.alert("오류", "활성화에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    if (!routine) return;
    setShareTitle(routine.title);
    setShareDescription(routine.description || "");
    setShareModalVisible(true);
  };

  const handleShareSubmit = async () => {
    if (!shareTitle.trim()) {
      Alert.alert("오류", "제목을 입력해주세요.");
      return;
    }

    setActionLoading(true);
    try {
      await communityApi.createSharedRoutine({
        routineId: Number(id),
        title: shareTitle,
        description: shareDescription,
      });

      setShareModalVisible(false);
      Alert.alert("공유 완료", "루틴이 커뮤니티에 공유되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            router.push("/(tabs)/community");
          },
        },
      ]);
    } catch (err) {
      Alert.alert("오류", "공유에 실패했습니다.");
      console.error("Failed to share routine:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettingsMenu = () => {
    if (!routine) return;

    const buttons: Array<{
      text: string;
      style?: "cancel" | "destructive";
      onPress?: () => void;
    }> = [{ text: "취소", style: "cancel" }];

    buttons.push({
      text: "커뮤니티에 공유",
      onPress: handleShare,
    });

    if (routine.active) {
      buttons.push({ text: "보관하기", onPress: handleArchive });
    } else {
      buttons.push({ text: "다시 활성화", onPress: handleActivate });
    }

    buttons.push({
      text: "루틴 수정",
      onPress: () => {
        router.push(`/(tabs)/routine/new?routineId=${id}`);
      },
    });

    buttons.push({
      text: "루틴 삭제",
      style: "destructive",
      onPress: handleDelete,
    });

    Alert.alert(undefined as unknown as string, undefined, buttons);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !routine) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-lg font-semibold text-white">
          {error ?? "루틴을 찾을 수 없어요"}
        </Text>
        <Text className="mb-6 text-sm text-white/50">
          삭제되었거나 존재하지 않는 루틴입니다.
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={fetchDetail}
            className="rounded-full bg-white/10 px-5 py-2.5"
          >
            <Text className="text-sm font-medium text-white">다시 시도</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-primary px-5 py-2.5"
          >
            <Text className="text-sm font-medium text-white">목록으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const sortedItems = [...routine.routineItems].sort(
    (a, b) => a.orderInRoutine - b.orderInRoutine,
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between gap-3 px-5 py-4">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
          >
            <ArrowLeft size={20} color={COLORS.white} />
          </Pressable>
          <Text
            className="flex-1 text-2xl font-bold text-white"
            numberOfLines={1}
          >
            {routine.title}
          </Text>
        </View>
        <Pressable
          onPress={handleSettingsMenu}
          className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <EllipsisVertical size={20} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 루틴 정보 */}
        {(routine.description || !routine.active) && (
          <View className="mb-7 rounded-xl border border-white/10 bg-card p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-white/40">
                루틴 정보
              </Text>
              {routine.active ? (
                <View className="rounded-md bg-primary/15 px-2.5 py-1">
                  <Text className="text-xs font-medium text-primary">활성</Text>
                </View>
              ) : (
                <View className="rounded-md bg-white/10 px-2.5 py-1">
                  <Text className="text-xs font-medium text-white/50">
                    보관됨
                  </Text>
                </View>
              )}
            </View>
            {routine.description ? (
              <Text className="text-sm leading-5 text-white/60">
                {routine.description}
              </Text>
            ) : null}
          </View>
        )}

        {/* 운동 구성 */}
        <Text className="mb-3 text-base font-semibold text-white/80">
          운동 구성 ({sortedItems.length}개)
        </Text>

        <View className="gap-3" style={{ paddingBottom: bottomPadding }}>
          {sortedItems.map((item, idx) => (
            <View key={item.routineItemId} className="rounded-2xl bg-card p-5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Text className="text-base font-bold text-white">
                      {idx + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-semibold text-white">
                      {item.exerciseName}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <View className="rounded-md bg-white/10 px-2 py-0.5">
                        <Text className="text-xs text-white/60">
                          {item.bodyPart}
                        </Text>
                      </View>
                      {item.partDetail ? (
                        <View className="rounded-md bg-white/10 px-2 py-0.5">
                          <Text className="text-xs text-white/60">
                            {item.partDetail}
                          </Text>
                        </View>
                      ) : null}
                      <Text className="text-[11px] text-white/25">
                        • 휴식 {item.restSeconds}초
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="items-center justify-center rounded-xl bg-primary/20 px-3 py-2">
                  <Text className="text-lg font-bold text-primary">
                    {item.sets}
                  </Text>
                  <Text className="text-[10px] font-medium text-primary/80">
                    세트
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB - 운동 시작 버튼 (활성 루틴만) */}
      {routine.active && (
        <Pressable
          onPress={() => router.push(`/(tabs)/workout/session?routineId=${id}`)}
          className="absolute flex-row items-center gap-4 rounded-full bg-primary px-5 py-3.5 shadow-lg active:opacity-90"
          style={{
            bottom: TAB_BAR_HEIGHT + insets.bottom + 24,
            right: 20,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Play size={18} color={COLORS.white} fill={COLORS.white} />
          <Text className="text-base font-semibold text-white">바로 시작</Text>
        </Pressable>
      )}

      {/* 공유 모달 */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-3xl bg-background px-5 pt-6"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                커뮤니티에 공유
              </Text>
              <Pressable onPress={() => setShareModalVisible(false)}>
                <Text className="text-base text-white/50">취소</Text>
              </Pressable>
            </View>

            <Text className="mb-2 text-sm font-medium text-white/70">제목</Text>
            <TextInput
              value={shareTitle}
              onChangeText={setShareTitle}
              placeholder="공유할 루틴의 제목을 입력하세요"
              placeholderTextColor={COLORS.mutedForeground}
              className="mb-4 rounded-xl bg-card px-4 py-3 text-base text-white"
              maxLength={100}
            />

            <Text className="mb-2 text-sm font-medium text-white/70">설명</Text>
            <TextInput
              value={shareDescription}
              onChangeText={setShareDescription}
              placeholder="루틴에 대한 설명을 입력하세요 (선택사항)"
              placeholderTextColor={COLORS.mutedForeground}
              className="mb-6 h-24 rounded-xl bg-card px-4 py-3 text-base text-white"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Pressable
              onPress={handleShareSubmit}
              disabled={actionLoading}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-4"
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Share2 size={18} color={COLORS.white} />
                  <Text className="text-base font-semibold text-white">
                    공유하기
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
