"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import WeatherCard from "@/components/WeatherCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationData, getCurrentWeather, getForecast, WeatherData, HourlyForecast, DailyForecast } from "@/lib/weather-api";
import { getWeatherIcon, getWeatherDescription } from "@/lib/weather-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApiKeyChecker from "@/components/ApiKeyChecker";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 클라이언트 사이드 확인 (SSR 대응)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 기본 위치 (서울)로 초기화
  useEffect(() => {
    const defaultLocation: LocationData = {
      name: "서울",
      country: "KR",
      lat: 37.5665,
      lon: 126.9780
    };
    setSelectedLocation(defaultLocation);
  }, []);

  // 위치가 선택되면 날씨 데이터 로드
  useEffect(() => {
    if (selectedLocation) {
      loadWeatherData(selectedLocation);
    }
  }, [selectedLocation]);

  const loadWeatherData = async (location: LocationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(location.lat, location.lon),
        getForecast(location.lat, location.lon)
      ]);

      // 현재 날씨 데이터에 지역명 업데이트
      setWeatherData({
        ...currentWeather,
        location: location.name
      });

      setHourlyForecast(forecast.hourly);
      setDailyForecast(forecast.daily);
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  // 임시 날씨 데이터 (API 연동 실패 시 대체용)
  const fallbackWeatherData = {
    location: selectedLocation?.name || "서울",
    temperature: 22,
    condition: "맑음",
    humidity: 65,
    windSpeed: 3.2,
    icon: "01d",
    description: "맑음",
    feelsLike: 24,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    precipitation: 20,
  };

  // SSR 대응: 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <Header onLocationSelect={handleLocationSelect} />

      {/* 메인 콘텐츠 - 데스크톱 중앙 정렬 강제 적용 */}
      <div className="flex justify-center w-full">
        <div className="max-w-6xl w-full px-4 py-8">
          <div className="flex flex-col items-center gap-12">
            {/* API 키 상태 체크 */}
            <div className="w-full flex justify-center">
              <ApiKeyChecker />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="w-full flex justify-center">
                <Alert className="max-w-2xl" role="alert" aria-live="assertive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">날씨 정보 로드 실패</div>
                      <div>{error}</div>
                      <div className="text-sm">
                        <button
                          onClick={() => {
                            setError(null);
                            if (selectedLocation) {
                              loadWeatherData(selectedLocation);
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 underline mr-4"
                        >
                          다시 시도
                        </button>
                        <button
                          onClick={() => setError(null)}
                          className="text-gray-500 hover:text-gray-700 underline"
                        >
                          오류 닫기
                        </button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* 현재 날씨 카드 */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {isLoading ? (
                <div className="w-full max-w-lg">
                  {/* 향상된 WeatherCard Skeleton */}
                  <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                    <CardHeader className="text-center" style={{ paddingBottom: '1.5rem' }}>
                      <Skeleton className="h-8 w-32 mx-auto" />
                    </CardHeader>
                    <CardContent>
                      {/* 메인 날씨 정보 */}
                      <div className="flex flex-col items-center gap-6 mb-8">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="text-center">
                          <Skeleton className="h-16 w-32 mb-3 mx-auto" />
                          <Skeleton className="h-6 w-40 mx-auto" />
                        </div>
                      </div>

                      {/* 상세 정보 그리드 스켈레톤 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', paddingTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid rgba(229, 231, 235, 0.3)' }}>
                        {Array.from({ length: 3 }, (_, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl" style={{ padding: '0.75rem' }}>
                            <Skeleton className="h-5 w-5 mx-auto mb-2" />
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(229, 231, 235, 0.3)' }}>
                        {Array.from({ length: 4 }, (_, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl" style={{ padding: '0.75rem' }}>
                            <Skeleton className="h-5 w-5 mx-auto mb-2" />
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <WeatherCard
                  {...(weatherData || fallbackWeatherData)}
                  icon={weatherData?.icon || fallbackWeatherData.icon}
                  description={weatherData?.description || fallbackWeatherData.description}
                  feelsLike={weatherData?.feelsLike || fallbackWeatherData.temperature + 2}
                  pressure={weatherData?.pressure || 1013}
                  visibility={weatherData?.visibility || 10}
                  uvIndex={weatherData?.uvIndex || 5}
                  precipitation={weatherData?.precipitation || 20}
                />
              )}
            </div>

            {/* 예보 섹션 */}
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <Tabs defaultValue="hourly" className="w-full">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <TabsList className="grid grid-cols-2" style={{ width: '100%', maxWidth: '320px' }}>
                    <TabsTrigger value="hourly" className="text-sm font-medium">24시간 예보</TabsTrigger>
                    <TabsTrigger value="daily" className="text-sm font-medium">7일 예보</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="hourly" className="w-full">
                  <div className="mb-4 text-sm text-muted-foreground text-center">
                    📈 24시간 시간별 예보 (1시간 간격) - 가로 스크롤하여 모든 시간 확인 가능
                  </div>
                  <div className="w-full">
                    {/* 온도 그래프 */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border">
                      <div className="mb-3 text-sm font-semibold text-center">🌡️ 온도 변화 그래프</div>
                      <div className="flex items-end gap-1 h-24 overflow-x-auto pb-2" style={{ minWidth: '100%' }}>
                        {(hourlyForecast.length > 0 ? hourlyForecast : Array.from({ length: 24 }, (_, i) => ({
                          time: `${new Date(Date.now() + i * 60 * 60 * 1000).getHours()}:00`,
                          temperature: Math.round(22 + Math.sin(i * 0.3) * 5),
                          condition: "Clear",
                          icon: "01d"
                        }))).map((forecast, i) => {
                          const maxTemp = Math.max(...(hourlyForecast.length > 0 ? hourlyForecast : Array.from({ length: 24 }, (_, j) => 22 + Math.sin(j * 0.3) * 5)).map(f => f.temperature));
                          const minTemp = Math.min(...(hourlyForecast.length > 0 ? hourlyForecast : Array.from({ length: 24 }, (_, j) => 22 + Math.sin(j * 0.3) * 5)).map(f => f.temperature));
                          const height = ((forecast.temperature - minTemp) / (maxTemp - minTemp)) * 80 + 20;

                          return (
                            <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '85px' }}>
                              <div className="text-xs font-medium mb-1">{forecast.temperature}°</div>
                              <div
                                className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                                style={{ height: `${height}px`, width: '24px' }}
                              ></div>
                              <div className="text-xs text-muted-foreground mt-1">{forecast.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 시간별 예보 카드 */}
                    <div className="overflow-x-auto">
                      {isLoading ? (
                        <div className="flex gap-2 pb-4" style={{ width: '2160px' }}>
                          {Array.from({ length: 24 }, (_, i) => (
                            <Skeleton key={i} className="h-32 w-[85px] rounded-lg flex-shrink-0" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2 pb-4" style={{ width: '2160px' }}>
                          {hourlyForecast.length > 0 ? hourlyForecast.map((forecast, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 flex-shrink-0"
                              style={{ width: '85px' }}
                            >
                              <div className="text-xs text-muted-foreground font-medium mb-1">
                                {forecast.time}
                              </div>
                              <div className="text-lg mb-1">
                                {getWeatherIcon(forecast.icon || "01d")}
                              </div>
                              <div className="font-bold text-sm">{forecast.temperature}°</div>
                              <div className="text-xs text-blue-500 font-medium">
                                {(forecast as HourlyForecast & { precipitation?: number }).precipitation ||
                                  (forecast.condition === "Rain" ? 80 :
                                    forecast.condition === "Clouds" ? 40 :
                                      forecast.condition === "Snow" ? 70 : 10)
                                }%
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {getWeatherDescription(forecast.condition)}
                              </div>
                            </div>
                          )) : (
                            <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                              <div className="text-center">
                                <div className="text-lg mb-2">📊</div>
                                <div>지역을 선택하면 시간별 예보가 표시됩니다</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="daily" className="w-full">
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div style={{ width: '100%', maxWidth: '600px' }}>
                      {isLoading ? (
                        Array.from({ length: 7 }, (_, i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-xl mb-3" />
                        ))
                      ) : (
                        dailyForecast.length > 0 ? dailyForecast.map((forecast, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700"
                            style={{ marginBottom: '0.75rem' }}
                          >
                            <div className="flex items-center space-x-5 flex-1">
                              <div className="text-sm font-semibold w-16 text-left">
                                {i === 0 ? '오늘' : forecast.day}
                              </div>
                              <div className="text-2xl">
                                {getWeatherIcon(forecast.icon || "01d")}
                              </div>
                              <div className="text-sm text-muted-foreground flex-1 text-left font-medium">
                                {getWeatherDescription(forecast.condition)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-right">
                              <span className="font-bold text-lg text-foreground">{forecast.maxTemp}°</span>
                              <span className="text-muted-foreground text-sm font-medium">{forecast.minTemp}°</span>
                            </div>
                          </div>
                        )) : (
                          <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                            <div className="text-center">
                              <div className="text-lg mb-2">📅</div>
                              <div>지역을 선택하면 7일 예보가 표시됩니다</div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }}>
          <p className="text-sm text-muted-foreground font-medium">
            데이터 제공: OpenWeatherMap | © 2024 날씨정보 서비스
          </p>
        </div>
      </footer>
    </div>
  );
}
