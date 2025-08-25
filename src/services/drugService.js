// services/drugService.js

// ✅ แก้ไข: ใช้ port 3001 ให้ตรงกับ patientService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class DrugService {

    // สร้างยาใหม่
    static async createDrug(drugData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs`);
            const response = await fetch(`${API_BASE_URL}/drugs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(drugData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating drug:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยาทั้งหมด
    static async getAllDrugs(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.package_code) queryParams.append('package_code', params.package_code);
            if (params.unit_code) queryParams.append('unit_code', params.unit_code);

            const url = `${API_BASE_URL}/drugs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drugs:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยาตามรหัส
    static async getDrugByCode(drugCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/drugs/${drugCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drug:', error);
            throw error;
        }
    }

    // ค้นหายา
    static async searchDrugs(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/drugs/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching drugs:', error);
            throw error;
        }
    }

    // ดึงยาตามข้อบ่งใช้
    static async getDrugsByIndication(indication) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/indication/${encodeURIComponent(indication)}`);
            const response = await fetch(`${API_BASE_URL}/drugs/indication/${encodeURIComponent(indication)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drugs by indication:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลยา
    static async updateDrug(drugCode, drugData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/drugs/${drugCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(drugData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating drug:', error);
            throw error;
        }
    }

    // ลบยา
    static async deleteDrug(drugCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/drugs/${drugCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting drug:', error);
            throw error;
        }
    }

    // ดึงสถิติยา
    static async getDrugStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/drugs/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/drugs/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drug stats:', error);
            throw error;
        }
    }

    // ✅ เพิ่ม: ฟังก์ชันสำหรับดึงข้อมูลยาจำลองเมื่อ API ไม่พร้อม
    static getMockDrugs() {
        return [
            { DRUG_CODE: 'MED001', GENERIC_NAME: 'Paracetamol 500mg', TRADE_NAME: 'Tylenol', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED002', GENERIC_NAME: 'Amoxicillin 250mg', TRADE_NAME: 'Amoxil', DEFAULT_UNIT: 'CAP', UNIT_CODE: 'CAP' },
            { DRUG_CODE: 'MED003', GENERIC_NAME: 'Omeprazole 20mg', TRADE_NAME: 'Losec', DEFAULT_UNIT: 'CAP', UNIT_CODE: 'CAP' },
            { DRUG_CODE: 'MED004', GENERIC_NAME: 'Salbutamol 100mcg', TRADE_NAME: 'Ventolin', DEFAULT_UNIT: 'SPRAY', UNIT_CODE: 'SPRAY' },
            { DRUG_CODE: 'MED005', GENERIC_NAME: 'Metformin 500mg', TRADE_NAME: 'Glucophage', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED006', GENERIC_NAME: 'Eye Drop Chloramphenicol', TRADE_NAME: 'Chlorsig', DEFAULT_UNIT: 'BOT', UNIT_CODE: 'BOT' },
            { DRUG_CODE: 'MED007', GENERIC_NAME: 'Betamethasone Cream', TRADE_NAME: 'Betnovate', DEFAULT_UNIT: 'TUBE', UNIT_CODE: 'TUBE' },
            { DRUG_CODE: 'MED008', GENERIC_NAME: 'Ibuprofen 400mg', TRADE_NAME: 'Brufen', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED009', GENERIC_NAME: 'Cetirizine 10mg', TRADE_NAME: 'Zyrtec', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED010', GENERIC_NAME: 'Loratadine 10mg', TRADE_NAME: 'Claritin', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED011', GENERIC_NAME: 'Aspirin 100mg', TRADE_NAME: 'Cardiprin', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED012', GENERIC_NAME: 'Simvastatin 20mg', TRADE_NAME: 'Zocor', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED013', GENERIC_NAME: 'Amlodipine 5mg', TRADE_NAME: 'Norvasc', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED014', GENERIC_NAME: 'Enalapril 10mg', TRADE_NAME: 'Renitec', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED015', GENERIC_NAME: 'Furosemide 40mg', TRADE_NAME: 'Lasix', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED016', GENERIC_NAME: 'Prednisolone 5mg', TRADE_NAME: 'Solone', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED017', GENERIC_NAME: 'Insulin Lispro', TRADE_NAME: 'Humalog', DEFAULT_UNIT: 'VIAL', UNIT_CODE: 'VIAL' },
            { DRUG_CODE: 'MED018', GENERIC_NAME: 'Diazepam 5mg', TRADE_NAME: 'Valium', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED019', GENERIC_NAME: 'Ranitidine 150mg', TRADE_NAME: 'Zantac', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED020', GENERIC_NAME: 'Clotrimazole Cream', TRADE_NAME: 'Canesten', DEFAULT_UNIT: 'TUBE', UNIT_CODE: 'TUBE' },
            { DRUG_CODE: 'MED021', GENERIC_NAME: 'Dexamethasone Eye Drop', TRADE_NAME: 'Maxidex', DEFAULT_UNIT: 'BOT', UNIT_CODE: 'BOT' },
            { DRUG_CODE: 'MED022', GENERIC_NAME: 'Chlorpheniramine 4mg', TRADE_NAME: 'Piriton', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED023', GENERIC_NAME: 'Domperidone 10mg', TRADE_NAME: 'Motilium', DEFAULT_UNIT: 'TAB', UNIT_CODE: 'TAB' },
            { DRUG_CODE: 'MED024', GENERIC_NAME: 'Loperamide 2mg', TRADE_NAME: 'Imodium', DEFAULT_UNIT: 'CAP', UNIT_CODE: 'CAP' },
            { DRUG_CODE: 'MED025', GENERIC_NAME: 'Paracetamol Syrup', TRADE_NAME: 'Tylenol Syrup', DEFAULT_UNIT: 'BOT', UNIT_CODE: 'BOT' }
        ];
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateDrugData(data) {
        const errors = [];

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!data.DRUG_CODE?.trim()) {
            errors.push('กรุณากรอกรหัสยา');
        }

        if (!data.GENERIC_NAME?.trim()) {
            errors.push('กรุณากรอกชื่อสามัญยา');
        }

        // ตรวจสอบรูปแบบรหัสยา
        if (data.DRUG_CODE && !/^[A-Z0-9]{3,10}$/.test(data.DRUG_CODE)) {
            errors.push('รหัสยาต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 3-10 หลัก');
        }

        // ตรวจสอบราคา
        if (data.UNIT_PRICE && (isNaN(data.UNIT_PRICE) || data.UNIT_PRICE < 0)) {
            errors.push('ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
        }

        // ตรวจสอบความยาวข้อความ
        const maxLengths = {
            GENERIC_NAME: 100,
            TRADE_NAME: 255,
            DOSAGE_FORM: 255,
            STRENGTH1: 255,
            ROUTE_ADMIN: 255,
            DOSE1: 255,
            INDICATION1: 255,
            CONTRAINDICATION1: 255,
            SIDE_EFFECTS: 255,
            PRECAUTIONS1: 255
        };

        Object.entries(maxLengths).forEach(([field, maxLength]) => {
            if (data[field] && data[field].length > maxLength) {
                errors.push(`${this.getFieldName(field)} ต้องไม่เกิน ${maxLength} ตัวอักษร`);
            }
        });

        return errors;
    }

    // แปลชื่อฟิลด์เป็นภาษาไทย
    static getFieldName(fieldName) {
        const fieldNames = {
            DRUG_CODE: 'รหัสยา',
            GENERIC_NAME: 'ชื่อสามัญ',
            TRADE_NAME: 'ชื่อทางการค้า',
            DOSAGE_FORM: 'รูปแบบยา',
            STRENGTH1: 'ขนาดความแรง',
            ROUTE_ADMIN: 'วิธีใช้',
            DOSE1: 'ขนาดยา',
            INDICATION1: 'ข้อบ่งใช้',
            CONTRAINDICATION1: 'ข้อห้ามใช้',
            SIDE_EFFECTS: 'อาการข้างเคียง',
            PRECAUTIONS1: 'ข้อควรระวัง',
            UNIT_PRICE: 'ราคา'
        };
        return fieldNames[fieldName] || fieldName;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatDrugData(data) {
        return {
            DRUG_CODE: data.DRUG_CODE?.trim().toUpperCase(),
            GENERIC_NAME: data.GENERIC_NAME?.trim(),
            TRADE_NAME: data.TRADE_NAME?.trim(),
            DOSAGE_FORM: data.DOSAGE_FORM?.trim(),
            STRENGTH1: data.STRENGTH1?.trim(),
            PACKAGE_CODE: data.PACKAGE_CODE?.trim(),
            ROUTE_ADMIN: data.ROUTE_ADMIN?.trim(),
            DOSE1: data.DOSE1?.trim(),
            INDICATION1: data.INDICATION1?.trim(),
            CONTRAINDICATION1: data.CONTRAINDICATION1?.trim(),
            SIDE_EFFECTS: data.SIDE_EFFECTS?.trim(),
            PRECAUTIONS1: data.PRECAUTIONS1?.trim(),
            NATION_LIST_CODE: data.NATION_LIST_CODE?.trim(),
            NARCOTICS1: data.NARCOTICS1?.trim(),
            UNIT_CODE: data.UNIT_CODE?.trim(),
            UNIT_PRICE: data.UNIT_PRICE ? parseFloat(data.UNIT_PRICE) : null
        };
    }

    // สร้างรหัสยาอัตโนมัติ
    static generateDrugCode(prefix = 'DRG') {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${prefix}${year}${month}${day}${random}`;
    }

    // ดึงรายการรูปแบบยา
    static getDosageForms() {
        return [
            { value: 'เม็ด', label: 'เม็ด' },
            { value: 'แคปซูล', label: 'แคปซูล' },
            { value: 'น้ำยา', label: 'น้ำยา' },
            { value: 'ครีม', label: 'ครีม' },
            { value: 'แผ่น', label: 'แผ่น' },
            { value: 'หยด', label: 'หยด' },
            { value: 'ฉีด', label: 'ฉีด' },
            { value: 'พ่น', label: 'พ่น' },
            { value: 'ผง', label: 'ผง' }
        ];
    }

    // ดึงรายการวิธีใช้ยา
    static getRouteAdmin() {
        return [
            { value: 'รับประทาน', label: 'รับประทาน' },
            { value: 'ฉีดเข้าเส้นเลือด', label: 'ฉีดเข้าเส้นเลือด' },
            { value: 'ฉีดเข้ากล้ามเนื้อ', label: 'ฉีดเข้ากล้ามเนื้อ' },
            { value: 'ทาภายนอก', label: 'ทาภายนอก' },
            { value: 'หยดตา', label: 'หยดตา' },
            { value: 'หยดหู', label: 'หยดหู' },
            { value: 'หยดจมูก', label: 'หยดจมูก' },
            { value: 'ใส่ทวาร', label: 'ใส่ทวาร' },
            { value: 'แปะ', label: 'แปะ' }
        ];
    }

    // คำนวณราคารวม
    static calculateTotalPrice(drugs) {
        return drugs.reduce((total, drug) => {
            return total + (parseFloat(drug.UNIT_PRICE) || 0) * (parseInt(drug.QTY) || 0);
        }, 0);
    }

    // ตรวจสอบ Drug Interaction (ตัวอย่าง)
    static checkDrugInteraction(drugCodes) {
        // ตัวอย่างการตรวจสอบปฏิกิริยาระหว่างยา
        const interactions = {
            'ASPIRIN-WARFARIN': 'เสี่ยงต่อการเลือดออก',
            'DIGOXIN-FUROSEMIDE': 'เสี่ยงต่อพิษจากดิก็อกซิน'
        };

        const warnings = [];
        for (let i = 0; i < drugCodes.length; i++) {
            for (let j = i + 1; j < drugCodes.length; j++) {
                const pair1 = `${drugCodes[i]}-${drugCodes[j]}`;
                const pair2 = `${drugCodes[j]}-${drugCodes[i]}`;

                if (interactions[pair1]) {
                    warnings.push(`${drugCodes[i]} + ${drugCodes[j]}: ${interactions[pair1]}`);
                } else if (interactions[pair2]) {
                    warnings.push(`${drugCodes[j]} + ${drugCodes[i]}: ${interactions[pair2]}`);
                }
            }
        }

        return warnings;
    }
}

export default DrugService;