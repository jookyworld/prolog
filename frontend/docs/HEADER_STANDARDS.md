# 페이지 헤더 표준 가이드

## 📐 표준 규격

모든 페이지의 헤더는 다음 규격을 **엄격히 준수**합니다.

### 1️⃣ 기본 구조

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    {/* 왼쪽: 타이틀 */}
    <h1 className="text-2xl font-bold tracking-tight">페이지 이름</h1>

    {/* 오른쪽: 버튼들 */}
    <div className="flex items-center gap-2">{/* 버튼 배치 */}</div>
  </div>
</header>
```

### 2️⃣ 필수 클래스 설명

| 클래스        | 값                                 | 설명                                                   |
| ------------- | ---------------------------------- | ------------------------------------------------------ |
| **높이**      | `h-14`                             | 헤더 내부 컨테이너 **고정 높이 56px** (절대 변경 금지) |
| **좌우 패딩** | `px-6`                             | 좌우 여백 24px 고정                                    |
| **수직 정렬** | `flex items-center`                | 타이틀과 버튼을 수직 중앙 정렬                         |
| **z-index**   | `z-50`                             | 헤더가 다른 요소보다 위에 표시                         |
| **배경**      | `bg-[#101012]/90 backdrop-blur-xl` | 반투명 배경 + 블러 효과                                |
| **보더**      | `border-b border-white/5`          | 하단 구분선                                            |
| **포지션**    | `sticky top-0`                     | 스크롤 시 상단 고정                                    |

---

## 🎨 버튼 스타일 가이드

### 아이콘 버튼 (정사각형)

```tsx
<button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
  <IconComponent className="w-5 h-5" />
</button>
```

**규칙:**

- 크기: `w-10 h-10` (40px × 40px)
- 아이콘: `w-5 h-5` (20px × 20px)
- 정렬: `flex items-center justify-center`

### 텍스트 버튼

```tsx
<button className="h-10 px-3 flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors">
  취소
</button>
```

**규칙:**

- 높이: `h-10` (아이콘 버튼과 동일)
- 패딩: `px-3` (좌우 12px)
- 정렬: `flex items-center`

---

## 📋 실제 구현 예시

### Case 1: 아이콘 버튼만 있는 헤더 (routine/page.tsx)

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">루틴</h1>

    <div className="flex items-center gap-2">
      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
        <Search className="w-5 h-5" />
      </button>

      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
        <Folder className="w-5 h-5" />
      </button>

      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  </div>
</header>
```

### Case 2: 텍스트 버튼이 있는 헤더 (routine/new/page.tsx)

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">루틴 생성</h1>

    <div className="flex items-center gap-4">
      <button className="h-10 px-3 flex items-center text-sm font-medium text-white/60 hover:text-white transition-colors">
        취소
      </button>

      <button className="h-10 px-3 flex items-center text-sm font-bold text-[#3182F6] hover:text-[#2563EB] transition-colors">
        저장
      </button>
    </div>
  </div>
</header>
```

### Case 3: 확장 가능한 헤더 (검색바 포함)

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  {/* 메인 헤더 */}
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">루틴</h1>
    <div className="flex items-center gap-2">{/* 버튼들 */}</div>
  </div>

  {/* 확장 영역 (검색바 등) */}
  <AnimatePresence>
    {isSearchVisible && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden border-t border-white/5"
      >
        <div className="h-12 px-6 flex items-center">
          <input
            placeholder="검색"
            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</header>
```

**확장 영역 규칙:**

- 높이: `h-12` (48px) - 메인 헤더보다 작게
- 구분선: `border-t border-white/5` 필수
- 패딩: `px-6` 동일 유지

---

## ✅ 체크리스트

새 페이지 헤더를 만들 때 다음을 확인하세요:

- [ ] `h-14` 고정 높이 적용
- [ ] `px-6` 좌우 패딩 적용
- [ ] `z-50` z-index 적용
- [ ] `flex items-center justify-between` 정렬
- [ ] `bg-[#101012]/90 backdrop-blur-xl` 배경
- [ ] `border-b border-white/5` 하단 구분선
- [ ] 아이콘 버튼: `w-10 h-10`, 아이콘: `w-5 h-5`
- [ ] 텍스트 버튼: `h-10 px-3 flex items-center`
- [ ] 타이틀: `text-2xl font-bold tracking-tight`

---

## 🚫 금지 사항

❌ **절대 하지 말아야 할 것들:**

1. **py-2, py-3 등 수직 패딩 사용 금지** → `h-14`로 고정 높이 사용
2. **중첩 div로 높이 간접 지정 금지** → 직접 `h-14` 명시
3. **아이콘 크기 제각각 금지** → `w-5 h-5` 통일
4. **z-index 10 이하 사용 금지** → `z-50` 필수
5. **타이틀 텍스트 크기 변경 금지** → `text-2xl` 고정

---

## 💡 장점

이 표준을 따르면:

✅ 모든 페이지 헤더가 **정확히 동일한 56px 높이** 유지  
✅ 탭 전환 시 **타이틀 위치가 절대 튀지 않음**  
✅ 버튼 크기와 정렬이 **완벽하게 일관적**  
✅ 유지보수와 확장이 **매우 쉬움**  
✅ 새로운 개발자도 **빠르게 적용 가능**

---

## 🎯 다른 페이지에 적용하기

### 홈 페이지 예시

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">홈</h1>
    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
      <Bell className="w-5 h-5" />
    </button>
  </div>
</header>
```

### 프로필 페이지 예시

```tsx
<header className="sticky top-0 z-50 bg-[#101012]/90 backdrop-blur-xl border-b border-white/5">
  <div className="h-14 px-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">내 정보</h1>
    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
      <Settings className="w-5 h-5" />
    </button>
  </div>
</header>
```

---

**마지막 업데이트:** 2025년 12월 31일
