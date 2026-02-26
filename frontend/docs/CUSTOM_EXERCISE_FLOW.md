# 종목 선택 및 커스텀 종목 추가 - 독립 페이지 방식

## 📐 아키텍처 개요

종목 선택 기능을 **모달**에서 **독립적인 전체 화면 페이지**로 전환하여 상태 관리 이슈를 해결하고 더 시원한 UI를 제공합니다.

---

## 🔄 사용자 플로우

```
루틴 생성 페이지 (/routine/new)
    ↓
[종목 추가] 버튼 클릭
    ↓
종목 선택 페이지 (/routine/new/select-exercise)
    ↓
옵션 1: 종목 선택 후 [확인] 클릭
    ↓
    localStorage에 저장 → 루틴 생성 페이지로 복귀
    ↓
    루틴 생성 페이지에서 localStorage 확인 → 자동 추가

옵션 2: 검색 결과 없음 or "직접 추가하기" 버튼 클릭
    ↓
    커스텀 종목 페이지 (/routine/new/custom-exercise?name=검색어)
    ↓
    종목 이름 입력 후 [완료] 클릭
    ↓
    localStorage에 저장 → 루틴 생성 페이지로 복귀
    ↓
    루틴 생성 페이지에서 localStorage 확인 → 자동 추가
```

---

## 📁 파일 구조

### 1. `app/routine/new/page.tsx` (수정)

**역할:** 루틴 생성 페이지 - localStorage에서 선택된 종목 및 커스텀 종목 자동 추가

**주요 변경사항:**

- ❌ 제거: `isExerciseModalOpen` 상태
- ❌ 제거: `ExerciseSelectModal` import 및 컴포넌트
- ❌ 제거: `addExercisesFromModal` 함수
- ✅ 추가: `useRouter` import
- ✅ 추가: 종목 추가 버튼이 `/routine/new/select-exercise`로 라우팅
- ✅ 추가: localStorage 리스너 (선택된 종목 + 커스텀 종목 처리)

**새로운 동작:**

```tsx
// 종목 추가 버튼
<button onClick={() => router.push("/routine/new/select-exercise")}>
  종목 추가
</button>;

// localStorage 리스너
useEffect(() => {
  // 선택된 종목들 처리
  const selectedExercises = localStorage.getItem("selected_exercises");
  if (selectedExercises) {
    const exercises = JSON.parse(selectedExercises);
    // 루틴에 추가 후 localStorage 정리
  }

  // 커스텀 종목 처리
  const pendingCustomExercise = localStorage.getItem("pending_custom_exercise");
  if (pendingCustomExercise) {
    // 루틴에 추가 후 localStorage 정리
  }
}, []);
```

---

### 2. `app/routine/new/select-exercise/page.tsx` (신규)

**역할:** 독립적인 전체 화면 종목 선택 페이지

**레이아웃 규격:**

```tsx
<div className="fixed inset-0 z-[110] bg-[#101012] overflow-y-auto">
  {/* 하단 네비게이션 바를 가리는 전체 화면 */}
</div>
```

**헤더 규격 (Type B):**

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    <button>뒤로가기</button>
    <h1>종목 선택</h1>
    <button>확인 ({선택된 개수})</button>
  </div>
</header>
```

**주요 기능:**

1. **카테고리 필터 칩 (IMG_3830 참고)**

   ```tsx
   const BODY_PARTS = [
     "전체",
     "가슴",
     "등",
     "어깨",
     "하체",
     "팔",
     "코어",
     "유산소",
   ];
   ```

   - 수평 스크롤 가능한 칩 레이아웃
   - 선택된 부위는 `bg-[#3182F6]`로 하이라이트

2. **검색창**

   ```tsx
   <input
     placeholder="종목명으로 검색"
     className="bg-[#17171C] pl-12 pr-4 py-3.5"
   />
   ```

   - 자동 포커스
   - 실시간 필터링

3. **종목 리스트 - 다중 선택**

   ```tsx
   const [selectedExercises, setSelectedExercises] = useState<
     Map<string, Exercise>
   >(new Map());

   const toggleExercise = (exercise) => {
     // Map에 추가/제거
   };
   ```

   - 각 아이템 클릭 시 토글
   - 선택된 종목은 `border-[#3182F6]` + `bg-[#3182F6]/10`
   - 체크 아이콘 표시
   - framer-motion으로 scale 애니메이션

4. **검색 결과 없을 때**

   ```tsx
   {
     filteredExercises.length === 0 && (
       <div>
         <p>찾는 종목이 없으신가요?</p>
         <button onClick={goToCustomExercise}>커스텀 종목 추가하기</button>
       </div>
     );
   }
   ```

5. **리스트 하단 CTA**

   ```tsx
   <button onClick={goToCustomExercise}>
     찾는 종목이 없나요? 직접 추가하기
   </button>
   ```

6. **확인 버튼 - localStorage 저장**
   ```tsx
   const handleConfirm = () => {
     const exercises = Array.from(selectedExercises.values()).map((ex) => ({
       id: ex.id,
       name: ex.name,
     }));
     localStorage.setItem("selected_exercises", JSON.stringify(exercises));
     router.push("/routine/new");
   };
   ```

**디자인 요소:**

- 카드: `bg-[#17171C]` (선택되지 않음), `bg-[#3182F6]/10` (선택됨)
- 보더: `border-2 border-[#3182F6]` (선택됨)
- 체크박스: `bg-[#3182F6]` 원형 + `Check` 아이콘

---

### 3. `app/routine/new/custom-exercise/page.tsx` (기존)

**역할:** 독립적인 전체 화면 커스텀 종목 입력 페이지

**주요 기능:**

- URL 쿼리 파라미터로 검색어 전달받기
- 자동 포커스 입력 필드
- localStorage에 저장 후 `/routine/new`로 복귀

---

## 🔗 데이터 전달 로직

### localStorage 키-값 구조

**1. 선택된 종목들 (다중)**

```json
{
  "key": "selected_exercises",
  "value": [
    { "id": "ex1", "name": "벤치프레스" },
    { "id": "ex3", "name": "덤벨 프레스" }
  ]
}
```

**2. 커스텀 종목 (단일)**

```json
{
  "key": "pending_custom_exercise",
  "value": {
    "id": "custom_1735660800000",
    "name": "내가 만든 운동",
    "body_part": "커스텀",
    "timestamp": 1735660800000
  }
}
```

### 데이터 흐름

1. **종목 선택 페이지 → 루틴 생성 페이지**

   ```
   /routine/new/select-exercise
   → localStorage.setItem("selected_exercises", ...)
   → router.push("/routine/new")
   → useEffect에서 감지 → 추가 → localStorage.removeItem
   ```

2. **커스텀 종목 페이지 → 루틴 생성 페이지**
   ```
   /routine/new/custom-exercise
   → localStorage.setItem("pending_custom_exercise", ...)
   → router.push("/routine/new")
   → useEffect에서 감지 → 추가 → localStorage.removeItem
   ```

---

## 🎨 디자인 시스템 준수

### 색상 팔레트

- 배경: `#101012`
- 카드/입력창: `#17171C`
- 포인트 컬러: `#3182F6` (Toss Blue)
- 보더: `border-white/5`

### 타이포그래피

- 제목: `text-lg font-bold tracking-tight`
- 버튼 텍스트: `text-sm font-bold`
- 본문: `text-sm text-white/60`

### 헤더 규격

- 높이: `h-14` (56px)
- 패딩: `px-6` (24px)
- 보더: `border-b border-white/5` (Type B)
- z-index: `z-50`

---

## ✅ 장점

### 1. **명확한 관심사 분리**

- 종목 선택: 독립 페이지에서 다중 선택 UI에 집중
- 커스텀 추가: 독립 페이지에서 입력에 집중

### 2. **개선된 UX**

- 전체 화면으로 더 넓은 작업 공간
- 모달 겹침 이슈 해결
- 카테고리 필터와 검색이 더 시원하게 동작

### 3. **상태 관리 단순화**

- 모달 내부 복잡한 상태 제거
- localStorage로 간단한 데이터 전달
- 페이지 간 명확한 데이터 흐름

### 4. **확장성**

- 나중에 필터 추가 (장비, 난이도 등) 용이
- 정렬 기능 추가 가능
- 즐겨찾기 기능 추가 가능

---

**마지막 업데이트:** 2025년 12월 31일

      const customExercise = JSON.parse(pendingExercise);
      // 루틴에 추가
      setRoutine((p) => ({
        ...p,
        exercises: [
          ...p.exercises,
          {
            id: uid("ex"),
            name: customExercise.name,
            target_sets: 3,
            rest_seconds: 60,
          },
        ],
      }));
      // 정리
      localStorage.removeItem("pending_custom_exercise");
    } catch (error) {
      console.error("Failed to parse custom exercise:", error);
      localStorage.removeItem("pending_custom_exercise");
    }

}
}, []);

```

**왜 localStorage?**

1. ✅ 페이지 간 상태 공유 간단
2. ✅ 새로고침 시에도 데이터 유지
3. ✅ URL 쿼리 파라미터보다 깔끔
4. ✅ React Context API 불필요

---

## 🎨 디자인 시스템 준수

### 색상 팔레트

- 배경: `#101012`
- 카드/입력창: `#17171C`
- 포인트 컬러: `#3182F6` (Toss Blue)
- 보더: `border-white/5`

### 타이포그래피

- 제목: `text-2xl font-bold tracking-tight`
- 입력 필드 (대형): `text-2xl font-bold`
- 본문: `text-sm text-white/60`
- 라벨: `text-sm font-bold text-white/60`

### 헤더 규격

- 높이: `h-14` (56px)
- 패딩: `px-6` (24px)
- 보더: `border-b border-white/5` (Type B)

---

## ✅ 장점

### 1. **명확한 관심사 분리**

- 모달: 종목 검색 및 선택에만 집중
- 커스텀 페이지: 커스텀 종목 생성에만 집중

### 2. **개선된 UX**

- 전체 화면으로 입력에 집중 가능
- 큰 입력 필드로 가독성 향상
- 안내 메시지와 예시로 이해도 증가

### 3. **확장성**

- 나중에 부위 선택, 장비 선택 등 추가 기능 확장 가능
- 독립 페이지이므로 복잡한 UI 추가 용이

### 4. **상태 관리 단순화**

- 모달 내부 복잡한 상태 제거
- localStorage로 간단한 데이터 전달

---

## 🔧 향후 개선 방안

### 옵션 1: React Query 또는 Zustand 사용

localStorage 대신 전역 상태 관리 라이브러리 사용

### 옵션 2: URL State

복잡한 데이터는 URL 인코딩으로 전달

### 옵션 3: Server Actions (Next.js 14+)

서버 액션으로 직접 DB에 저장 후 다시 가져오기

---

**마지막 업데이트:** 2025년 12월 31일
```
