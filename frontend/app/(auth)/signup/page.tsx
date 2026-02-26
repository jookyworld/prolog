"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import type { SignupRequest } from "@/lib/types/auth";
import {
  signupStep1Schema,
  signupStep2Schema,
  type SignupStep1Values,
  type SignupStep2Values,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Values | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="text-white/50 text-sm">
          {step === 1 ? "계정 정보를 입력하세요" : "신체 정보를 입력하세요"}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <div
            className={`h-1 w-12 rounded-full ${step >= 1 ? "bg-[#3182F6]" : "bg-white/10"}`}
          />
          <div
            className={`h-1 w-12 rounded-full ${step >= 2 ? "bg-[#3182F6]" : "bg-white/10"}`}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {step === 1 ? (
        <Step1Form
          onNext={(data) => {
            setStep1Data(data);
            setStep(2);
          }}
        />
      ) : (
        <Step2Form
          onBack={() => setStep(1)}
          onSubmit={async (data) => {
            setError("");
            try {
              const req: SignupRequest = { ...step1Data!, ...data };
              await signup(req);
              router.replace("/");
            } catch {
              setError("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
          }}
        />
      )}

      <p className="text-center text-sm text-white/50">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-[#3182F6] hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

function Step1Form({ onNext }: { onNext: (data: SignupStep1Values) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">아이디</Label>
        <Input
          id="username"
          placeholder="4자 이상"
          className="bg-[#17171C] border-white/10"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-red-400 text-xs">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="8자 이상"
          className="bg-[#17171C] border-white/10"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          className="bg-[#17171C] border-white/10"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          placeholder="2~10자"
          className="bg-[#17171C] border-white/10"
          {...register("nickname")}
        />
        {errors.nickname && (
          <p className="text-red-400 text-xs">{errors.nickname.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#3182F6] hover:bg-[#2272EB] text-white h-12 rounded-xl"
      >
        다음
      </Button>
    </form>
  );
}

function Step2Form({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (data: SignupStep2Values) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
  });

  const gender = watch("gender");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>성별</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["MALE", "FEMALE"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setValue("gender", g, { shouldValidate: true })}
              className={`h-12 rounded-xl border text-sm font-medium transition-colors ${
                gender === g
                  ? "bg-[#3182F6] border-[#3182F6] text-white"
                  : "bg-[#17171C] border-white/10 text-white/60 hover:border-white/20"
              }`}
            >
              {g === "MALE" ? "남성" : "여성"}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-red-400 text-xs">{errors.gender.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="height">키 (cm)</Label>
        <Input
          id="height"
          type="number"
          placeholder="170"
          className="bg-[#17171C] border-white/10"
          {...register("height")}
        />
        {errors.height && (
          <p className="text-red-400 text-xs">{errors.height.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">체중 (kg)</Label>
        <Input
          id="weight"
          type="number"
          placeholder="70"
          className="bg-[#17171C] border-white/10"
          {...register("weight")}
        />
        {errors.weight && (
          <p className="text-red-400 text-xs">{errors.weight.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-12 rounded-xl border-white/10 bg-transparent hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#3182F6] hover:bg-[#2272EB] text-white h-12 rounded-xl"
        >
          {isSubmitting ? "가입 중..." : "가입 완료"}
        </Button>
      </div>
    </form>
  );
}
