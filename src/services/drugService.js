// services/drugService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class DrugService {

    // ✅ สร้างยาใหม่ - รองรับ fields ทั้งหมด
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

    // ✅ ดึงข้อมูลยาทั้งหมด - เพิ่ม filters
    static async getAllDrugs(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.type) queryParams.append('type', params.type);
            if (params.unit_code) queryParams.append('unit_code', params.unit_code);
            if (params.drug_formulations) queryParams.append('drug_formulations', params.drug_formulations);

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

    // ✅ ดึงข้อมูลยาตามรหัส
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

    // ✅ อัพเดทข้อมูลยา - รองรับ fields ทั้งหมด
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

    // ✅ ลบยา
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

    // ✅ ดึงประเภทยา (Type1)
    static async getDrugTypes() {
        try {
            const response = await fetch(`${API_BASE_URL}/drugs/filters/types`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching drug types:', error);
            throw error;
        }
    }

    // ✅ ดึงรูปแบบยา (Drug_formulations)
    static async getDrugFormulations() {
        try {
            const response = await fetch(`${API_BASE_URL}/drugs/filters/formulations`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching drug formulations:', error);
            throw error;
        }
    }

    // ✅ ตรวจสอบความถูกต้องของข้อมูล - อัปเดตตาม TABLE_DRUG
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
            DRUG_CODE: 10,
            GENERIC_NAME: 100,
            TRADE_NAME: 255,
            UNIT_CODE: 10,
            Type1: 255,
            Dose1: 255,
            Indication1: 255,
            Effect1: 255,
            Contraindications1: 255,
            Comment1: 255,
            Drug_formulations: 255,
            SOCIAL_CARD: 50,
            UCS_CARD: 50
        };

        Object.entries(maxLengths).forEach(([field, maxLength]) => {
            if (data[field] && data[field].length > maxLength) {
                errors.push(`${this.getFieldName(field)} ต้องไม่เกิน ${maxLength} ตัวอักษร`);
            }
        });

        return errors;
    }

    // ✅ แปลชื่อฟิลด์เป็นภาษาไทย - อัปเดตตาม TABLE_DRUG
    static getFieldName(fieldName) {
        const fieldNames = {
            DRUG_CODE: 'รหัสยา',
            GENERIC_NAME: 'ชื่อสามัญ',
            TRADE_NAME: 'ชื่อทางการค้า',
            UNIT_CODE: 'หน่วย',
            UNIT_PRICE: 'ราคา',
            Type1: 'ประเภท',
            Dose1: 'ขนาดยา',
            Indication1: 'ข้อบ่งใช้',
            Effect1: 'ผลข้างเคียง',
            Contraindications1: 'ข้อห้ามใช้',
            Comment1: 'หมายเหตุ',
            Drug_formulations: 'รูปแบบยา',
            SOCIAL_CARD: 'บัตรสวัสดิการ',
            UCS_CARD: 'บัตรทอง'
        };
        return fieldNames[fieldName] || fieldName;
    }

    // ✅ จัดรูปแบบข้อมูลก่อนส่ง API
    static formatDrugData(data) {
        return {
            DRUG_CODE: data.DRUG_CODE?.trim().toUpperCase(),
            GENERIC_NAME: data.GENERIC_NAME?.trim(),
            TRADE_NAME: data.TRADE_NAME?.trim(),
            UNIT_CODE: data.UNIT_CODE?.trim(),
            UNIT_PRICE: data.UNIT_PRICE ? parseFloat(data.UNIT_PRICE) : null,
            Type1: data.Type1?.trim(),
            Dose1: data.Dose1?.trim(),
            Indication1: data.Indication1?.trim(),
            Effect1: data.Effect1?.trim() || 'None',
            Contraindications1: data.Contraindications1?.trim() || 'None',
            Comment1: data.Comment1?.trim() || 'None',
            Drug_formulations: data.Drug_formulations?.trim(),
            SOCIAL_CARD: data.SOCIAL_CARD || 'N',
            UCS_CARD: data.UCS_CARD || 'N'
        };
    }

    // ✅ ดึงรายการหน่วยยา
    static getUnitCodes() {
        return [
            { value: 'เม็ด', label: 'เม็ด' },
            { value: 'แคปซูล', label: 'แคปซูล' },
            { value: 'ขวด', label: 'ขวด' },
            { value: 'หลอด', label: 'หลอด' },
            { value: 'กล่อง', label: 'กล่อง' },
            { value: 'แผง', label: 'แผง' },
            { value: 'Amp', label: 'Amp' },
            { value: 'Vial', label: 'Vial' }
        ];
    }

    // ✅ ดึงรายการรูปแบบยา
    static getDrugFormulationsList() {
        return [
            { value: 'Tablets', label: 'เม็ด (Tablets)' },
            { value: 'Capsules', label: 'แคปซูล (Capsules)' },
            { value: 'Topical', label: 'ยาทาภายนอก (Topical)' },
            { value: 'Injections', label: 'ยาฉีด (Injections)' },
            { value: 'ยาน้ำ', label: 'ยาน้ำ' },
            { value: 'Syrup', label: 'ยาน้ำเชื่อม (Syrup)' },
            { value: 'Drops', label: 'ยาหยด (Drops)' },
            { value: 'Spray', label: 'ยาพ่น (Spray)' }
        ];
    }

    // ✅ ดึงรายการประเภทยา
    static getDrugTypesList() {
        return [
            { value: 'ยาอันตราย', label: 'ยาอันตราย' },
            { value: 'ยาสามัญประจำบ้าน', label: 'ยาสามัญประจำบ้าน' },
            { value: 'ยาใช้ภายนอก', label: 'ยาใช้ภายนอก' },
            { value: 'วัถุอออกฤทธิ์', label: 'วัถุอออกฤทธิ์' }
        ];
    }

    // ✅ สร้างรหัสยาอัตโนมัติ
    static async generateNextDrugCode() {
        try {
            // ดึงรหัสยาล่าสุดจาก API
            const response = await this.getAllDrugs({ limit: 1, page: 1 });
            
            if (response.success && response.data.length > 0) {
                const lastCode = response.data[0].DRUG_CODE;
                // สมมติว่ารหัสเป็น D0001, D0002, ...
                const match = lastCode.match(/^D(\d+)$/);
                if (match) {
                    const nextNum = parseInt(match[1]) + 1;
                    return `D${nextNum.toString().padStart(4, '0')}`;
                }
            }
            
            return 'D0001'; // รหัสเริ่มต้น
        } catch (error) {
            console.error('Error generating drug code:', error);
            // สร้างรหัสแบบสุ่ม
            const random = Math.floor(Math.random() * 10000);
            return `D${random.toString().padStart(4, '0')}`;
        }
    }

    // ✅ คำนวณราคารวม
    static calculateTotalPrice(drugs) {
        return drugs.reduce((total, drug) => {
            return total + (parseFloat(drug.UNIT_PRICE) || 0) * (parseInt(drug.QTY) || 0);
        }, 0);
    }

    // ✅ ฟอร์แมตราคา
    static formatPrice(price) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2
        }).format(price || 0);
    }

    // ✅ ฟังก์ชันเปรียบเทียบยา
    static compareDrugs(drug1, drug2) {
        const differences = [];
        
        const fieldsToCompare = [
            'GENERIC_NAME', 'TRADE_NAME', 'UNIT_PRICE', 'Type1', 
            'Dose1', 'Indication1', 'Drug_formulations'
        ];

        fieldsToCompare.forEach(field => {
            if (drug1[field] !== drug2[field]) {
                differences.push({
                    field: this.getFieldName(field),
                    value1: drug1[field],
                    value2: drug2[field]
                });
            }
        });

        return differences;
    }
}

export default DrugService;