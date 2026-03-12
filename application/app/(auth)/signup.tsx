import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api/auth";
import { COLORS } from "@/lib/constants";
import { MARKETING_CONSENT } from "@/lib/constants/terms";
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
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking } from "react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TERMS_URLS = {
  terms: "https://prolog.jooky.site/terms",
  privacy: "https://prolog.jooky.site/privacy",
} as const;

const STEP_LABELS: Record<number, string> = {
  1: "약관에 동의하세요",
  2: "계정 정보를 입력하세요",
  3: "이메일을 인증하세요",
  4: "신체 정보를 입력하세요",
};

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [step1Data, setStep1Data] = useState<SignupStep1Values | null>(null);
  const [step3Data, setStep3Data] = useState<SignupStep3Values | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [error, setError] = useState("");

  const goToStep = (next: 1 | 2 | 3 | 4) => {
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
              {STEP_LABELS[step]}
            </Text>
            <View className="flex-row justify-center gap-2 pt-2">
              {([1, 2, 3, 4] as const).map((s) => (
                <View
                  key={s}
                  className={`h-1 w-8 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </View>
          </View>

          {error ? (
            <Text className="text-center text-sm text-red-400">{error}</Text>
          ) : null}

          {step === 1 ? (
            <TermsStep
              onNext={(mc) => {
                setMarketingConsent(mc);
                goToStep(2);
              }}
            />
          ) : step === 2 ? (
            <Step1Form
              defaultValues={step1Data ?? undefined}
              onBack={() => goToStep(1)}
              onNext={(data) => {
                setStep1Data(data);
                goToStep(3);
              }}
            />
          ) : step === 3 ? (
            <Step2Form
              email={step1Data!.email}
              isVerified={isEmailVerified}
              onBack={() => {
                setIsEmailVerified(false);
                goToStep(2);
              }}
              onNext={() => {
                setIsEmailVerified(true);
                goToStep(4);
              }}
            />
          ) : (
            <Step3Form
              defaultValues={step3Data ?? undefined}
              onBack={() => goToStep(3)}
              onSubmit={async (data) => {
                setStep3Data(data);
                try {
                  const req: SignupRequest = {
                    ...step1Data!,
                    ...data,
                    marketingConsent,
                  };
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

type TermsModalContent = "terms" | "privacy" | "marketing" | null;

function TermsStep({ onNext }: { onNext: (marketingConsent: boolean) => void }) {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [viewing, setViewing] = useState<TermsModalContent>(null);

  const allRequired = termsAgreed && privacyAgreed;
  const allChecked = allRequired && marketingAgreed;

  const toggleAll = () => {
    const next = !allChecked;
    setTermsAgreed(next);
    setPrivacyAgreed(next);
    setMarketingAgreed(next);
  };

  const modalContent: Record<NonNullable<TermsModalContent>, { title: string; body: string }> = {
    terms: { title: "서비스 이용약관", body: "" },
    privacy: { title: "개인정보 처리방침", body: "" },
    marketing: { title: "마케팅 수신 동의", body: MARKETING_CONSENT },
  };

  const handleView = (type: NonNullable<TermsModalContent>) => {
    if (type === "terms") {
      Linking.openURL(TERMS_URLS.terms);
    } else if (type === "privacy") {
      Linking.openURL(TERMS_URLS.privacy);
    } else {
      setViewing(type);
    }
  };

  return (
    <View className="gap-4">
      {/* 전체 동의 */}
      <Pressable
        onPress={toggleAll}
        className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4"
      >
        {allChecked ? (
          <CheckCircle2 size={22} color={COLORS.primary} />
        ) : (
          <Circle size={22} color={COLORS.mutedForeground} />
        )}
        <Text className="text-base font-semibold text-white">전체 동의</Text>
      </Pressable>

      <View className="gap-3">
        {/* 서비스 이용약관 */}
        <TermsRow
          label="서비스 이용약관 동의"
          required
          checked={termsAgreed}
          onToggle={() => setTermsAgreed((v) => !v)}
          onView={() => handleView("terms")}
        />
        <TermsRow
          label="개인정보 처리방침 동의"
          required
          checked={privacyAgreed}
          onToggle={() => setPrivacyAgreed((v) => !v)}
          onView={() => handleView("privacy")}
        />
        <TermsRow
          label="마케팅 수신 동의"
          required={false}
          checked={marketingAgreed}
          onToggle={() => setMarketingAgreed((v) => !v)}
          onView={() => handleView("marketing")}
        />
      </View>

      <Button
        onPress={() => onNext(marketingAgreed)}
        disabled={!allRequired}
        className="w-full"
      >
        다음
      </Button>

      {/* 약관 내용 모달 */}
      <Modal
        visible={viewing !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewing(null)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="text-base font-semibold text-white">
              {viewing ? modalContent[viewing].title : ""}
            </Text>
            <TouchableOpacity onPress={() => setViewing(null)}>
              <Text className="text-primary">닫기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-4 py-4">
            <Text className="text-sm leading-6 text-muted-foreground">
              {viewing ? modalContent[viewing].body : ""}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function TermsRow({
  label,
  required,
  checked,
  onToggle,
  onView,
}: {
  label: string;
  required: boolean;
  checked: boolean;
  onToggle: () => void;
  onView: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable onPress={onToggle} className="flex-1 flex-row items-center gap-2">
        {checked ? (
          <CheckCircle2 size={20} color={COLORS.primary} />
        ) : (
          <Circle size={20} color={COLORS.mutedForeground} />
        )}
        <Text className="text-sm text-muted-foreground">
          {label}{" "}
          <Text className={required ? "text-primary" : "text-muted-foreground"}>
            ({required ? "필수" : "선택"})
          </Text>
        </Text>
      </Pressable>
      <TouchableOpacity onPress={onView}>
        <Text className="text-xs text-muted-foreground underline">보기</Text>
      </TouchableOpacity>
    </View>
  );
}

function Step1Form({
  defaultValues,
  onBack,
  onNext,
}: {
  defaultValues?: SignupStep1Values;
  onBack: () => void;
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
          {isSubmitting ? "확인 중..." : "다음"}
        </Button>
      </View>
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
