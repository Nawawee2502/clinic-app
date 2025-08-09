// services/labService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class LabService {

    // ดึงข้อมูลการตรวจ LAB ทั้งหมด
    static async getAllLabs(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);

            const url = `${API_BASE_URL}/lab${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching labs:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการตรวจ LAB ตามรหัส
    static async getLabByCode(labCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/lab/${labCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching lab:', error);
            throw error;
        }
    }

    // ค้นหาการตรวจ LAB
    static async searchLabs(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/lab/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching labs:', error);
            throw error;
        }
    }

    // สร้างการตรวจ LAB ใหม่
    static async createLab(labData) {
        try {
            const response = await fetch(`${API_BASE_URL}/lab`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(labData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating lab:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลการตรวจ LAB
    static async updateLab(labCode, labData) {
        try {
            const response = await fetch(`${API_BASE_URL}/lab/${labCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(labData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating lab:', error);
            throw error;
        }
    }

    // ลบการตรวจ LAB
    static async deleteLab(labCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/lab/${labCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting lab:', error);
            throw error;
        }
    }

    // สร้างรายการ options สำหรับ dropdown
    static formatForDropdown(labList) {
        return labList.map(lab => ({
            value: lab.LABCODE,
            label: `${lab.LABCODE} - ${lab.LABNAME}`,
            data: lab
        }));
    }
}

export default LabService;