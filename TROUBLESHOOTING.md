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

---

## 🔄 iOS 시뮬레이터 무한 로딩 및 Timeout 문제 (2026-03-07 해결)

### 문제 상황

`npm start` 실행 후 iOS 시뮬레이터에서 다음과 같은 문제 발생:

#### 증상
- iOS 시뮬레이터 화면: "New update available, downloading..." 무한 로딩
- Expo 터미널: 번들링이 시작되지 않거나 중단됨
- 시뮬레이터 연결 시도 시 timeout 에러

#### 초기 에러 로그
```bash
Error: xcrun simctl openurl 1DC368B0-DF9C-4CDC-A6CB-D5828BFDEE3E exp://172.30.94.245:8081 exited with non-zero code: 60
An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60):
Simulator device failed to open exp://172.30.94.245:8081.
Operation timed out
```

---

### 🔍 근본 원인 분석

이 문제는 **2가지 독립적인 이슈**가 복합적으로 발생한 경우였음:

#### 원인 1: 누락된 필수 npm 의존성 (주 원인)

Metro Bundler가 JavaScript를 번들링하는 과정에서 **필수 Babel 플러그인들이 누락**되어 번들 생성 실패:

**누락된 패키지**:
1. `react-native-worklets`
   - `babel-preset-expo`가 내부적으로 요구하는 플러그인
   - `react-native-reanimated/plugin/index.js`가 `require('react-native-worklets/plugin')` 호출
   - 하지만 `package.json`에는 `react-native-worklets-core`만 존재

2. `react-refresh`
   - Hot reload 기능에 필요한 핵심 Babel 변환 플러그인
   - `babel-preset-expo`가 필수로 요구

**왜 누락되었나?**
```bash
# React 버전 충돌로 인한 peer dependency 경고
npm error ERESOLVE could not resolve
npm error While resolving: react-dom@19.2.4
npm error Found: react@19.1.0
```
- `react@19.1.0` vs `react-dom@19.2.4` 버전 불일치
- 일부 패키지가 peer dependency로 자동 설치되지 않음

**실제 에러 로그**:
```
ERROR  Error: [BABEL] Cannot find module 'react-native-worklets/plugin'
Require stack:
- /Users/.../react-native-reanimated/plugin/index.js
- /Users/.../babel-preset-expo/build/index.js
```

```
ERROR  Error: [BABEL] Cannot find module 'react-refresh/babel'
Require stack:
- /Users/.../babel-preset-expo/build/index.js
```

#### 원인 2: 네트워크 설정 문제 (부차적 원인)

번들링이 성공한 후에도 앱이 백엔드 API에 연결하지 못하는 문제:

**`.env` 파일 문제점**:
```bash
# 잘못된 설정
EXPO_PUBLIC_API_URL=http://localhost:3000

# 문제점:
# 1. iOS 시뮬레이터에서 localhost는 시뮬레이터 자체를 가리킴
# 2. 포트 3000은 잘못된 포트 (백엔드는 8080에서 실행 중)
```

**결과**:
```
ERROR  [Login] Error: [TypeError: Network request failed]
```

---

### ✅ 해결 방법

#### Step 1: 누락된 의존성 설치

```bash
# 1. app 디렉토리로 이동
cd /Users/jooky/Documents/projects/prolog/app

# 2. 필수 Babel 플러그인 설치
npm install --save-dev react-native-worklets react-refresh --legacy-peer-deps

# 3. NativeWind가 필요로 하는 reanimated 재설치
npm install react-native-reanimated@~4.1.1 --legacy-peer-deps
```

**설치 이유**:
- `react-native-worklets`: Babel 플러그인 시스템에서 필수
- `react-refresh`: React Fast Refresh (HMR) 기능 제공
- `react-native-reanimated`: NativeWind 4.x가 CSS 애니메이션에 사용

**최종 설치된 의존성**:
```json
{
  "dependencies": {
    "react-native-reanimated": "~4.1.1"
  },
  "devDependencies": {
    "react-native-worklets": "^0.7.4",
    "react-refresh": "^0.14.0"
  }
}
```

#### Step 2: 네트워크 설정 수정

**백엔드 실제 포트 확인**:
```bash
lsof -i -P | grep java | grep LISTEN
# 출력: java ... *:8080 (LISTEN)  ← 8080 포트 확인
```

**`.env` 파일 수정**:
```bash
# Before
EXPO_PUBLIC_API_URL=http://localhost:3000

# After
EXPO_PUBLIC_API_URL=http://172.30.94.245:8080
```

**변경 사항**:
- ✅ `localhost` → `172.30.94.245` (맥의 실제 IP)
- ✅ `3000` → `8080` (백엔드 실제 포트)

**IP 주소를 사용하는 이유**:
- iOS 시뮬레이터는 별도의 네트워크 환경에서 실행
- `localhost`는 시뮬레이터 자체를 가리킴
- 호스트 머신에 접근하려면 실제 IP 주소 필요
- Expo가 사용하는 IP와 동일한 주소 사용 권장

#### Step 3: Expo 재시작

```bash
# 캐시 클리어하면서 재시작
npx expo start --clear --ios
```

**결과**:
```
✅ iOS Bundled 943ms node_modules/expo-router/entry.js (3318 modules)
✅ 앱 정상 로드
✅ 백엔드 API 연결 성공
```

---

### 📋 진단 체크리스트

#### 1단계: 번들링 에러 확인

**Metro Bundler 로그 확인**:
```bash
npx expo start
# 터미널에서 에러 로그 확인
# "Cannot find module" 에러가 있는지 체크
```

**누락된 패키지 확인**:
```bash
# Babel이 필요로 하는 패키지 설치 여부 확인
ls node_modules | grep worklets
ls node_modules | grep react-refresh
```

#### 2단계: React 버전 충돌 체크

```bash
npm list react react-dom
```

**peer dependency 경고 발생 시**:
```bash
npm install --legacy-peer-deps
```

#### 3단계: 네트워크 설정 확인

**백엔드 포트 확인**:
```bash
lsof -i -P | grep LISTEN
# Spring Boot는 보통 8080
# Express는 보통 3000 또는 설정된 PORT
```

**맥의 IP 주소 확인**:
```bash
# Expo가 자동으로 감지한 IP 사용 (권장)
# 또는 직접 확인:
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**`.env` 파일 검증**:
```bash
cat .env
# EXPO_PUBLIC_API_URL이 올바른 IP:PORT인지 확인
```

#### 4단계: iOS 시뮬레이터 상태 확인

**시뮬레이터 실행 여부**:
```bash
ps aux | grep -i simulator | grep -v grep
```

**Metro Bundler 포트 확인**:
```bash
lsof -i :8081 | grep LISTEN
# Metro가 8081에서 리스닝 중인지 확인
```

---

### 🚫 하지 말아야 할 것

#### ❌ package.json에서 react-native-reanimated만 제거
```bash
# NativeWind가 내부적으로 사용하므로 제거하면 안 됨
npm uninstall react-native-reanimated  # ❌
```
→ `react-native-css-interop`가 reanimated에 의존

#### ❌ localhost를 그대로 사용
```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:8080  # ❌
```
→ iOS 시뮬레이터에서 연결 불가

#### ❌ 캐시 문제로 오인하고 계속 클리어
```bash
npx expo start --clear  # 반복
rm -rf .expo
npx expo start --clear  # 반복
```
→ 근본 원인(누락된 패키지)을 해결하지 않으면 의미 없음

#### ❌ Babel 플러그인 직접 수정 시도
```javascript
// babel.config.js에서 임시방편 시도
plugins: [
  // 'react-native-reanimated/plugin',  // 주석 처리 ❌
]
```
→ 일시적으로 에러는 사라지지만 NativeWind 애니메이션 기능 손상

---

### ✅ 권장 사항

#### 1. 프로젝트 초기 설정 시

**의존성 버전 고정**:
```json
{
  "dependencies": {
    "expo": "~54.0.33",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1"
  },
  "devDependencies": {
    "react-native-worklets": "^0.7.4",
    "react-refresh": "^0.14.0"
  }
}
```

**package-lock.json 생성**:
```bash
npm install --legacy-peer-deps
# lock 파일로 버전 고정
```

#### 2. 개발 환경 설정

**`.env` 템플릿 작성**:
```bash
# .env.example
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:8080

# README에 설정 방법 명시:
# 1. .env.example을 .env로 복사
# 2. YOUR_IP_HERE를 ifconfig로 확인한 IP로 변경
```

**시뮬레이터 연결 테스트**:
```bash
# 백엔드 헬스체크 엔드포인트 호출
curl http://172.30.94.245:8080/actuator/health
# 또는
curl http://172.30.94.245:8080/api/health
```

#### 3. 팀 협업 시

**필수 설정 문서화**:
- iOS 시뮬레이터는 localhost 사용 불가 명시
- 백엔드 포트 정보 공유 (Spring Boot: 8080)
- IP 주소 확인 방법 안내

**의존성 설치 가이드**:
```bash
# 프로젝트 클론 후
cd app
npm install --legacy-peer-deps  # peer dependency 경고 우회
npx expo start --ios
```

---

### 🔧 의존성 버전 호환성 매트릭스

| 패키지 | 필수 버전 | 이유 |
|--------|----------|------|
| `expo` | ~54.0.33 | 프로젝트 SDK 버전 |
| `react` | 19.1.0 | Expo 54 권장 버전 |
| `react-native` | 0.81.5 | Expo 54 기본 버전 |
| `react-native-reanimated` | ~4.1.1 | NativeWind 4.x 호환 |
| `react-native-worklets` | ^0.7.4 | reanimated 4.x 호환 |
| `react-refresh` | ^0.14.0 | React 19.x 호환 |
| `nativewind` | ^4.2.1 | reanimated 의존 |

**알려진 경고** (무시 가능):
```
react-native-svg@15.15.3 - expected version: 15.12.1
react-native-worklets@0.7.4 - expected version: 0.5.1
```
→ 현재 버전으로 정상 작동 확인됨

---

### 🎯 핵심 교훈

#### 1. 에러 메시지의 함정
```
표면적 에러: "Operation timed out"
실제 원인: 누락된 npm 패키지로 인한 번들링 실패
```
→ **네트워크 타임아웃이 아니라 번들 자체가 생성되지 않았던 것**

#### 2. NativeWind의 숨겨진 의존성
```
NativeWind 4.x
  └── react-native-css-interop
      └── react-native-reanimated (CSS 애니메이션용)
          └── react-native-worklets (Babel 플러그인)
```
→ `package.json`에 명시되지 않은 의존성도 설치 필요

#### 3. iOS 시뮬레이터의 네트워크 격리
```
❌ localhost → 시뮬레이터 자체
✅ 192.168.x.x / 172.x.x.x → 호스트 머신
```
→ **물리 디바이스와 달리 시뮬레이터는 별도 네트워크 환경**

---

### 🔗 참고 자료

- [React Native Reanimated - Installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/)
- [NativeWind v4 - Dependencies](https://www.nativewind.dev/v4/getting-started/react-native)
- [Expo - Accessing localhost from iOS Simulator](https://docs.expo.dev/guides/how-expo-works/#accessing-localhost-from-ios-simulator)
- [React Fast Refresh](https://react.dev/learn/react-compiler#installing-react-fast-refresh)

---

### 📝 작성 정보

- **작성일**: 2026-03-07
- **문제 발생 환경**:
  - macOS Darwin 25.3.0
  - Node.js (npm with --legacy-peer-deps)
  - Expo SDK 54.0.33
  - iOS Simulator (iPhone 17 Pro)
  - Spring Boot 백엔드 (포트 8080)
- **해결 시간**: 약 2시간
- **핵심 해결책**:
  1. `react-native-worklets` + `react-refresh` 설치
  2. `.env` 파일 IP 주소 및 포트 수정
- **주의사항**: 이 문제는 에러 메시지만으로는 원인 파악이 어려우므로, Metro Bundler 전체 로그를 꼼꼼히 확인해야 함

---

## 🗑️ 루틴 삭제 불가 문제 (2026-03-07 해결)

### 문제 상황

루틴 삭제 시도 시 다음 에러 발생:

```
Cannot delete or update a parent row: a foreign key constraint fails
(`prolog`.`workout_sessions`, CONSTRAINT `FK4q6pnw9nar0dxwb0qsofyefea`
FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`))
```

**증상**:
- 루틴을 한 번이라도 사용한 경우 삭제 불가
- WorkoutSession이 Routine을 참조하고 있어서 외래 키 제약 위반
- 데이터 무결성은 유지되지만 사용자 UX 저해

---

### 🔍 문제 원인

#### 1. 외래 키 제약 조건

```sql
-- 기존 제약
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE RESTRICT;  -- ❌ 삭제 불가
```

**기본 동작**:
- JPA/Hibernate 기본값: `ON DELETE RESTRICT`
- Routine 삭제 시 참조하는 WorkoutSession이 있으면 에러
- 데이터 정합성은 보장하지만 유연성 부족

#### 2. 운동 기록 맥락 손실 우려

루틴을 삭제하면:
- 과거 운동 기록에서 "어떤 루틴으로 운동했는지" 정보 손실
- 모두 "자유 운동"으로 표시될 가능성
- 사용자 경험 저하

---

### ✅ 해결 방법

#### 핵심 전략: 스냅샷 패턴 + ON DELETE SET NULL

**1. 스냅샷 저장 (운동 기록 보존)**

```sql
-- workout_sessions 테이블에 컬럼 추가
ALTER TABLE workout_sessions
ADD COLUMN routine_title_snapshot VARCHAR(100) NULL;
```

```java
// WorkoutSession.java
@Column(name = "routine_title_snapshot", length = 100)
private String routineTitleSnapshot;

private WorkoutSession(User user, Routine routine, LocalDateTime startedAt) {
    this.user = user;
    this.routine = routine;
    // 세션 시작 시 루틴 제목 스냅샷 저장
    this.routineTitleSnapshot = routine != null ? routine.getTitle() : null;
    this.startedAt = startedAt;
}
```

**2. 외래 키 제약 변경**

```sql
-- 기존 외래 키 삭제
ALTER TABLE workout_sessions
DROP FOREIGN KEY FK4q6pnw9nar0dxwb0qsofyefea;

-- 새로운 외래 키 추가 (ON DELETE SET NULL)
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;  -- ✅ routine_id만 NULL로 변경
```

**3. 서비스 로직 단순화**

```java
// RoutineService.java
@Transactional
public void deleteRoutine(Long userId, Long routineId) {
    Routine routine = getRoutineAndValidateOwner(userId, routineId);

    // 1. RoutineItem 삭제
    routineItemRepository.deleteAll(
        routineItemRepository.findByRoutineIdOrderByOrderInRoutineAsc(routineId)
    );

    // 2. Routine 삭제 (WorkoutSession의 routine_id는 자동으로 NULL)
    routineRepository.delete(routine);
}
```

---

### 📊 동작 방식

#### Before (삭제 불가)

```
Routine (id=1, title="상체 루틴")
    ↑ FK (ON DELETE RESTRICT)
WorkoutSession (id=100, routine_id=1)

[루틴 삭제 시도]
    ↓
❌ 에러: Cannot delete parent row (외래 키 제약 위반)
```

#### After (삭제 가능)

```
[세션 시작 시]
Routine (id=1, title="상체 루틴")
    ↓
WorkoutSession 생성
    ├─ routine_id = 1
    └─ routine_title_snapshot = "상체 루틴"  ← 스냅샷 저장

[루틴 삭제 시]
Routine 삭제
    ↓ (ON DELETE SET NULL 트리거)
WorkoutSession 자동 업데이트
    ├─ routine_id = NULL  ← 외래 키만 제거
    └─ routine_title_snapshot = "상체 루틴"  ← 보존됨!

[운동 기록 조회 시]
    ↓
title: routine_title_snapshot → "상체 루틴" ✅
type: "routine" ✅
```

---

### 🛠️ 수동 마이그레이션

```sql
USE prolog;

-- 1. 스냅샷 컬럼 추가
ALTER TABLE workout_sessions
ADD COLUMN routine_title_snapshot VARCHAR(100) NULL;

-- 2. 기존 데이터 스냅샷 채우기
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL;

-- 3. 외래 키 재설정
ALTER TABLE workout_sessions
DROP FOREIGN KEY FK4q6pnw9nar0dxwb0qsofyefea;

ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;

-- 4. 확인
SHOW CREATE TABLE workout_sessions\G
```

---

### 🚀 자동 마이그레이션 (Flyway)

#### 1. 의존성 추가

```kotlin
// build.gradle.kts
dependencies {
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")
}
```

#### 2. 설정 추가

```yaml
# application-local.yml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # update → validate

  flyway:
    enabled: true
    baseline-on-migrate: true
```

#### 3. 마이그레이션 파일

**`backend/src/main/resources/db/migration/V2__add_routine_snapshot.sql`**

```sql
-- routine_title_snapshot 추가
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS routine_title_snapshot VARCHAR(100) NULL;

-- 기존 데이터 마이그레이션
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL;

-- 외래 키 재설정
ALTER TABLE workout_sessions DROP FOREIGN KEY IF EXISTS FK4q6pnw9nar0dxwb0qsofyefea;
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL;
```

#### 4. 실행

```bash
cd backend
./gradlew bootRun
# Flyway가 자동으로 마이그레이션 실행
```

---

### ✅ 검증 방법

#### 1. 루틴 생성 및 운동

```bash
# 루틴 생성
POST /api/routines
{ "title": "테스트 루틴", "items": [...] }

# 세션 시작
POST /api/workouts/sessions
{ "routineId": 1 }

# 확인: routine_title_snapshot에 제목 저장됨
```

#### 2. 루틴 삭제 전 기록 조회

```bash
GET /api/workouts/sessions/{id}
# 응답: { "routineId": 1, "routineTitle": "테스트 루틴" }
```

#### 3. 루틴 삭제

```bash
DELETE /api/routines/1
# ✅ 성공 (에러 없음)
```

#### 4. 루틴 삭제 후 기록 조회

```bash
GET /api/workouts/sessions/{id}
# 응답: { "routineId": null, "routineTitle": "테스트 루틴" }
#       ↑ 삭제됨      ↑ 스냅샷으로 보존! ✅
```

---

### 🎨 프론트엔드 개선

#### 1. 안전한 삭제 플로우

```
활성 루틴 → [보관하기] → 보관 루틴 → [삭제] → 완료
```

**변경 사항**:
- 활성 루틴: 보관 버튼만 표시 (삭제 불가)
- 보관 루틴: 활성화 또는 삭제 가능
- 2단계 프로세스로 실수 방지

#### 2. 깔끔한 UI

```typescript
// lib/types/workout.ts
export function toWorkoutSession(res: WorkoutSessionListItemRes) {
  // 제목: routineTitle이 있으면 사용, 없으면 "자유 운동"
  const title = res.routineTitle ?? "자유 운동";

  // 타입: routineTitle이 있으면 루틴 기반 (삭제되었어도)
  const type = res.routineTitle ? "routine" : "free";

  return { id, title, type, completedAt };
}
```

**화면 표시**:
```
운동 기록:
┌──────────────────────┐
│ 상체 루틴 A   [루틴] │  ← 루틴 삭제되었어도 동일하게 표시
└──────────────────────┘
```

---

### 🚫 하지 말아야 할 것

#### ❌ 강제로 WorkoutSession 삭제

```java
// 잘못된 방법
workoutSessionRepository.deleteByRoutineId(routineId);  // ❌
routineRepository.delete(routine);
```
→ 사용자의 소중한 운동 기록 손실

#### ❌ CASCADE DELETE 사용

```sql
-- 절대 하지 말 것
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE CASCADE;  -- ❌ 운동 기록도 함께 삭제됨
```

#### ❌ 스냅샷 없이 ON DELETE SET NULL만 사용

```sql
-- 스냅샷 없으면
ALTER TABLE workout_sessions ... ON DELETE SET NULL;
-- 결과: routine_id = null, routine_title_snapshot = null
-- 화면: "자유 운동"으로 표시 (맥락 손실)
```

---

### 📋 체크리스트

#### 배포 전:
- [ ] 데이터베이스 백업
- [ ] Flyway 마이그레이션 테스트
- [ ] 기존 세션 데이터 스냅샷 채우기 확인
- [ ] 외래 키 제약 변경 확인 (`ON DELETE SET NULL`)

#### 배포 후:
- [ ] 루틴 삭제 동작 확인 (에러 없이 삭제됨)
- [ ] 운동 기록 조회 정상 (제목 보존됨)
- [ ] 필터링 정상 ("루틴" 필터에 포함)
- [ ] 프론트엔드 UI 정상 (깔끔하게 표시)

---

### 🎯 핵심 교훈

#### 1. 스냅샷 패턴의 중요성

```
운동 종목: exercise_name (스냅샷)
운동 부위: body_part_snapshot (스냅샷)
루틴 제목: routine_title_snapshot (스냅샷)  ← 추가
```
→ **일관된 데이터 영속성 전략**

#### 2. 외래 키 제약 옵션

```
ON DELETE RESTRICT: 삭제 불가 (기본값)
ON DELETE CASCADE: 연쇄 삭제 (위험)
ON DELETE SET NULL: 참조만 제거 (안전) ✅
```

#### 3. UX 관점의 데이터 설계

- 기술적으로는 `routine_id = null`
- 사용자에게는 "상체 루틴 A"로 보임
- 부정적 표현 없음 ("(삭제됨)" 표시 안 함)

---

### 📚 관련 문서

- [ROUTINE_DELETE_FEATURE.md](./ROUTINE_DELETE_FEATURE.md) - 전체 구현 상세 문서
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 스냅샷 기반 영속성 원칙

---

### 📝 작성 정보

- **작성일**: 2026-03-07
- **문제 발생 환경**: Spring Boot 4.0.1, MySQL, JPA/Hibernate
- **해결 시간**: 약 3시간
- **핵심 해결책**:
  1. `routine_title_snapshot` 컬럼 추가 (스냅샷)
  2. `ON DELETE SET NULL` 외래 키 제약
  3. 2단계 삭제 플로우 (활성 → 보관 → 삭제)
  4. 깔끔한 UI (삭제 여부 표시 안 함)
