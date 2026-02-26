"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { logout, deleteAccount } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      <header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl">
        <div className="h-14 px-6 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">설정</h1>
        </div>
      </header>

      <div className="px-6 space-y-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 h-14 bg-[#17171C] rounded-2xl hover:bg-[#1F1F24] text-white"
        >
          <LogOut className="w-5 h-5 text-white/60" />
          로그아웃
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-14 bg-[#17171C] rounded-2xl hover:bg-[#1F1F24] text-red-400"
            >
              <Trash2 className="w-5 h-5" />
              회원 탈퇴
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#17171C] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                모든 운동 기록과 데이터가 영구적으로 삭제됩니다. 이 작업은
                되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                탈퇴하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
