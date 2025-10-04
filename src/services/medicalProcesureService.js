// services/medicalProcedureService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class MedicalProcedureService {

    // ✅ สร้างหัตถการใหม่
    static async createProcedure(procedureData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/procedures`);
            const response = await fetch(`${API_BASE_URL}/procedures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(procedureData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating procedure:', error);
            throw error;
        }
    }

    // ✅ ดึงข้อมูลหัตถการทั้งหมด
    static async getAllProcedures(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.type) queryParams.append('type', params.type);

            const url = `${API_BASE_URL}/procedures${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching procedures:', error);
            throw error;
        }
    }

    // ✅ ดึงข้อมูลหัตถการตามรหัส
    static async getProcedureByCode(procedureCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/procedures/${procedureCode}`);
            const response = await fetch(`${API_BASE_URL}/procedures/${procedureCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching procedure:', error);
            throw error;
        }
    }

    // ✅ อัพเดทข้อมูลหัตถการ
    static async updateProcedure(procedureCode, procedureData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/procedures/${procedureCode}`);
            const response = await fetch(`${API_BASE_URL}/procedures/${procedureCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(procedureData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating procedure:', error);
            throw error;
        }
    }

    // ✅ ลบหัตถการ
    static async deleteProcedure(procedureCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/procedures/${procedureCode}`);
            const response = await fetch(`${API_BASE_URL}/procedures/${procedureCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting procedure:', error);
            throw error;
        }
    }

    // ✅ ดึงประเภทหัตถการ
    static async getProcedureTypes() {
        try {
            const response = await fetch(`${API_BASE_URL}/procedures/types/list`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching procedure types:', error);
            throw error;
        }
    }

    // ✅ ค้นหาหัตถการ
    static async searchProcedures(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/procedures/search/${searchTerm}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching procedures:', error);
            throw error;
        }
    }

    // ✅ ตรวจสอบความถูกต้องของข้อมูล
    static validateProcedureData(data) {
        const errors = [];

        if (!data.MEDICAL_PROCEDURE_CODE?.trim()) {
            errors.push('กรุณากรอกรหัสหัตถการ');
        }

        if (!data.MED_PRO_NAME_THAI?.trim()) {
            errors.push('กรุณากรอกชื่อหัตถการภาษาไทย');
        }

        // ตรวจสอบรูปแบบรหัส
        if (data.MEDICAL_PROCEDURE_CODE && !/^[A-Z0-9]{3,10}$/.test(data.MEDICAL_PROCEDURE_CODE)) {
            errors.push('รหัสหัตถการต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 3-10 หลัก');
        }

        // ตรวจสอบราคา
        if (data.UNIT_PRICE && (isNaN(data.UNIT_PRICE) || data.UNIT_PRICE < 0)) {
            errors.push('ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
        }

        // ตรวจสอบความยาวข้อความ
        const maxLengths = {
            MEDICAL_PROCEDURE_CODE: 10,
            MED_PRO_NAME_THAI: 100,
            MED_PRO_NAME_ENG: 100,
            MED_PRO_TYPE: 100
        };

        Object.entries(maxLengths).forEach(([field, maxLength]) => {
            if (data[field] && data[field].length > maxLength) {
                errors.push(`${this.getFieldName(field)} ต้องไม่เกิน ${maxLength} ตัวอักษร`);
            }
        });

        return errors;
    }

    // ✅ แปลชื่อฟิลด์เป็นภาษาไทย
    static getFieldName(fieldName) {
        const fieldNames = {
            MEDICAL_PROCEDURE_CODE: 'รหัสหัตถการ',
            MED_PRO_NAME_THAI: 'ชื่อหัตถการ (ไทย)',
            MED_PRO_NAME_ENG: 'ชื่อหัตถการ (อังกฤษ)',
            MED_PRO_TYPE: 'ประเภทหัตถการ',
            UNIT_PRICE: 'ราคา',
            SOCIAL_CARD: 'บัตรสวัสดิการ',
            UCS_CARD: 'บัตรทอง'
        };
        return fieldNames[fieldName] || fieldName;
    }

    // ✅ จัดรูปแบบข้อมูลก่อนส่ง API
    static formatProcedureData(data) {
        return {
            MEDICAL_PROCEDURE_CODE: data.MEDICAL_PROCEDURE_CODE?.trim().toUpperCase(),
            MED_PRO_NAME_THAI: data.MED_PRO_NAME_THAI?.trim(),
            MED_PRO_NAME_ENG: data.MED_PRO_NAME_ENG?.trim(),
            MED_PRO_TYPE: data.MED_PRO_TYPE?.trim(),
            UNIT_PRICE: data.UNIT_PRICE ? parseFloat(data.UNIT_PRICE) : null,
            SOCIAL_CARD: data.SOCIAL_CARD || 'N',
            UCS_CARD: data.UCS_CARD || 'N'
        };
    }

    // ✅ ดึงรายการประเภทหัตถการ
    static getProcedureTypesList() {
        return [
            { value: 'ตรวจร่างกาย', label: 'ตรวจร่างกาย' },
            { value: 'รักษาทั่วไป', label: 'รักษาทั่วไป' },
            { value: 'ผ่าตัดเล็ก', label: 'ผ่าตัดเล็ก' },
            { value: 'ทันตกรรม', label: 'ทันตกรรม' },
            { value: 'ฟื้นฟูสมรรถภาพ', label: 'ฟื้นฟูสมรรถภาพ' },
            { value: 'ฉีดวัคซีน', label: 'ฉีดวัคซีน' },
            { value: 'ตรวจเลือด', label: 'ตรวจเลือด' },
            { value: 'เอ็กซ์เรย์', label: 'เอ็กซ์เรย์' }
        ];
    }

    // ✅ สร้างรหัสหัตถการอัตโนมัติ
    static async generateNextProcedureCode() {
        try {
            const response = await this.getAllProcedures({ limit: 1, page: 1 });

            if (response.success && response.data.length > 0) {
                const lastCode = response.data[0].MEDICAL_PROCEDURE_CODE;
                const match = lastCode.match(/^P(\d+)$/);
                if (match) {
                    const nextNum = parseInt(match[1]) + 1;
                    return `P${nextNum.toString().padStart(4, '0')}`;
                }
            }

            return 'P0001';
        } catch (error) {
            console.error('Error generating procedure code:', error);
            const random = Math.floor(Math.random() * 10000);
            return `P${random.toString().padStart(4, '0')}`;
        }
    }

    // ✅ ฟอร์แมตราคา
    static formatPrice(price) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2
        }).format(price || 0);
    }

    // ✅ คำนวณราคารวม
    static calculateTotalPrice(procedures) {
        return procedures.reduce((total, procedure) => {
            return total + (parseFloat(procedure.UNIT_PRICE) || 0);
        }, 0);
    }
}

export default MedicalProcedureService;