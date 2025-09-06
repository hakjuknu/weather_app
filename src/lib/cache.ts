/**
 * 데이터 캐싱 유틸리티
 */

export interface CacheData<T> {
    data: T;
    timestamp: number;
    expiresIn: number; // 만료 시간 (ms)
}

const CACHE_PREFIX = 'weather-app-cache';

/**
 * 데이터를 캐시에 저장
 */
export function setCache<T>(key: string, data: T, expiresInMinutes: number = 10): void {
    try {
        const cacheData: CacheData<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: expiresInMinutes * 60 * 1000, // 분을 밀리초로 변환
        };

        const cacheKey = `${CACHE_PREFIX}-${key}`;
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('캐시 저장 실패:', error);
    }
}

/**
 * 캐시에서 데이터 가져오기
 */
export function getCache<T>(key: string): T | null {
    try {
        const cacheKey = `${CACHE_PREFIX}-${key}`;
        const cached = localStorage.getItem(cacheKey);

        if (!cached) {
            return null;
        }

        const cacheData: CacheData<T> = JSON.parse(cached);
        const now = Date.now();

        // 캐시가 만료되었는지 확인
        if (now - cacheData.timestamp > cacheData.expiresIn) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return cacheData.data;
    } catch (error) {
        console.warn('캐시 읽기 실패:', error);
        return null;
    }
}

/**
 * 특정 키의 캐시 삭제
 */
export function removeCache(key: string): void {
    try {
        const cacheKey = `${CACHE_PREFIX}-${key}`;
        localStorage.removeItem(cacheKey);
    } catch (error) {
        console.warn('캐시 삭제 실패:', error);
    }
}

/**
 * 모든 캐시 삭제
 */
export function clearAllCache(): void {
    try {
        const keys = Object.keys(localStorage).filter(key =>
            key.startsWith(CACHE_PREFIX)
        );

        keys.forEach(key => localStorage.removeItem(key));
        console.log(`${keys.length}개의 캐시 항목을 삭제했습니다.`);
    } catch (error) {
        console.warn('캐시 전체 삭제 실패:', error);
    }
}

/**
 * 캐시 상태 확인
 */
export function getCacheInfo(): {
    totalCaches: number;
    totalSize: number;
    oldestCache?: string;
    newestCache?: string;
} {
    try {
        const cacheKeys = Object.keys(localStorage).filter(key =>
            key.startsWith(CACHE_PREFIX)
        );

        let totalSize = 0;
        let oldestTimestamp = Infinity;
        let newestTimestamp = 0;
        let oldestCache = '';
        let newestCache = '';

        cacheKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += value.length;

                try {
                    const cacheData = JSON.parse(value);
                    if (cacheData.timestamp < oldestTimestamp) {
                        oldestTimestamp = cacheData.timestamp;
                        oldestCache = key;
                    }
                    if (cacheData.timestamp > newestTimestamp) {
                        newestTimestamp = cacheData.timestamp;
                        newestCache = key;
                    }
                } catch {
                    // JSON 파싱 실패시 무시
                }
            }
        });

        return {
            totalCaches: cacheKeys.length,
            totalSize: Math.round(totalSize / 1024), // KB 단위
            oldestCache: oldestCache ? oldestCache.replace(CACHE_PREFIX + '-', '') : undefined,
            newestCache: newestCache ? newestCache.replace(CACHE_PREFIX + '-', '') : undefined,
        };
    } catch (error) {
        console.warn('캐시 정보 조회 실패:', error);
        return { totalCaches: 0, totalSize: 0 };
    }
}

