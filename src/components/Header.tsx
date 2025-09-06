"use client";

import { CloudSun, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LocationSearch from "@/components/LocationSearch";
import { LocationData } from "@/lib/weather-api";

interface HeaderProps {
  onLocationSelect: (location: LocationData) => void;
}

export default function Header({ onLocationSelect }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <CloudSun className="h-7 w-7 text-blue-600" />
          <h1 className="text-xl font-bold hidden sm:block">날씨정보</h1>
          <h1 className="text-lg font-bold sm:hidden">날씨</h1>
        </div>

        {/* 검색창 */}
        <div className="flex-1 max-w-md mx-4 sm:mx-6">
          <LocationSearch 
            onLocationSelect={onLocationSelect}
            placeholder="지역을 검색하세요..."
            className="w-full"
          />
        </div>

        {/* 다크모드 토글 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label="다크모드 토글"
          disabled={!mounted}
          className="flex-shrink-0"
        >
          {mounted && theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
