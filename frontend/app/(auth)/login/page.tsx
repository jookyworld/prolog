"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      await login(data);
      router.replace("/");
    } catch {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ProLog</h1>
        <p className="text-white/50 text-sm">운동을 기록하고 성장하세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">아이디</Label>
          <Input
            id="username"
            placeholder="아이디를 입력하세요"
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
            placeholder="비밀번호를 입력하세요"
            className="bg-[#17171C] border-white/10"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#3182F6] hover:bg-[#2272EB] text-white h-12 rounded-xl"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-[#3182F6] hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
