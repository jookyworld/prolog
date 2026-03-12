import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const schema = z
  .object({
    code: z.string().length(6, "인증 코드는 6자리입니다."),
    newPassword: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(30),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onResend = async () => {
    setResendMessage("");
    setError("");
    try {
      await authApi.requestPasswordReset({ email });
      setResendMessage("인증 코드를 재전송했습니다.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setResendMessage("잠시 후 다시 시도해주세요. (10분에 최대 3회)");
      } else {
        setResendMessage("전송 중 오류가 발생했습니다.");
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    setError("");
    try {
      await authApi.confirmPasswordReset({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setError("입력 횟수를 초과했습니다. 코드를 재전송해주세요.");
      } else {
        setError("인증 코드가 올바르지 않거나 만료되었습니다.");
      }
    }
  };

  if (done) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6 gap-6">
        <Text className="text-2xl font-bold text-white">비밀번호 변경 완료</Text>
        <Text className="text-sm text-muted-foreground text-center">
          새 비밀번호로 로그인해주세요.
        </Text>
        <Button className="w-full" onPress={() => router.replace("/(auth)/login")}>
          로그인하기
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="flex-1 bg-background px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-8">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-white">새 비밀번호 설정</Text>
            <Text className="text-sm text-muted-foreground">
              {email}로 전송된 인증 코드를 입력해주세요.
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Label>인증 코드</Label>
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="6자리 코드"
                    keyboardType="number-pad"
                    maxLength={6}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.code && (
                <Text className="text-xs text-red-400">{errors.code.message}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>새 비밀번호</Label>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="8자 이상"
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.newPassword && (
                <Text className="text-xs text-red-400">{errors.newPassword.message}</Text>
              )}
            </View>

            <View className="gap-2">
              <Label>새 비밀번호 확인</Label>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="비밀번호를 다시 입력하세요"
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-xs text-red-400">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {error ? (
              <Text className="text-center text-sm text-red-400">{error}</Text>
            ) : null}

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </View>

          <View className="items-center gap-2">
            {resendMessage ? (
              <Text className="text-xs text-muted-foreground">{resendMessage}</Text>
            ) : null}
            <TouchableOpacity onPress={onResend}>
              <Text className="text-sm text-muted-foreground">
                코드를 받지 못하셨나요? <Text className="text-primary">재전송</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm text-muted-foreground">이전으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
