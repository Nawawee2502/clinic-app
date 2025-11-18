// services/balCashService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BalCashService {
    // ดึงข้อมูลยอดยกมาเงินสดทั้งหมด
    static async getAllBalCash(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.year) queryParams.append('year', params.year);
            if (params.month) queryParams.append('month', params.month);

            const url = `${API_BASE_URL}/bal_cash${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching BAL_CASH:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดยกมาเงินสดตามวันที่
    static async getBalCashByDate(date) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_cash/date/${date}`);
            const response = await fetch(`${API_BASE_URL}/bal_cash/date/${date}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching BAL_CASH by date:', error);
            throw error;
        }
    }

    // สร้างหรืออัปเดตยอดยกมาเงินสด (พร้อม propagate ไปวันที่ถัดไป)
    static async createOrUpdateBalCash(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_cash`);
            const response = await fetch(`${API_BASE_URL}/bal_cash`, {
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
            console.error('Error creating/updating BAL_CASH:', error);
            throw error;
        }
    }

    // อัปเดตยอดยกมาเงินสด
    static async updateBalCash(date, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_cash/${date}`);
            const response = await fetch(`${API_BASE_URL}/bal_cash/${date}`, {
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
            console.error('Error updating BAL_CASH:', error);
            throw error;
        }
    }

    // ลบยอดยกมาเงินสด
    static async deleteBalCash(date) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_cash/${date}`);
            const response = await fetch(`${API_BASE_URL}/bal_cash/${date}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting BAL_CASH:', error);
            throw error;
        }
    }
}

export default BalCashService;

