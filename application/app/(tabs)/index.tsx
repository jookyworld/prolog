import { useAuth } from "@/contexts/auth-context";
import { homeApi } from "@/lib/api/home";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type { BodyPart } from "@/lib/types/exercise";
import type { HomeStatsResponse } from "@/lib/types/home";
import { TrendingUp, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Circle, Polyline, Text as SvgText } from "react-native-svg";

function formatE1RM(kg: number): string {
  return `${kg.toFixed(1)}kg`;
}

function getBodyPartLabel(bodyParts: BodyPart[]): string {
  if (bodyParts.length === 0) return "";
  if (bodyParts.length === 1) return bodyParts[0];

  const unique = [...new Set(bodyParts)];
  if (unique.length === 1) return unique[0];

  const hasLower = unique.some((bp) => bp === "하체");
  const hasUpper = unique.some(
    (bp) => bp === "가슴" || bp === "등" || bp === "어깨" || bp === "팔",
  );

  if (hasLower && hasUpper) return "전신";
  if (hasLower) return "하체";
  if (hasUpper && unique.length > 2) return "상체";

  return unique.slice(0, 2).join("·");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedSessions, setSelectedSessions] = useState<
    Record<number, number | null>
  >({});
  const [homeData, setHomeData] = useState<HomeStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHomeStats();
    }
  }, [user]);

  const loadHomeStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await homeApi.getHomeStats();
      setHomeData(data);
    } catch (err) {
      console.error("Failed to load home stats:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (exerciseId: number, sessionIndex: number) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId] === sessionIndex ? null : sessionIndex,
    }));
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
  if (error || !homeData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-white/60">
            {error || "데이터를 불러올 수 없습니다."}
          </Text>
          <Pressable
            onPress={loadHomeStats}
            className="mt-4 rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">다시 시도</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
        }}
      >
        {/* 헤더 */}
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-primary">ProLog</Text>
          <Text className="mt-1 text-sm text-white/50">
            {new Date().toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </Text>
        </View>

        {/* 통계 카드 (3개) */}
        <View className="flex-row gap-3 px-5">
          {/* 이번 주 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">이번 주</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {homeData.thisWeek.workouts}
              <Text className="text-base text-white/40">회</Text>
            </Text>
          </View>

          {/* 이번 달 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">이번 달</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {homeData.thisMonth.workouts}
              <Text className="text-base text-white/40">회</Text>
            </Text>
          </View>

          {/* 평균 운동 시간 */}
          <View className="flex-1 rounded-2xl bg-card p-4">
            <Text className="text-xs text-white/40">평균 시간</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {homeData.avgWorkoutDuration >= 3600 && (
                <>
                  {Math.floor(homeData.avgWorkoutDuration / 3600)}
                  <Text className="text-base text-white/40">시간 </Text>
                </>
              )}
              {Math.floor((homeData.avgWorkoutDuration % 3600) / 60)}
              <Text className="text-base text-white/40">분</Text>
            </Text>
          </View>
        </View>

        {/* 주간 활동 */}
        <View className="mx-5 mt-6 rounded-2xl bg-card p-5">
          <View className="flex-row items-center justify-between gap-1.5">
            {homeData.weeklyActivity.map((day, idx) => {
              const hasWorkout = day.workoutCount > 0;
              const bodyPartLabel = getBodyPartLabel(day.bodyParts);
              return (
                <View key={idx} className="flex-1 items-center gap-2">
                  {/* 날짜 */}
                  <View className="items-center">
                    <Text
                      className={`text-xs ${
                        hasWorkout ? "text-white/80" : "text-white/30"
                      }`}
                    >
                      {day.dayOfWeek}
                    </Text>
                    <Text className="text-[10px] text-white/20">
                      {day.formattedDate}
                    </Text>
                  </View>
                  {/* 부위 표시 */}
                  {hasWorkout && bodyPartLabel ? (
                    <View className="w-full items-center rounded-lg bg-primary/15 py-2">
                      <Text className="text-[10px] font-bold text-primary">
                        {bodyPartLabel}
                      </Text>
                    </View>
                  ) : (
                    <View className="w-full items-center py-2">
                      <View className="h-2 w-2 rounded-full bg-white/5" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 종목별 성장 추세 */}
        <View className="mx-5 mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">
              주요 운동 성장 추세
            </Text>
          </View>

          <View className="gap-3">
            {/* 데이터 없음 */}
            {homeData.exerciseProgress.length === 0 && (
              <View className="rounded-2xl bg-card p-6">
                <View className="flex-row items-start gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                    <TrendingUp size={22} color={COLORS.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-white">
                      아직 성장 추세가 없어요
                    </Text>
                    <Text className="text-sm leading-5 text-white/50">
                      {"운동을 기록하면\n부위별 성장 그래프가 표시됩니다."}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {homeData.exerciseProgress.map((exercise) => {
              const isBodyweight = exercise.sessions[0]?.isBodyweight ?? false;
              const hasSufficientData = exercise.sessions.length >= 3;

              // 성장 수치 계산
              const firstValue = isBodyweight
                ? exercise.sessions[0].bestSetReps
                : exercise.sessions[0].estimatedOneRM;
              const lastValue = isBodyweight
                ? exercise.sessions[exercise.sessions.length - 1].bestSetReps
                : exercise.sessions[exercise.sessions.length - 1]
                    .estimatedOneRM;
              const growth = lastValue - firstValue;
              const growthPercent =
                firstValue > 0
                  ? ((growth / firstValue) * 100).toFixed(1)
                  : "0.0";

              // 그래프 Y축 값
              const graphValues = exercise.sessions.map((s) =>
                isBodyweight ? s.bestSetReps : s.estimatedOneRM,
              );
              const maxVal = Math.max(...graphValues);
              const minVal = Math.min(...graphValues);
              const range = maxVal - minVal;

              const selectedSessionIndex =
                selectedSessions[exercise.exerciseId];
              const selectedSession =
                selectedSessionIndex !== null &&
                selectedSessionIndex !== undefined
                  ? exercise.sessions[selectedSessionIndex]
                  : null;

              return (
                <View
                  key={exercise.exerciseId}
                  className="overflow-visible rounded-2xl bg-card"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <View className="px-4 pt-4 pb-2">
                    {/* 헤더 */}
                    <View className="mb-2 flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-lg font-bold text-white">
                            {exercise.exerciseName}
                          </Text>
                          <View className="rounded-full bg-white/10 px-2 py-0.5">
                            <Text className="text-[10px] text-white/50">
                              {exercise.bodyPart}
                            </Text>
                          </View>
                        </View>
                        <Text className="mt-0.5 text-xs text-white/40">
                          {isBodyweight
                            ? `최고 횟수  ${firstValue}회 → ${lastValue}회`
                            : `추정 1RM  ${formatE1RM(firstValue)} → ${formatE1RM(lastValue)}`}
                        </Text>
                      </View>
                      {hasSufficientData && (
                        <View className="items-end">
                          <Text className="text-xl font-bold text-primary">
                            {growth >= 0 ? "+" : ""}
                            {isBodyweight ? `${growth}회` : formatE1RM(growth)}
                          </Text>
                          <Text className="text-xs text-white/40">
                            {growth >= 0 ? "+" : ""}
                            {growthPercent}%
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 세션 부족 — 기록 쌓는 중 */}
                    {!hasSufficientData ? (
                      <View className="mt-2 rounded-xl bg-white/5 px-4 py-3">
                        <Text className="mb-2 text-xs text-white/40">
                          {`${exercise.sessions.length}회 기록됨 · ${3 - exercise.sessions.length}번 더 하면 그래프가 표시됩니다`}
                        </Text>
                        {exercise.sessions.length > 0 && (
                          <Text className="text-sm font-semibold text-white">
                            최근 최고 세트:{" "}
                            {isBodyweight
                              ? `${exercise.sessions[exercise.sessions.length - 1].bestSetReps}회`
                              : `${exercise.sessions[exercise.sessions.length - 1].bestSetWeight}kg × ${exercise.sessions[exercise.sessions.length - 1].bestSetReps}회`}
                          </Text>
                        )}
                      </View>
                    ) : (
                      /* 그래프 */
                      <View
                        style={{
                          position: "relative",
                          height: 90,
                          marginTop: 12,
                          marginHorizontal: -8,
                        }}
                      >
                        <Svg width="100%" height="90" viewBox="0 0 300 90">
                          {/* 배경 그리드 */}
                          {[0, 1, 2, 3, 4].map((i) => (
                            <SvgText
                              key={`grid-${i}`}
                              x="5"
                              y={15 + i * 12}
                              fontSize="8"
                              fill="rgba(255,255,255,0.1)"
                            >
                              ─
                            </SvgText>
                          ))}

                          {/* 라인 */}
                          <Polyline
                            points={exercise.sessions
                              .map((session, i) => {
                                const val = isBodyweight
                                  ? session.bestSetReps
                                  : session.estimatedOneRM;
                                const x =
                                  (i /
                                    Math.max(exercise.sessions.length - 1, 1)) *
                                    280 +
                                  10;
                                const y =
                                  range > 0
                                    ? 10 + (1 - (val - minVal) / range) * 40
                                    : 40;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                            fill="none"
                            stroke={COLORS.primary}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* 점 */}
                          {exercise.sessions.map((session, i) => {
                            const val = isBodyweight
                              ? session.bestSetReps
                              : session.estimatedOneRM;
                            const x =
                              (i / Math.max(exercise.sessions.length - 1, 1)) *
                                280 +
                              10;
                            const y =
                              range > 0
                                ? 10 + (1 - (val - minVal) / range) * 40
                                : 40;
                            const isLast = i === exercise.sessions.length - 1;
                            const isSelected = selectedSessionIndex === i;
                            return (
                              <Circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={isSelected ? 8 : isLast ? 6 : 4}
                                fill={
                                  isSelected || isLast
                                    ? COLORS.primary
                                    : COLORS.card
                                }
                                stroke={COLORS.primary}
                                strokeWidth={isSelected ? 3 : isLast ? 2.5 : 2}
                                onPress={() =>
                                  toggleSession(exercise.exerciseId, i)
                                }
                              />
                            );
                          })}

                          {/* 날짜 */}
                          {exercise.sessions.map((session, i) => {
                            const x =
                              (i / Math.max(exercise.sessions.length - 1, 1)) *
                                280 +
                              10;
                            const isSelected = selectedSessionIndex === i;
                            return (
                              <SvgText
                                key={`date-${i}`}
                                x={x}
                                y="80"
                                fontSize="11"
                                fill={
                                  isSelected
                                    ? COLORS.primary
                                    : "rgba(255,255,255,0.4)"
                                }
                                fontWeight={isSelected ? "bold" : "normal"}
                                textAnchor="middle"
                                onPress={() =>
                                  toggleSession(exercise.exerciseId, i)
                                }
                              >
                                {session.date}
                              </SvgText>
                            );
                          })}
                        </Svg>

                        {/* 선택된 세션 팝업 */}
                        {selectedSession && (
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              left: "15%",
                              right: "15%",
                              zIndex: 1000,
                              elevation: 20,
                            }}
                            className="rounded-xl bg-card/95 backdrop-blur-sm"
                          >
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                              className="rounded-xl p-3"
                            >
                              {/* 팝업 헤더 */}
                              <View className="mb-2 flex-row items-start justify-between">
                                <View className="flex-1">
                                  <Text className="text-sm font-semibold text-white">
                                    {selectedSession.routineName}
                                  </Text>
                                  <Text className="text-xs text-white/50">
                                    {selectedSession.date}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() =>
                                    toggleSession(exercise.exerciseId, -1)
                                  }
                                  className="ml-2"
                                >
                                  <X size={16} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                              </View>

                              {/* 최고 세트 */}
                              <View className="mb-2 rounded-lg bg-primary/10 px-2 py-1.5">
                                <Text className="text-xs text-white/50">
                                  최고 세트
                                </Text>
                                <Text className="text-sm font-bold text-primary">
                                  {isBodyweight
                                    ? `${selectedSession.bestSetReps}회`
                                    : `${selectedSession.bestSetWeight}kg × ${selectedSession.bestSetReps}회  (추정 1RM ${formatE1RM(selectedSession.estimatedOneRM)})`}
                                </Text>
                              </View>

                              {/* 전체 세트 목록 */}
                              <View className="gap-1">
                                {selectedSession.sets.map((set, idx) => (
                                  <View
                                    key={idx}
                                    className="flex-row items-center justify-between"
                                  >
                                    <Text className="w-6 text-xs text-white/40">
                                      {idx + 1}
                                    </Text>
                                    <Text className="w-16 text-sm font-medium text-white">
                                      {set.weight > 0
                                        ? `${set.weight}kg`
                                        : "맨몸"}
                                    </Text>
                                    <Text className="w-12 text-sm font-medium text-white">
                                      ×{set.reps}
                                    </Text>
                                    <Text className="w-16 text-right text-xs text-white/40">
                                      {set.weight > 0
                                        ? `${set.weight * set.reps}kg`
                                        : `${set.reps}회`}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
