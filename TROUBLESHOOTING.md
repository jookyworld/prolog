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

## 📝 작성 정보

- **작성일**: 2026-03-05
- **문제 발생 환경**: macOS, Node.js, Expo SDK 54
- **해결 시간**: 약 30분
- **최종 해결책**: node_modules 완전 재설치
