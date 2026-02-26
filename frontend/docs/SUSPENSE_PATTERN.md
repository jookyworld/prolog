# Next.js App Router - Suspense 패턴 가이드

## 문제 상황
Next.js App Router에서 `useSearchParams()`를 사용하는 클라이언트 컴포넌트는 빌드 시 다음 에러가 발생할 수 있습니다:
```
Error: useSearchParams() should be wrapped in a suspense boundary
```

이는 App Router가 정적 렌더링을 시도할 때 동적 함수(`useSearchParams`)가 suspense boundary 없이 사용되어 발생합니다.

## 해결 방법: Suspense Boundary 패턴

### 패턴 1: 단일 파일 내 컴포넌트 분리 (권장)

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ✅ 실제 로직을 담당하는 내부 컴포넌트
function MyPageContent() {
  const searchParams = useSearchParams(); // 여기서 사용
  const param = searchParams.get("id");

  return (
    <div>
      {/* 기존 모든 로직 */}
    </div>
  );
}

// ✅ Suspense로 감싼 진입점 (export default)
export default function MyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101012] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60 text-sm">로딩 중...</p>
          </div>
        </div>
      }
    >
      <MyPageContent />
    </Suspense>
  );
}
```

### 패턴 2: 별도 파일로 분리

**page.tsx** (진입점)
```tsx
import { Suspense } from "react";
import MyPageContent from "./MyPageContent";

export default function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageContent />
    </Suspense>
  );
}
```

**MyPageContent.tsx** (실제 로직)
```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function MyPageContent() {
  const searchParams = useSearchParams();
  // ... 로직
}
```

### 패턴 3: HOC 스타일 래퍼 (재사용 시)

```tsx
// lib/with-suspense.tsx
import { Suspense, ComponentType } from "react";

export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className="min-h-screen bg-[#101012] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin"></div>
            </div>
          )
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// 사용 예
"use client";

import { useSearchParams } from "next/navigation";
import { withSuspense } from "@/lib/with-suspense";

function MyPageContent() {
  const searchParams = useSearchParams();
  // ...
}

export default withSuspense(MyPageContent);
```

## 적용된 페이지들

이 프로젝트에서 이미 적용된 페이지:

1. ✅ `/app/exercise/custom/page.tsx`
2. ✅ `/app/exercise/page.tsx`
3. ✅ `/app/workout/planned/page.tsx`

## 주의사항

### ❌ 하면 안 되는 것
```tsx
"use client";

export default function MyPage() {
  const searchParams = useSearchParams(); // ❌ Suspense 없이 직접 사용
  // ...
}
```

### ✅ 해야 하는 것
```tsx
"use client";

function MyPageContent() {
  const searchParams = useSearchParams(); // ✅ 내부 컴포넌트에서 사용
  // ...
}

export default function MyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyPageContent />
    </Suspense>
  );
}
```

## Fallback UI 가이드

### 미니멀 로딩
```tsx
<Suspense fallback={<div className="min-h-screen bg-[#101012]" />}>
```

### 스피너 로딩
```tsx
<Suspense
  fallback={
    <div className="min-h-screen bg-[#101012] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#3182F6]/20 border-t-[#3182F6] rounded-full animate-spin"></div>
    </div>
  }
>
```

### 스켈레톤 로딩 (권장)
```tsx
<Suspense
  fallback={
    <div className="min-h-screen bg-[#101012]">
      <div className="h-14 bg-white/5 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-20 bg-white/5 rounded-3xl animate-pulse" />
        <div className="h-20 bg-white/5 rounded-3xl animate-pulse" />
      </div>
    </div>
  }
>
```

## 추가 고려사항

### 다른 동적 함수들도 동일하게 처리
```tsx
// 이런 함수들도 Suspense가 필요할 수 있습니다
useSearchParams()  // ✅ 이미 적용됨
cookies()
headers()
```

### 서버 컴포넌트에서는 불필요
```tsx
// app/my-page/page.tsx (서버 컴포넌트)
export default function MyPage({ searchParams }: { searchParams: { id: string } }) {
  // ✅ 서버 컴포넌트에서는 props로 받으므로 Suspense 불필요
  const id = searchParams.id;
}
```

## 빌드 확인
```bash
# 빌드 시 에러 확인
pnpm build

# 성공 시 출력 예시
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

## 참고 링크
- [Next.js Docs: useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Next.js Docs: Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
