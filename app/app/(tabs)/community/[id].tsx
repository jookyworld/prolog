import { communityApi } from "@/lib/api/community";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import type { SharedRoutineDetail, Comment } from "@/lib/types/community";
import { BODY_PART_LABEL } from "@/lib/types/exercise";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Eye,
  Download,
  ArrowLeft,
  Dumbbell,
  Clock,
  Send,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}톤`;
  }
  return `${kg}kg`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

export default function CommunityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routineId = Number(id);

  const [routine, setRoutine] = useState<SharedRoutineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    loadData();
  }, [routineId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const routineData = await communityApi.getSharedRoutineDetail(routineId);
      setRoutine(routineData);
    } catch (err) {
      console.error("Failed to load routine detail:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!routine) return;

    try {
      const result = await communityApi.importRoutine(routineId);

      setRoutine((prev) =>
        prev ? { ...prev, importCount: prev.importCount + 1 } : null
      );

      // TODO: 성공 토스트 표시
      console.log("루틴이 추가되었습니다:", result.title);

      // 루틴 탭으로 이동
      router.push("/(tabs)/routine");
    } catch (err) {
      console.error("Failed to import routine:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await communityApi.createComment(routineId, commentText);

      setRoutine((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
            }
          : null
      );

      setCommentText("");
      Keyboard.dismiss();
    } catch (err) {
      console.error("Failed to create comment:", err);
      Alert.alert("오류", "댓글 작성에 실패했습니다.");
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    Alert.alert("댓글 삭제", "이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await communityApi.deleteComment(commentId);

            setRoutine((prev) =>
              prev
                ? {
                    ...prev,
                    comments: prev.comments.filter((c) => c.id !== commentId),
                  }
                : null
            );
          } catch (err) {
            console.error("Failed to delete comment:", err);
            Alert.alert("오류", "댓글 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !routine) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-white/60">
            {error || "루틴을 찾을 수 없습니다."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="-ml-2 p-2">
          <ArrowLeft size={24} color={COLORS.white} />
        </Pressable>
        <Text className="text-lg font-semibold text-white">루틴 상세</Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 + TAB_BAR_HEIGHT + insets.bottom }}
      >
        {/* 작성자 정보 */}
        <View className="border-b border-white/5 px-5 py-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Text className="text-lg font-bold text-primary">
                {routine.nickname[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white">
                {routine.nickname}
              </Text>
              <Text className="text-sm text-white/40">
                {new Date(routine.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 루틴 정보 */}
        <View className="border-b border-white/5 px-5 py-4">
          <Text className="mb-2 text-2xl font-bold text-white">
            {routine.title}
          </Text>
          {routine.description && (
            <Text className="mb-3 text-base text-white/70">
              {routine.description}
            </Text>
          )}

          {/* 통계 */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Eye size={16} color={COLORS.mutedForeground} />
              <Text className="text-sm text-white/50">
                {routine.viewCount}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Download size={16} color={COLORS.mutedForeground} />
              <Text className="text-sm text-white/50">
                {routine.importCount}
              </Text>
            </View>
          </View>
        </View>

        {/* 운동 종목 */}
        <View className="border-b border-white/5 px-5 py-4">
          <Text className="mb-3 text-lg font-semibold text-white">
            운동 종목 ({routine.routineSnapshot.items.length}개)
          </Text>
          <View className="gap-2">
            {routine.routineSnapshot.items.map((item) => (
              <View
                key={item.exerciseId}
                className="flex-row items-center justify-between rounded-lg bg-card p-3"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-white">
                    {item.exerciseName}
                  </Text>
                  <Text className="text-xs text-white/40">
                    {BODY_PART_LABEL[item.bodyPart]}
                  </Text>
                </View>
                <Text className="text-sm text-white/50">
                  {item.sets}세트 × {item.restSeconds}초
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 최근 수행 기록 */}
        {routine.lastSessionSnapshot && (
          <View className="border-b border-white/5 px-5 py-4">
            <Text className="mb-3 text-lg font-semibold text-white">
              최근 수행 기록
            </Text>
            <View className="rounded-xl bg-card p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-white/60">
                  {formatRelativeDate(routine.lastSessionSnapshot.completedAt)}
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Clock size={14} color={COLORS.mutedForeground} />
                    <Text className="text-sm text-white/50">
                      {formatDuration(routine.lastSessionSnapshot.duration)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Dumbbell size={14} color={COLORS.mutedForeground} />
                    <Text className="text-sm text-white/50">
                      {formatVolume(routine.lastSessionSnapshot.totalVolume)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-3">
                {routine.lastSessionSnapshot.exercises.map((exercise, idx) => (
                  <View key={idx}>
                    <Text className="mb-1.5 text-sm font-medium text-white">
                      {exercise.exerciseName}
                    </Text>
                    <View className="gap-1">
                      {exercise.sets.map((set, setIdx) => (
                        <View
                          key={setIdx}
                          className="flex-row items-center justify-between"
                        >
                          <Text className="w-6 text-xs text-white/40">
                            {set.setNumber}
                          </Text>
                          <Text className="w-20 text-sm text-white">
                            {set.weight}kg
                          </Text>
                          <Text className="w-16 text-sm text-white">
                            ×{set.reps}
                          </Text>
                          <Text className="w-20 text-right text-xs text-white/40">
                            {set.weight * set.reps}kg
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 댓글 */}
        <View className="px-5 py-4">
          <Text className="mb-3 text-lg font-semibold text-white">
            댓글 ({routine.comments.length})
          </Text>
          <View className="gap-3">
            {routine.comments.length === 0 ? (
              <Text className="py-8 text-center text-sm text-white/40">
                첫 댓글을 작성해보세요
              </Text>
            ) : (
              routine.comments.map((comment) => (
                <View key={comment.id} className="rounded-lg bg-card p-3">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-white">
                      {comment.nickname}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-white/40">
                        {formatRelativeDate(comment.createdAt)}
                      </Text>
                      <Pressable
                        onPress={() => handleCommentDelete(comment.id)}
                        className="p-1"
                      >
                        <Trash2 size={14} color={COLORS.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>
                  <Text className="text-sm text-white/70">
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 액션 바 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          className="border-t border-white/5 bg-background px-5 pt-3"
          style={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
        >
          {/* 댓글 입력 */}
          <View className="mb-3 flex-row items-center gap-2">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor={COLORS.mutedForeground}
              className="flex-1 rounded-lg bg-card px-4 py-3 text-sm text-white"
              multiline
              maxLength={200}
            />
            <Pressable
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
              className={`h-12 w-12 items-center justify-center rounded-lg ${
                commentText.trim() ? "bg-primary" : "bg-card"
              }`}
            >
              <Send
                size={18}
                color={commentText.trim() ? COLORS.white : COLORS.mutedForeground}
              />
            </Pressable>
          </View>

          {/* 가져오기 버튼 */}
          <Pressable
            onPress={handleImport}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-primary py-3"
          >
            <Download size={20} color={COLORS.white} />
            <Text className="text-sm font-semibold text-white">
              내 루틴에 추가
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
