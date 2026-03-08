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
  Check,
  Download,
  Dumbbell,
  Eye,
  Share2,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const SORT_LABELS: Record<SharedRoutineSortType, string> = {
  RECENT: "최신순",
  POPULAR: "인기순",
  IMPORTED: "많이 가져간 순",
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
  onImport: (id: number) => void;
  onPress: (id: number) => void;
  importing: boolean;
  imported: boolean;
}

function RoutineCard({ routine, onImport, onPress, importing, imported }: RoutineCardProps) {
  const bodyPartLabels = getBodyPartLabels(routine.bodyParts);

  return (
    <Pressable
      onPress={() => onPress(routine.id)}
      className="rounded-2xl bg-card p-4"
    >
      {/* 작성자 정보 */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <Text className="text-base font-bold text-primary">
              {routine.nickname[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-sm font-semibold text-white">
              {routine.nickname}
            </Text>
            <Text className="text-xs text-white/40">
              {new Date(routine.createdAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* 루틴 제목 */}
      <Text className="mb-2 text-lg font-bold text-white">{routine.title}</Text>

      {/* 대표 운동 종목 */}
      {routine.exerciseNames.length > 0 && (
        <View className="mb-2 flex-row items-center gap-1">
          <Dumbbell size={14} color={COLORS.primary} />
          <Text className="flex-1 text-sm text-white/70" numberOfLines={1}>
            {routine.exerciseNames.join(', ')}
            {routine.exerciseCount > routine.exerciseNames.length &&
              ` 외 ${routine.exerciseCount - routine.exerciseNames.length}개`}
          </Text>
        </View>
      )}

      {/* 설명 */}
      {routine.description && (
        <Text className="mb-3 text-sm text-white/50" numberOfLines={2}>
          {routine.description}
        </Text>
      )}

      {/* 운동 부위 뱃지 */}
      <View className="mb-3 flex-row flex-wrap items-center gap-2">
        {bodyPartLabels.map((label) => (
          <View
            key={label}
            className="rounded-full bg-primary/10 px-2.5 py-1"
          >
            <Text className="text-xs font-medium text-primary">{label}</Text>
          </View>
        ))}
      </View>

      {/* 통계 & 액션 */}
      <View className="flex-row items-center justify-between border-t border-white/5 pt-3">
        {/* 통계 */}
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Eye size={14} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/50">
              {formatNumber(routine.viewCount)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Download size={14} color={COLORS.mutedForeground} />
            <Text className="text-xs text-white/50">
              {formatNumber(routine.importCount)}
            </Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onImport(routine.id);
          }}
          disabled={importing || imported}
          className={`flex-row items-center gap-1.5 rounded-lg px-4 py-2 ${
            imported ? "bg-primary/20" : importing ? "bg-white/10" : "bg-primary active:opacity-80"
          }`}
        >
          {importing ? (
            <ActivityIndicator size="small" color={COLORS.mutedForeground} />
          ) : imported ? (
            <Check size={13} color={COLORS.primary} />
          ) : null}
          <Text className={`text-xs font-semibold ${
            imported ? "text-primary" : importing ? "text-white/40" : "text-white"
          }`}>
            {importing ? "가져오는 중..." : imported ? "가져옴" : "가져오기"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sortType, setSortType] = useState<SharedRoutineSortType>("RECENT");
  const [routines, setRoutines] = useState<SharedRoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<number | null>(null);

  // 공유 모달 상태
  const [shareStep, setShareStep] = useState<"pick" | "form">("pick");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [myRoutines, setMyRoutines] = useState<RoutineListItem[]>([]);
  const [myRoutinesLoading, setMyRoutinesLoading] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineListItem | null>(null);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [sortType]),
  );

  const loadRoutines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await communityApi.getSharedRoutines(sortType);
      setRoutines(response.content);
    } catch (err) {
      console.error("Failed to load routines:", err);
      setError("루틴을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  };

  const handleImport = async (id: number) => {
    setImportingId(id);
    try {
      const result = await communityApi.importRoutine(id);
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, importCount: r.importCount + 1, isImported: true } : r,
        ),
      );
      Alert.alert("완료", `'${result.title}' 루틴을 내 루틴에 추가했습니다.`);
    } catch (err) {
      console.error("Failed to import routine:", err);
      Alert.alert("오류", "루틴 가져오기에 실패했습니다.");
    } finally {
      setImportingId(null);
    }
  };

  const handlePress = (id: number) => {
    router.push(`/(tabs)/community/${id}`);
  };

  const openShareModal = async () => {
    setShareStep("pick");
    setSelectedRoutine(null);
    setShareTitle("");
    setShareDescription("");
    setShareModalVisible(true);
    setMyRoutinesLoading(true);
    try {
      const data = await routineApi.getRoutines("ACTIVE");
      setMyRoutines(data);
    } catch {
      Alert.alert("오류", "루틴 목록을 불러오지 못했습니다.");
      setShareModalVisible(false);
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
      loadRoutines();
      Alert.alert("공유 완료", "루틴이 커뮤니티에 공유되었습니다!");
    } catch {
      Alert.alert("오류", "공유에 실패했습니다.");
    } finally {
      setShareLoading(false);
    }
  };

  const closeShareModal = () => {
    if (shareLoading) return;
    setShareModalVisible(false);
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
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 헤더 */}
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold text-white">커뮤니티</Text>
          <Text className="mt-1 text-sm text-white/50">
            다른 사람들의 루틴을 확인하고 가져가보세요
          </Text>
        </View>

        {/* 정렬 */}
        <View className="mb-4 flex-row gap-2 px-5">
          {(Object.keys(SORT_LABELS) as SharedRoutineSortType[]).map(
            (sort) => (
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
            ),
          )}
        </View>

        {/* 에러 상태 */}
        {error && (
          <View className="items-center px-5 py-10">
            <Text className="text-center text-white/60">{error}</Text>
            <Pressable
              onPress={loadRoutines}
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
                  아직 공유된 루틴이 없습니다
                </Text>
              </View>
            ) : (
              routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onImport={handleImport}
                  onPress={handlePress}
                  importing={importingId === routine.id}
                  imported={routine.isImported}
                />
              ))
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
        animationType="slide"
        transparent
        onRequestClose={closeShareModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-3xl bg-background px-5 pt-6"
            style={{ paddingBottom: insets.bottom + 20, maxHeight: "80%" }}
          >
            {/* 모달 헤더 */}
            <View className="mb-5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                {shareStep === "form" && (
                  <Pressable onPress={() => setShareStep("pick")}>
                    <Text className="text-base text-primary">← 뒤로</Text>
                  </Pressable>
                )}
                <Text className="text-xl font-bold text-white">
                  {shareStep === "pick" ? "루틴 선택" : "공유 정보 입력"}
                </Text>
              </View>
              <Pressable onPress={closeShareModal}>
                <Text className="text-base text-white/50">취소</Text>
              </Pressable>
            </View>

            {/* Step 1: 루틴 선택 */}
            {shareStep === "pick" && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {myRoutinesLoading ? (
                  <View className="items-center py-10">
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : myRoutines.length === 0 ? (
                  <View className="items-center py-10">
                    <Text className="text-center text-white/50">
                      공유할 수 있는 활성 루틴이 없습니다
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2 pb-4">
                    {myRoutines.map((routine) => (
                      <Pressable
                        key={routine.id}
                        onPress={() => handleRoutinePick(routine)}
                        className="flex-row items-center justify-between rounded-xl bg-card px-4 py-4 active:opacity-70"
                      >
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-white">
                            {routine.title}
                          </Text>
                          {routine.description ? (
                            <Text className="mt-0.5 text-sm text-white/40" numberOfLines={1}>
                              {routine.description}
                            </Text>
                          ) : null}
                        </View>
                        <Check size={18} color={COLORS.primary} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Step 2: 제목/설명 입력 */}
            {shareStep === "form" && (
              <View>
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
                  disabled={!shareTitle.trim() || shareLoading}
                  className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${
                    shareTitle.trim() && !shareLoading ? "bg-primary" : "bg-white/10"
                  }`}
                >
                  {shareLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Share2 size={18} color={COLORS.white} />
                      <Text className="text-base font-semibold text-white">공유하기</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
