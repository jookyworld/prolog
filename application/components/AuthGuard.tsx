import { useAuth } from "@/contexts/auth-context";
import { COLORS } from "@/lib/constants";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";

const MIN_SPLASH_MS = 2000;

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [showSplash, setShowSplash] = useState(true);
  const splashStart = useRef(Date.now());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 페이드인 애니메이션
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 로딩 완료 후 최소 시간 보장
  useEffect(() => {
    if (isLoading) return;

    const elapsed = Date.now() - splashStart.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    const timer = setTimeout(() => setShowSplash(false), remaining);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // 라우팅
  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, showSplash, segments, router]);

  if (showSplash) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            opacity: fadeAnim,
          }}
        >
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 32 }}
          />
          <Animated.Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            {"어제의 나를 넘어서는\n진정한 "}
            <Animated.Text style={{ color: COLORS.primary, fontWeight: "700" }}>
              상급노하우
            </Animated.Text>
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  return <>{children}</>;
}
