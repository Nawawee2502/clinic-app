// src/services/bookBankService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BookBankService {

    // Get Token from localStorage
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    // Get All Book Banks
    static async getAllBookBanks() {
        try {
            const response = await fetch(`${API_BASE_URL}/book-bank`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลบัญชีธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching book banks:', error);
            throw error;
        }
    }

    // Get Book Bank by Code and No
    static async getBookBank(bankCode, bankNo) {
        try {
            const response = await fetch(`${API_BASE_URL}/book-bank/${bankCode}/${bankNo}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลบัญชีธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching book bank:', error);
            throw error;
        }
    }

    // Create Book Bank (Admin Only)
    static async createBookBank(bookBankData) {
        try {
            const response = await fetch(`${API_BASE_URL}/book-bank`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bankCode: bookBankData.bankCode,
                    bankNo: bookBankData.bankNo,
                    bankBranch: bookBankData.bankBranch,
                    bankType: bookBankData.bankType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถสร้างข้อมูลบัญชีธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating book bank:', error);
            throw error;
        }
    }

    // Update Book Bank (Admin Only)
    static async updateBookBank(bankCode, bankNo, bookBankData) {
        try {
            const response = await fetch(`${API_BASE_URL}/book-bank/${bankCode}/${bankNo}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bankBranch: bookBankData.bankBranch,
                    bankType: bookBankData.bankType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลบัญชีธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating book bank:', error);
            throw error;
        }
    }

    // Delete Book Bank (Admin Only)
    static async deleteBookBank(bankCode, bankNo) {
        try {
            const response = await fetch(`${API_BASE_URL}/book-bank/${bankCode}/${bankNo}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถลบข้อมูลบัญชีธนาคารได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting book bank:', error);
            throw error;
        }
    }
}

export default BookBankService;