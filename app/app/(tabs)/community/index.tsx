import { communityApi } from "@/lib/api/community";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type {
  SharedRoutineListItem,
  SharedRoutineSortType,
} from "@/lib/types/community";
import { BODY_PART_LABEL, type BodyPart } from "@/lib/types/exercise";
import { useRouter } from "expo-router";
import {
  Download,
  Dumbbell,
  Eye,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
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
  return [...new Set(bodyParts)].map((bp) => BODY_PART_LABEL[bp]);
}

interface RoutineCardProps {
  routine: SharedRoutineListItem;
  onImport: (id: number) => void;
  onPress: (id: number) => void;
}

function RoutineCard({ routine, onImport, onPress }: RoutineCardProps) {
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
          className="rounded-lg bg-primary px-4 py-2 active:opacity-80"
        >
          <Text className="text-xs font-semibold text-white">가져오기</Text>
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

  useEffect(() => {
    loadRoutines();
  }, [sortType]);

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
    try {
      const result = await communityApi.importRoutine(id);

      // 낙관적 업데이트
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, importCount: r.importCount + 1 } : r,
        ),
      );

      // TODO: 성공 토스트 표시
      console.log("루틴이 추가되었습니다:", result.title);
    } catch (err) {
      console.error("Failed to import routine:", err);
    }
  };

  const handlePress = (id: number) => {
    router.push(`/(tabs)/community/${id}`);
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
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 }}
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
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
