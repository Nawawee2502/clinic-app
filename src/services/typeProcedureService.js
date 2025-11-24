// services/typeProcedureService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TypeProcedureService {
    // ดึงข้อมูลประเภทหัตถการทั้งหมด
    static async getAllTypeProcedures() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_procedure`);
            const response = await fetch(`${API_BASE_URL}/type_procedure`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching type procedures:', error);
            throw error;
        }
    }

    // ดึงข้อมูลประเภทหัตถการตามรหัส
    static async getTypeProcedureByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_procedure/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_procedure/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching type procedure:', error);
            throw error;
        }
    }

    // สร้างประเภทหัตถการใหม่
    static async createTypeProcedure(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_procedure`);
            const response = await fetch(`${API_BASE_URL}/type_procedure`, {
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
            console.error('Error creating type procedure:', error);
            throw error;
        }
    }

    // แก้ไขประเภทหัตถการ
    static async updateTypeProcedure(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_procedure/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_procedure/${code}`, {
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
            console.error('Error updating type procedure:', error);
            throw error;
        }
    }

    // ลบประเภทหัตถการ
    static async deleteTypeProcedure(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/type_procedure/${code}`);
            const response = await fetch(`${API_BASE_URL}/type_procedure/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting type procedure:', error);
            throw error;
        }
    }
}

export default TypeProcedureService;

