import { inquiryApi } from "@/lib/api/inquiry";
import { COLORS } from "@/lib/constants";
import type { InquiryCategory } from "@/lib/types/inquiry";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types/inquiry";
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
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES: InquiryCategory[] = ["BUG", "SUGGESTION", "QUESTION"];

export default function InquiryNewScreen() {
  const router = useRouter();

  const [category, setCategory] = useState<InquiryCategory>("QUESTION");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && content.trim() && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await inquiryApi.createInquiry({
        category,
        title: title.trim(),
        content: content.trim(),
      });
      router.back();
    } catch (err) {
      Alert.alert("오류", err instanceof Error ? err.message : "문의 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
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
          <Text className="text-2xl font-bold text-white">문의 작성</Text>
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className="rounded-lg px-4 py-2 active:opacity-80"
          style={{
            backgroundColor: canSubmit ? COLORS.primary : "rgba(255,255,255,0.05)",
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text
              className="text-sm font-semibold"
              style={{ color: canSubmit ? COLORS.white : "rgba(255,255,255,0.3)" }}
            >
              등록
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5">
          {/* 카테고리 */}
          <Text className="mb-2 text-sm font-medium text-white/60">문의 유형</Text>
          <View className="mb-5 flex-row gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: category === cat ? COLORS.primary : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: category === cat ? COLORS.white : "rgba(255,255,255,0.6)",
                  }}
                >
                  {INQUIRY_CATEGORY_LABEL[cat]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 제목 */}
          <Text className="mb-2 text-sm font-medium text-white/60">제목</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="문의 제목을 입력해주세요"
            placeholderTextColor={COLORS.placeholder}
            maxLength={200}
            className="mb-5 rounded-xl bg-card px-4 py-3 text-base text-white"
          />

          {/* 내용 */}
          <Text className="mb-2 text-sm font-medium text-white/60">내용</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="문의 내용을 자세히 적어주세요"
            placeholderTextColor={COLORS.placeholder}
            multiline
            textAlignVertical="top"
            className="min-h-[200px] rounded-xl bg-card px-4 py-3 text-base text-white"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
