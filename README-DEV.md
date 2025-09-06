# 🛠️ 개발자 가이드

## 🚀 자동화된 개발 서버 시작 방법

이제 더 이상 수동으로 `npm run dev`를 입력할 필요가 없습니다!

### 방법 1: 자동 스크립트 실행 (권장)

**Windows PowerShell:**
```bash
.\start-dev.ps1
```

**Windows Command Prompt:**
```bash
start-dev.bat
```

### 방법 2: VSCode/Cursor 태스크 사용

1. **Ctrl+Shift+P** → `Tasks: Run Task` 
2. **"Dev Server Auto Start"** 선택
3. 자동으로 서버 시작 및 브라우저 접속 안내

### 방법 3: 빠른 npm 스크립트

```bash
# 터보 모드로 빠른 시작
npm run dev:auto

# 캐시 정리 후 시작  
npm run dev:clean

# 프로세스 정리 후 재시작
npm run dev:restart
```

## ⚡ 자동화 기능들

### 🔄 **자동 프로세스 정리**
- 기존 Node.js 프로세스 자동 종료
- 포트 충돌 방지

### 📁 **자동 캐시 관리**
- .next 폴더 자동 정리
- 환경변수 변경시 캐시 클리어

### 🌍 **환경변수 자동 설정**
- .env.local 파일 자동 생성
- API 키 기본값 설정

### 📊 **상태 모니터링**
- 컬러 코딩된 상태 메시지
- 접속 URL 자동 표시

## 💡 사용법

이제 다음과 같이 사용하세요:

1. **프로젝트 열기**
2. **`.\start-dev.ps1`** 실행 (또는 다른 방법)
3. **자동으로 서버 시작 및 접속 안내**
4. **코드 수정시 자동 리로딩**

더 이상 수동으로 서버 관리할 필요가 없습니다! 🎉

