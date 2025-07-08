#!/bin/bash

echo "🏥 Clinic Management System - Demo"
echo "=================================="
echo ""
echo "🔄 กำลังเริ่มต้นระบบ..."
echo ""

# ตรวจสอบ Node.js
if ! command -v node &> /dev/null; then
    echo "❌ ไม่พบ Node.js ในระบบ"
    echo "💡 กรุณาติดตั้ง Node.js จาก https://nodejs.org"
    echo ""
    echo "📌 หรือใช้วิธีง่าย:"
    echo "   python3 -m http.server 8000"
    echo "   แล้วเปิด browser ไปที่ http://localhost:8000"
    exit 1
fi

# เช็คว่าอยู่ในโฟลเดอร์ที่ถูกต้องหรือไม่
if [ ! -f "index.html" ]; then
    echo "❌ ไม่พบไฟล์ index.html"
    echo "💡 กรุณารันไฟล์นี้ในโฟลเดอร์ Demo"
    exit 1
fi

echo "🚀 เริ่มต้น Clinic Management Demo..."
echo "🌐 URL: http://localhost:8000"
echo ""
echo "📝 คำแนะนำ:"
echo "   - ระบบจะเปิด browser อัตโนมัติใน 3 วินาที"
echo "   - หากไม่เปิด ให้ไปที่ http://localhost:8000 ด้วยตนเอง"
echo "   - กด Ctrl+C เพื่อหยุด server"
echo ""

# เปิด browser อัตโนมัติ (Mac)
sleep 3
if command -v open &> /dev/null; then
    open http://localhost:8000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8000
fi

# รัน server
npx serve -s . -p 8000