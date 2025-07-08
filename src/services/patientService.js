// services/patientService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class PatientService {

    // สร้างผู้ป่วยใหม่
    static async createPatient(patientData) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ป่วยทั้งหมด
    static async getAllPatients() {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ป่วยตาม HN
    static async getPatientByHN(hn) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${hn}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    }

    // ค้นหาผู้ป่วย
    static async searchPatients(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching patients:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลผู้ป่วย
    static async updatePatient(hn, patientData) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${hn}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    }

    // ลบผู้ป่วย
    static async deletePatient(hn) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${hn}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }

    // ดึงสถิติผู้ป่วย
    static async getPatientStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/stats/basic`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient stats:', error);
            throw error;
        }
    }

    // ดึงผู้ป่วยตามจังหวัด
    static async getPatientsByProvince(provinceCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/province/${provinceCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patients by province:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validatePatientData(data) {
        const errors = [];

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!data.HNCODE?.trim()) {
            errors.push('กรุณากรอกรหัส HN');
        }

        if (!data.NAME1?.trim()) {
            errors.push('กรุณากรอกชื่อ');
        }

        if (!data.SURNAME?.trim()) {
            errors.push('กรุณากรอกนามสกุล');
        }

        if (!data.IDNO?.trim()) {
            errors.push('กรุณากรอกเลขบัตรประชาชน');
        }

        // ตรวจสอบรูปแบบบัตรประชาชน
        if (data.IDNO && !/^\d{13}$/.test(data.IDNO.replace(/-/g, ''))) {
            errors.push('รูปแบบเลขบัตรประชาชนไม่ถูกต้อง (ต้องเป็นตัวเลข 13 หลัก)');
        }

        // ตรวจสอบอีเมล
        if (data.EMAIL1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.EMAIL1)) {
            errors.push('รูปแบบอีเมลไม่ถูกต้อง');
        }

        // ตรวจสอบเบอร์โทรศัพท์
        if (data.TEL1 && !/^[\d\-\s\+\(\)]+$/.test(data.TEL1)) {
            errors.push('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
        }

        // ตรวจสอบอายุ
        if (data.AGE && (isNaN(data.AGE) || data.AGE < 0 || data.AGE > 150)) {
            errors.push('อายุต้องเป็นตัวเลขระหว่าง 0-150');
        }

        // ตรวจสอบน้ำหนัก
        if (data.WEIGHT1 && (isNaN(data.WEIGHT1) || data.WEIGHT1 < 0 || data.WEIGHT1 > 1000)) {
            errors.push('น้ำหนักต้องเป็นตัวเลขระหว่าง 0-1000 กิโลกรัม');
        }

        // ตรวจสอบส่วนสูง
        if (data.HIGH1 && (isNaN(data.HIGH1) || data.HIGH1 < 0 || data.HIGH1 > 300)) {
            errors.push('ส่วนสูงต้องเป็นตัวเลขระหว่าง 0-300 เซนติเมตร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatPatientData(data) {
        return {
            HNCODE: data.HNCODE?.trim(),
            IDNO: data.IDNO?.replace(/-/g, ''), // เอาเครื่องหมาย - ออก
            PRENAME: data.PRENAME?.trim(),
            NAME1: data.NAME1?.trim(),
            SURNAME: data.SURNAME?.trim(),
            SEX: data.SEX,
            BDATE: data.BDATE,
            AGE: data.AGE ? parseInt(data.AGE) : null,
            BLOOD_GROUP1: data.BLOOD_GROUP1,
            OCCUPATION1: data.OCCUPATION1?.trim(),
            ORIGIN1: data.ORIGIN1?.trim(),
            NATIONAL1: data.NATIONAL1?.trim(),
            RELIGION1: data.RELIGION1?.trim(),
            STATUS1: data.STATUS1,
            WEIGHT1: data.WEIGHT1 ? parseFloat(data.WEIGHT1) : null,
            HIGH1: data.HIGH1 ? parseFloat(data.HIGH1) : null,

            // ที่อยู่ตามบัตรประชาชน
            CARD_ADDR1: data.CARD_ADDR1?.trim(),
            CARD_TUMBOL_CODE: data.CARD_TUMBOL_CODE?.trim(),
            CARD_AMPHER_CODE: data.CARD_AMPHER_CODE?.trim(),
            CARD_PROVINCE_CODE: data.CARD_PROVINCE_CODE?.trim(),

            // ที่อยู่ปัจจุบัน
            ADDR1: data.useCardAddress ? data.CARD_ADDR1?.trim() : data.ADDR1?.trim(),
            TUMBOL_CODE: data.useCardAddress ? data.CARD_TUMBOL_CODE?.trim() : data.TUMBOL_CODE?.trim(),
            AMPHER_CODE: data.useCardAddress ? data.CARD_AMPHER_CODE?.trim() : data.AMPHER_CODE?.trim(),
            PROVINCE_CODE: data.useCardAddress ? data.CARD_PROVINCE_CODE?.trim() : data.PROVINCE_CODE?.trim(),
            ZIPCODE: data.useCardAddress ? data.CARD_ZIPCODE?.trim() : data.ZIPCODE?.trim(),

            TEL1: data.TEL1?.trim(),
            EMAIL1: data.EMAIL1?.trim(),

            // ประวัติสุขภาพ
            DISEASE1: data.DISEASE1?.trim(),
            DRUG_ALLERGY: data.DRUG_ALLERGY?.trim(),
            FOOD_ALLERGIES: data.FOOD_ALLERGIES?.trim()
        };
    }

    // สร้าง HN อัตโนมัติ (ถ้าต้องการ)
    static generateHN() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-4);

        return `HN${year}${month}${day}${time}`;
    }
}

export default PatientService;