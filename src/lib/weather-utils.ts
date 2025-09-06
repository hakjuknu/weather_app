/**
 * 날씨 관련 유틸리티 함수들
 */

/**
 * OpenWeatherMap 아이콘 코드를 이모지로 변환
 * @param iconCode OpenWeatherMap 아이콘 코드 (예: "01d", "02n")
 * @returns 날씨 이모지
 */
export function getWeatherIcon(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    // Clear sky
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    
    // Few clouds
    '02d': '🌤️',  // few clouds day
    '02n': '☁️',  // few clouds night
    
    // Scattered clouds
    '03d': '☁️',  // scattered clouds day
    '03n': '☁️',  // scattered clouds night
    
    // Broken clouds
    '04d': '☁️',  // broken clouds day
    '04n': '☁️',  // broken clouds night
    
    // Shower rain
    '09d': '🌧️',  // shower rain day
    '09n': '🌧️',  // shower rain night
    
    // Rain
    '10d': '🌦️',  // rain day
    '10n': '🌧️',  // rain night
    
    // Thunderstorm
    '11d': '⛈️',  // thunderstorm day
    '11n': '⛈️',  // thunderstorm night
    
    // Snow
    '13d': '🌨️',  // snow day
    '13n': '🌨️',  // snow night
    
    // Mist
    '50d': '🌫️',  // mist day
    '50n': '🌫️',  // mist night
  };

  return iconMap[iconCode] || '🌤️';
}

/**
 * 영어 날씨 상태를 한국어로 변환
 * @param condition 영어 날씨 상태 (예: "Clear", "Clouds", "Rain")
 * @returns 한국어 날씨 상태
 */
export function getWeatherDescription(condition: string): string {
  const descriptionMap: { [key: string]: string } = {
    'Clear': '맑음',
    'Clouds': '흐림',
    'Rain': '비',
    'Drizzle': '이슬비',
    'Thunderstorm': '천둥번개',
    'Snow': '눈',
    'Mist': '안개',
    'Smoke': '연기',
    'Haze': '실안개',
    'Dust': '먼지',
    'Fog': '짙은 안개',
    'Sand': '모래바람',
    'Ash': '화산재',
    'Squall': '돌풍',
    'Tornado': '토네이도',
  };

  return descriptionMap[condition] || condition;
}

/**
 * 풍속을 텍스트 설명으로 변환
 * @param windSpeed 풍속 (m/s)
 * @returns 풍속 설명
 */
export function getWindDescription(windSpeed: number): string {
  if (windSpeed < 0.3) return '고요';
  if (windSpeed < 1.6) return '실바람';
  if (windSpeed < 3.4) return '남실바람';
  if (windSpeed < 5.5) return '된바람';
  if (windSpeed < 8.0) return '센바람';
  if (windSpeed < 10.8) return '된센바람';
  if (windSpeed < 13.9) return '큰바람';
  if (windSpeed < 17.2) return '큰센바람';
  if (windSpeed < 20.8) return '매우 큰바람';
  if (windSpeed < 24.5) return '폭풍';
  if (windSpeed < 28.5) return '큰폭풍';
  if (windSpeed < 32.7) return '매우 큰폭풍';
  return '태풍';
}

/**
 * 자외선 지수를 텍스트 설명과 색상으로 변환
 * @param uvIndex 자외선 지수
 * @returns 자외선 지수 정보
 */
export function getUVIndexInfo(uvIndex: number): { description: string; color: string } {
  if (uvIndex <= 2) return { description: '낮음', color: 'text-green-600' };
  if (uvIndex <= 5) return { description: '보통', color: 'text-yellow-600' };
  if (uvIndex <= 7) return { description: '높음', color: 'text-orange-600' };
  if (uvIndex <= 10) return { description: '매우 높음', color: 'text-red-600' };
  return { description: '위험', color: 'text-purple-600' };
}

/**
 * 습도 백분율을 텍스트 설명으로 변환
 * @param humidity 습도 (%)
 * @returns 습도 설명
 */
export function getHumidityDescription(humidity: number): string {
  if (humidity < 30) return '건조';
  if (humidity < 60) return '적정';
  if (humidity < 80) return '높음';
  return '매우 높음';
}

/**
 * 기압을 텍스트 설명으로 변환
 * @param pressure 기압 (hPa)
 * @returns 기압 설명
 */
export function getPressureDescription(pressure: number): string {
  if (pressure < 1000) return '저기압';
  if (pressure < 1020) return '보통';
  return '고기압';
}

/**
 * 가시거리를 텍스트 설명으로 변환
 * @param visibility 가시거리 (km)
 * @returns 가시거리 설명
 */
export function getVisibilityDescription(visibility: number): string {
  if (visibility < 1) return '매우 나쁨';
  if (visibility < 3) return '나쁨';
  if (visibility < 5) return '보통';
  if (visibility < 10) return '좋음';
  return '매우 좋음';
}

/**
 * 온도에 따른 색상 클래스 반환
 * @param temperature 온도 (°C)
 * @returns Tailwind CSS 색상 클래스
 */
export function getTemperatureColor(temperature: number): string {
  if (temperature <= 0) return 'text-blue-600';
  if (temperature <= 10) return 'text-blue-500';
  if (temperature <= 20) return 'text-green-500';
  if (temperature <= 25) return 'text-yellow-500';
  if (temperature <= 30) return 'text-orange-500';
  return 'text-red-500';
}

