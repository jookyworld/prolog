import { useAuth } from "@/contexts/auth-context";
import { communityApi } from "@/lib/api/community";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import type { SharedRoutineDetail } from "@/lib/types/community";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  Eye,
  MessageCircle,
  MoreVertical,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function CommunityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routineId = Number(id);

  const { user } = useAuth();
  const [routine, setRoutine] = useState<SharedRoutineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // 댓글 바텀시트
  const [commentSheetVisible, setCommentSheetVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput>(null);
  const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [routineId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityApi.getSharedRoutineDetail(routineId);
      setRoutine(data);
    } catch (err) {
      console.error("Failed to load routine detail:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!routine || importing) return;
    setImporting(true);
    try {
      const result = await communityApi.importRoutine(routineId);
      Alert.alert("완료", `'${result.title}' 루틴을 내 루틴에 추가했습니다.`, [
        { text: "내 루틴 보기", onPress: () => router.push("/(tabs)/routine") },
        { text: "확인" },
      ]);
    } catch (err) {
      console.error("Failed to import routine:", err);
      Alert.alert("오류", "루틴 가져오기에 실패했습니다.");
    } finally {
      setImporting(false);
    }
  };

  const openCommentSheet = () => {
    setCommentSheetVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      commentInputRef.current?.focus();
    });
  };

  const closeCommentSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(SHEET_HEIGHT);
      fadeAnim.setValue(0);
      setCommentSheetVisible(false);
    });
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText("");
    try {
      const newComment = await communityApi.createComment(routineId, text);
      setRoutine((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null,
      );
    } catch (err) {
      console.error("Failed to create comment:", err);
      setCommentText(text);
      Alert.alert("오류", "댓글 작성에 실패했습니다.");
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await communityApi.deleteComment(commentId);
      setRoutine((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : null,
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
      Alert.alert("오류", "댓글 삭제에 실패했습니다.");
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
            onPress={loadData}
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

  const sortedItems = [...routine.routineSnapshot.items].sort(
    (a, b) => a.orderInRoutine - b.orderInRoutine,
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white/5"
        >
          <ArrowLeft size={20} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 80,
        }}
      >
        {/* 작성자 행 */}
        <View className="flex-row items-center gap-3 px-5 pb-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/20">
            <Text className="text-base font-bold text-primary">
              {routine.nickname[0].toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">
              {routine.nickname}
            </Text>
            <Text className="text-xs text-white/40">
              {new Date(routine.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* 게시글 본문 */}
        <View className="px-5 pb-5">
          <Text className="mb-2 text-2xl font-bold text-white">
            {routine.title}
          </Text>
          {routine.description ? (
            <Text className="text-sm leading-6 text-white/60">
              {routine.description}
            </Text>
          ) : null}
        </View>

        {/* 운동 구성 */}

        <View className="px-5 gap-2">
          {sortedItems.map((item, idx) => (
            <View
              key={item.exerciseId}
              className="flex-row items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
            >
              <Text className="w-5 text-center text-xs font-bold text-white/25">
                {idx + 1}
              </Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  {item.exerciseName}
                </Text>
                <Text className="text-xs text-white/40">{item.bodyPart}</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-primary">
                  {item.sets}세트
                </Text>
                <Text className="text-xs text-white/30">
                  휴식 {item.restSeconds}초
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 액션 바 */}
        <View className="flex-row items-center gap-3 px-7 py-3">
          <View className="flex-row items-center gap-1.5">
            <Eye size={16} color={COLORS.mutedForeground} />
            <Text className="text-sm text-white/40">{routine.viewCount}</Text>
          </View>
          <Pressable
            onPress={openCommentSheet}
            className="flex-row items-center gap-1.5"
          >
            <MessageCircle size={16} color={COLORS.mutedForeground} />
            <Text className="text-sm text-white/40">
              {routine.comments.length > 0 ? routine.comments.length : ""}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* FAB - 가져오기 */}
      <Pressable
        onPress={handleImport}
        disabled={importing}
        className="absolute flex-row items-center gap-2 rounded-full bg-primary px-5 py-3.5 active:opacity-90"
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
        {importing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Download size={18} color={COLORS.white} />
        )}
        <Text className="text-base font-semibold text-white">
          {importing ? "가져오는 중..." : "가져오기"}
        </Text>
      </Pressable>

      {/* 댓글 바텀시트 */}
      <Modal
        visible={commentSheetVisible}
        animationType="none"
        transparent
        onRequestClose={closeCommentSheet}
      >
        <Animated.View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim }}
        >
          {/* 배경 탭으로 닫기 */}
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={closeCommentSheet}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Animated.View
              className="rounded-t-3xl bg-background"
              style={{
                height: SHEET_HEIGHT,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* 드래그 핸들 */}
              <View className="items-center pt-3 pb-1">
                <View className="h-1 w-10 rounded-full bg-white/20" />
              </View>

              {/* 시트 헤더 */}
              <View className="flex-row items-center justify-between px-5 py-3">
                <Text className="text-base font-bold text-white">
                  댓글{" "}
                  {routine.comments.length > 0 ? routine.comments.length : ""}
                </Text>
                <Pressable
                  onPress={closeCommentSheet}
                  className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
                >
                  <X size={16} color={COLORS.white} />
                </Pressable>
              </View>

              {/* 댓글 목록 */}
              <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {routine.comments.length === 0 ? (
                  <View className="items-center py-12">
                    <Text className="text-sm text-white/30">
                      아직 댓글이 없습니다
                    </Text>
                    <Text className="mt-1 text-xs text-white/20">
                      첫 번째 댓글을 남겨보세요
                    </Text>
                  </View>
                ) : (
                  <View className="gap-5 py-2" style={{ paddingBottom: 12 }}>
                    {routine.comments.map((comment) => (
                      <View key={comment.id} className="flex-row gap-3">
                        {/* 아바타 */}
                        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <Text className="text-xs font-bold text-white/60">
                            {comment.nickname[0].toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1 gap-0.5">
                          {/* 1줄: 작성자 + 작성일 */}
                          <View className="flex-row items-center gap-2">
                            <Text className="text-sm font-semibold text-white">
                              {comment.nickname}
                            </Text>
                            <Text className="text-xs text-white/30">
                              {formatRelativeDate(comment.createdAt)}
                            </Text>
                          </View>
                          {/* 2줄: 내용 */}
                          <Text className="text-sm leading-5 text-white/70">
                            {comment.content}
                          </Text>
                        </View>
                        {/* 메뉴 버튼 */}
                        <Pressable
                          onPress={() => {
                            const isOwn = user?.nickname === comment.nickname;
                            const showMenu = (onAction: () => void) => {
                              if (Platform.OS === "ios") {
                                ActionSheetIOS.showActionSheetWithOptions(
                                  {
                                    options: [isOwn ? "삭제" : "신고", "취소"],
                                    destructiveButtonIndex: 0,
                                    cancelButtonIndex: 1,
                                  },
                                  (idx) => {
                                    if (idx === 0) onAction();
                                  },
                                );
                              } else {
                                Alert.alert(
                                  undefined as unknown as string,
                                  undefined,
                                  [
                                    {
                                      text: isOwn ? "삭제" : "신고",
                                      style: "destructive",
                                      onPress: onAction,
                                    },
                                    { text: "취소", style: "cancel" },
                                  ],
                                );
                              }
                            };

                            if (isOwn) {
                              showMenu(() =>
                                Alert.alert("삭제", "삭제하시겠습니까?", [
                                  {
                                    text: "삭제",
                                    style: "destructive",
                                    onPress: () => deleteComment(comment.id),
                                  },
                                  { text: "취소", style: "cancel" },
                                ]),
                              );
                            } else {
                              showMenu(() =>
                                Alert.alert("신고", "신고하시겠습니까?", [
                                  {
                                    text: "신고",
                                    style: "destructive",
                                    onPress: () =>
                                      Alert.alert(
                                        "신고 완료",
                                        "신고가 접수되었습니다.",
                                      ),
                                  },
                                  { text: "취소", style: "cancel" },
                                ]),
                              );
                            }
                          }}
                          className="self-start p-1"
                        >
                          <MoreVertical
                            size={14}
                            color={COLORS.mutedForeground}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* 댓글 입력창 */}
              <View
                className="flex-row items-center gap-3 border-t border-white/5 px-4 pt-3"
                style={{ paddingBottom: insets.bottom + 12 }}
              >
                <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Text className="text-xs font-bold text-primary">
                    {user?.nickname?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View className="flex-1 flex-row items-center rounded-full bg-white/8 px-4">
                  <TextInput
                    ref={commentInputRef}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder={`${routine.nickname}에게 댓글 달기...`}
                    placeholderTextColor={COLORS.mutedForeground}
                    className="flex-1 py-2.5 text-sm text-white"
                    multiline
                    maxLength={200}
                  />
                  {commentText.trim() ? (
                    <Pressable
                      onPress={handleCommentSubmit}
                      className="ml-2 py-1"
                    >
                      <Text className="text-sm font-semibold text-primary">
                        게시
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
