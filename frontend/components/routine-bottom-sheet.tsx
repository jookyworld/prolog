"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Heart, Target, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface Routine {
  id: string;
  name: string;
  bodyPart: string;
  icon: typeof Dumbbell;
  exercises: number;
  duration: number;
}

interface RoutineBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoutine: (routineId: string) => void;
}

const routines: Routine[] = [
  {
    id: "1",
    name: "4분할 등/이두",
    bodyPart: "등, 이두",
    icon: Dumbbell,
    exercises: 8,
    duration: 65,
  },
  {
    id: "2",
    name: "가슴/삼두 집중",
    bodyPart: "가슴, 삼두",
    icon: Heart,
    exercises: 7,
    duration: 55,
  },
  {
    id: "3",
    name: "하체 킬러",
    bodyPart: "하체",
    icon: Zap,
    exercises: 6,
    duration: 70,
  },
  {
    id: "4",
    name: "어깨 루틴",
    bodyPart: "어깨",
    icon: Target,
    exercises: 6,
    duration: 50,
  },
];

export function RoutineBottomSheet({
  isOpen,
  onClose,
  onSelectRoutine,
}: RoutineBottomSheetProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#17171C] rounded-t-[32px] max-w-lg mx-auto"
            style={{ maxHeight: "85vh" }}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Content */}
            <div
              className="px-6 pb-8 overflow-y-auto"
              style={{ maxHeight: "calc(85vh - 32px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 mt-2">
                <h2 className="text-2xl font-bold text-white">
                  어떤 운동을 할까요?
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Routine List */}
              <div className="space-y-3 mb-6">
                {routines.map((routine) => {
                  const IconComponent = routine.icon;
                  return (
                    <div
                      key={routine.id}
                      className="bg-[#1E1E24] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#232329] transition-colors"
                    >
                      {/* Icon */}
                      <div className="bg-[#3182F6]/10 rounded-xl p-3 flex-shrink-0">
                        <IconComponent
                          className="w-6 h-6 text-[#3182F6]"
                          strokeWidth={2.5}
                        />
                      </div>

                      {/* Routine Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-0.5">
                          {routine.name}
                        </h3>
                        <p className="text-sm text-white/60">
                          {routine.exercises}개 운동 • 평균 {routine.duration}분
                        </p>
                      </div>

                      {/* Start Button */}
                      <Button
                        onClick={() => {
                          onSelectRoutine(routine.id);
                          router.push(
                            `/workout/planned?routineId=${routine.id}`
                          );
                        }}
                        className="bg-[#3182F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl px-6 h-10 flex-shrink-0"
                      >
                        시작
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Empty Log Button */}
              <Button
                onClick={() => {
                  onSelectRoutine("empty");
                  router.push("/exercise?from=free_start");
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-2xl h-14 border border-white/10"
              >
                빈 일지로 시작
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
