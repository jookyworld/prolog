import { workoutApi } from "@/lib/api/workout";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/format";
import {
  WorkoutSession,
  toWorkoutSession,
} from "@/lib/types/workout";
import { ArrowLeft, Dumbbell } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type TypeFilter = "all" | "routine" | "free";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "routine", label: "루틴" },
  { value: "free", label: "자유 운동" },
];

const PAGE_SIZE = 20;

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isLoadingRef = useRef(false);

  const fetchSessions = useCallback(async (filter: TypeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getSessions(0, PAGE_SIZE, filter);
      setSessions(data.content.map(toWorkoutSession));
      setPage(0);
      setHasMore(!data.last);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await workoutApi.getSessions(nextPage, PAGE_SIZE, typeFilter);
      setSessions((prev) => [...prev, ...data.content.map(toWorkoutSession)]);
      setPage(nextPage);
      setHasMore(!data.last);
    } catch {
      // 무시
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, page, typeFilter]);

  useEffect(() => {
    fetchSessions(typeFilter);
  }, [typeFilter]);

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 300) {
        loadMore();
      }
    },
    [loadMore],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <ArrowLeft size={20} color={COLORS.white} />
        </Pressable>
        <Text className="text-2xl font-bold text-white">운동 기록</Text>
      </View>

      {/* 필터 칩 */}
      <View className="flex-row gap-2 px-5 pb-4">
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setTypeFilter(f.value)}
            className={`rounded-full px-4 py-2 ${
              typeFilter === f.value ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                typeFilter === f.value ? "text-white" : "text-white/50"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 컨텐츠 */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 }}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="mt-3 text-sm text-white/50">불러오는 중...</Text>
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl bg-card p-8">
            <Text className="mb-4 text-sm text-white/60">{error}</Text>
            <Pressable
              onPress={() => fetchSessions(typeFilter)}
              className="rounded-full bg-white/10 px-5 py-2.5"
            >
              <Text className="text-sm font-medium text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : sessions.length === 0 ? (
          /* 빈 상태 */
          <View className="rounded-2xl bg-card p-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <Dumbbell size={22} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-white">
                  아직 운동 기록이 없어요
                </Text>
                <Text className="text-sm leading-5 text-white/50">
                  운동을 시작하면 여기에 기록이 쌓여요.{"\n"}지금 바로 첫 운동을
                  시작해보세요!
                </Text>
              </View>
            </View>
          </View>
        ) : (
          /* 세션 카드 리스트 */
          <View className="gap-3 pb-8">
            {sessions.map((session) => (
              <Pressable
                key={session.id}
                onPress={() =>
                  router.push(`/(tabs)/profile/history/${session.id}`)
                }
                className="rounded-2xl bg-card p-5 active:opacity-80"
              >
                <Text className="mb-2 text-xs text-white/40">
                  {formatRelativeDate(session.completedAt)}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-semibold text-white">
                    {session.title}
                  </Text>
                  <View
                    className={`rounded-md px-2 py-0.5 ${
                      session.type === "routine"
                        ? "bg-primary/15"
                        : "bg-white/10"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        session.type === "routine"
                          ? "text-primary"
                          : "text-white/50"
                      }`}
                    >
                      {session.type === "routine" ? "루틴" : "자유"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {loadingMore && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
