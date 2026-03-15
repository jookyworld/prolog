import { ApiError } from "@/lib/api";
import { exerciseApi } from "@/lib/api/exercise";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import {
  BODY_PARTS,
  type BodyPart,
  type ExerciseResponse,
} from "@/lib/types/exercise";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Dumbbell,
  EllipsisVertical,
  Plus,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

type TabType = "all" | "custom";

type FormState = {
  name: string;
  bodyPart: BodyPart;
  partDetail: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  bodyPart: "가슴",
  partDetail: "",
};

export default function ExerciseManageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("all");

  // 전체 종목
  const [allExercises, setAllExercises] = useState<ExerciseResponse[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [allError, setAllError] = useState<string | null>(null);
  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | null>(null);

  // 커스텀 종목
  const [customExercises, setCustomExercises] = useState<ExerciseResponse[]>(
    [],
  );
  const [customLoading, setCustomLoading] = useState(false);
  const [customLoaded, setCustomLoaded] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // 폼 모달
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setAllLoading(true);
    setAllError(null);
    try {
      const data = await exerciseApi.getExercises();
      setAllExercises(data);
    } catch (err) {
      setAllError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setAllLoading(false);
    }
  }, []);

  const fetchCustom = useCallback(async () => {
    setCustomLoading(true);
    setCustomError(null);
    try {
      const data = await exerciseApi.getCustomExercises();
      setCustomExercises(data);
      setCustomLoaded(true);
    } catch (err) {
      setCustomError(
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setCustomLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (activeTab === "custom" && !customLoaded) {
      fetchCustom();
    }
  }, [activeTab, customLoaded, fetchCustom]);

  // 전체 종목 필터
  const filteredAll = useMemo(() => {
    if (!filterBodyPart) return allExercises;
    return allExercises.filter((e) => e.bodyPart === filterBodyPart);
  }, [allExercises, filterBodyPart]);

  const allGrouped = useMemo(() => {
    return BODY_PARTS.map((part) => ({
      part,
      items: filteredAll.filter((e) => e.bodyPart === part),
    })).filter((s) => s.items.length > 0);
  }, [filteredAll]);

  // 커스텀 종목 섹션
  const customGrouped = useMemo(() => {
    return BODY_PARTS.map((part) => ({
      part,
      items: customExercises.filter((e) => e.bodyPart === part),
    })).filter((s) => s.items.length > 0);
  }, [customExercises]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setModalVisible(true);
  };

  const openEdit = (exercise: ExerciseResponse) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      partDetail: exercise.partDetail ?? "",
    });
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      Alert.alert("입력 오류", "종목 이름을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: trimmedName,
        bodyPart: form.bodyPart,
        partDetail: form.partDetail.trim() || undefined,
      };
      if (editingId !== null) {
        const updated = await exerciseApi.updateCustomExercise(editingId, body);
        setCustomExercises((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e)),
        );
      } else {
        const created = await exerciseApi.createCustomExercise(body);
        setCustomExercises((prev) => [created, ...prev]);
        // 전체 목록에도 반영
        setAllExercises((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "저장에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (exercise: ExerciseResponse) => {
    const confirmDelete = async (force = false) => {
      try {
        await exerciseApi.deleteCustomExercise(exercise.id, force);
        setCustomExercises((prev) => prev.filter((e) => e.id !== exercise.id));
        setAllExercises((prev) => prev.filter((e) => e.id !== exercise.id));
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          Alert.alert("종목 삭제", err.message, [
            { text: "취소", style: "cancel" },
            {
              text: "삭제",
              style: "destructive",
              onPress: () => confirmDelete(true),
            },
          ]);
        } else {
          Alert.alert(
            "오류",
            err instanceof Error ? err.message : "삭제에 실패했습니다.",
          );
        }
      }
    };

    Alert.alert(exercise.name, "이 커스텀 종목을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => confirmDelete(false),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </Pressable>
          <Text className="text-2xl font-bold text-white">종목 관리</Text>
        </View>
        {activeTab === "custom" && (
          <Pressable
            onPress={openCreate}
            className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15"
          >
            <Plus size={20} color={COLORS.primary} />
          </Pressable>
        )}
      </View>

      {/* 탭 */}
      <View className="mx-5 mb-4 flex-row rounded-xl bg-white/5 p-1">
        {(["all", "custom"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 items-center rounded-lg py-2"
            style={
              activeTab === tab
                ? { backgroundColor: COLORS.primary }
                : undefined
            }
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  activeTab === tab ? COLORS.white : "rgba(255,255,255,0.4)",
              }}
            >
              {tab === "all" ? "전체 종목" : "커스텀 종목"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 전체 종목 탭 */}
      {activeTab === "all" && (
        <>
          {/* 부위 필터 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 max-h-9"
            contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          >
            <Pressable
              onPress={() => setFilterBodyPart(null)}
              className="rounded-full px-4 py-1.5"
              style={{
                backgroundColor:
                  filterBodyPart === null
                    ? COLORS.primary
                    : "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    filterBodyPart === null
                      ? COLORS.white
                      : "rgba(255,255,255,0.6)",
                }}
              >
                전체
              </Text>
            </Pressable>
            {BODY_PARTS.map((bp) => (
              <Pressable
                key={bp}
                onPress={() =>
                  setFilterBodyPart(bp === filterBodyPart ? null : bp)
                }
                className="rounded-full px-4 py-1.5"
                style={{
                  backgroundColor:
                    filterBodyPart === bp
                      ? COLORS.primary
                      : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color:
                      filterBodyPart === bp
                        ? COLORS.white
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  {bp}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
            }}
          >
            {allLoading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : allError ? (
              <View className="rounded-2xl bg-card p-6">
                <Text className="mb-3 text-center text-white/60">
                  {allError}
                </Text>
                <Pressable
                  onPress={fetchAll}
                  className="items-center rounded-xl bg-primary/15 py-2.5"
                >
                  <Text className="text-sm font-medium text-white">
                    다시 시도
                  </Text>
                </Pressable>
              </View>
            ) : allGrouped.length === 0 ? (
              <View className="items-center py-20">
                <Text className="text-sm text-white/40">
                  해당 부위의 종목이 없습니다
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {allGrouped.map((section) => (
                  <View key={section.part}>
                    <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                      {section.part}
                    </Text>
                    <View className="rounded-2xl bg-card">
                      {section.items.map((exercise, index) => (
                        <View key={exercise.id}>
                          {index > 0 && (
                            <View className="mx-5 h-px bg-white/5" />
                          )}
                          <View className="flex-row items-center px-5 py-4">
                            <View className="flex-1">
                              <View className="flex-row items-center gap-2">
                                <Text className="text-base text-white">
                                  {exercise.name}
                                </Text>
                                {exercise.custom && (
                                  <View className="rounded bg-white/10 px-1.5 py-0.5">
                                    <Text className="text-[10px] text-white/40">
                                      커스텀
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {exercise.partDetail ? (
                                <Text className="mt-0.5 text-sm text-white/40">
                                  {exercise.partDetail}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* 커스텀 종목 탭 */}
      {activeTab === "custom" && (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
          }}
        >
          {customLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : customError ? (
            <View className="rounded-2xl bg-card p-6">
              <Text className="mb-3 text-center text-white/60">
                {customError}
              </Text>
              <Pressable
                onPress={fetchCustom}
                className="items-center rounded-xl bg-primary/15 py-2.5"
              >
                <Text className="text-sm font-medium text-white">
                  다시 시도
                </Text>
              </Pressable>
            </View>
          ) : customExercises.length === 0 ? (
            <View className="rounded-2xl bg-card p-6">
              <View className="flex-row items-start gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                  <Dumbbell size={22} color={COLORS.primary} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-white">
                    커스텀 종목이 없어요
                  </Text>
                  <Text className="text-sm leading-5 text-white/50">
                    {"기본 종목에 없는 운동을\n직접 추가해보세요!"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {customGrouped.map((section) => (
                <View key={section.part}>
                  <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                    {section.part}
                  </Text>
                  <View className="rounded-2xl bg-card">
                    {section.items.map((exercise, index) => (
                      <View key={exercise.id}>
                        {index > 0 && <View className="mx-5 h-px bg-white/5" />}
                        <View className="flex-row items-center px-5 py-2.5">
                          <View className="flex-1">
                            <Text className="text-base font-medium text-white">
                              {exercise.name}
                            </Text>
                            {exercise.partDetail ? (
                              <Text className="mt-0.5 text-sm text-white/40">
                                {exercise.partDetail}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable
                            onPress={() =>
                              Alert.alert(exercise.name, undefined, [
                                { text: "취소", style: "cancel" },
                                {
                                  text: "수정",
                                  onPress: () => openEdit(exercise),
                                },
                                {
                                  text: "삭제",
                                  style: "destructive",
                                  onPress: () => handleDelete(exercise),
                                },
                              ])
                            }
                            className="h-9 w-9 items-center justify-center rounded-xl"
                          >
                            <EllipsisVertical
                              size={16}
                              color={COLORS.mutedForeground}
                            />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* 추가/수정 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={closeModal}
        >
          <Pressable
            onPress={() => {}}
            className="mx-6 w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: COLORS.card }}
          >
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                {editingId !== null ? "종목 수정" : "커스텀 종목 추가"}
              </Text>
              <Pressable
                onPress={closeModal}
                className="rounded-lg p-1 active:bg-white/5"
              >
                <X size={20} color={COLORS.mutedForeground} />
              </Pressable>
            </View>

            <Text className="mb-2 text-sm font-medium text-white/60">
              종목 이름
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              placeholder="예: 케이블 크로스오버"
              placeholderTextColor={COLORS.placeholder}
              className="mb-4 rounded-xl bg-white/5 px-4 py-3 text-base text-white"
            />

            <Text className="mb-2 text-sm font-medium text-white/60">
              운동 부위
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 max-h-10"
              contentContainerStyle={{ gap: 6 }}
            >
              {BODY_PARTS.map((bp) => (
                <Pressable
                  key={bp}
                  onPress={() => setForm((f) => ({ ...f, bodyPart: bp }))}
                  className="rounded-full px-3.5 py-2"
                  style={{
                    backgroundColor:
                      form.bodyPart === bp
                        ? COLORS.primary
                        : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color:
                        form.bodyPart === bp
                          ? COLORS.white
                          : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {bp}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="mb-2 text-sm font-medium text-white/60">
              세부 부위 (선택)
            </Text>
            <TextInput
              value={form.partDetail}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, partDetail: text }))
              }
              placeholder="예: 전면 어깨, 이두, 힙 등"
              placeholderTextColor={COLORS.placeholder}
              className="mb-6 rounded-xl bg-white/5 px-4 py-3 text-base text-white"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="items-center rounded-xl py-3.5 active:opacity-80"
              style={{
                backgroundColor: form.name.trim()
                  ? COLORS.primary
                  : "rgba(255,255,255,0.05)",
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: form.name.trim()
                      ? COLORS.white
                      : "rgba(255,255,255,0.3)",
                  }}
                >
                  {editingId !== null ? "수정 완료" : "추가하기"}
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
