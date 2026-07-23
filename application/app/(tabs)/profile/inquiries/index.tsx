import { inquiryApi } from "@/lib/api/inquiry";
import { COLORS, TAB_BAR_HEIGHT } from "@/lib/constants";
import type { InquiryResponse } from "@/lib/types/inquiry";
import { INQUIRY_CATEGORY_LABEL } from "@/lib/types/inquiry";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function InquiryListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inquiryApi.getMyInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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
          <Text className="text-2xl font-bold text-white">문의하기</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/profile/inquiries/new")}
          className="h-10 w-10 items-center justify-center"
        >
          <Plus size={20} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16,
        }}
      >
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : error ? (
          <View className="rounded-2xl bg-card p-6">
            <Text className="mb-3 text-center text-white/60">{error}</Text>
            <Pressable onPress={fetch} className="items-center rounded-xl bg-primary/15 py-2.5">
              <Text className="text-sm font-medium text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : inquiries.length === 0 ? (
          <View className="items-center py-20">
            <Text className="mb-2 text-base text-white/40">문의 내역이 없습니다</Text>
            <Text className="text-sm text-white/25">
              오른쪽 상단 + 버튼으로 문의를 작성해보세요
            </Text>
          </View>
        ) : (
          <View className="rounded-2xl bg-card">
            {inquiries.map((inquiry, index) => (
              <View key={inquiry.id}>
                {index > 0 && <View className="mx-5 h-px bg-white/5" />}
                <Pressable
                  onPress={() => router.push(`/(tabs)/profile/inquiries/${inquiry.id}`)}
                  className="flex-row items-center px-5 py-4 active:opacity-70"
                >
                  <View className="flex-1">
                    <View className="mb-1 flex-row items-center gap-2">
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
                    <Text className="text-base text-white" numberOfLines={1}>
                      {inquiry.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-white/30">
                      {formatDate(inquiry.createdAt)}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.iconMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
