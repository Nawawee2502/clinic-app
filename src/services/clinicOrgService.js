// src/services/clinicOrgService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ClinicOrgService {

    // Get Token from localStorage
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    // Get Clinic Organization Info
    static async getClinicOrg() {
        try {
            const response = await fetch(`${API_BASE_URL}/clinic-org`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลองค์กรได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching clinic org:', error);
            throw error;
        }
    }

    // Update Clinic Organization Info
    static async updateClinicOrg(orgData) {
        try {
            const response = await fetch(`${API_BASE_URL}/clinic-org`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orgData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลองค์กรได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating clinic org:', error);
            throw error;
        }
    }

    // Upload Logo
    static async uploadLogo(logoBase64) {
        try {
            const response = await fetch(`${API_BASE_URL}/clinic-org/logo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ logo: logoBase64 })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปโหลดโลโก้ได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    }
}

export default ClinicOrgService;