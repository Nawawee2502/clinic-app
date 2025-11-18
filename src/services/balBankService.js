// services/balBankService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BalBankService {
    // ดึงข้อมูลยอดยกมาเงินฝากธนาคารทั้งหมด
    static async getAllBalBank(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.year) queryParams.append('year', params.year);
            if (params.month) queryParams.append('month', params.month);
            if (params.bank_no) queryParams.append('bank_no', params.bank_no);

            const url = `${API_BASE_URL}/bal_bank${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching BAL_BANK:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดยกมาเงินฝากธนาคารตามวันที่และเลขบัญชี
    static async getBalBankByDateAndBank(date, bankNo) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_bank/date/${date}/${bankNo}`);
            const response = await fetch(`${API_BASE_URL}/bal_bank/date/${date}/${bankNo}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching BAL_BANK by date and bank:', error);
            throw error;
        }
    }

    // สร้างหรืออัปเดตยอดยกมาเงินฝากธนาคาร (พร้อม propagate ไปวันที่ถัดไป)
    static async createOrUpdateBalBank(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_bank`);
            const response = await fetch(`${API_BASE_URL}/bal_bank`, {
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
            console.error('Error creating/updating BAL_BANK:', error);
            throw error;
        }
    }

    // อัปเดตยอดยกมาเงินฝากธนาคาร
    static async updateBalBank(date, bankNo, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_bank/${date}/${bankNo}`);
            const response = await fetch(`${API_BASE_URL}/bal_bank/${date}/${bankNo}`, {
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
            console.error('Error updating BAL_BANK:', error);
            throw error;
        }
    }

    // ลบยอดยกมาเงินฝากธนาคาร
    static async deleteBalBank(date, bankNo) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_bank/${date}/${bankNo}`);
            const response = await fetch(`${API_BASE_URL}/bal_bank/${date}/${bankNo}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting BAL_BANK:', error);
            throw error;
        }
    }
}

export default BalBankService;

