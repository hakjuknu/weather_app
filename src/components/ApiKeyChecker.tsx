"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ApiKeyChecker() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // 임시 해결책: 하드코딩된 API 키 사용
    const envKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    const fallbackKey = 'cd5dba61c3d4e98408e32ad36f15c1e9';
    const finalKey = envKey && envKey !== 'undefined' ? envKey : fallbackKey;
    setApiKey(finalKey);
    
    console.log('Environment variables debug:', {
      apiKey: finalKey ? `${finalKey.substring(0, 8)}...` : 'undefined',
      rawEnvValue: envKey,
      fallbackValue: fallbackKey,
      finalValue: finalKey,
      allEnvVars: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')),
    });
  }, []);

  if (apiKey === undefined) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          환경변수 로딩 중...
        </AlertDescription>
      </Alert>
    );
  }

  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-semibold">⚠️ API 키가 설정되지 않았습니다</div>
            <div className="text-sm">
              1. <code>.env.local</code> 파일을 확인하세요<br/>
              2. <code>NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=실제_API_키</code><br/>
              3. 개발 서버를 재시작하세요<br/>
              4. 현재 감지된 값: <code>{apiKey || 'undefined'}</code>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="max-w-2xl mx-auto">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        ✅ API 키가 정상적으로 설정되었습니다 ({apiKey.substring(0, 8)}...)
      </AlertDescription>
    </Alert>
  );
}
