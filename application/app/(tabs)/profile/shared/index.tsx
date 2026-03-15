import { communityApi } from "@/lib/api/community";
import { COLORS } from "@/lib/constants";
import type { SharedRoutineListItem } from "@/lib/types/community";
import type { BodyPart } from "@/lib/types/exercise";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronLeft,
  EllipsisVertical,
  Eye,
  MessageCircle,
  Share2,
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PAGE_SIZE = 20;

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

function getBodyPartLabels(bodyParts: BodyPart[]): string[] {
  return [...new Set(bodyParts)];
}

interface RoutineCardProps {
  routine: SharedRoutineListItem;
  onPress: (id: number) => void;
  onDelete: (id: number) => void;
}

function RoutineCard({ routine, onPress, onDelete }: RoutineCardProps) {
  const bodyPartLabels = getBodyPartLabels(routine.bodyParts);

  const handleMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["취소", "삭제"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onDelete(routine.id);
        },
      );
    } else {
      Alert.alert("옵션", undefined, [
        {
          text: "삭제",
          style: "destructive",
          onPress: () => onDelete(routine.id),
        },
        { text: "취소", style: "cancel" },
      ]);
    }
  };

  return (
    <Pressable
      onPress={() => onPress(routine.id)}
      className="rounded-2xl bg-card p-3"
    >
      {/* 날짜 + 메뉴 버튼 */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs text-white/30">
          {new Date(routine.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Pressable
          onPress={handleMenu}
          hitSlop={8}
          className="h-7 w-7 items-center justify-center rounded-full"
        >
          <EllipsisVertical size={16} color={COLORS.mutedForeground} />
        </Pressable>
      </View>

      {/* 루틴 제목 */}
      <Text
        className="mb-1.5 ml-2 text-base font-bold text-white"
        numberOfLines={1}
      >
        {routine.title}
      </Text>

      {/* 대표 운동 종목 */}
      {routine.exerciseNames.length > 0 && (
        <View className="mb-2 flex-row items-center">
          <Text className="flex-1 ml-2 text-xs text-white/60" numberOfLines={1}>
            {routine.exerciseNames.join(", ")}
            {routine.exerciseCount > routine.exerciseNames.length &&
              ` 외 ${routine.exerciseCount - routine.exerciseNames.length}개`}
          </Text>
        </View>
      )}

      {/* 부위 뱃지 + 통계 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row flex-wrap items-center gap-1.5 ml-1">
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

export default function MySharedRoutinesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [routines, setRoutines] = useState<SharedRoutineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isLoadingMoreRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const load = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getMySharedRoutines(0, PAGE_SIZE);
      setRoutines(response.content);
      setPage(0);
      setHasMore(!response.last);
    } catch {
      Alert.alert("목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await communityApi.getMySharedRoutines(
        nextPage,
        PAGE_SIZE,
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
  }, [hasMore, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - 300
      ) {
        loadMore();
      }
    },
    [loadMore],
  );

  const handleDelete = (id: number) => {
    Alert.alert("공유 루틴 삭제", "이 루틴을 커뮤니티에서 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await communityApi.deleteSharedRoutine(id);
            setRoutines((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert("삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
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
        {/* 헤더 */}
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </Pressable>
          <Text className="text-2xl font-bold text-white">공유 기록</Text>
        </View>

        {/* 목록 */}
        <View className="gap-3 px-5">
          {routines.length === 0 ? (
            <View className="rounded-2xl bg-card p-6">
              <View className="flex-row items-start gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                  <Share2 size={22} color={COLORS.primary} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-white">
                    아직 공유한 루틴이 없어요
                  </Text>
                  <Text className="text-sm leading-5 text-white/50">
                    {"내 루틴을 커뮤니티에 공유하면\n여기에 표시됩니다."}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onPress={(id) => router.push(`/(tabs)/profile/shared/${id}`)}
                onDelete={handleDelete}
              />
            ))
          )}
          {loadingMore && (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
