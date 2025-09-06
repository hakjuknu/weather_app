"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react";
import Header from "@/components/Header";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import {
  LocationData,
  getCurrentWeather,
  getForecast,
  searchLocations,
  WeatherData,
  HourlyForecast,
  DailyForecast
} from "@/lib/weather-api";
import CacheManager from "@/components/CacheManager";
import { getWeatherIcon, getWeatherDescription } from "@/lib/weather-utils";

export default function TestPage() {
  // 상태 관리
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [isClient, setIsClient] = useState(false);

  // API 키 체크
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  // 2단계 기능 테스트 함수들
  const handleLocationSelect = async (location: LocationData) => {
    setSelectedLocation(location);
    setIsLoading(true);
    setError(null);

    try {
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(location.lat, location.lon),
        getForecast(location.lat, location.lon)
      ]);

      setWeatherData({
        ...currentWeather,
        location: location.name
      });
      setHourlyForecast(forecast.hourly);
      setDailyForecast(forecast.daily);

      // 테스트 성공 기록
      setTestResults(prev => ({
        ...prev,
        locationSearch: true,
        weatherApi: true,
        forecastApi: true
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 정보를 불러올 수 없습니다.');
      setTestResults(prev => ({
        ...prev,
        weatherApi: false,
        forecastApi: false
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // API 연결 테스트
  const testApiConnection = async () => {
    setApiStatus('checking');
    try {
      await searchLocations('seoul', 1);
      setApiStatus('success');
      setTestResults(prev => ({ ...prev, apiConnection: true }));
    } catch {
      setApiStatus('error');
      setTestResults(prev => ({ ...prev, apiConnection: false }));
    }
  };

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 컴포넌트 마운트 시 API 테스트
  useEffect(() => {
    testApiConnection();
  }, []);

  // 로컬 스토리지 테스트
  const testLocalStorage = () => {
    try {
      const testData = { test: 'data', timestamp: Date.now() };
      localStorage.setItem('weather-test', JSON.stringify(testData));
      const retrieved = localStorage.getItem('weather-test');
      localStorage.removeItem('weather-test');

      setTestResults(prev => ({
        ...prev,
        localStorage: retrieved === JSON.stringify(testData)
      }));
    } catch {
      setTestResults(prev => ({ ...prev, localStorage: false }));
    }
  };

  useEffect(() => {
    testLocalStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Header onLocationSelect={handleLocationSelect} />

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 2단계 기능 테스트 페이지</h1>
          <p className="text-muted-foreground">지역 검색, API 연동, 데이터 저장 등 핵심 기능들을 테스트합니다</p>
        </div>

        {/* API 상태 체크 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔑 API 키 & 연결 상태 테스트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={apiKey ? "default" : "destructive"}>
                    {apiKey ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {apiKey ? "API 키 설정됨" : "API 키 없음"}
                  </Badge>
                </div>
                {apiKey && (
                  <p className="text-sm text-muted-foreground">
                    키: {apiKey.substring(0, 8)}...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={apiStatus === 'success' ? "default" : apiStatus === 'error' ? "destructive" : "secondary"}>
                    {apiStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {apiStatus === 'success' && <Wifi className="h-3 w-3" />}
                    {apiStatus === 'error' && <WifiOff className="h-3 w-3" />}
                    {apiStatus === 'checking' ? "연결 확인 중" : apiStatus === 'success' ? "API 연결 성공" : "API 연결 실패"}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={testApiConnection}>
                  다시 테스트
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LocationSearch 컴포넌트 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 LocationSearch 컴포넌트 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-md mx-auto">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="지역을 검색해보세요..."
              />
            </div>

            <div className="text-sm space-y-2">
              <p><strong>테스트 방법:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>검색창에 도시명을 입력해보세요 (예: 서울, 부산, tokyo)</li>
                <li>자동완성 결과를 클릭해보세요</li>
                <li>현재 위치 버튼을 클릭해보세요 (GPS 권한 필요)</li>
                <li>최근 검색 기록이 저장되는지 확인해보세요</li>
              </ul>
            </div>

            {selectedLocation && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  선택된 위치: <strong>{selectedLocation.name}</strong>
                  ({selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 날씨 API 연동 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>🌤️ 실시간 날씨 API 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>날씨 정보를 불러오는 중...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : weatherData ? (
              <div className="max-w-md mx-auto">
                <WeatherCard
                  {...weatherData}
                  icon={weatherData.icon}
                  description={weatherData.description}
                  feelsLike={weatherData.feelsLike}
                  pressure={weatherData.pressure}
                  visibility={weatherData.visibility}
                  uvIndex={weatherData.uvIndex}
                  precipitation={weatherData.precipitation}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                위에서 지역을 선택하면 실시간 날씨 정보가 표시됩니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 예보 데이터 테스트 */}
        {(hourlyForecast.length > 0 || dailyForecast.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📊 예보 데이터 테스트
                {selectedLocation && (
                  <div className="text-sm font-normal text-muted-foreground">
                    {selectedLocation.name} ({selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)})
                    <div className="text-xs">
                      업데이트: {new Date().toLocaleTimeString('ko-KR')}
                    </div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hourly" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hourly">시간별 예보</TabsTrigger>
                  <TabsTrigger value="daily">일별 예보</TabsTrigger>
                </TabsList>

                <TabsContent value="hourly" className="mt-4">
                  <div className="mb-4 text-sm text-muted-foreground text-center">
                    📊 24시간 시간별 예보 ({hourlyForecast.length}개 데이터) - 가로 스크롤 가능
                  </div>

                  {/* 온도 그래프 */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border">
                    <div className="mb-3 text-sm font-semibold text-center">🌡️ 온도 변화 그래프</div>
                    <div className="overflow-x-auto">
                      <div className="flex items-end gap-1 h-24 pb-2" style={{ minWidth: '2040px' }}>
                        {(hourlyForecast.length > 0 ? hourlyForecast.slice(0, 24) :
                          Array.from({ length: 24 }, (_, i) => ({
                            time: `${(new Date().getHours() + i) % 24}:00`,
                            temperature: Math.round(22 + Math.sin(i * 0.3) * 5),
                            condition: "Clear",
                            icon: "01d",
                            precipitation: (i * 3) % 20
                          }))
                        ).map((forecast, i) => {
                          const allTemps = hourlyForecast.length > 0 ?
                            hourlyForecast.slice(0, 24).map(f => f.temperature) :
                            Array.from({ length: 24 }, (_, j) => 22 + Math.sin(j * 0.3) * 5);
                          const maxTemp = Math.max(...allTemps);
                          const minTemp = Math.min(...allTemps);
                          const height = ((forecast.temperature - minTemp) / (maxTemp - minTemp || 1)) * 80 + 20;

                          return (
                            <div key={i} className="flex flex-col items-center flex-shrink-0" style={{ width: '80px' }}>
                              <div className="text-xs font-medium mb-1">{forecast.temperature}°</div>
                              <div
                                className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                                style={{ height: `${height}px`, width: '20px' }}
                                title={`${forecast.time}: ${forecast.temperature}°C`}
                              ></div>
                              <div className="text-xs text-muted-foreground mt-1">{forecast.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 시간별 예보 카드 */}
                  <div className="overflow-x-auto bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 border">
                    <div className="flex gap-2 pb-2" style={{ minWidth: '2040px' }}>
                      {hourlyForecast.slice(0, 24).map((forecast, i) => (
                        <div key={i} className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm flex-shrink-0" style={{ width: '80px' }}>
                          <div className="text-xs text-muted-foreground mb-1">
                            {forecast.time}
                          </div>
                          <div className="text-lg mb-1">
                            {getWeatherIcon(forecast.icon)}
                          </div>
                          <div className="font-semibold text-sm">{forecast.temperature}°</div>
                          <div className="text-xs text-blue-500 font-medium">
                            {forecast.precipitation || 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getWeatherDescription(forecast.condition)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="daily" className="mt-4">
                  <div className="mb-3 text-sm text-muted-foreground text-center">
                    일별 예보 ({dailyForecast.length}개 데이터)
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    {dailyForecast.slice(0, 5).map((forecast, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium">
                            {i === 0 ? '오늘' : forecast.day}
                          </span>
                          <span className="text-xl">
                            {getWeatherIcon(forecast.icon)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getWeatherDescription(forecast.condition)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold">{forecast.maxTemp}°</span>
                          <span className="text-muted-foreground">{forecast.minTemp}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* 테스트 결과 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>✅ 테스트 결과 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {Object.entries({
                'API 연결': testResults.apiConnection,
                '로컬 저장소': testResults.localStorage,
                '지역 검색': testResults.locationSearch,
                '날씨 API': testResults.weatherApi,
                '예보 API': testResults.forecastApi,
              }).map(([name, result]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <span className="font-medium">{name}</span>
                  <Badge variant={result === true ? "default" : result === false ? "destructive" : "secondary"}>
                    {result === true && <Check className="h-3 w-3" />}
                    {result === false && <X className="h-3 w-3" />}
                    {result === undefined && <Clock className="h-3 w-3" />}
                    {result === true ? "성공" : result === false ? "실패" : "대기"}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>참고:</strong> API 키가 설정되지 않았거나 잘못된 경우 일부 테스트가 실패할 수 있습니다.
                <code className="ml-2">.env.local</code> 파일에 올바른 OpenWeatherMap API 키를 설정해주세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 캐시 관리 테스트 */}
        <div className="flex justify-center">
          <CacheManager />
        </div>

        {/* 추가 기능 테스트 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 추가 테스트 사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">최근 검색 기능 테스트:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>여러 지역을 검색한 후 검색창을 다시 클릭해보세요</li>
                  <li>최근 검색 기록이 표시되는지 확인하세요</li>
                  <li>최근 검색 항목을 삭제할 수 있는지 확인하세요</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">GPS 현재 위치 테스트:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>검색창에서 &quot;현재 위치 사용&quot; 버튼을 클릭해보세요</li>
                  <li>브라우저의 위치 권한을 허용해주세요</li>
                  <li>현재 위치의 날씨가 정확히 표시되는지 확인하세요</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">에러 처리 테스트:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>존재하지 않는 지역명을 검색해보세요</li>
                  <li>인터넷 연결을 끊고 검색해보세요</li>
                  <li>적절한 에러 메시지가 표시되는지 확인하세요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
