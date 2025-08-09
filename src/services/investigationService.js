// services/investigationService.js (IX)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class InvestigationService {

    // ดึงข้อมูลการตรวจทั้งหมด
    static async getAllInvestigations(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);

            const url = `${API_BASE_URL}/ix${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching investigations:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการตรวจตามรหัส
    static async getInvestigationByCode(ixCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/ix/${ixCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching investigation:', error);
            throw error;
        }
    }

    // ค้นหาการตรวจ
    static async searchInvestigations(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/ix/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching investigations:', error);
            throw error;
        }
    }

    // สร้างการตรวจใหม่
    static async createInvestigation(investigationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(investigationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating investigation:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลการตรวจ
    static async updateInvestigation(ixCode, investigationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ix/${ixCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(investigationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating investigation:', error);
            throw error;
        }
    }

    // ลบการตรวจ
    static async deleteInvestigation(ixCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/ix/${ixCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting investigation:', error);
            throw error;
        }
    }

    // สร้างรายการ options สำหรับ dropdown
    static formatForDropdown(investigationList) {
        return investigationList.map(investigation => ({
            value: investigation.IXCODE,
            label: `${investigation.IXCODE} - ${investigation.IXNAME}`,
            data: investigation
        }));
    }

    // ดึงรายการประเภทการตรวจ
    static getInvestigationTypes() {
        return [
            { value: 'Physical', label: 'ตรวจร่างกาย' },
            { value: 'Vital Signs', label: 'สัญญาณชีพ' },
            { value: 'Neurological', label: 'ตรวจระบบประสาท' },
            { value: 'Cardiovascular', label: 'ตรวจระบบหัวใจและหลอดเลือด' },
            { value: 'Respiratory', label: 'ตรวจระบบหายใจ' },
            { value: 'Musculoskeletal', label: 'ตรวจระบบกล้ามเนื้อและกระดูก' }
        ];
    }
}

export default InvestigationService;