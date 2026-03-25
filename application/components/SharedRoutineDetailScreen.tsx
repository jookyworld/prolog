import { useAuth } from "@/contexts/auth-context";
import { blockApi } from "@/lib/api/block";
import { communityApi } from "@/lib/api/community";
import {
  REPORT_REASON_LABELS,
  reportApi,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/api/report";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import type { SharedRoutineDetail } from "@/lib/types/community";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Download,
  EllipsisVertical,
  Eye,
  MessageCircle,
  MoreVertical,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Props {
  routineId: number;
}

export default function SharedRoutineDetailScreen({ routineId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
  const [sheetBottom, setSheetBottom] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e.endCoordinates.height;
      const availableHeight = SCREEN_HEIGHT - kbHeight - insets.top - 8;
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          Platform.OS === "ios" ? e.duration : 250,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
      setKeyboardVisible(true);
      setSheetBottom(kbHeight);
      setSheetHeight(Math.min(SHEET_HEIGHT, availableHeight));
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          Platform.OS === "ios" ? e.duration : 250,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
      setKeyboardVisible(false);
      setSheetBottom(0);
      setSheetHeight(SHEET_HEIGHT);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.top]);

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

  const handleBlockUser = async (targetUserId: number, onSuccess?: () => void) => {
    Alert.alert(
      "사용자 차단",
      "이 사용자를 차단하면 해당 사용자의 루틴과 댓글이 더 이상 표시되지 않습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "차단",
          style: "destructive",
          onPress: async () => {
            try {
              await blockApi.blockUser(targetUserId);
              Alert.alert("차단 완료", "사용자가 차단되었습니다.", [
                { text: "확인", onPress: onSuccess ?? (() => router.back()) },
              ]);
            } catch {
              Alert.alert("차단하지 못했습니다. 잠시 후 다시 시도해주세요.");
            }
          },
        },
      ],
    );
  };

  const handleReport = (targetType: ReportTargetType, targetId: number) => {
    const reasons = Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][];
    const options = reasons.map(([, label]) => label);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["취소", ...options], cancelButtonIndex: 0 },
        async (idx) => {
          if (idx === 0) return;
          const reason = reasons[idx - 1][0];
          try {
            await reportApi.createReport(targetType, targetId, reason);
            Alert.alert("신고 완료", "신고가 접수되었습니다.");
          } catch {
            Alert.alert("이미 신고한 콘텐츠이거나 오류가 발생했습니다.");
          }
        },
      );
    } else {
      Alert.alert(
        "신고 사유 선택",
        undefined,
        [
          ...reasons.map(([reason, label]) => ({
            text: label,
            onPress: async () => {
              try {
                await reportApi.createReport(targetType, targetId, reason);
                Alert.alert("신고 완료", "신고가 접수되었습니다.");
              } catch {
                Alert.alert("이미 신고한 콘텐츠이거나 오류가 발생했습니다.");
              }
            },
          })),
          { text: "취소", style: "cancel" },
        ],
      );
    }
  };

  const handleOptions = () => {
    const isOwn = user?.username === routine?.username;
    if (isOwn) {
      const doDelete = () => {
        Alert.alert(
          "공유 루틴 삭제",
          "커뮤니티에서 이 루틴을 삭제하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            {
              text: "삭제",
              style: "destructive",
              onPress: async () => {
                try {
                  await communityApi.deleteSharedRoutine(routineId);
                  router.back();
                } catch {
                  Alert.alert(
                    "삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
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
            options: ["취소", "삭제"],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
          },
          (idx) => {
            if (idx === 1) doDelete();
          },
        );
      } else {
        Alert.alert(undefined as unknown as string, undefined, [
          { text: "삭제", style: "destructive", onPress: doDelete },
          { text: "취소", style: "cancel" },
        ]);
      }
    } else {
      const doBlock = () => handleBlockUser(routine!.userId);
      const doReport = () => handleReport("ROUTINE", routineId);

      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["취소", "신고", "이 사용자 차단"],
            destructiveButtonIndex: 2,
            cancelButtonIndex: 0,
          },
          (idx) => {
            if (idx === 1) doReport();
            if (idx === 2) doBlock();
          },
        );
      } else {
        Alert.alert(undefined as unknown as string, undefined, [
          { text: "신고", onPress: doReport },
          { text: "이 사용자 차단", style: "destructive", onPress: doBlock },
          { text: "취소", style: "cancel" },
        ]);
      }
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
      Alert.alert("루틴을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
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
    ]).start();
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
      Alert.alert("댓글을 작성하지 못했습니다. 잠시 후 다시 시도해주세요.");
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
      Alert.alert("댓글을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
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
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <ChevronLeft size={24} color={COLORS.white} />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-white">
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

        <Pressable
          onPress={handleOptions}
          className="h-10 w-10 items-center justify-center"
        >
          <EllipsisVertical size={20} color={COLORS.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 80,
        }}
      >
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
              <Text className="w-5 text-center text-base font-bold text-white/25">
                {idx + 1}
              </Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  {item.exerciseName}
                </Text>
                <Text className="text-xs text-white/40">{item.bodyPart}</Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-bold text-primary">
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
            <Text className="text-base text-white/40">{routine.viewCount}</Text>
          </View>
          <Pressable
            onPress={openCommentSheet}
            className="flex-row items-center gap-1.5"
          >
            <MessageCircle size={16} color={COLORS.mutedForeground} />
            <Text className="text-base text-white/40">
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
        {/* 백드롭 */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: fadeAnim,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeCommentSheet} />
        </Animated.View>

        {/* 시트 래퍼 - 키보드 위에 위치 (state로 제어, driver 충돌 없음) */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            bottom: sheetBottom,
            left: 0,
            right: 0,
          }}
        >
          <Animated.View
            className="rounded-t-3xl bg-background"
            style={{
              height: sheetHeight,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="items-center pt-3 pb-1">
              <View className="h-1 w-10 rounded-full bg-white/20" />
            </View>

            <View className="flex-row items-center justify-between px-7 py-3">
              <Text className="text-base font-bold text-white">
                댓글{" "}
                {routine.comments.length > 0 ? routine.comments.length : ""}
              </Text>
            </View>

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
                      <View className="flex-1 gap-0.5 px-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-semibold text-white">
                            {comment.nickname}
                          </Text>
                          <Text className="text-xs text-white/30">
                            {formatRelativeDate(comment.createdAt)}
                          </Text>
                        </View>
                        <Text className="text-base leading-5 text-white/70">
                          {comment.content}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          const isOwn = user?.nickname === comment.nickname;

                          if (isOwn) {
                            if (Platform.OS === "ios") {
                              ActionSheetIOS.showActionSheetWithOptions(
                                {
                                  options: ["삭제", "취소"],
                                  destructiveButtonIndex: 0,
                                  cancelButtonIndex: 1,
                                },
                                (idx) => {
                                  if (idx === 0) {
                                    Alert.alert("삭제", "삭제하시겠습니까?", [
                                      {
                                        text: "삭제",
                                        style: "destructive",
                                        onPress: () => deleteComment(comment.id),
                                      },
                                      { text: "취소", style: "cancel" },
                                    ]);
                                  }
                                },
                              );
                            } else {
                              Alert.alert(undefined as unknown as string, undefined, [
                                {
                                  text: "삭제",
                                  style: "destructive",
                                  onPress: () => deleteComment(comment.id),
                                },
                                { text: "취소", style: "cancel" },
                              ]);
                            }
                          } else {
                            const blockOnSuccess = () => {
                              closeCommentSheet();
                              setRoutine((prev) =>
                                prev ? { ...prev, comments: prev.comments.filter((c) => c.userId !== comment.userId) } : null
                              );
                            };

                            if (Platform.OS === "ios") {
                              ActionSheetIOS.showActionSheetWithOptions(
                                {
                                  options: ["취소", "신고", "이 사용자 차단"],
                                  destructiveButtonIndex: 2,
                                  cancelButtonIndex: 0,
                                },
                                (idx) => {
                                  if (idx === 1) handleReport("COMMENT", comment.id);
                                  if (idx === 2) handleBlockUser(comment.userId, blockOnSuccess);
                                },
                              );
                            } else {
                              Alert.alert(undefined as unknown as string, undefined, [
                                {
                                  text: "신고",
                                  onPress: () => handleReport("COMMENT", comment.id),
                                },
                                {
                                  text: "이 사용자 차단",
                                  style: "destructive",
                                  onPress: () => handleBlockUser(comment.userId, blockOnSuccess),
                                },
                                { text: "취소", style: "cancel" },
                              ]);
                            }
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

            <View
              className="flex-row items-center gap-3 border-t border-white/5 px-4 pt-3"
              style={{
                paddingBottom: keyboardVisible ? 12 : insets.bottom + 12,
              }}
            >
              <View className="flex-1 flex-row items-center rounded-full bg-white/8 px-4">
                <TextInput
                  ref={commentInputRef}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={`${routine.nickname}에게 댓글 달기...`}
                  placeholderTextColor={COLORS.mutedForeground}
                  className="flex-1 py-2.5 text-base text-white"
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}
