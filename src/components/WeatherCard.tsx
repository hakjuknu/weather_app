import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Wind, Thermometer, Eye, Gauge, Sun, CloudRain } from "lucide-react";
import { 
  getWeatherIcon, 
  getWindDescription, 
  getUVIndexInfo, 
  getHumidityDescription,
  getPressureDescription,
  getVisibilityDescription
} from "@/lib/weather-utils";

interface WeatherCardProps {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon?: string;
  description?: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  precipitation?: number; // 강수확률 (%)
}

export default function WeatherCard({
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  icon = "01d",
  description,
  feelsLike = temperature + 2,
  pressure = 1013,
  visibility = 10,
  uvIndex = 5,
  precipitation = 20,
}: WeatherCardProps) {
  return (
    <Card 
      className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
      role="region"
      aria-label={`${location}의 현재 날씨 정보`}
      tabIndex={0}
    >
      <CardHeader style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
        <CardTitle className="text-3xl font-bold text-foreground" role="heading" aria-level={2}>
          {location}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 현재 날씨 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="text-8xl drop-shadow-lg">
            {getWeatherIcon(icon)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div 
              className="text-6xl font-bold text-foreground mb-3 tracking-tight" 
              aria-label={`현재 온도 ${temperature}도`}
            >
              {temperature}°C
            </div>
            <div 
              className="text-xl text-muted-foreground font-medium"
              aria-label={`날씨 상태: ${description || condition}`}
            >
              {description || condition}
            </div>
          </div>
        </div>

        {/* 추가 주요 정보 - 체감온도, 자외선, 강수확률 */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '0.75rem', 
            paddingTop: '1.5rem', 
            marginBottom: '1.5rem',
            borderTop: '1px solid rgba(229, 231, 235, 0.3)' 
          }}
        >
          <div 
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Thermometer className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className="text-lg font-bold text-foreground">{feelsLike}°C</div>
              <div className="text-xs text-muted-foreground font-medium">체감온도</div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Sun className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className={`text-lg font-bold ${getUVIndexInfo(uvIndex).color}`}>{uvIndex}</div>
              <div className="text-xs text-muted-foreground font-medium">자외선</div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <CloudRain className="h-5 w-5 text-sky-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className={`text-lg font-bold ${precipitation > 70 ? 'text-blue-600' : precipitation > 30 ? 'text-blue-500' : 'text-gray-500'}`}>
                {precipitation}%
              </div>
              <div className="text-xs text-muted-foreground font-medium">강수확률</div>
            </div>
          </div>
        </div>

        {/* 상세 정보 그리드 */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(229, 231, 235, 0.3)' 
          }}
        >
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Droplets className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className="text-lg font-bold text-foreground">{humidity}%</div>
              <div className="text-xs text-muted-foreground font-medium">습도 ({getHumidityDescription(humidity)})</div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Wind className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className="text-lg font-bold text-foreground">{windSpeed}m/s</div>
              <div className="text-xs text-muted-foreground font-medium">{getWindDescription(windSpeed)}</div>
            </div>
          </div>
        </div>

        {/* 추가 상세 정보 */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            paddingTop: '1rem'
          }}
        >
          <div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Gauge className="h-5 w-5 text-purple-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className="text-lg font-bold text-foreground">{pressure}hPa</div>
              <div className="text-xs text-muted-foreground font-medium">기압 ({getPressureDescription(pressure)})</div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', gap: '0.5rem' }}
          >
            <Eye className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div style={{ textAlign: 'center' }}>
              <div className="text-lg font-bold text-foreground">{visibility}km</div>
              <div className="text-xs text-muted-foreground font-medium">가시거리 ({getVisibilityDescription(visibility)})</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}