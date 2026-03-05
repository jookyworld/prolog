import { useWorkout } from "@/contexts/workout-context";
import { routineApi } from "@/lib/api/routine";
import { workoutApi } from "@/lib/api/workout";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import { formatElapsedTime } from "@/lib/format";
import { getSelectedExercises } from "@/lib/store/exercise-selection";
import type { RoutineItemRes } from "@/lib/types/routine";
import type {
  ActiveExercise,
  ActiveSet,
  WorkoutSessionCompleteReq,
} from "@/lib/types/workout";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Check, Minus, Plus } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { activeSession, startWorkout, endWorkout } = useWorkout();

  const isFreeWorkout = routineId === "free";
  const numericRoutineId = isFreeWorkout ? null : Number(routineId);

  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [routineTitle, setRoutineTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [originalRoutineItems, setOriginalRoutineItems] = useState<
    RoutineItemRes[] | null
  >(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setIdCounter = useRef(0);
  const initRef = useRef(false);
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  const nextSetId = useCallback(() => {
    return `set-${++setIdCounter.current}`;
  }, []);

  // Pick up exercises added via select-exercises screen (for free workouts)
  useFocusEffect(
    useCallback(() => {
      if (!initRef.current) return;
      const added = getSelectedExercises();
      if (added.length === 0) return;

      const newExercises: ActiveExercise[] = added.map((ex) => ({
        id: `ex-${ex.id}-${Date.now()}`,
        exerciseId: ex.id,
        name: ex.name,
        sets: Array.from({ length: 3 }, (_, i) => ({
          id: nextSetId(),
          setNumber: i + 1,
          weight: "",
          reps: "",
          completed: false,
        })),
      }));

      setExercises((prev) => [...prev, ...newExercises]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextSetId]),
  );

  // Initialize session
  useFocusEffect(
    useCallback(() => {
      if (!routineId || initRef.current) return;
      initRef.current = true;

      const init = async () => {
        try {
          const currentSession = activeSessionRef.current;

          if (isFreeWorkout) {
            // Free workout
            if (currentSession && currentSession.routineId === null) {
              // Resume existing free session
              setSessionId(currentSession.sessionId);
              setRoutineTitle("자유 운동");
              setExercises([]);
            } else {
              // Start new free session
              const session = await workoutApi.startSession(null);
              setSessionId(session.id);
              setRoutineTitle("자유 운동");
              setExercises([]);
              startWorkout(session.id, null);
            }
          } else if (
            currentSession &&
            currentSession.routineId === numericRoutineId
          ) {
            // Resume existing routine session
            const routine = await routineApi.getRoutineDetail(
              numericRoutineId!,
            );
            setRoutineTitle(routine.title);
            setSessionId(currentSession.sessionId);
            setOriginalRoutineItems(routine.routineItems);

            // Load last session data for pre-filling
            let lastDataMap = new Map<
              number,
              { weight: number; reps: number }[]
            >();
            try {
              const lastSession = await workoutApi.getLastSessionByRoutine(
                numericRoutineId!,
              );
              lastSession.exercises.forEach((ex) => {
                lastDataMap.set(
                  ex.exerciseId,
                  ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
                );
              });
            } catch {
              // No previous session, ignore
            }

            const sorted = [...routine.routineItems].sort(
              (a, b) => a.orderInRoutine - b.orderInRoutine,
            );

            const activeExercises: ActiveExercise[] = sorted.map((item) => {
              const lastSets = lastDataMap.get(item.exerciseId) || [];
              return {
                id: String(item.routineItemId),
                exerciseId: item.exerciseId,
                name: item.exerciseName,
                sets: Array.from({ length: item.sets }, (_, i) => {
                  const lastSet = lastSets[i];
                  return {
                    id: nextSetId(),
                    setNumber: i + 1,
                    weight: lastSet ? String(lastSet.weight) : "",
                    reps: lastSet ? String(lastSet.reps) : "",
                    completed: false,
                  };
                }),
              };
            });

            setExercises(activeExercises);
          } else {
            // New routine session
            const [routine, session] = await Promise.all([
              routineApi.getRoutineDetail(numericRoutineId!),
              workoutApi.startSession(numericRoutineId),
            ]);

            setRoutineTitle(routine.title);
            setSessionId(session.id);
            setOriginalRoutineItems(routine.routineItems);
            startWorkout(session.id, numericRoutineId);

            // Load last session data for pre-filling
            let lastDataMap = new Map<
              number,
              { weight: number; reps: number }[]
            >();
            try {
              const lastSession = await workoutApi.getLastSessionByRoutine(
                numericRoutineId!,
              );
              lastSession.exercises.forEach((ex) => {
                lastDataMap.set(
                  ex.exerciseId,
                  ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
                );
              });
            } catch {
              // No previous session, ignore
            }

            const sorted = [...routine.routineItems].sort(
              (a, b) => a.orderInRoutine - b.orderInRoutine,
            );

            const activeExercises: ActiveExercise[] = sorted.map((item) => {
              const lastSets = lastDataMap.get(item.exerciseId) || [];
              return {
                id: String(item.routineItemId),
                exerciseId: item.exerciseId,
                name: item.exerciseName,
                sets: Array.from({ length: item.sets }, (_, i) => {
                  const lastSet = lastSets[i];
                  return {
                    id: nextSetId(),
                    setNumber: i + 1,
                    weight: lastSet ? String(lastSet.weight) : "",
                    reps: lastSet ? String(lastSet.reps) : "",
                    completed: false,
                  };
                }),
              };
            });

            setExercises(activeExercises);
          }
        } catch (err) {
          Alert.alert(
            "오류",
            err instanceof Error ? err.message : "세션을 시작할 수 없습니다.",
            [{ text: "확인", onPress: () => router.back() }],
          );
        } finally {
          setLoading(false);
        }
      };

      init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routineId, router, startWorkout, nextSetId]),
  );

  // Timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const updateSet = useCallback(
    (exerciseIdx: number, setId: string, updates: Partial<ActiveSet>) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === exerciseIdx
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, ...updates } : s,
                ),
              }
            : ex,
        ),
      );
    },
    [],
  );

  const addSet = useCallback(
    (exerciseIdx: number) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === exerciseIdx
            ? {
                ...ex,
                sets: [
                  ...ex.sets,
                  {
                    id: nextSetId(),
                    setNumber: ex.sets.length + 1,
                    weight: "",
                    reps: "",
                    completed: false,
                  },
                ],
              }
            : ex,
        ),
      );
    },
    [nextSetId],
  );

  const removeSet = useCallback((exerciseIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIdx || ex.sets.length <= 1) return ex;
        const newSets = ex.sets.slice(0, -1);
        return { ...ex, sets: newSets };
      }),
    );
  }, []);

  const removeExercise = useCallback((exerciseIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIdx));
  }, []);

  const moveExerciseUp = useCallback((exerciseIdx: number) => {
    if (exerciseIdx === 0) return;
    setExercises((prev) => {
      const updated = [...prev];
      [updated[exerciseIdx - 1], updated[exerciseIdx]] = [
        updated[exerciseIdx],
        updated[exerciseIdx - 1],
      ];
      return updated;
    });
  }, []);

  const moveExerciseDown = useCallback((exerciseIdx: number) => {
    setExercises((prev) => {
      if (exerciseIdx >= prev.length - 1) return prev;
      const updated = [...prev];
      [updated[exerciseIdx], updated[exerciseIdx + 1]] = [
        updated[exerciseIdx + 1],
        updated[exerciseIdx],
      ];
      return updated;
    });
  }, []);

  const hasRoutineChanged = useCallback(() => {
    if (!originalRoutineItems) return false;

    const sorted = [...originalRoutineItems].sort(
      (a, b) => a.orderInRoutine - b.orderInRoutine,
    );

    if (sorted.length !== exercises.length) return true;

    for (let i = 0; i < sorted.length; i++) {
      const orig = sorted[i];
      const curr = exercises[i];
      if (orig.exerciseId !== curr.exerciseId) return true;
      if (orig.sets !== curr.sets.length) return true;
    }

    return false;
  }, [originalRoutineItems, exercises]);

  const completeWithAction = async (
    action: WorkoutSessionCompleteReq["action"],
    completedSets: WorkoutSessionCompleteReq["sets"],
    newRoutineTitle?: string,
  ) => {
    if (!sessionId) return;
    setCompleting(true);
    try {
      await workoutApi.completeSession(sessionId, {
        action,
        sets: completedSets,
        ...(newRoutineTitle ? { routineTitle: newRoutineTitle } : {}),
      });
      endWorkout();
      initRef.current = false;
      setLoading(true);
      setElapsedTime(0);
      router.back();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "운동 완료 처리에 실패했습니다.",
      );
    } finally {
      setCompleting(false);
    }
  };

  const promptRoutineTitleAndCreate = (
    completedSets: WorkoutSessionCompleteReq["sets"],
  ) => {
    Alert.prompt(
      "루틴 이름 입력",
      "이 운동을 루틴으로 저장합니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "저장",
          onPress: (title: string | undefined) => {
            const trimmed = (title ?? "").trim();
            if (!trimmed) {
              Alert.alert("알림", "루틴 이름을 입력해주세요.");
              return;
            }
            completeWithAction(
              "CREATE_ROUTINE_AND_RECORD",
              completedSets,
              trimmed,
            );
          },
        },
      ],
      "plain-text",
      "",
      "default",
    );
  };

  const handleComplete = () => {
    const completedSets = exercises.flatMap((ex) =>
      ex.sets
        .filter((s) => s.completed && s.reps) // Only require reps (weight can be 0 for bodyweight exercises)
        .map((s) => ({
          exerciseId: ex.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight ? Number(s.weight) : 0, // Default to 0 for bodyweight exercises
          reps: Number(s.reps),
        })),
    );

    if (completedSets.length === 0) {
      Alert.alert("알림", "완료된 세트가 없습니다.");
      return;
    }

    if (isFreeWorkout) {
      // Free workout: offer to record only or create a routine
      Alert.alert("운동 완료", `${completedSets.length}개 세트를 기록합니다.`, [
        { text: "취소", style: "cancel" },
        {
          text: "기록만 저장",
          onPress: () => completeWithAction("RECORD_ONLY", completedSets),
        },
        {
          text: "루틴으로 저장",
          onPress: () => promptRoutineTitleAndCreate(completedSets),
        },
      ]);
      return;
    }

    // Routine-based session with changes
    if (originalRoutineItems && hasRoutineChanged()) {
      Alert.alert(
        "운동 구성이 변경됨",
        "루틴과 다른 구성으로 운동했습니다. 어떻게 저장할까요?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "이대로 저장",
            onPress: () => completeWithAction("RECORD_ONLY", completedSets),
          },
          {
            text: "자유 운동으로 저장",
            onPress: () =>
              completeWithAction("DETACH_AND_RECORD", completedSets),
          },
          {
            text: "루틴도 업데이트",
            onPress: () =>
              completeWithAction("UPDATE_ROUTINE_AND_RECORD", completedSets),
          },
        ],
      );
      return;
    }

    Alert.alert("운동 완료", `${completedSets.length}개 세트를 기록합니다.`, [
      { text: "취소", style: "cancel" },
      {
        text: "완료",
        onPress: () => completeWithAction("RECORD_ONLY", completedSets),
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      "운동 중단",
      "운동을 중단하시겠습니까?\n기록이 저장되지 않습니다.",
      [
        { text: "계속하기", style: "cancel" },
        {
          text: "그만하기",
          style: "destructive",
          onPress: async () => {
            if (sessionId) {
              try {
                await workoutApi.cancelSession(sessionId);
              } catch {
                // 취소 실패해도 로컬 상태는 정리
              }
            }
            endWorkout();
            initRef.current = false;
            setLoading(true);
            setElapsedTime(0);
            router.back();
          },
        },
      ],
    );
  };

  const handleAddExercise = () => {
    const rid = isFreeWorkout ? "free" : routineId;
    router.push(
      `/select-exercises?returnTo=workout&routineId=${rid}`,
    );
  };

  const isExerciseCompleted = (exercise: ActiveExercise) => {
    return exercise.sets.every((set) => set.completed);
  };

  const handleExerciseLongPress = (
    exerciseIdx: number,
    exerciseName: string,
  ) => {
    const buttons: any[] = [];

    if (exerciseIdx > 0) {
      buttons.push({
        text: "위로 이동",
        onPress: () => moveExerciseUp(exerciseIdx),
      });
    }

    if (exerciseIdx < exercises.length - 1) {
      buttons.push({
        text: "아래로 이동",
        onPress: () => moveExerciseDown(exerciseIdx),
      });
    }

    buttons.push({
      text: "삭제",
      style: "destructive",
      onPress: () => {
        Alert.alert("종목 삭제", `${exerciseName}을(를) 삭제하시겠습니까?`, [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => removeExercise(exerciseIdx),
          },
        ]);
      },
    });

    buttons.push({ text: "취소", style: "cancel" });

    Alert.alert("종목 관리", exerciseName, buttons);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text className="mt-3 text-sm text-white/50">운동 준비 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header - Unified top bar */}
      <View className="border-b border-white/10 px-5 py-4">
        {/* Top row: Back, Title, Timer, Complete */}
        <View className="mb-3 flex-row items-center">
          <Pressable
            onPress={handleCancel}
            className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-white/5 active:bg-white/10"
          >
            <Text className="text-lg text-white/70">←</Text>
          </Pressable>

          <Text
            className="flex-1 text-base font-bold text-white"
            numberOfLines={1}
          >
            {routineTitle}
          </Text>

          <View className="mx-3 rounded-lg bg-white/10 px-3 py-1.5">
            <Text className="font-mono text-lg font-bold text-white">
              {formatElapsedTime(elapsedTime)}
            </Text>
          </View>

          <Pressable
            onPress={handleComplete}
            disabled={completing}
            className="rounded-xl bg-primary px-4 py-2 active:opacity-80"
          >
            {completing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text className="text-sm font-semibold text-white">완료</Text>
            )}
          </Pressable>
        </View>

        {/* Bottom row: Progress bar and add button */}
        {exercises.length > 0 &&
          (() => {
            const totalSets = exercises.reduce(
              (sum, ex) => sum + ex.sets.length,
              0,
            );
            const completedSets = exercises.reduce(
              (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
              0,
            );
            const progress =
              totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

            return (
              <View className="flex-row items-center gap-3">
                {/* Progress bar */}
                <View className="flex-1">
                  <View className="mb-1.5 flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-white/50">
                      진행률
                    </Text>
                    <Text className="text-xs font-semibold text-white/70">
                      {completedSets}/{totalSets}
                    </Text>
                  </View>
                  <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <View
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>

                {/* Add exercise button */}
                <Pressable
                  onPress={handleAddExercise}
                  className="flex-row items-center gap-1.5 rounded-xl bg-white/8 px-3 py-2 active:opacity-80"
                >
                  <Plus size={14} color={COLORS.white} />
                  <Text className="text-xs font-semibold text-white">종목</Text>
                </Pressable>
              </View>
            );
          })()}
      </View>

      {/* Exercise list */}
      {exercises.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-lg font-semibold text-white/60">
            종목을 추가해주세요
          </Text>
          <Text className="mb-6 text-sm text-white/40">
            상단의 종목 버튼을 눌러 운동을 추가하세요
          </Text>
          <Pressable
            onPress={handleAddExercise}
            className="rounded-xl bg-primary px-6 py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">
              종목 추가하기
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1 pt-4"
          contentContainerStyle={{
            paddingBottom: 60 + TAB_BAR_HEIGHT + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {exercises.map((exercise, exerciseIdx) => {
            const isCompleted = isExerciseCompleted(exercise);
            const completedSets = exercise.sets.filter(
              (s) => s.completed,
            ).length;

            return (
              <View key={exercise.id} className="mb-8 px-5">
                <View className="flex-row">
                  {/* Left: Number + Buttons */}
                  <View
                    className="mr-4 items-center gap-3"
                    style={{ width: 48 }}
                  >
                    {/* Exercise number */}
                    <Pressable
                      onPress={() =>
                        handleExerciseLongPress(exerciseIdx, exercise.name)
                      }
                      className="h-10 w-10 items-center justify-center rounded-full bg-white/8 active:bg-white/10"
                    >
                      <Text
                        className="text-base font-bold"
                        style={{
                          color: isCompleted
                            ? "#22c55e"
                            : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {exerciseIdx + 1}
                      </Text>
                    </Pressable>

                    {/* Add/Remove set buttons - vertical */}
                    <View className="items-center gap-1 rounded-xl bg-white/5 px-2 py-2">
                      <Pressable
                        onPress={() => removeSet(exerciseIdx)}
                        disabled={exercise.sets.length <= 1}
                        className="h-7 w-7 items-center justify-center rounded-lg active:bg-white/10"
                        style={{
                          opacity: exercise.sets.length <= 1 ? 0.3 : 1,
                        }}
                      >
                        <Minus size={14} color={COLORS.mutedForeground} />
                      </Pressable>
                      <Text className="text-[10px] font-medium text-white/40">
                        세트
                      </Text>
                      <Pressable
                        onPress={() => addSet(exerciseIdx)}
                        className="h-7 w-7 items-center justify-center rounded-lg active:bg-white/10"
                      >
                        <Plus size={14} color={COLORS.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Right: Header + Sets */}
                  <View className="flex-1">
                    {/* Header */}
                    <View className="mb-3 h-10 flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-white">
                        {exercise.name}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        {isCompleted && (
                          <View className="rounded-full bg-green-500/20 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-green-400">
                              완료
                            </Text>
                          </View>
                        )}
                        <Text className="text-xs text-white/40">
                          {completedSets}/{exercise.sets.length} 세트
                        </Text>
                      </View>
                    </View>

                    {/* Set rows */}
                    <View className="gap-2.5">
                      {exercise.sets.map((set) => (
                        <View
                          key={set.id}
                          className="flex-row items-center gap-2.5"
                        >
                          <View style={{ width: 36 }}>
                            <Text className="text-center text-base font-bold text-white">
                              {set.setNumber}
                            </Text>
                          </View>
                          <View
                            className="flex-1 flex-row items-center gap-1 rounded-lg px-3 py-2.5"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                          >
                            <TextInput
                              className="flex-1 text-center text-sm font-semibold text-white"
                              placeholder="0"
                              placeholderTextColor={COLORS.placeholder}
                              keyboardType="numeric"
                              value={set.weight}
                              onChangeText={(v) =>
                                updateSet(exerciseIdx, set.id, {
                                  weight: v,
                                })
                              }
                            />
                            <Text className="text-sm font-medium text-white/50">kg</Text>
                          </View>
                          <View
                            className="flex-1 flex-row items-center gap-1 rounded-lg px-3 py-2.5"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                          >
                            <TextInput
                              className="flex-1 text-center text-sm font-semibold text-white"
                              placeholder="0"
                              placeholderTextColor={COLORS.placeholder}
                              keyboardType="numeric"
                              value={set.reps}
                              onChangeText={(v) =>
                                updateSet(exerciseIdx, set.id, { reps: v })
                              }
                            />
                            <Text className="text-sm font-medium text-white/50">회</Text>
                          </View>
                          <Pressable
                            onPress={() =>
                              updateSet(exerciseIdx, set.id, {
                                completed: !set.completed,
                              })
                            }
                            className="h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: set.completed
                                ? COLORS.primary
                                : "rgba(255,255,255,0.08)",
                            }}
                          >
                            <Check
                              size={16}
                              color={
                                set.completed ? COLORS.white : COLORS.iconMuted
                              }
                            />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
