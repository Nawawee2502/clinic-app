// src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
    static TOKEN_KEY = 'auth_token';
    static USER_KEY = 'auth_user';

    // Register
    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'ลงทะเบียนไม่สำเร็จ');
            }

            // บันทึก Token และ User หลังลงทะเบียนสำเร็จ
            this.setToken(data.data.token);
            this.setUser(data.data.user);
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login
    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }

            this.setToken(data.data.token);
            this.setUser(data.data.user);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout
    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    // Verify Token
    static async verifyToken() {
        try {
            const token = this.getToken();
            if (!token) {
                return { success: false, message: 'ไม่พบ Token' };
            }

            const response = await fetch(`${API_BASE_URL}/users/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                this.logout();
                return { success: false, expired: true, message: data.message };
            }

            this.setUser(data.data.user);
            return { success: true, data: data.data };
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
            return { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ Token' };
        }
    }

    // Get All Users
    static async getAllUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status) queryParams.append('status', params.status);
            if (params.role) queryParams.append('role', params.role);
            if (params.search) queryParams.append('search', params.search);

            const url = `${API_BASE_URL}/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get User By ID
    static async getUserById(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    // Create User
    static async createUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update User
    static async updateUser(userId, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Delete User
    static async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Change Password
    static async changePassword(oldPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Helper Methods
    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
}

export default AuthService;