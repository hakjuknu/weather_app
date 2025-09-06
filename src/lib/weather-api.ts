// OpenWeatherMap API 연동 서비스
import { setCache, getCache } from './cache';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'cd5dba61c3d4e98408e32ad36f15c1e9';
const BASE_URL = 'https://api.openweathermap.org';

// 지역 정보 타입 정의
export interface LocationData {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  local_names?: { [key: string]: string };
}

// 현재 날씨 데이터 타입 정의
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  icon: string;
  precipitation: number; // 강수확률 (%)
}

// 시간별 예보 데이터 타입 정의
export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number; // 강수확률 (%)
}

// 일별 예보 데이터 타입 정의
export interface DailyForecast {
  date: string;
  day: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Geocoding API로 지역 검색
 */
export async function searchLocations(query: string, limit: number = 5): Promise<LocationData[]> {
  if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY.trim() === '' || API_KEY === 'undefined') {
    console.warn('API 키가 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    return getMockLocationData(query, limit);
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`API 요청 실패: ${response.status}. Mock 데이터를 사용합니다.`);
      return getMockLocationData(query, limit);
    }

    const data: LocationData[] = await response.json();
    return data;
  } catch (error) {
    console.warn('지역 검색 중 오류 발생. Mock 데이터를 사용합니다:', error);
    return getMockLocationData(query, limit);
  }
}

/**
 * 현재 날씨 정보 가져오기 (캐싱 포함)
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  // 캐시 키 생성
  const cacheKey = `weather-${lat.toFixed(2)}-${lon.toFixed(2)}`;

  // 캐시에서 먼저 확인 (5분 캐시)
  const cachedWeather = getCache<WeatherData>(cacheKey);
  if (cachedWeather) {
    console.log('캐시된 날씨 데이터 사용:', cacheKey);
    return cachedWeather;
  }

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('API 키가 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    const mockData = getMockWeatherData(lat, lon);
    setCache(cacheKey, mockData, 5); // 5분 캐시
    return mockData;
  }

  try {
    const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`API 요청 실패: ${response.status}. Mock 데이터를 사용합니다.`);
      return getMockWeatherData(lat, lon);
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      pressure: data.main.pressure,
      visibility: Math.round((data.visibility || 10000) / 1000),
      uvIndex: 0,
      feelsLike: Math.round(data.main.feels_like),
      icon: data.weather[0].icon,
      precipitation: Math.round((data.rain?.['1h'] || data.snow?.['1h'] || 0) * 100) ||
        (data.weather[0].main === 'Rain' ? 80 :
          data.weather[0].main === 'Clouds' ? 20 : 5),
    };

    // 캐시에 저장 (5분)
    setCache(cacheKey, weatherData, 5);
    return weatherData;
  } catch (error) {
    console.warn('현재 날씨 조회 중 오류 발생. Mock 데이터를 사용합니다:', error);
    const mockData = getMockWeatherData(lat, lon);
    setCache(cacheKey, mockData, 5); // Mock 데이터도 캐시
    return mockData;
  }
}

/**
 * 예보 정보 가져오기 (캐싱 포함)
 */
export async function getForecast(lat: number, lon: number): Promise<{
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}> {
  // 캐시 키 생성
  const cacheKey = `forecast-${lat.toFixed(2)}-${lon.toFixed(2)}`;

  // 캐시에서 먼저 확인 (15분 캐시)
  const cachedForecast = getCache<{ hourly: HourlyForecast[], daily: DailyForecast[] }>(cacheKey);
  if (cachedForecast) {
    console.log('캐시된 예보 데이터 사용:', cacheKey);
    return cachedForecast;
  }

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('API 키가 설정되지 않았습니다. Mock 예보 데이터를 사용합니다.');
    const mockData = getMockForecastData(lat, lon);
    setCache(cacheKey, mockData, 15); // 15분 캐시
    return mockData;
  }

  try {
    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`API 요청 실패: ${response.status}. Mock 예보 데이터를 사용합니다.`);
      return getMockForecastData(lat, lon);
    }

    const data = await response.json();

    // 24시간 예보 생성 (3시간 데이터를 1시간으로 보간)
    const hourly: HourlyForecast[] = [];
    for (let i = 0; i < 24; i++) {
      const targetTime = new Date(Date.now() + i * 60 * 60 * 1000);
      const apiDataIndex = Math.floor(i / 3);
      const nextApiDataIndex = Math.min(apiDataIndex + 1, data.list.length - 1);

      if (apiDataIndex < data.list.length) {
        const currentData = data.list[apiDataIndex];
        const nextData = data.list[nextApiDataIndex];
        const factor = (i % 3) / 3;

        const currentTemp = currentData.main.temp;
        const nextTemp = nextData.main.temp;
        const interpolatedTemp = currentTemp + (nextTemp - currentTemp) * factor;

        hourly.push({
          time: targetTime.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          temperature: Math.round(interpolatedTemp),
          condition: currentData.weather[0].main,
          icon: currentData.weather[0].icon,
          humidity: Math.round(currentData.main.humidity + (nextData.main.humidity - currentData.main.humidity) * factor),
          windSpeed: Math.round((currentData.wind.speed + (nextData.wind.speed - currentData.wind.speed) * factor) * 10) / 10,
        });
      }
    }

    // 일별 예보
    const dailyMap = new Map();
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
          temps: [],
          conditions: [],
          icons: [],
          humidity: [],
          windSpeed: [],
        });
      }

      const dayData = dailyMap.get(dateKey);
      dayData.temps.push(item.main.temp);
      dayData.conditions.push(item.weather[0].main);
      dayData.icons.push(item.weather[0].icon);
      dayData.humidity.push(item.main.humidity);
      dayData.windSpeed.push(item.wind.speed);
    });

    const daily: DailyForecast[] = Array.from(dailyMap.values()).map((dayData: any) => ({
      date: dayData.date,
      day: dayData.day,
      maxTemp: Math.round(Math.max(...dayData.temps)),
      minTemp: Math.round(Math.min(...dayData.temps)),
      condition: dayData.conditions[0],
      icon: dayData.icons[0],
      humidity: Math.round(dayData.humidity.reduce((a: number, b: number) => a + b, 0) / dayData.humidity.length),
      windSpeed: Math.round((dayData.windSpeed.reduce((a: number, b: number) => a + b, 0) / dayData.windSpeed.length) * 10) / 10,
    })).slice(0, 7);

    const forecastData = { hourly, daily };

    // 캐시에 저장 (15분)
    setCache(cacheKey, forecastData, 15);
    return forecastData;
  } catch (error) {
    console.warn('예보 조회 중 오류 발생. Mock 예보 데이터를 사용합니다:', error);
    const mockData = getMockForecastData(lat, lon);
    setCache(cacheKey, mockData, 15); // Mock 데이터도 캐시
    return mockData;
  }
}

// Mock 데이터 함수들
function getMockLocationData(query: string, limit: number): LocationData[] {
  const mockLocations: LocationData[] = [
    { name: '서울', country: 'KR', lat: 37.5665, lon: 126.9780, state: '서울특별시' },
    { name: '부산', country: 'KR', lat: 35.1796, lon: 129.0756, state: '부산광역시' },
    { name: '대구', country: 'KR', lat: 35.8714, lon: 128.6014, state: '대구광역시' },
    { name: '인천', country: 'KR', lat: 37.4563, lon: 126.7052, state: '인천광역시' },
    { name: '광주', country: 'KR', lat: 35.1595, lon: 126.8526, state: '광주광역시' },
    { name: '대전', country: 'KR', lat: 36.3504, lon: 127.3845, state: '대전광역시' },
    { name: '울산', country: 'KR', lat: 35.5384, lon: 129.3114, state: '울산광역시' },
    { name: '제주', country: 'KR', lat: 33.4996, lon: 126.5312, state: '제주특별자치도' },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, state: 'Tokyo' },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, state: 'New York' },
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, state: 'England' },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, state: 'Île-de-France' },
  ];

  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const filtered = mockLocations.filter(location => {
    const nameMatch = location.name.toLowerCase().includes(normalizedQuery);
    const stateMatch = location.state?.toLowerCase().includes(normalizedQuery);

    const englishNames: { [key: string]: string } = {
      '서울': 'seoul', '부산': 'busan', '대구': 'daegu',
      '인천': 'incheon', '광주': 'gwangju', '대전': 'daejeon',
      '울산': 'ulsan', '제주': 'jeju'
    };

    const englishMatch = englishNames[location.name]?.toLowerCase().includes(normalizedQuery);
    return nameMatch || stateMatch || englishMatch;
  });

  return filtered.slice(0, limit);
}

function getMockWeatherData(lat: number, lon: number): WeatherData {
  const seed = Math.round(lat * 1000 + lon * 1000) % 100;
  const weatherPatterns = [
    { condition: 'Clear', description: '맑음', icon: '01d', tempModifier: 2, humidityBase: 45 },
    { condition: 'Clouds', description: '구름많음', icon: '03d', tempModifier: 0, humidityBase: 65 },
    { condition: 'Rain', description: '비', icon: '10d', tempModifier: -3, humidityBase: 80 },
    { condition: 'Snow', description: '눈', icon: '13d', tempModifier: -8, humidityBase: 85 },
    { condition: 'Mist', description: '안개', icon: '50d', tempModifier: -1, humidityBase: 90 },
  ];

  const pattern = weatherPatterns[seed % weatherPatterns.length];
  const isKorea = lat >= 33 && lat <= 39 && lon >= 124 && lon <= 132;
  let baseTemp = isKorea ? 23 : 20;

  const finalTemp = baseTemp + pattern.tempModifier + ((seed % 10) - 5);
  const humidity = Math.max(30, Math.min(95, pattern.humidityBase + ((seed % 20) - 10)));
  const windSpeed = Math.max(1, Math.min(8, 3 + ((seed % 6) - 3)));

  // 날씨 상태에 따른 강수확률 설정
  let precipitation = 0;
  switch (pattern.condition) {
    case 'Rain':
      precipitation = 70 + ((seed % 20) + 10); // 70-90%
      break;
    case 'Clouds':
      precipitation = 20 + ((seed % 30)); // 20-50%
      break;
    case 'Snow':
      precipitation = 60 + ((seed % 30)); // 60-90%
      break;
    case 'Clear':
      precipitation = (seed % 10); // 0-10%
      break;
    case 'Mist':
      precipitation = 15 + ((seed % 20)); // 15-35%
      break;
    default:
      precipitation = (seed % 15); // 0-15%
  }

  return {
    location: isKorea ? '서울' : '테스트 도시',
    temperature: Math.round(finalTemp),
    condition: pattern.condition,
    description: pattern.description,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    pressure: 1013 + ((seed % 30) - 15),
    visibility: Math.max(1, Math.min(15, 10 + ((seed % 10) - 5))),
    uvIndex: Math.max(0, Math.min(11, 5 + ((seed % 6) - 3))),
    feelsLike: Math.round(finalTemp + ((humidity > 70) ? 2 : -1)),
    icon: pattern.icon,
    precipitation: Math.max(0, Math.min(100, precipitation)),
  };
}

function getMockForecastData(lat: number, lon: number): {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
} {
  const seed = Math.round(lat * 1000 + lon * 1000) % 100;
  const currentWeather = getMockWeatherData(lat, lon);

  // 24시간 시간별 예보 (1시간 간격)
  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(Date.now() + i * 60 * 60 * 1000);
    const hourOfDay = hour.getHours();

    // 하루 주기의 자연스러운 온도 변화
    const hourlyTempCycle = Math.sin((hourOfDay - 6) * Math.PI / 12) * 4;
    const dailyTrend = -i * 0.1;
    const randomVariation = ((seed + i * 7) % 10 - 5) * 0.3;

    const finalTemp = currentWeather.temperature + hourlyTempCycle + dailyTrend + randomVariation;

    // 날씨 전환 패턴
    const weatherVariations = [
      currentWeather.condition,
      currentWeather.condition,
      currentWeather.condition === 'Clear' ? 'Clouds' : 'Clear',
    ];
    const condition = weatherVariations[(i + seed) % weatherVariations.length];

    const iconMap: { [key: string]: string } = {
      'Clear': hourOfDay >= 6 && hourOfDay < 18 ? '01d' : '01n',
      'Clouds': hourOfDay >= 6 && hourOfDay < 18 ? '03d' : '03n',
      'Rain': '10d',
      'Snow': '13d',
      'Mist': '50d',
    };

    return {
      time: hour.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(finalTemp),
      condition: condition,
      icon: iconMap[condition] || '01d',
      humidity: Math.max(30, Math.min(90, currentWeather.humidity + ((i * 2 - 4) + (seed % 10 - 5)))),
      windSpeed: Math.max(0.5, Math.min(10, currentWeather.windSpeed + ((seed + i) % 4 - 2))),
      precipitation: Math.max(0, Math.min(100,
        condition === 'Rain' ? 70 + ((seed + i * 3) % 25) :
          condition === 'Clouds' ? 20 + ((seed + i * 2) % 30) :
            condition === 'Snow' ? 60 + ((seed + i * 4) % 35) :
              5 + ((seed + i) % 15)
      )),
    };
  });

  // 7일 일별 예보
  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const tempTrend = Math.sin((i * 2 + seed * 0.1) * 0.3) * 3;

    const weatherProgression = [
      currentWeather.condition,
      currentWeather.condition,
      'Clouds',
      'Rain',
      'Clear',
    ];
    const condition = weatherProgression[Math.min(i, weatherProgression.length - 1)];

    const iconMap: { [key: string]: string } = {
      'Clear': '01d', 'Clouds': '03d', 'Rain': '10d', 'Snow': '13d', 'Mist': '50d',
    };

    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
      maxTemp: Math.round(currentWeather.temperature + 5 + tempTrend),
      minTemp: Math.round(currentWeather.temperature - 3 + tempTrend * 0.5),
      condition: condition,
      icon: iconMap[condition] || '01d',
      humidity: Math.max(40, Math.min(85, currentWeather.humidity + ((i * 3 - 6) + (seed % 15 - 7)))),
      windSpeed: Math.max(1, Math.min(8, currentWeather.windSpeed + ((seed + i * 2) % 5 - 2))),
    };
  });

  return { hourly, daily };
}

/**
 * 좌표로 지역명 검색 (Reverse Geocoding)
 */
export async function getLocationByCoords(lat: number, lon: number): Promise<LocationData | null> {
  if (!API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  try {
    const url = `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: LocationData[] = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('역지오코딩 중 오류 발생:', error);
    throw new Error('위치 정보를 가져오는 중 오류가 발생했습니다.');
  }
}
