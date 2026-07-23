import { inquiryApi } from "@/lib/api/inquiry";
import { COLORS } from "@/lib/constants";
import type { InquiryResponse } from "@/lib/types/inquiry";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types/inquiry";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InquiryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryApi.getMyInquiry(Number(id));
      setInquiry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleDelete = () => {
    Alert.alert("문의 삭제", "이 문의를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await inquiryApi.deleteInquiry(Number(id));
            router.back();
          } catch (err) {
            Alert.alert("오류", err instanceof Error ? err.message : "삭제에 실패했습니다.");
          }
        },
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
          <Text className="text-2xl font-bold text-white">문의 상세</Text>
        </View>
        <Pressable onPress={handleDelete} className="h-10 w-10 items-center justify-center">
          <Trash2 size={18} color={COLORS.destructive} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : error ? (
        <View className="mx-5 rounded-2xl bg-card p-6">
          <Text className="mb-3 text-center text-white/60">{error}</Text>
          <Pressable onPress={fetch} className="items-center rounded-xl bg-primary/15 py-2.5">
            <Text className="text-sm font-medium text-white">다시 시도</Text>
          </Pressable>
        </View>
      ) : inquiry ? (
        <ScrollView className="flex-1 px-5">
          {/* 문의 내용 */}
          <View className="rounded-2xl bg-card p-5">
            <View className="mb-3 flex-row items-center gap-2">
              <View
                className="rounded px-1.5 py-0.5"
                style={{
                  backgroundColor: inquiry.answer
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  className="text-[10px] font-medium"
                  style={{
                    color: inquiry.answer ? "rgba(34,197,94,0.9)" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {inquiry.answer ? "답변완료" : "대기중"}
                </Text>
              </View>
              <Text className="text-[11px] text-white/25">
                {INQUIRY_CATEGORY_LABEL[inquiry.category]}
              </Text>
            </View>

            <Text className="mb-1 text-lg font-bold text-white">{inquiry.title}</Text>
            <Text className="mb-4 text-xs text-white/30">{formatDate(inquiry.createdAt)}</Text>
            <Text className="text-base leading-6 text-white/80">{inquiry.content}</Text>
          </View>

          {/* 답변 */}
          {inquiry.answer && (
            <View className="mt-3 rounded-2xl bg-card p-5">
              <View className="mb-3 flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Text className="text-[10px] font-bold text-primary">A</Text>
                </View>
                <Text className="text-sm font-semibold text-white">운영진 답변</Text>
                {inquiry.answeredAt && (
                  <Text className="text-[11px] text-white/25">
                    {formatDate(inquiry.answeredAt)}
                  </Text>
                )}
              </View>
              <Text className="text-base leading-6 text-white/80">{inquiry.answer}</Text>
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
