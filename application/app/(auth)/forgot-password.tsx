import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { authApi } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
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

const schema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    authApi.requestPasswordReset({ email: data.email }).catch(() => {});
    router.push({
      pathname: "/(auth)/reset-password",
      params: { email: data.email },
    });
  };

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
            <Text className="text-2xl font-bold text-white">비밀번호 찾기</Text>
            <Text className="text-sm text-muted-foreground">
              가입 시 사용한 이메일로 인증 코드를 보내드립니다.
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Label>이메일</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="이메일을 입력하세요"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-xs text-red-400">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <Button onPress={handleSubmit(onSubmit)} className="w-full">
              인증 코드 전송
            </Button>
          </View>

          <TouchableOpacity onPress={() => router.back()} className="items-center">
            <Text className="text-sm text-muted-foreground">로그인으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
