import { workoutApi } from "@/lib/api/workout";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import { WorkoutSession, toWorkoutSession } from "@/lib/types/workout";
import { useRouter } from "expo-router";
import { ChevronLeft, Dumbbell } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BODY_PART_FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: "전체" },
  { value: "가슴", label: "가슴" },
  { value: "어깨", label: "어깨" },
  { value: "등", label: "등" },
  { value: "팔", label: "팔" },
  { value: "하체", label: "하체" },
  { value: "코어", label: "코어" },
  { value: "유산소", label: "유산소" },
  { value: "기타", label: "기타" },
];

const PAGE_SIZE = 20;

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isLoadingRef = useRef(false);

  const fetchSessions = useCallback(async (filter: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getSessions(
        0,
        PAGE_SIZE,
        filter ?? undefined,
      );
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
      const data = await workoutApi.getSessions(
        nextPage,
        PAGE_SIZE,
        bodyPart ?? undefined,
      );
      setSessions((prev) => [...prev, ...data.content.map(toWorkoutSession)]);
      setPage(nextPage);
      setHasMore(!data.last);
    } catch {
      // 무시
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, page, bodyPart]);

  useEffect(() => {
    fetchSessions(bodyPart);
  }, [bodyPart]);

  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; sessions: WorkoutSession[] }[] =
      [];
    for (const session of sessions) {
      const d = new Date(session.completedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
      const last = groups[groups.length - 1];
      if (last?.key === key) {
        last.sessions.push(session);
      } else {
        groups.push({ key, label, sessions: [session] });
      }
    }
    return groups;
  }, [sessions]);

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center"
        >
          <ChevronLeft size={24} color={COLORS.white} />
        </Pressable>
        <Text className="text-2xl font-bold text-white">운동 기록</Text>
      </View>

      {/* 부위 필터 칩 (가로 스크롤) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="flex-grow-0 pb-4"
      >
        {BODY_PART_FILTERS.map((f) => {
          const active = bodyPart === f.value;
          return (
            <Pressable
              key={f.label}
              onPress={() => setBodyPart(f.value)}
              className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "bg-card"}`}
            >
              <Text
                className={`text-sm font-medium ${active ? "text-white" : "text-white/50"}`}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 컨텐츠 */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
        }}
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
              onPress={() => fetchSessions(bodyPart)}
              className="rounded-full bg-white/10 px-5 py-2.5"
            >
              <Text className="text-sm font-medium text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : sessions.length === 0 ? (
          <View className="rounded-2xl bg-card p-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <Dumbbell size={22} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-white">
                  {bodyPart
                    ? `${bodyPart} 운동 기록이 없어요`
                    : "아직 운동 기록이 없어요"}
                </Text>
                <Text className="text-sm leading-5 text-white/50">
                  {bodyPart
                    ? "다른 부위를 선택하거나 전체를 확인해보세요."
                    : "운동을 시작하면 여기에 기록이 쌓여요.\n지금 바로 첫 운동을 시작해보세요!"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="pb-8">
            {monthGroups.map((group) => (
              <View key={group.key}>
                {/* 월 헤더 */}
                <Text className="pb-3 pt-5 text-lg font-bold text-white">
                  {group.label}
                </Text>

                {/* 해당 월 카드들 */}
                <View className="gap-3">
                  {group.sessions.map((session) => (
                    <Pressable
                      key={session.id}
                      onPress={() =>
                        router.push(`/(tabs)/profile/history/${session.id}`)
                      }
                      className="rounded-2xl bg-card px-5 py-4 active:opacity-80"
                    >
                      <Text className="mb-2 text-xl font-semibold text-white">
                        {session.title}
                      </Text>
                      <View className="flex-row items-end justify-between">
                        {session.bodyParts.length > 0 ? (
                          <View className="flex-1 flex-row flex-wrap gap-1.5">
                            {session.bodyParts.map((part) => (
                              <View
                                key={part}
                                className="rounded-full bg-primary/10 px-2.5 py-0.5"
                              >
                                <Text className="text-xs font-medium text-primary">
                                  {part}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View />
                        )}
                        <Text className="ml-3 text-sm text-white/30">
                          {formatShortDate(session.completedAt)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
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
