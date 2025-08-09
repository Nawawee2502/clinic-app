// services/radiologicalService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class RadiologicalService {

    // ดึงข้อมูลการตรวจรังสีทั้งหมด
    static async getAllRadiological(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);

            const url = `${API_BASE_URL}/radiological${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching radiological tests:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการตรวจรังสีตามรหัส
    static async getRadiologicalByCode(rlCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/radiological/${rlCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching radiological test:', error);
            throw error;
        }
    }

    // ค้นหาการตรวจรังสี
    static async searchRadiological(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/radiological/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching radiological tests:', error);
            throw error;
        }
    }

    // สร้างการตรวจรังสีใหม่
    static async createRadiological(radiologicalData) {
        try {
            const response = await fetch(`${API_BASE_URL}/radiological`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(radiologicalData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating radiological test:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลการตรวจรังสี
    static async updateRadiological(rlCode, radiologicalData) {
        try {
            const response = await fetch(`${API_BASE_URL}/radiological/${rlCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(radiologicalData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating radiological test:', error);
            throw error;
        }
    }

    // ลบการตรวจรังสี
    static async deleteRadiological(rlCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/radiological/${rlCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting radiological test:', error);
            throw error;
        }
    }

    // สร้างรายการ options สำหรับ dropdown
    static formatForDropdown(radiologicalList) {
        return radiologicalList.map(radio => ({
            value: radio.RLCODE,
            label: `${radio.RLCODE} - ${radio.RLNAME}`,
            data: radio
        }));
    }

    // ดึงรายการประเภทการตรวจ
    static getRadiologicalTypes() {
        return [
            { value: 'X-ray', label: 'เอ็กซเรย์' },
            { value: 'CT', label: 'ซีทีสแกน' },
            { value: 'MRI', label: 'เอ็มอาร์ไอ' },
            { value: 'Ultrasound', label: 'อัลตราซาวด์' },
            { value: 'Mammography', label: 'แมมโมกราฟี' },
            { value: 'Fluoroscopy', label: 'ฟลูออโรสโคปี' }
        ];
    }
}

export default RadiologicalService;