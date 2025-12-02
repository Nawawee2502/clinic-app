// services/appointmentService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AppointmentService {
    
    // ดึงนัดหมายทั้งหมด (พร้อม filters)
    static async getAllAppointments(params = {}) {
        try {
            const { page = 1, limit = 50, status, doctor_code, hncode, date_from, date_to, search } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (status) queryParams.append('status', status);
            if (doctor_code) queryParams.append('doctor_code', doctor_code);
            if (hncode) queryParams.append('hncode', hncode);
            if (date_from) queryParams.append('date_from', date_from);
            if (date_to) queryParams.append('date_to', date_to);
            if (search) queryParams.append('search', search);

            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments?${queryParams}`);
            const response = await fetch(`${API_BASE_URL}/appointments?${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    // ดึงนัดหมายตาม ID
    static async getAppointmentById(appointmentId) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    }

    // ดึงนัดหมายตามวันที่
    static async getAppointmentsByDate(date, params = {}) {
        try {
            const { doctor_code, status } = params;
            const queryParams = new URLSearchParams();
            
            if (doctor_code) queryParams.append('doctor_code', doctor_code);
            if (status) queryParams.append('status', status);

            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/appointments/date/${date}${queryString ? `?${queryString}` : ''}`;
            
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching appointments by date:', error);
            throw error;
        }
    }

    // ดึงนัดหมายของผู้ป่วยตาม HNCODE
    static async getPatientAppointments(hncode, params = {}) {
        try {
            const { page = 1, limit = 50, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (status) {
                queryParams.append('status', status);
            }

            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/patient/${hncode}?${queryParams}`);
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${hncode}?${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            throw error;
        }
    }

    // สร้างนัดหมายใหม่
    static async createAppointment(appointmentData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments`);
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    // แก้ไขนัดหมาย
    static async updateAppointment(appointmentId, appointmentData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    // ลบนัดหมาย
    static async deleteAppointment(appointmentId) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    // อัพเดทสถานะนัดหมาย
    static async updateAppointmentStatus(appointmentId, status) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}/status`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }

    // ดึงนัดหมายวันนี้ (จาก queue route)
    static async getTodayAppointments() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/appointments/today`);
            const response = await fetch(`${API_BASE_URL}/queue/appointments/today`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    }

    // ดึงสถิตินัดหมาย
    static async getAppointmentStats(params = {}) {
        try {
            const { date_from, date_to } = params;
            const queryParams = new URLSearchParams();
            
            if (date_from) queryParams.append('date_from', date_from);
            if (date_to) queryParams.append('date_to', date_to);

            const queryString = queryParams.toString();
            const url = `${API_BASE_URL}/appointments/stats${queryString ? `?${queryString}` : ''}`;
            
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching appointment stats:', error);
            throw error;
        }
    }
}

export default AppointmentService;

