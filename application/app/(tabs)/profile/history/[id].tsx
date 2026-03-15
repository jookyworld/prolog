import { workoutApi } from "@/lib/api/workout";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatElapsedTime, formatShortDate } from "@/lib/format";
import {
  WorkoutSessionDetail,
  toWorkoutSessionDetail,
} from "@/lib/types/workout";
import { ChevronLeft, EllipsisVertical } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function WorkoutHistoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getSessionDetail(id);
      setSession(toWorkoutSessionDetail(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleOptions = () => {
    const doDelete = () => {
      Alert.alert(
        "기록 삭제",
        "이 운동 기록을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: async () => {
              try {
                await workoutApi.deleteSession(Number(id));
                router.back();
              } catch (err) {
                Alert.alert(
                  "오류",
                  err instanceof Error ? err.message : "삭제에 실패했습니다.",
                );
              }
            },
          },
        ],
      );
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["취소", "기록 삭제"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) doDelete();
        },
      );
    } else {
      Alert.alert(undefined as unknown as string, undefined, [
        { text: "기록 삭제", style: "destructive", onPress: doDelete },
        { text: "취소", style: "cancel" },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-lg font-semibold text-white">
          {error ?? "기록을 찾을 수 없어요"}
        </Text>
        <Text className="mb-6 text-sm text-white/50">
          삭제되었거나 존재하지 않는 기록입니다.
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

  const sortedExercises = [...session.exercises].sort(
    (a, b) => a.orderNo - b.orderNo,
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 네비게이션 바 */}
      <View className="flex-row items-center justify-between px-4 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <ChevronLeft size={24} color={COLORS.white} />
        </Pressable>
        <Pressable
          onPress={handleOptions}
          className="h-10 w-10 items-center justify-center"
        >
          <EllipsisVertical size={20} color={COLORS.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 32,
        }}
      >
        {/* 히어로 */}
        <View className="px-5 pb-6 pt-2">
          <View className="mb-2.5 flex-row items-center gap-2">
            <View
              className={`self-start rounded-md px-2 py-0.5 ${
                session.type === "routine" ? "bg-primary/15" : "bg-white/10"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  session.type === "routine" ? "text-primary" : "text-white/40"
                }`}
              >
                {session.type === "routine" ? "루틴" : "자유 운동"}
              </Text>
            </View>
            <Text className="text-sm text-white/35">
              {formatShortDate(session.completedAt)}
            </Text>
          </View>
          <Text
            className="text-3xl font-bold leading-tight text-white"
            numberOfLines={2}
          >
            {session.title}
          </Text>
        </View>

        {/* 요약 스탯 */}
        <View className="mx-5 mb-8 overflow-hidden rounded-2xl bg-card">
          <View className="flex-row">
            <View className="flex-1 items-center py-5">
              <Text className="text-2xl font-bold tracking-tight text-white">
                {session.elapsedTime > 0
                  ? formatElapsedTime(session.elapsedTime)
                  : "—"}
              </Text>
              <Text className="mt-1.5 text-xs text-white/40">운동 시간</Text>
            </View>
            <View className="my-4 w-px bg-white/5" />
            <View className="flex-1 items-center py-5">
              <Text className="text-2xl font-bold tracking-tight text-white">
                {session.totalSets}
              </Text>
              <Text className="mt-1.5 text-xs text-white/40">총 세트</Text>
            </View>
            <View className="my-4 w-px bg-white/5" />
            <View className="flex-1 items-center py-5">
              <Text className="text-2xl font-bold tracking-tight text-white">
                {session.totalVolume > 0
                  ? session.totalVolume.toLocaleString()
                  : "—"}
              </Text>
              <Text className="mt-1.5 text-xs text-white/40">볼륨 (kg)</Text>
            </View>
          </View>
        </View>

        {/* 종목 목록 */}
        <View className="px-5">
          {sortedExercises.map((exercise, exIdx) => {
            const volume = exercise.sets.reduce(
              (sum, s) => sum + s.weight * s.reps,
              0,
            );
            const isLast = exIdx === sortedExercises.length - 1;
            return (
              <View key={exercise.id}>
                {/* 종목 헤더 */}
                <View className="flex-row items-center justify-between py-4">
                  <Text className="text-base font-bold text-white" numberOfLines={1}>
                    {exercise.name}
                  </Text>
                  <View className="ml-3 rounded-full bg-white/5 px-3 py-1">
                    <Text className="text-xs font-semibold text-white/40">
                      {exercise.sets.length}세트
                    </Text>
                  </View>
                </View>

                {/* 세트 행 */}
                {exercise.sets.map((set) => (
                  <View
                    key={set.id}
                    className="flex-row items-center py-3"
                  >
                    {/* 세트 번호 */}
                    <Text className="w-5 text-center text-sm font-semibold text-white/25">
                      {set.setNo}
                    </Text>

                    {/* 무게 + 횟수 */}
                    <View className="ml-4 flex-row items-baseline gap-4">
                      <View className="flex-row items-baseline">
                        <Text className="text-lg font-bold text-white">
                          {set.weight > 0 ? set.weight : "맨몸"}
                        </Text>
                        {set.weight > 0 && (
                          <Text className="ml-1 text-sm text-white/35">kg</Text>
                        )}
                      </View>
                      <View className="flex-row items-baseline">
                        <Text className="text-lg font-bold text-white">
                          {set.reps}
                        </Text>
                        <Text className="ml-1 text-sm text-white/35">회</Text>
                      </View>
                    </View>

                    {/* 메모 */}
                    <Text
                      className="ml-4 flex-1 text-sm text-white/25"
                      numberOfLines={1}
                    >
                      {set.memo ?? ""}
                    </Text>
                  </View>
                ))}

                {/* 합계 */}
                {volume > 0 && (
                  <View className="items-end pb-2 pt-1">
                    <Text className="text-xs text-white/25">
                      합계{" "}
                      <Text className="font-semibold text-white/40">
                        {volume.toLocaleString()} kg
                      </Text>
                    </Text>
                  </View>
                )}

                {/* 종목 구분선 */}
                {!isLast && <View className="h-px bg-white/5" />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
