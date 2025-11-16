// src/services/roleService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class RoleService {
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    static async getAllRoles() {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลสิทธิ์ได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }

    static async createRole(roleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    roleName: roleData.roleName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถสร้างสิทธิ์ใหม่ได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    static async updateRole(roleCode, roleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${roleCode}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    roleName: roleData.roleName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถแก้ไขสิทธิ์ได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    static async deleteRole(roleCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${roleCode}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถลบสิทธิ์ได้');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }
}

export default RoleService;

