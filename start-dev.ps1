# Weather App Auto Dev Server Script
Write-Host "Starting Weather App Development Server..." -ForegroundColor Cyan

# Clean existing processes
Write-Host "Cleaning existing Node.js processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null | Out-Null
Start-Sleep -Seconds 1

# Check .env.local file
if (Test-Path ".env.local") {
    Write-Host "Environment file found" -ForegroundColor Green
} else {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    "NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=cd5dba61c3d4e98408e32ad36f15c1e9" | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "Environment file created" -ForegroundColor Green
}

# Clean cache if needed
if (Test-Path ".next") {
    Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}

# Start development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Access URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Test Page: http://localhost:3000/test" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Magenta

npm run dev
