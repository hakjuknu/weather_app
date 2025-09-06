"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchLocations, LocationData } from "@/lib/weather-api";
import { useDebounce } from "@/hooks/useDebounce";

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "지역을 검색하세요...",
  className = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 디바운스된 검색어 (500ms 지연)
  const debouncedQuery = useDebounce(query, 500);

  // 컴포넌트 마운트 시 최근 검색 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('weather-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('최근 검색 기록 로드 실패:', error);
      }
    }
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 디바운스된 검색어로 API 호출
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('검색 시작:', debouncedQuery);
        const searchResults = await searchLocations(debouncedQuery, 8);
        console.log('검색 결과:', searchResults);
        
        setResults(searchResults);
        if (searchResults.length > 0) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
        setError(null); // 성공시 에러 초기화
      } catch (err) {
        console.error('Location search error:', err);
        const errorMessage = err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.';
        setError(errorMessage);
        setResults([]);
        setIsOpen(true); // 에러 메시지 표시를 위해 드롭다운 열기
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // 지역 선택 처리
  const handleLocationSelect = (location: LocationData) => {
    setQuery("");
    setIsOpen(false);
    setResults([]);
    
    // 최근 검색에 추가
    const updatedRecent = [
      location,
      ...recentSearches.filter(item => 
        !(item.lat === location.lat && item.lon === location.lon)
      )
    ].slice(0, 5); // 최대 5개까지만 저장

    setRecentSearches(updatedRecent);
    localStorage.setItem('weather-recent-searches', JSON.stringify(updatedRecent));

    onLocationSelect(location);
  };

  // 최근 검색 삭제
  const handleRemoveRecent = (location: LocationData, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = recentSearches.filter(item => 
      !(item.lat === location.lat && item.lon === location.lon)
    );
    setRecentSearches(updated);
    localStorage.setItem('weather-recent-searches', JSON.stringify(updated));
  };

  // 입력 필드 포커스 시
  const handleInputFocus = () => {
    if (query.trim() === '' && recentSearches.length > 0) {
      setIsOpen(true);
    } else if (query.trim() !== '' && results.length > 0) {
      setIsOpen(true);
    }
  };

  // 현재 위치 사용
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const location: LocationData = {
              name: "현재 위치",
              country: "KR",
              lat: latitude,
              lon: longitude
            };
            handleLocationSelect(location);
          } catch {
            setError("현재 위치를 가져올 수 없습니다.");
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setError("위치 접근이 거부되었습니다.");
          setIsLoading(false);
        }
      );
    } else {
      setError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
    }
  };

  // 지역 표시 포맷팅
  const formatLocation = (location: LocationData) => {
    const parts = [location.name];
    if (location.state && location.state !== location.name) {
      parts.push(location.state);
    }
    if (location.country) {
      parts.push(location.country);
    }
    return parts.join(", ");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={isLoading}
          aria-label="지역 검색"
          aria-describedby={error ? "search-error" : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-[9999] shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {/* 에러 메시지 */}
            {error && (
              <div 
                className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                role="alert"
                aria-live="polite"
              >
                <div className="font-medium mb-1">⚠️ 검색 오류</div>
                <div>{error}</div>
                <div className="mt-2 text-xs">
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 underline"
                  >
                    오류 메시지 닫기
                  </button>
                </div>
              </div>
            )}

            {/* 현재 위치 사용 버튼 */}
            {query.trim() === '' && (
              <Button
                variant="ghost"
                onClick={handleUseCurrentLocation}
                disabled={isLoading}
                className="w-full justify-start p-3 h-auto text-left hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                <div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">현재 위치 사용</div>
                  <div className="text-xs text-muted-foreground">GPS로 현재 위치의 날씨를 확인합니다</div>
                </div>
              </Button>
            )}

            {/* 최근 검색 기록 */}
            {query.trim() === '' && recentSearches.length > 0 && (
              <div className="mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  최근 검색
                </div>
                {recentSearches.map((location, index) => (
                  <Button
                    key={`${location.lat}-${location.lon}-${index}`}
                    variant="ghost"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full justify-start p-3 h-auto text-left relative group"
                  >
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{formatLocation(location)}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveRecent(location, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Button>
                ))}
              </div>
            )}

            {/* 검색 결과 */}
            {query.trim() !== '' && results.length > 0 && !isLoading && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-700/50">
                  검색 결과 ({results.length}개)
                </div>
                {results.map((location, index) => (
                  <Button
                    key={`${location.lat}-${location.lon}-${index}`}
                    variant="ghost"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full justify-start p-3 h-auto text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium">{formatLocation(location)}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {location.country}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
            
            {/* 로딩 중 */}
            {isLoading && query.trim() !== '' && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">검색 중...</span>
              </div>
            )}

            {/* 검색 결과 없음 */}
            {query.trim() !== '' && !isLoading && results.length === 0 && !error && (
              <div className="p-3 text-sm text-muted-foreground text-center">
                &apos;{query}&apos;에 대한 검색 결과가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

