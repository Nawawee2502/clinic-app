// services/typeDrugService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TypeDrugService {
    // ดึงข้อมูลประเภทยาทั้งหมด
    static async getAllTypeDrugs() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_drug`);
            const response = await fetch(`${API_BASE_URL}/type_drug`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching type drugs:', error);
            throw error;
        }
    }

    // ดึงข้อมูลประเภทยาตามรหัส
    static async getTypeDrugByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_drug/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_drug/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching type drug:', error);
            throw error;
        }
    }

    // สร้างประเภทยาใหม่
    static async createTypeDrug(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_drug`);
            const response = await fetch(`${API_BASE_URL}/type_drug`, {
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
            console.error('Error creating type drug:', error);
            throw error;
        }
    }

    // แก้ไขประเภทยา
    static async updateTypeDrug(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_drug/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_drug/${code}`, {
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
            console.error('Error updating type drug:', error);
            throw error;
        }
    }

    // ลบประเภทยา
    static async deleteTypeDrug(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_drug/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_drug/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting type drug:', error);
            throw error;
        }
    }
}

export default TypeDrugService;

