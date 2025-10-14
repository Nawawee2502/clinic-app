// src/services/bankService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BankService {

    // Get Token from localStorage
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    // Get All Banks
    static async getAllBanks() {
        try {
            const response = await fetch(`${API_BASE_URL}/bank`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching banks:', error);
            throw error;
        }
    }

    // Get Bank by Code
    static async getBankByCode(bankCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/bank/${bankCode}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching bank:', error);
            throw error;
        }
    }

    // Create Bank (Admin Only)
    static async createBank(bankData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bank`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bankCode: bankData.bankCode,
                    bankName: bankData.bankName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถสร้างข้อมูลธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating bank:', error);
            throw error;
        }
    }

    // Update Bank (Admin Only)
    static async updateBank(bankCode, bankData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bank/${bankCode}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bankName: bankData.bankName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating bank:', error);
            throw error;
        }
    }

    // Delete Bank (Admin Only)
    static async deleteBank(bankCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/bank/${bankCode}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถลบข้อมูลธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting bank:', error);
            throw error;
        }
    }
}

export default BankService;