// scripts/create-demo.js
const fs = require('fs');
const path = require('path');

console.log('🏗️ Creating Clinic Demo Package...\n');

const demoFolderName = 'Clinic Management System - Demo';
const buildPath = path.join(__dirname, '..', 'build');
const demoPath = path.join(__dirname, '..', demoFolderName);

// ลบโฟลเดอร์เก่า (ถ้ามี)
if (fs.existsSync(demoPath)) {
    fs.rmSync(demoPath, { recursive: true, force: true });
    console.log('🗑️ Removed old demo folder');
}

// สร้างโฟลเดอร์ใหม่
fs.mkdirSync(demoPath, { recursive: true });
console.log('📁 Created demo folder');

// คัดลอกไฟล์จาก build
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }

    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);

        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

// คัดลอกไฟล์ build
copyFolderSync(buildPath, demoPath);
console.log('📋 Copied build files');

// สร้างไฟล์ start-demo.bat สำหรับ Windows
const startBatContent = `@echo off
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

pause`;

fs.writeFileSync(path.join(demoPath, 'start-demo.bat'), startBatContent, 'utf8');
console.log('🖥️ Created start-demo.bat for Windows');

// สร้างไฟล์ start-demo.sh สำหรับ Mac/Linux
const startShContent = `#!/bin/bash

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
npx serve -s . -p 8000`;

fs.writeFileSync(path.join(demoPath, 'start-demo.sh'), startShContent, 'utf8');
fs.chmodSync(path.join(demoPath, 'start-demo.sh'), '755');
console.log('🍎 Created start-demo.sh for Mac/Linux');

// สร้างไฟล์ README ที่อัพเดทแล้ว
const readmeContent = `🏥 Clinic Management System - Demo Version
==========================================

🚀 วิธีการใช้งาน (แนะนำ):

สำหรับ Windows:
1. ดับเบิลคลิกไฟล์ "start-demo.bat"
2. รอให้ระบบเริ่มต้น (3 วินาที)
3. Browser จะเปิดอัตโนมัติไปที่ http://localhost:8000

สำหรับ Mac/Linux:
1. เปิด Terminal ในโฟลเดอร์นี้
2. รันคำสั่ง: ./start-demo.sh
3. Browser จะเปิดอัตโนมัติไปที่ http://localhost:8000

📌 วิธีทางเลือก (ถ้าไม่มี Node.js):

1. ติดตั้ง Extension "Web Server for Chrome"
2. เปิด Extension และเลือกโฟลเดอร์นี้
3. เปิด URL ที่ Extension แสดง

หรือ:
1. ใช้ Python: python3 -m http.server 8000
2. เปิด browser ไปที่ http://localhost:8000

✨ Features ที่ทดสอบได้:
- หน้า Dashboard
- ระบบเมนูและนำทาง  
- ฟอร์มต่างๆ (ยังไม่เชื่อมข้อมูล)
- UI/UX ทั้งหมด
- Responsive Design

⚠️ หมายเหตุสำคัญ:
- ห้ามดับเบิลคลิก index.html โดยตรง (จะเกิด CORS Error)
- ต้องใช้ Web Server เท่านั้น
- ยังไม่มีข้อมูลจริง (รอ Database)
- เป็นเพียงการทดสอบ UI/UX

📞 ติดต่อสอบถาม:
Email: [อีเมลของคุณ]
Tel: [เบอร์โทรของคุณ]
Line: [Line ID ของคุณ]

สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}
`;

fs.writeFileSync(path.join(demoPath, 'README.txt'), readmeContent, 'utf8');
console.log('📝 Created updated README.txt');

// สร้างไฟล์ package.json สำหรับ demo (ถ้าต้องการ)
const demoPkgJson = {
    "name": "clinic-demo",
    "version": "1.0.0",
    "description": "Clinic Management System Demo",
    "scripts": {
        "start": "npx serve -s . -p 8000"
    }
};

fs.writeFileSync(
    path.join(demoPath, 'package.json'),
    JSON.stringify(demoPkgJson, null, 2),
    'utf8'
);
console.log('📦 Created package.json for demo');

console.log('\n✅ Demo package created successfully!');
console.log(`📁 Location: ${demoFolderName}`);
console.log('🎯 Instructions for client:');
console.log('   Windows: ดับเบิลคลิก start-demo.bat');
console.log('   Mac/Linux: รัน ./start-demo.sh');
console.log('📧 Ready to send to client! 🎉');