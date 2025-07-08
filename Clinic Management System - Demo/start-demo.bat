@echo off
color 0A
echo.
echo  🏥 Clinic Management System - Demo
echo  ===================================
echo.
echo  🔄 กำลังเริ่มต้นระบบ...
echo.

:: ตรวจสอบ Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ ไม่พบ Node.js ในระบบ
    echo  💡 กรุณาติดตั้ง Node.js จาก https://nodejs.org
    echo.
    echo  📌 หรือใช้วิธีง่าย:
    echo     1. เปิด Chrome Browser
    echo     2. ลากไฟล์ index.html ไปใส่ใน Chrome
    echo     3. หรือใช้ Extension "Web Server for Chrome"
    echo.
    pause
    exit /b 1
)

:: เช็คว่าอยู่ในโฟลเดอร์ที่ถูกต้องหรือไม่
if not exist "index.html" (
    echo  ❌ ไม่พบไฟล์ index.html
    echo  💡 กรุณารันไฟล์นี้ในโฟลเดอร์ Demo
    pause
    exit /b 1
)

:: เริ่มต้น web server
echo  🚀 เริ่มต้น Clinic Management Demo...
echo  🌐 URL: http://localhost:8000
echo.
echo  📝 คำแนะนำ:
echo     - ระบบจะเปิด browser อัตโนมัติใน 3 วินาที
echo     - หากไม่เปิด ให้ไปที่ http://localhost:8000 ด้วยตนเอง
echo     - กด Ctrl+C เพื่อหยุด server
echo.

:: เปิด browser อัตโนมัติ (หน่วงเวลา 3 วินาที)
timeout /t 3 /nobreak >nul 2>&1
start http://localhost:8000

:: รัน server
npx serve -s . -p 8000

pause