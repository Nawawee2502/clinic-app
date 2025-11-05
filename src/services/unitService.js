// services/unitService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UnitService {
    // ดึงข้อมูลหน่วยนับทั้งหมด
    static async getAllUnits() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/units`);
            const response = await fetch(`${API_BASE_URL}/units`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    // ดึงข้อมูลหน่วยนับตามรหัส
    static async getUnitByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/units/${code}`);
            const response = await fetch(`${API_BASE_URL}/units/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching unit:', error);
            throw error;
        }
    }

    // สร้างหน่วยนับใหม่
    static async createUnit(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/units`);
            const response = await fetch(`${API_BASE_URL}/units`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating unit:', error);
            throw error;
        }
    }

    // แก้ไขหน่วยนับ
    static async updateUnit(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/units/${code}`);
            const response = await fetch(`${API_BASE_URL}/units/${code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating unit:', error);
            throw error;
        }
    }

    // ลบหน่วยนับ
    static async deleteUnit(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/units/${code}`);
            const response = await fetch(`${API_BASE_URL}/units/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting unit:', error);
            throw error;
        }
    }
}

export default UnitService;

