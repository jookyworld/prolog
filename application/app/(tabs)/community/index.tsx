import { communityApi } from "@/lib/api/community";
import { routineApi } from "@/lib/api/routine";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type {
  SharedRoutineListItem,
  SharedRoutineSortType,
} from "@/lib/types/community";
import type { BodyPart } from "@/lib/types/exercise";
import type { RoutineListItem } from "@/lib/types/routine";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Eye,
  MessageCircle,
  Search,
  Share2,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PAGE_SIZE = 20;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

const SORT_LABELS: Record<SharedRoutineSortType, string> = {
  POPULAR: "인기순",
  RECENT: "최신순",
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function getBodyPartLabels(bodyParts: BodyPart[]): string[] {
  return [...new Set(bodyParts)];
}

interface RoutineCardProps {
  routine: SharedRoutineListItem;
  onPress: (id: number) => void;
}

function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const bodyPartLabels = getBodyPartLabels(routine.bodyParts);

  return (
    <Pressable
      onPress={() => onPress(routine.id)}
      className="rounded-2xl bg-card p-4"
    >
      {/* 작성자 정보 */}
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="text-sm font-medium text-white/60">
          {routine.nickname}
        </Text>
        <Text className="text-xs text-white/30">
          {new Date(routine.createdAt).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* 루틴 제목 */}
      <Text className="mb-3 text-base font-bold text-white" numberOfLines={1}>
        {routine.title}
      </Text>

      {/* 대표 운동 종목 */}
      {routine.exerciseNames.length > 0 && (
        <Text className="mb-3 text-xs text-white/60" numberOfLines={1}>
          {routine.exerciseNames.join(", ")}
          {routine.exerciseCount > routine.exerciseNames.length &&
            ` 외 ${routine.exerciseCount - routine.exerciseNames.length}개`}
        </Text>
      )}

      {/* 부위 뱃지 + 통계 한 줄 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row flex-wrap items-center gap-1.5">
          {bodyPartLabels.map((label) => (
            <View
              key={label}
              className="rounded-full bg-primary/10 px-2 py-0.5"
            >
              <Text className="text-xs font-medium text-primary">{label}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="flex-row items-center gap-1">
            <Eye size={12} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/40">
              {formatNumber(routine.viewCount)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MessageCircle size={12} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/40">
              {formatNumber(routine.commentCount)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sortType, setSortType] = useState<SharedRoutineSortType>("POPULAR");
  const [routines, setRoutines] = useState<SharedRoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");

  // 공유 모달 상태
  const [shareStep, setShareStep] = useState<"pick" | "form">("pick");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [myRoutines, setMyRoutines] = useState<RoutineListItem[]>([]);
  const [myRoutinesLoading, setMyRoutinesLoading] = useState(false);
  const [selectedRoutine, setSelectedRoutine] =
    useState<RoutineListItem | null>(null);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRoutines(sortType, keyword);
    }, [sortType, keyword]),
  );

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadRoutines = async (sort: SharedRoutineSortType, kw: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.getSharedRoutines(
        sort,
        0,
        PAGE_SIZE,
        kw,
      );
      setRoutines(response.content);
      setPage(0);
      setHasMore(!response.last);
    } catch (err) {
      console.error("Failed to load routines:", err);
      setError("루틴을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRoutines = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await communityApi.getSharedRoutines(
        sortType,
        nextPage,
        PAGE_SIZE,
        keyword,
      );
      setRoutines((prev) => [...prev, ...response.content]);
      setPage(nextPage);
      setHasMore(!response.last);
    } catch {
      // 무시
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [hasMore, page, sortType, keyword]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines(sortType, keyword);
    setRefreshing(false);
  };

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - 300
      ) {
        loadMoreRoutines();
      }
    },
    [loadMoreRoutines],
  );

  const handlePress = (id: number) => {
    router.push(`/(tabs)/community/${id}`);
  };

  const openShareModal = async () => {
    setShareStep("pick");
    setSelectedRoutine(null);
    setShareTitle("");
    setShareDescription("");
    setShareModalVisible(true);
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
    setMyRoutinesLoading(true);
    try {
      const data = await routineApi.getRoutines("ACTIVE");
      setMyRoutines(data);
    } catch {
      Alert.alert("루틴 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      closeShareModal();
    } finally {
      setMyRoutinesLoading(false);
    }
  };

  const handleRoutinePick = (routine: RoutineListItem) => {
    setSelectedRoutine(routine);
    setShareTitle(routine.title);
    setShareDescription(routine.description || "");
    setShareStep("form");
  };

  const handleShareSubmit = async () => {
    if (!selectedRoutine || !shareTitle.trim()) return;
    setShareLoading(true);
    try {
      await communityApi.createSharedRoutine({
        routineId: selectedRoutine.id,
        title: shareTitle,
        description: shareDescription,
      });
      setShareModalVisible(false);
      loadRoutines(sortType, keyword);
      Alert.alert("공유 완료", "루틴이 커뮤니티에 공유되었습니다!");
    } catch {
      Alert.alert("공유하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setShareLoading(false);
    }
  };

  const closeShareModal = () => {
    if (shareLoading) return;
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
      setShareModalVisible(false);
    });
  };

  // 로딩 상태
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {/* 검색바 */}
        <View className="mx-5 my-4 flex-row items-center gap-2 rounded-xl bg-card px-3 py-2.5">
          <Search size={16} color={COLORS.mutedForeground} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="루틴 이름, 설명으로 검색"
            placeholderTextColor={COLORS.mutedForeground}
            className="flex-1 text-sm text-white"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <X size={16} color={COLORS.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* 정렬 */}
        <View className="mb-4 flex-row gap-2 px-5">
          {(Object.keys(SORT_LABELS) as SharedRoutineSortType[]).map((sort) => (
            <Pressable
              key={sort}
              onPress={() => setSortType(sort)}
              className={`rounded-full px-4 py-2 ${
                sortType === sort ? "bg-primary/20" : "bg-card"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  sortType === sort ? "text-primary" : "text-white/50"
                }`}
              >
                {SORT_LABELS[sort]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 에러 상태 */}
        {error && (
          <View className="items-center px-5 py-10">
            <Text className="text-center text-white/60">{error}</Text>
            <Pressable
              onPress={() => loadRoutines(sortType, keyword)}
              className="mt-4 rounded-lg bg-primary px-6 py-3"
            >
              <Text className="font-semibold text-white">다시 시도</Text>
            </Pressable>
          </View>
        )}

        {/* 루틴 리스트 */}
        {!error && (
          <View className="gap-3 px-5 pb-6">
            {routines.length === 0 ? (
              <View className="items-center py-20">
                <Text className="text-center text-white/40">
                  {keyword
                    ? `"${keyword}"에 대한 검색 결과가 없습니다`
                    : "아직 공유된 루틴이 없습니다"}
                </Text>
              </View>
            ) : (
              routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={handlePress}
                />
              ))
            )}
            {loadingMore && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - 공유하기 버튼 */}
      <Pressable
        onPress={openShareModal}
        className="absolute flex-row items-center gap-2 rounded-full bg-primary px-5 py-3.5 shadow-lg active:opacity-90"
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
        <Share2 size={18} color={COLORS.white} />
        <Text className="text-base font-semibold text-white">공유하기</Text>
      </Pressable>

      {/* 공유 모달 */}
      <Modal
        visible={shareModalVisible}
        animationType="none"
        transparent
        onRequestClose={closeShareModal}
      >
        {/* 배경 */}
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
          <Pressable style={{ flex: 1 }} onPress={closeShareModal} />
        </Animated.View>

        {/* 시트 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        >
          <Animated.View
            className="rounded-t-3xl bg-background"
            style={{
              maxHeight: SCREEN_HEIGHT * 0.85,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* 드래그 핸들 */}
            <View className="items-center pb-1 pt-3">
              <View className="h-1 w-10 rounded-full bg-white/20" />
            </View>

            {/* 시트 헤더 */}
            <View className="flex-row items-center justify-between px-5 py-3">
              <View className="flex-row items-center gap-3">
                {shareStep === "form" && (
                  <Pressable
                    onPress={() => setShareStep("pick")}
                    className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
                  >
                    <ArrowLeft size={16} color={COLORS.white} />
                  </Pressable>
                )}
                <Text className="text-base font-bold text-white">
                  {shareStep === "pick" ? "루틴 선택" : "공유 정보 입력"}
                </Text>
              </View>
              <Pressable
                onPress={closeShareModal}
                className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
              >
                <X size={16} color={COLORS.white} />
              </Pressable>
            </View>

            {/* Step 1: 루틴 선택 */}
            {shareStep === "pick" && (
              <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                {myRoutinesLoading ? (
                  <View className="items-center py-12">
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : myRoutines.length === 0 ? (
                  <View className="items-center py-12">
                    <Text className="text-sm text-white/40">
                      공유할 수 있는 활성 루틴이 없습니다
                    </Text>
                  </View>
                ) : (
                  <View
                    className="gap-2 py-2"
                    style={{ paddingBottom: insets.bottom + 20 }}
                  >
                    {myRoutines.map((routine) => (
                      <Pressable
                        key={routine.id}
                        onPress={() => handleRoutinePick(routine)}
                        className="flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-4 active:opacity-70"
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-white">
                            {routine.title}
                          </Text>
                          {routine.description ? (
                            <Text
                              className="mt-0.5 text-xs text-white/40"
                              numberOfLines={1}
                            >
                              {routine.description}
                            </Text>
                          ) : null}
                        </View>
                        <Check size={16} color={COLORS.mutedForeground} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Step 2: 제목/설명 입력 */}
            {shareStep === "form" && (
              <View
                className="px-5"
                style={{ paddingBottom: insets.bottom + 20 }}
              >
                <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
                  제목
                </Text>
                <TextInput
                  value={shareTitle}
                  onChangeText={setShareTitle}
                  placeholder="공유할 루틴의 제목을 입력하세요"
                  placeholderTextColor={COLORS.mutedForeground}
                  className="mb-5 rounded-xl bg-white/5 px-4 py-3 text-sm text-white"
                  maxLength={100}
                />
                <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
                  설명
                </Text>
                <TextInput
                  value={shareDescription}
                  onChangeText={setShareDescription}
                  placeholder="루틴에 대한 설명을 입력하세요 (선택사항)"
                  placeholderTextColor={COLORS.mutedForeground}
                  className="mb-6 h-24 rounded-xl bg-white/5 px-4 py-3 text-sm text-white"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Pressable
                  onPress={handleShareSubmit}
                  disabled={!shareTitle.trim() || shareLoading}
                  className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${
                    shareTitle.trim() && !shareLoading
                      ? "bg-primary"
                      : "bg-white/10"
                  }`}
                >
                  {shareLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Share2 size={16} color={COLORS.white} />
                      <Text className="text-sm font-semibold text-white">
                        공유하기
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
