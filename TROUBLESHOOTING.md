# ProLog 트러블슈팅 가이드

## 🔥 Expo 실행 불가 문제 (2026-03-05 해결)

### 문제 상황

```bash
npx expo start
```

실행 시 다음 에러들이 연속적으로 발생:

#### 1차 에러: `react-native-worklets/plugin` 모듈 찾을 수 없음

```
ERROR  Error: [BABEL] Cannot find module 'react-native-worklets/plugin'
Require stack:
- /Users/jooky/Documents/projects/prolog/app/node_modules/react-native-reanimated/plugin/index.js
- /Users/jooky/Documents/projects/prolog/app/node_modules/babel-preset-expo/build/index.js
```

**원인**: `react-native-reanimated` 4.x가 필요로 하는 `react-native-worklets-core` 패키지가 설치되지 않음

**시도한 해결책 1**:
```bash
npm install react-native-worklets-core --legacy-peer-deps
```
→ 패키지는 설치되었으나 에러 지속

**원인 분석**: `react-native-reanimated/plugin/index.js`가 `react-native-worklets/plugin`을 require하는데, 실제 패키지명은 `react-native-worklets-core`임

**시도한 해결책 2**: 심볼릭 링크 생성
```bash
cd node_modules
ln -s react-native-worklets-core react-native-worklets
```
→ 에러 지속 (node_modules가 이미 손상됨)

---

#### 2차 에러: `react-refresh/babel` 모듈 찾을 수 없음

```
ERROR  Error: [BABEL] Cannot find module 'react-refresh/babel'
Require stack:
- /Users/jooky/Documents/projects/prolog/app/node_modules/babel-preset-expo/build/index.js
```

**원인**: `babel-preset-expo`가 필요로 하는 `react-refresh` 패키지가 누락됨

**근본 원인**: `node_modules` 디렉토리가 불완전하게 설치되거나 손상됨
- `--legacy-peer-deps` 플래그로 설치하면서 일부 peer dependency가 누락
- 의존성 충돌로 인한 불완전한 설치

---

### ✅ 최종 해결 방법

**완전한 재설치**로 해결:

```bash
# 1. 기존 Expo 프로세스 종료
pkill -f "expo start"

# 2. app 디렉토리로 이동
cd /Users/jooky/Documents/projects/prolog/app

# 3. node_modules와 lock 파일 완전 삭제
rm -rf node_modules package-lock.json

# 4. 깨끗한 재설치
npm install

# 5. Expo 재시작
npx expo start --clear
```

**결과**:
- ✅ Metro Bundler 정상 실행
- ✅ iOS 번들링 성공 (3,414 modules in 10.1s)
- ✅ 모든 의존성 정상 설치

---

## 🔍 문제 원인 분석

### 1. `react-native-reanimated` 4.x의 의존성 변경

- **이전**: `react-native-worklets` 패키지 사용
- **현재**: `react-native-worklets-core` 패키지로 변경
- **문제**: `react-native-reanimated/plugin/index.js`가 여전히 구버전 이름(`react-native-worklets`)을 require함

**react-native-reanimated/plugin/index.js**:
```javascript
// @ts-ignore plugin type isn't exposed
const plugin = require('react-native-worklets/plugin');  // ❌ 구버전 이름
module.exports = plugin;
```

**해결**: `node_modules` 재설치 시 npm이 자동으로 처리

### 2. React 버전 충돌

**현재 버전**:
- `react`: 19.1.0
- `react-dom`: 19.2.4 (일부 패키지가 요구)

**충돌**: `react-dom@19.2.4`가 `react@^19.2.4`를 peer dependency로 요구

**해결**: `--legacy-peer-deps` 사용 또는 완전 재설치

### 3. 손상된 node_modules

**원인**:
- 부분적인 설치 (`npm install <package> --legacy-peer-deps`)
- 의존성 충돌로 인한 불완전한 설치
- peer dependency 경고 무시

**증상**:
- 일부 패키지는 설치되었으나 내부 의존성 누락
- Babel 플러그인 로딩 실패
- 모듈 resolve 실패

**해결**: 완전 재설치만이 확실한 해결책

---

## 📋 체크리스트

### Expo 실행 안될 때

1. **포트 충돌 확인**
   ```bash
   lsof -i :8081
   # 프로세스 종료: kill <PID>
   ```

2. **Metro Bundler 상태 확인**
   ```bash
   curl http://localhost:8081/status
   # 기대 결과: packager-status:running
   ```

3. **의존성 문제 시 완전 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **캐시 클리어**
   ```bash
   npx expo start --clear
   ```

### 번들링 에러 발생 시

1. **에러 로그 확인**
   ```bash
   curl "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true" 2>&1 | head -100
   ```

2. **누락된 패키지 확인**
   - `Cannot find module 'XXX'` 에러 확인
   - `npm ls <package-name>`으로 설치 여부 확인

3. **Babel 설정 확인**
   - `babel-preset-expo` 버전 확인
   - Babel 플러그인 의존성 확인

---

## 🚫 하지 말아야 할 것

### ❌ 부분적인 패키지 설치
```bash
npm install <package> --legacy-peer-deps
```
→ 다른 패키지의 의존성을 깨뜨릴 수 있음

### ❌ 심볼릭 링크로 임시방편
```bash
ln -s react-native-worklets-core react-native-worklets
```
→ node_modules가 이미 손상된 경우 효과 없음

### ❌ node_modules만 삭제하고 package-lock.json 유지
```bash
rm -rf node_modules  # package-lock.json 유지
npm install
```
→ lock 파일에 손상된 의존성 트리가 남아있을 수 있음

---

## ✅ 권장 사항

### 1. 의존성 추가 시
```bash
# 올바른 방법
npm install <package>

# peer dependency 경고가 있다면 먼저 해결
npm install <missing-peer-dependency>
```

### 2. 정기적인 의존성 업데이트
```bash
# 업데이트 가능한 패키지 확인
npm outdated

# 주의해서 업데이트
npm update
```

### 3. Expo SDK 업데이트 시
```bash
# Expo CLI 사용 권장
npx expo install --fix
```

---

## 📦 현재 주요 의존성 버전

```json
{
  "expo": "~54.0.33",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "react-native-worklets-core": "1.6.3"
}
```

**알려진 이슈**:
- `react-native-svg@15.15.3` vs 권장 버전 `15.12.1`
  - 현재 작동하지만, 문제 발생 시 버전 다운그레이드 고려

---

## 🔗 참고 자료

- [React Native Reanimated 공식 문서](https://docs.swmansion.com/react-native-reanimated/)
- [Expo 트러블슈팅](https://docs.expo.dev/troubleshooting/overview/)
- [Metro Bundler 설정](https://facebook.github.io/metro/)

---

## 🔄 Modal 네비게이션 문제 (2026-03-05 해결)

### 문제 상황

여러 화면(루틴 생성, 루틴 수정, 운동 진행)에서 `select-exercises` 화면으로 이동 후, 뒤로가기 또는 완료 버튼을 눌러도 원래 화면으로 돌아가지 않는 문제 발생.

**증상**:
- `router.push('/select-exercises')` 호출 시 화면 전환이 제대로 안됨
- 종목 선택 후 `router.back()` 호출해도 이전 화면으로 돌아가지 않음
- 모든 진입점(루틴 생성/수정/운동 진행)에서 동일한 문제 발생

**파일 구조**:
```
app/
├── _layout.tsx (Slot)  ❌ 문제
├── (tabs)/
│   ├── _layout.tsx (Tabs)
│   ├── routine/new.tsx → /select-exercises 호출
│   └── workout/session.tsx → /select-exercises 호출
└── (modal)/
    ├── _layout.tsx (Stack with modal presentation)
    └── select-exercises.tsx
```

---

### 🔍 문제 원인 분석

#### 1. Root Layout의 문제

**기존 구조**:
```tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Slot />  // ❌ 단순 Slot 사용
        </AuthGuard>
      </WorkoutProvider>
    </AuthProvider>
  );
}
```

**문제점**:
- `Slot`은 파일 기반 라우팅만 제공
- Tabs 네비게이터 내부에서 외부 Modal로 이동하는 것을 지원하지 않음
- 네비게이션 스택이 제대로 관리되지 않음

#### 2. Expo Router의 Modal 동작 방식

Expo Router에서 Modal을 사용하려면:
1. **Root가 Stack이어야 함** - Modal을 스택의 한 화면으로 관리
2. **Modal 그룹을 명시적으로 설정** - `presentation: "modal"` 옵션 필요
3. **올바른 네비게이션 계층** - Tabs와 Modal이 같은 레벨에서 관리되어야 함

**잘못된 구조**:
```
Root (Slot)
├── (tabs) - 독립적
└── (modal) - 독립적 (서로 연결되지 않음)
```

**올바른 구조**:
```
Root (Stack)
├── (tabs) - Stack Screen
└── (modal) - Stack Screen (presentation: modal)
```

---

### ✅ 해결 방법

#### 1. Root Layout을 Stack으로 변경

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        </AuthGuard>
      </WorkoutProvider>
    </AuthProvider>
  );
}
```

**변경 사항**:
- ✅ `Slot` → `Stack` 변경
- ✅ `(tabs)`, `(auth)`, `(modal)` 그룹을 명시적으로 Stack.Screen으로 등록
- ✅ `(modal)` 그룹에 `presentation: "modal"` 옵션 설정

#### 2. Modal Layout 정리

```tsx
// app/(modal)/_layout.tsx
import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // presentation은 Root에서 설정하므로 여기서는 제거
      }}
    />
  );
}
```

**변경 사항**:
- ❌ `presentation: "modal"` 제거 (Root에서 설정하므로 중복 제거)
- ✅ 기본 Stack 설정만 유지

#### 3. 네비게이션 코드 단순화

```tsx
// app/(modal)/select-exercises.tsx
const handleConfirm = () => {
  const selected = selectedIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter((e): e is ExerciseResponse => e !== undefined);
  setSelectedExercises(selected);

  // Stack 구조가 올바르게 설정되었으므로 back()만으로 충분
  router.back();
};
```

**변경 사항**:
- ❌ `router.canDismiss()` 체크 제거 (불필요)
- ❌ `router.dismiss()` 제거 (Stack에서는 back()으로 충분)
- ✅ 단순히 `router.back()` 사용

---

### 📋 핵심 개념 정리

#### Expo Router의 네비게이션 계층

1. **Root가 Stack이어야 하는 이유**:
   - Modal은 기존 화면 위에 표시되는 방식
   - Stack 네비게이터가 화면 계층을 관리
   - Tabs만으로는 Modal을 올바르게 표시할 수 없음

2. **Modal Presentation 옵션**:
   ```tsx
   <Stack.Screen
     name="(modal)"
     options={{ presentation: "modal" }}
   />
   ```
   - iOS: 하단에서 올라오는 카드 스타일
   - Android: 전체 화면 오버레이
   - 뒤로가기 제스처 자동 지원

3. **네비게이션 메서드**:
   - `router.push()`: 새 화면을 스택에 추가
   - `router.back()`: 스택에서 한 단계 뒤로
   - `router.dismiss()`: Modal을 닫음 (선택적)

#### 파일 구조와 라우팅

```
app/
├── _layout.tsx
│   └── Stack (Root)
│       ├── (tabs) → Stack.Screen
│       └── (modal) → Stack.Screen (presentation: modal)
│
├── (tabs)/
│   ├── _layout.tsx → Tabs Navigator
│   └── [screens]
│
└── (modal)/
    ├── _layout.tsx → Stack Navigator
    └── [modal screens]
```

**라우팅 경로**:
- `/(tabs)/routine/new` → `/select-exercises` → `router.back()` → `/(tabs)/routine/new`
- `/(tabs)/workout/session` → `/select-exercises` → `router.back()` → `/(tabs)/workout/session`

---

### 🚫 흔한 실수

#### ❌ Root에서 Slot 사용
```tsx
// 잘못된 예
export default function RootLayout() {
  return <Slot />;  // Modal 네비게이션 불가
}
```

#### ❌ Modal 그룹에서 presentation 중복 설정
```tsx
// Root에서 설정했는데 Modal _layout에서도 설정
// app/_layout.tsx
<Stack.Screen name="(modal)" options={{ presentation: "modal" }} />

// app/(modal)/_layout.tsx - 중복!
<Stack screenOptions={{ presentation: "modal" }} />
```

#### ❌ 복잡한 네비게이션 로직
```tsx
// 불필요하게 복잡한 코드
if (router.canDismiss()) {
  router.dismiss();
} else if (router.canGoBack()) {
  router.back();
} else {
  router.replace('/');
}

// Stack이 올바르게 설정되었다면 단순히
router.back();
```

---

### ✅ 검증 방법

**테스트 시나리오**:

1. **루틴 생성에서 종목 선택**:
   ```
   /routine/new → /select-exercises → 선택 → 확인 → /routine/new
   ```
   ✅ 선택한 종목이 추가됨
   ✅ 입력 중이던 데이터 유지됨

2. **루틴 수정에서 종목 선택**:
   ```
   /routine/[id] → /select-exercises → 선택 → 확인 → /routine/[id]
   ```
   ✅ 기존 종목 + 새 종목이 표시됨

3. **운동 진행 중 종목 추가**:
   ```
   /workout/session → /select-exercises → 선택 → 확인 → /workout/session
   ```
   ✅ 진행 중인 운동에 종목 추가됨
   ✅ 타이머, 세트 데이터 유지됨

4. **뒤로가기 제스처**:
   - iOS: 왼쪽 가장자리에서 스와이프
   - Android: 시스템 뒤로가기 버튼
   ✅ 선택 취소하고 이전 화면으로 복귀

---

### 📚 관련 문서

- [Expo Router - Modals](https://docs.expo.dev/router/advanced/modals/)
- [React Navigation - Stack Navigator](https://reactnavigation.org/docs/stack-navigator)
- [Expo Router - File-based routing](https://docs.expo.dev/router/introduction/)

---

### 🎯 교훈

1. **Root Layout은 신중하게 선택**:
   - 단순한 앱: `Slot` 사용 가능
   - Modal/Drawer 필요: `Stack` 필수

2. **파일 구조 = 네비게이션 구조**:
   - Expo Router는 파일 시스템 기반
   - 폴더 구조가 라우팅 계층 결정

3. **공식 문서의 예제 구조를 따르자**:
   - 특히 Modal, Tabs 같은 복잡한 네비게이션은 공식 가이드 준수

---

## 📝 작성 정보

- **작성일**: 2026-03-05
- **문제 발생 환경**: macOS, Node.js, Expo SDK 54, Expo Router v3
- **해결 시간**: 약 1시간
- **최종 해결책**: Root Layout을 Slot에서 Stack으로 변경하고 Modal 그룹을 올바르게 설정
