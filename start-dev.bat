@echo off
echo 🌤️ 날씨 앱 개발 서버를 시작합니다...

echo ⏹️ 기존 Node.js 프로세스 정리 중...
taskkill /f /im node.exe 2>nul
timeout /t 1 /nobreak >nul

echo ✅ 환경변수 파일 확인 중...
if not exist .env.local (
    echo ⚠️ .env.local 파일이 없습니다. 생성 중...
    echo NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=cd5dba61c3d4e98408e32ad36f15c1e9 > .env.local
    echo ✅ 환경변수 파일 생성 완료
)

if exist .next (
    echo 🗑️ Next.js 캐시 정리 중...
    rmdir /s /q .next 2>nul
)

echo 🚀 개발 서버 시작 중...
echo 📍 접속 주소: http://localhost:3000
echo 📍 테스트 페이지: http://localhost:3000/test
echo 💡 Ctrl+C로 서버를 중지할 수 있습니다.
echo.

npm run dev

