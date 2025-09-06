"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCacheInfo, clearAllCache } from "@/lib/cache";
import { Trash2, Database } from "lucide-react";

export default function CacheManager() {
    const [cacheInfo, setCacheInfo] = useState({
        totalCaches: 0,
        totalSize: 0,
        oldestCache: undefined as string | undefined,
        newestCache: undefined as string | undefined,
    });

    const updateCacheInfo = () => {
        const info = getCacheInfo();
        setCacheInfo(info);
    };

    useEffect(() => {
        updateCacheInfo();

        // 1분마다 캐시 정보 업데이트
        const interval = setInterval(updateCacheInfo, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleClearCache = () => {
        clearAllCache();
        updateCacheInfo();
    };

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    캐시 관리
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">캐시 항목</div>
                        <div className="font-semibold">{cacheInfo.totalCaches}개</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">사용 용량</div>
                        <div className="font-semibold">{cacheInfo.totalSize}KB</div>
                    </div>
                </div>

                {cacheInfo.totalCaches > 0 && (
                    <div className="space-y-2 text-xs">
                        {cacheInfo.newestCache && (
                            <div>
                                <Badge variant="secondary">최신</Badge>
                                <span className="ml-2 text-muted-foreground">{cacheInfo.newestCache}</span>
                            </div>
                        )}
                        {cacheInfo.oldestCache && (
                            <div>
                                <Badge variant="outline">오래됨</Badge>
                                <span className="ml-2 text-muted-foreground">{cacheInfo.oldestCache}</span>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearCache}
                    disabled={cacheInfo.totalCaches === 0}
                    className="w-full"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    캐시 전체 삭제
                </Button>

                <div className="text-xs text-muted-foreground">
                    • 날씨 데이터: 5분 캐시
                    • 예보 데이터: 15분 캐시
                    • 자동 만료 관리
                </div>
            </CardContent>
        </Card>
    );
}

