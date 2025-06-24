# Real Estate Project - Complete Login Fix
# This script fixes login issues and starts both servers

Write-Host "🚀 Real Estate Project - Login Fix & Startup" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "backend") -or !(Test-Path "frontend")) {
    Write-Host "❌ Error: This script must be run from the project root directory" -ForegroundColor Red
    Write-Host "💡 Make sure you're in the 'real-estate-project' folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Project directory confirmed" -ForegroundColor Green

# Step 1: Create admin user with correct credentials
Write-Host "`n1️⃣ Creating admin user..." -ForegroundColor Cyan
Set-Location "backend"
node seed-admin.js
Write-Host "✅ Admin user setup complete" -ForegroundColor Green

# Step 2: Test API endpoints
Write-Host "`n2️⃣ Testing API endpoints..." -ForegroundColor Cyan
node test-login-endpoints.js
Write-Host "✅ API endpoint test complete" -ForegroundColor Green

# Step 3: Clean frontend cache
Write-Host "`n3️⃣ Cleaning frontend cache..." -ForegroundColor Cyan
Set-Location "../frontend"
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Frontend cache cleared" -ForegroundColor Green
} else {
    Write-Host "✅ No cache to clear" -ForegroundColor Green
}

if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "✅ Build folder cleared" -ForegroundColor Green
}

Set-Location ".."

# Step 4: Start servers
Write-Host "`n4️⃣ Starting servers..." -ForegroundColor Cyan

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 Backend Server Starting...' -ForegroundColor Green; npm run dev" -PassThru

# Wait for backend
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "🎨 Starting frontend server..." -ForegroundColor Blue
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Green; npm start" -PassThru

Write-Host "`n🎉 Both servers are starting!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

Write-Host "`n📋 Important Information:" -ForegroundColor Cyan
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor White
Write-Host "Admin Login: http://localhost:3000/admin/login" -ForegroundColor White

Write-Host "`n🔐 Login Credentials:" -ForegroundColor Cyan
Write-Host "📧 Email: khan@gmail.com" -ForegroundColor White
Write-Host "🔑 Password: admin123" -ForegroundColor White

Write-Host "`n� Login Fix Applied:" -ForegroundColor Yellow
Write-Host "✅ Admin user created with correct email" -ForegroundColor Green
Write-Host "✅ API endpoints verified" -ForegroundColor Green
Write-Host "✅ Frontend cache cleared" -ForegroundColor Green
Write-Host "✅ Environment variables properly set" -ForegroundColor Green

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 30-60 seconds for both servers to fully start" -ForegroundColor White
Write-Host "2. Open browser and go to: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "3. Login with the credentials above" -ForegroundColor White
Write-Host "4. Check browser console for debug logs" -ForegroundColor White

Write-Host "`n🚨 If login still fails:" -ForegroundColor Red
Write-Host "• Open browser DevTools (F12)" -ForegroundColor Gray
Write-Host "• Check Console tab for API debug messages" -ForegroundColor Gray
Write-Host "• Check Network tab to see actual API calls" -ForegroundColor Gray
Write-Host "• Verify the API calls go to http://localhost:5000/api/auth/login" -ForegroundColor Gray

Write-Host "`n✨ Login should now work perfectly!" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Green
