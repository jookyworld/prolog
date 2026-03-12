import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api/auth";
import { COLORS } from "@/lib/constants";
import type { SignupRequest } from "@/lib/types/auth";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  type SignupStep1Values,
  type SignupStep2Values,
  type SignupStep3Values,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Values | null>(null);
  const [step3Data, setStep3Data] = useState<SignupStep3Values | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [error, setError] = useState("");

  const goToStep = (next: 1 | 2 | 3) => {
    setError("");
    setStep(next);
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
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-white">회원가입</Text>
            <Text className="text-sm text-muted-foreground">
              {step === 1 ? "계정 정보를 입력하세요" : step === 2 ? "이메일을 인증하세요" : "신체 정보를 입력하세요"}
            </Text>
            <View className="flex-row justify-center gap-2 pt-2">
              {([1, 2, 3] as const).map((s) => (
                <View
                  key={s}
                  className={`h-1 w-12 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </View>
          </View>

          {error ? (
            <Text className="text-center text-sm text-red-400">{error}</Text>
          ) : null}

          {step === 1 ? (
            <Step1Form
              defaultValues={step1Data ?? undefined}
              onNext={(data) => {
                setStep1Data(data);
                goToStep(2);
              }}
            />
          ) : step === 2 ? (
            <Step2Form
              email={step1Data!.email}
              isVerified={isEmailVerified}
              onBack={() => {
                setIsEmailVerified(false);
                goToStep(1);
              }}
              onNext={() => {
                setIsEmailVerified(true);
                goToStep(3);
              }}
            />
          ) : (
            <Step3Form
              defaultValues={step3Data ?? undefined}
              onBack={() => goToStep(2)}
              onSubmit={async (data) => {
                setStep3Data(data);
                try {
                  const req: SignupRequest = { ...step1Data!, ...data };
                  await signup(req);
                  router.replace("/(tabs)");
                } catch {
                  setError("회원가입에 실패했습니다. 다시 시도해주세요.");
                }
              }}
            />
          )}

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-sm text-primary">로그인</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Step1Form({
  defaultValues,
  onNext,
}: {
  defaultValues?: SignupStep1Values;
  onNext: (data: SignupStep1Values) => void;
}) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues,
  });

  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data: SignupStep1Values) => {
    setSubmitError("");
    try {
      const result = await authApi.checkDuplicates({
        username: data.username,
        email: data.email,
        nickname: data.nickname,
      });
      let hasDuplicate = false;
      if (!result.usernameAvailable) {
        setError("username", { message: "이미 사용 중인 아이디입니다." });
        hasDuplicate = true;
      }
      if (!result.emailAvailable) {
        setError("email", { message: "이미 사용 중인 이메일입니다." });
        hasDuplicate = true;
      }
      if (!result.nicknameAvailable) {
        setError("nickname", { message: "이미 사용 중인 닉네임입니다." });
        hasDuplicate = true;
      }
      if (!hasDuplicate) {
        onNext(data);
      }
    } catch {
      setSubmitError("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>아이디</Label>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="5자 이상"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.username && (
          <Text className="text-xs text-red-400">{errors.username.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>비밀번호</Label>
        <Controller
          control={control}
          name="password"
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
        {errors.password && (
          <Text className="text-xs text-red-400">{errors.password.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>이메일</Label>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="example@email.com"
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
          <Text className="text-xs text-red-400">{errors.email.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>닉네임</Label>
        <Controller
          control={control}
          name="nickname"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="4~30자"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.nickname && (
          <Text className="text-xs text-red-400">{errors.nickname.message}</Text>
        )}
      </View>

      {submitError ? (
        <Text className="text-center text-sm text-red-400">{submitError}</Text>
      ) : null}

      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "확인 중..." : "다음"}
      </Button>
    </View>
  );
}

function Step2Form({
  email,
  isVerified,
  onBack,
  onNext,
}: {
  email: string;
  isVerified: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
  });

  const handleSend = async () => {
    setIsSending(true);
    setSendError("");
    try {
      await authApi.sendEmailVerification({ email });
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setSendError("잠시 후 다시 시도해주세요. (10분에 최대 3회)");
      } else if (e instanceof ApiError && e.status === 400) {
        setSendError(e.message);
      } else {
        setSendError("전송 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendMessage("");
    try {
      await authApi.sendEmailVerification({ email });
      setResendMessage("인증 코드를 재전송했습니다.");
      setValue("code", "");
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setResendMessage("잠시 후 다시 시도해주세요. (10분에 최대 3회)");
      } else {
        setResendMessage("전송 중 오류가 발생했습니다.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const [verifyError, setVerifyError] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const onSubmit = async (data: SignupStep2Values) => {
    setVerifyError("");
    try {
      await authApi.confirmEmailVerification({ email, code: data.code });
      onNext();
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setVerifyError("입력 횟수를 초과했습니다. 코드를 재전송해주세요.");
        setIsLocked(true);
      } else {
        setVerifyError("인증 코드가 올바르지 않거나 만료되었습니다.");
      }
    }
  };

  if (isVerified) {
    return (
      <View className="gap-4">
        <Text className="text-sm text-muted-foreground">
          {email} 인증이 완료되었습니다.
        </Text>
        <Button className="w-full" onPress={onNext}>
          다음
        </Button>
        <Button variant="outline" className="w-full" onPress={onBack}>
          이전으로
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted-foreground">
        {email}로 인증 코드를 전송합니다.
      </Text>

      {!sent ? (
        <>
          {sendError ? (
            <Text className="text-center text-sm text-red-400">{sendError}</Text>
          ) : null}
          <Button
            onPress={handleSend}
            loading={isSending}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? "전송 중..." : "인증 코드 전송"}
          </Button>
          <Button variant="outline" onPress={onBack} className="w-full">
            이전으로
          </Button>
        </>
      ) : (
        <>
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
                  editable={!isLocked}
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

          {verifyError ? (
            <Text className="text-center text-sm text-red-400">{verifyError}</Text>
          ) : null}

          <View className="flex-row gap-3">
            <Button variant="outline" size="icon" onPress={onBack}>
              <ArrowLeft size={16} color={COLORS.white} />
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || isLocked}
              className="flex-1"
            >
              {isSubmitting ? "확인 중..." : "인증 완료"}
            </Button>
          </View>

          <View className="items-center gap-2">
            {resendMessage ? (
              <Text className="text-xs text-muted-foreground">{resendMessage}</Text>
            ) : null}
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text className="text-sm text-muted-foreground">
                코드를 받지 못하셨나요?{" "}
                <Text className="text-primary">
                  {isResending ? "전송 중..." : "재전송"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function Step3Form({
  defaultValues,
  onBack,
  onSubmit,
}: {
  defaultValues?: SignupStep3Values;
  onBack: () => void;
  onSubmit: (data: SignupStep3Values) => Promise<void>;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupStep3Values>({
    resolver: zodResolver(signupStep3Schema),
    defaultValues,
  });

  const gender = watch("gender");

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>성별</Label>
        <View className="flex-row gap-3">
          {(["MALE", "FEMALE"] as const).map((g) => (
            <Pressable
              key={g}
              onPress={() => setValue("gender", g, { shouldValidate: true })}
              className={`h-12 flex-1 items-center justify-center rounded-xl border ${
                gender === g
                  ? "border-primary bg-primary"
                  : "border-border bg-card"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  gender === g ? "text-white" : "text-muted-foreground"
                }`}
              >
                {g === "MALE" ? "남성" : "여성"}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.gender && (
          <Text className="text-xs text-red-400">{errors.gender.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>키 (cm)</Label>
        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="170"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = Number(text);
                onChange(text === "" ? undefined : num);
              }}
              value={value != null ? String(value) : ""}
            />
          )}
        />
        {errors.height && (
          <Text className="text-xs text-red-400">{errors.height.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Label>체중 (kg)</Label>
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="70"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = Number(text);
                onChange(text === "" ? undefined : num);
              }}
              value={value != null ? String(value) : ""}
            />
          )}
        />
        {errors.weight && (
          <Text className="text-xs text-red-400">{errors.weight.message}</Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <Button variant="outline" size="icon" onPress={onBack}>
          <ArrowLeft size={16} color={COLORS.white} />
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "가입 중..." : "가입 완료"}
        </Button>
      </View>
    </View>
  );
}
