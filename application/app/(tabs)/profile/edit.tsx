import { useAuth } from "@/contexts/auth-context";
import { userApi } from "@/lib/api/user";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type { Gender } from "@/lib/types/auth";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
  { value: "UNKNOWN", label: "미설정" },
];

export default function ProfileEditScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [gender, setGender] = useState<Gender>(user?.gender ?? "UNKNOWN");
  const [birthYear, setBirthYear] = useState(user?.birthYear?.toString() ?? "");
  const [height, setHeight] = useState(user?.height?.toString() ?? "");
  const [weight, setWeight] = useState(user?.weight?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임을 입력해주세요.");
      return;
    }

    const by = Number(birthYear);
    const h = Number(height);
    const w = Number(weight);
    const currentYear = new Date().getFullYear();

    if (!by || by < 1930 || by > currentYear - 10) {
      Alert.alert("알림", "올바른 출생연도를 입력해주세요.");
      return;
    }
    if (!h || h <= 0) {
      Alert.alert("알림", "올바른 키를 입력해주세요.");
      return;
    }
    if (!w || w <= 0) {
      Alert.alert("알림", "올바른 체중을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        nickname: nickname.trim(),
        gender,
        birthYear: by,
        height: h,
        weight: w,
      });
      updateUser(updated);
      router.back();
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : "저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ChevronLeft size={24} color={COLORS.white} />
        </Pressable>
        <Text className="text-lg font-bold text-white">프로필 수정</Text>
        <Pressable onPress={handleSave} disabled={saving} className="p-1">
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text className="text-base font-medium text-primary">저장</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Nickname */}
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium text-white/60">
              닉네임
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="닉네임"
              placeholderTextColor={COLORS.placeholder}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
          </View>

          {/* Gender */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">성별</Text>
            <View className="flex-row gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setGender(opt.value)}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    gender === opt.value ? "bg-primary" : "bg-card"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      gender === opt.value ? "text-white" : "text-white/50"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Birth Year */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">
              출생연도
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="1990"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              maxLength={4}
              value={birthYear}
              onChangeText={setBirthYear}
            />
          </View>

          {/* Height */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">
              키 (cm)
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>

          {/* Weight */}
          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium text-white/60">
              체중 (kg)
            </Text>
            <TextInput
              className="rounded-xl bg-card px-4 py-3.5 text-base text-white"
              placeholder="0"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
