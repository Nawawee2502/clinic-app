/**
 * Utility functions for Thai date and time formatting
 * แสดงเป็นเวลาไทย แต่บันทึกเข้า DB เป็น ค.ศ. แบบปกติ
 */

// ✅ ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย (แสดง) - พ.ศ.
export const formatThaiDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // ✅ แปลงเป็น พ.ศ.

        return `${day} ${month} ${year}`;
    } catch (error) {
        console.error('Error formatting Thai date:', error);
        return dateString;
    }
};

// ✅ ฟังก์ชันแปลงวันที่เป็นรูปแบบไทยแบบสั้น (แสดง) - พ.ศ. DD/MM/YYYY
export const formatThaiDateShort = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 543).toString(); // ✅ แปลงเป็น พ.ศ.

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting Thai date short:', error);
        return dateString;
    }
};

// ✅ ฟังก์ชันแปลงวันที่เป็นรูปแบบไทยแบบยาว (แสดง) - พ.ศ. DD/MM/YYYY HH:mm:ss
export const formatThaiDateTime = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 543).toString(); // ✅ แปลงเป็น พ.ศ.
        
        // ✅ ใช้เวลาไทย (Asia/Bangkok timezone)
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('Error formatting Thai date time:', error);
        return dateString;
    }
};

// ✅ ฟังก์ชันแปลงเวลาเป็นรูปแบบไทย (แสดง) - HH:mm:ss
export const formatThaiTime = (timeString) => {
    if (!timeString) return '';

    try {
        // ถ้าเป็น ISO string หรือ datetime string
        if (timeString.includes('T') || timeString.includes(' ')) {
            const date = new Date(timeString);
            if (isNaN(date.getTime())) return timeString;

            // ✅ ใช้เวลาไทย (Asia/Bangkok timezone)
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${hours}:${minutes}:${seconds}`;
        } else {
            // ถ้าเป็นแค่เวลา เช่น "14:30:00"
            return timeString.substring(0, 8);
        }
    } catch (error) {
        console.error('Error formatting Thai time:', error);
        return timeString;
    }
};

// ✅ ฟังก์ชันแปลงเวลาเป็นรูปแบบไทยแบบสั้น (แสดง) - HH:mm
export const formatThaiTimeShort = (timeString) => {
    if (!timeString) return '';

    try {
        // ถ้าเป็น ISO string หรือ datetime string
        if (timeString.includes('T') || timeString.includes(' ')) {
            const date = new Date(timeString);
            if (isNaN(date.getTime())) return timeString;

            // ✅ ใช้เวลาไทย (Asia/Bangkok timezone)
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${hours}:${minutes}`;
        } else {
            // ถ้าเป็นแค่เวลา เช่น "14:30:00"
            return timeString.substring(0, 5);
        }
    } catch (error) {
        console.error('Error formatting Thai time short:', error);
        return timeString;
    }
};

// ✅ ฟังก์ชันดึงวันที่ปัจจุบันสำหรับบันทึก DB (ค.ศ.) - YYYY-MM-DD
export const getCurrentDateForDB = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // ✅ ค.ศ. สำหรับบันทึก DB
};

// ✅ ฟังก์ชันดึงวันที่ปัจจุบันสำหรับแสดง (ไทย) - พ.ศ. DD/MM/YYYY
export const getCurrentDateForDisplay = () => {
    const now = new Date();
    return formatThaiDateShort(now.toISOString().split('T')[0]);
};

// ✅ ฟังก์ชันดึงเวลาปัจจุบันสำหรับบันทึก DB (ค.ศ.) - HH:mm:ss
export const getCurrentTimeForDB = () => {
    const now = new Date();
    // ✅ ใช้เวลาไทย (Asia/Bangkok timezone) แต่บันทึกเป็น string
    return now.toLocaleTimeString('th-TH', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Bangkok'
    });
};

// ✅ ฟังก์ชันดึงเวลาปัจจุบันสำหรับแสดง (ไทย) - HH:mm:ss
export const getCurrentTimeForDisplay = () => {
    const now = new Date();
    return formatThaiTime(now.toISOString());
};

// ✅ ฟังก์ชันดึงวันที่และเวลาปัจจุบันสำหรับบันทึก DB (ค.ศ.) - {date: YYYY-MM-DD, time: HH:mm:ss}
export const getCurrentDateTimeForDB = () => {
    return {
        date: getCurrentDateForDB(),
        time: getCurrentTimeForDB()
    };
};

// ✅ ฟังก์ชันดึงวันที่และเวลาปัจจุบันสำหรับแสดง (ไทย) - {date: DD/MM/YYYY, time: HH:mm:ss}
export const getCurrentDateTimeForDisplay = () => {
    return {
        date: getCurrentDateForDisplay(),
        time: getCurrentTimeForDisplay()
    };
};

// ✅ ฟังก์ชันแปลงวันที่จาก input (th-TH) เป็น ค.ศ. สำหรับบันทึก DB
export const convertInputDateToDB = (inputDateString) => {
    if (!inputDateString) return '';
    
    // ถ้าเป็น YYYY-MM-DD format (จาก input type="date") ให้ใช้เลย
    if (/^\d{4}-\d{2}-\d{2}$/.test(inputDateString)) {
        return inputDateString;
    }
    
    // ถ้าเป็น DD/MM/YYYY format (จาก input th-TH) ให้แปลง
    try {
        const [day, month, year] = inputDateString.split('/');
        const christianYear = parseInt(year) - 543; // แปลงจาก พ.ศ. เป็น ค.ศ.
        return `${christianYear}-${month}-${day}`;
    } catch (error) {
        console.error('Error converting input date to DB:', error);
        return inputDateString;
    }
};

// ✅ ฟังก์ชันแปลงวันที่จาก DB (ค.ศ.) เป็น format สำหรับ input (YYYY-MM-DD)
export const convertDBDateToInput = (dbDateString) => {
    if (!dbDateString) return '';
    
    // ถ้าเป็น YYYY-MM-DD format ให้ใช้เลย
    if (/^\d{4}-\d{2}-\d{2}$/.test(dbDateString)) {
        return dbDateString;
    }
    
    try {
        const date = new Date(dbDateString);
        if (isNaN(date.getTime())) return dbDateString;
        
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error converting DB date to input:', error);
        return dbDateString;
    }
};

// ✅ ฟังก์ชันแปลงวันที่จาก DB (ค.ศ.) เป็น format สำหรับแสดง (DD/MM/YYYY พ.ศ.)
export const convertDBDateToDisplay = (dbDateString) => {
    if (!dbDateString) return '';
    return formatThaiDateShort(dbDateString);
};

// ✅ ฟังก์ชันแปลงวันที่และเวลาจาก DB (ค.ศ.) เป็น format สำหรับแสดง (DD/MM/YYYY พ.ศ. HH:mm:ss)
export const convertDBDateTimeToDisplay = (dbDateTimeString) => {
    if (!dbDateTimeString) return '';
    return formatThaiDateTime(dbDateTimeString);
};

