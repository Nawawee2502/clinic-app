// services/queueService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class QueueService {

    // ดึงคิววันนี้
    static async getTodayQueue() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/today`);
            const response = await fetch(`${API_BASE_URL}/queue/today`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching today queue:', error);
            throw error;
        }
    }

    // ดึงคิวทั้งหมด (ไม่กรองตามวันที่)
    static async getAllQueue() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/all`);
            const response = await fetch(`${API_BASE_URL}/queue/all`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all queue:', error);
            throw error;
        }
    }

    // ✅ ดึงคิวทั้งหมดพร้อมสถานะการชำระเงิน (Optimized for Payment Page)
    static async getAllQueueWithPaymentStatus() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/all-with-payment-status`);
            const response = await fetch(`${API_BASE_URL}/queue/all-with-payment-status`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all queue with payment status:', error);
            throw error;
        }
    }

    // ดึงนัดหมายวันนี้
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

    // สร้างคิว walk-in
    static async createWalkInQueue(queueData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/create`);
            const response = await fetch(`${API_BASE_URL}/queue/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(queueData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating walk-in queue:', error);
            throw error;
        }
    }

    // เช็คอินจากนัดหมาย
    static async checkInAppointment(appointmentId) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/checkin`);
            const response = await fetch(`${API_BASE_URL}/queue/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ APPOINTMENT_ID: appointmentId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking in appointment:', error);
            throw error;
        }
    }

    // อัพเดทสถานะคิว
    static async updateQueueStatus(queueId, status) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/${queueId}/status`);
            const response = await fetch(`${API_BASE_URL}/queue/${queueId}/status`, {
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
            console.error('Error updating queue status:', error);
            throw error;
        }
    }

    // ลบคิว
    static async removeQueue(queueId) {
        try {
            console.log('🔗 Calling API (delete queue):', `${API_BASE_URL}/queue/${queueId}`);
            const response = await fetch(`${API_BASE_URL}/queue/${queueId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error removing queue:', error);
            throw error;
        }
    }

    // ดึงสถิติคิว
    static async getQueueStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/queue/stats`);
            const response = await fetch(`${API_BASE_URL}/queue/stats`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching queue stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องข้อมูลคิว
    static validateQueueData(data) {
        const errors = [];

        if (!data.HNCODE?.trim()) {
            errors.push('กรุณาระบุ Hospital Number');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลคิว
    static formatQueueData(data) {
        return {
            HNCODE: data.HNCODE?.trim(),
            CHIEF_COMPLAINT: data.CHIEF_COMPLAINT?.trim(),
            CREATED_BY: data.CREATED_BY?.trim()
        };
    }

    // ดึงรายการสถานะคิว
    static getQueueStatuses() {
        return [
            { value: 'รอตรวจ', label: 'รอตรวจ', color: 'warning' },
            { value: 'กำลังตรวจ', label: 'กำลังตรวจ', color: 'info' },
            { value: 'เสร็จแล้ว', label: 'เสร็จแล้ว', color: 'success' }
        ];
    }

    // ดึงรายการประเภทคิว
    static getQueueTypes() {
        return [
            { value: 'walk-in', label: 'Walk-in', color: 'primary' },
            { value: 'appointment', label: 'นัดหมาย', color: 'secondary' }
        ];
    }

    static async updateQueueStatusSafe(queueId, status) {
        try {
            console.log('🔗 Calling SAFE API:', `${API_BASE_URL}/queue/${queueId}/status-only`);
            const response = await fetch(`${API_BASE_URL}/queue/${queueId}/status-only`, {
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
            console.error('Error updating queue status (safe):', error);
            throw error;
        }
    }
}

export default QueueService;