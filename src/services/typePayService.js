// services/typePayService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TypePayService {
    // ดึงข้อมูลประเภทรายจ่ายทั้งหมด
    static async getAllTypePay() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay`);
            const response = await fetch(`${API_BASE_URL}/typepay`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment types:', error);
            throw error;
        }
    }

    // ดึงข้อมูลประเภทรายจ่ายตามรหัส
    static async getTypePayByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/${code}`);
            const response = await fetch(`${API_BASE_URL}/typepay/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment type:', error);
            throw error;
        }
    }

    // ค้นหาประเภทรายจ่าย
    static async searchTypePay(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/typepay/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching payment types:', error);
            throw error;
        }
    }

    // ตรวจสอบว่ารหัสมีอยู่แล้วหรือไม่
    static async checkCodeExists(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/check/${code}`);
            const response = await fetch(`${API_BASE_URL}/typepay/check/${code}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking payment type code:', error);
            throw error;
        }
    }

    // สร้างประเภทรายจ่ายใหม่
    static async createTypePay(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay`);
            const response = await fetch(`${API_BASE_URL}/typepay`, {
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
            console.error('Error creating payment type:', error);
            throw error;
        }
    }

    // แก้ไขประเภทรายจ่าย
    static async updateTypePay(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/${code}`);
            const response = await fetch(`${API_BASE_URL}/typepay/${code}`, {
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
            console.error('Error updating payment type:', error);
            throw error;
        }
    }

    // ลบประเภทรายจ่าย
    static async deleteTypePay(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/${code}`);
            const response = await fetch(`${API_BASE_URL}/typepay/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting payment type:', error);
            throw error;
        }
    }

    // ดึงสถิติประเภทรายจ่าย (ถ้ามี endpoint)
    static async getTypePayStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typepay/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/typepay/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment type stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    // ✅ แก้ตรงนี้ - เพิ่ม parameter isEditing
    static validateTypePayData(data, isEditing = false) {
        const errors = [];

        // ตรวจสอบรหัส - เฉพาะตอน EDIT เท่านั้น
        if (isEditing) {
            if (!data.TYPE_PAY_CODE?.trim()) {
                errors.push('กรุณากรอกรหัสประเภทรายจ่าย');
            } else if (data.TYPE_PAY_CODE.length > 3) {
                errors.push('รหัสประเภทรายจ่ายต้องไม่เกิน 3 ตัวอักษร');
            }
        }

        // ตรวจสอบชื่อ - ทั้ง CREATE และ EDIT
        if (!data.TYPE_PAY_NAME?.trim()) {
            errors.push('กรุณากรอกชื่อประเภทรายจ่าย');
        } else if (data.TYPE_PAY_NAME.length > 100) {
            errors.push('ชื่อประเภทรายจ่ายต้องไม่เกิน 100 ตัวอักษร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatTypePayData(data) {
        return {
            TYPE_PAY_CODE: data.TYPE_PAY_CODE?.trim().toUpperCase(),
            TYPE_PAY_NAME: data.TYPE_PAY_NAME?.trim()
        };
    }

    // สร้างรายการ dropdown สำหรับเลือกประเภทรายจ่าย
    static formatForDropdown(typePayList) {
        return typePayList.map(item => ({
            value: item.TYPE_PAY_CODE,
            label: `${item.TYPE_PAY_CODE} - ${item.TYPE_PAY_NAME}`,
            data: item
        }));
    }

    // แปลงเป็น options สำหรับ select/dropdown
    static toOptions(typePayList) {
        return typePayList.map(item => ({
            value: item.TYPE_PAY_CODE,
            label: item.TYPE_PAY_NAME,
            code: item.TYPE_PAY_CODE,
            name: item.TYPE_PAY_NAME
        }));
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(typePayList) {
        const headers = ['รหัสประเภทรายจ่าย', 'ชื่อประเภทรายจ่าย'];

        const rows = typePayList.map(item => [
            item.TYPE_PAY_CODE,
            item.TYPE_PAY_NAME
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field || ''}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(typePayList, filename = 'payment-types') {
        const csvContent = this.exportToCSV(typePayList);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // สร้างรหัสอัตโนมัติ (3 หลัก)
    static generateCode(existingCodes = []) {
        // หารหัสที่มีอยู่แล้ว
        const usedNumbers = existingCodes
            .map(code => parseInt(code))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);

        // หาเลขถัดไปที่ว่าง
        let nextNumber = 1;
        for (const num of usedNumbers) {
            if (num === nextNumber) {
                nextNumber++;
            } else {
                break;
            }
        }

        // แปลงเป็นรหัส 3 หลัก
        return nextNumber.toString().padStart(3, '0');
    }

    // กรองข้อมูลตามเงื่อนไข
    static filterTypePay(typePayList, filterOptions = {}) {
        let filtered = [...typePayList];

        // กรองตามคำค้นหา
        if (filterOptions.searchTerm) {
            const search = filterOptions.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.TYPE_PAY_CODE.toLowerCase().includes(search) ||
                item.TYPE_PAY_NAME.toLowerCase().includes(search)
            );
        }

        // เรียงลำดับ
        if (filterOptions.sortBy) {
            filtered.sort((a, b) => {
                const aValue = a[filterOptions.sortBy];
                const bValue = b[filterOptions.sortBy];

                if (filterOptions.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                } else {
                    return aValue > bValue ? 1 : -1;
                }
            });
        }

        return filtered;
    }

    // นับจำนวนการใช้งานประเภทรายจ่าย (ถ้ามีการเชื่อมโยงกับตารางอื่น)
    static async getUsageCount(code) {
        try {
            // TODO: Implement endpoint for counting usage
            console.log(`Checking usage count for payment type: ${code}`);
            return 0;
        } catch (error) {
            console.error('Error getting usage count:', error);
            throw error;
        }
    }

    // ตรวจสอบว่าสามารถลบได้หรือไม่
    static async canDelete(code) {
        try {
            const usageCount = await this.getUsageCount(code);
            return usageCount === 0;
        } catch (error) {
            console.error('Error checking if can delete:', error);
            return false;
        }
    }

    // แปลงข้อมูลสำหรับแสดงผลในตาราง
    static formatForTable(typePayList) {
        return typePayList.map((item, index) => ({
            no: index + 1,
            code: item.TYPE_PAY_CODE,
            name: item.TYPE_PAY_NAME,
            ...item
        }));
    }
}

export default TypePayService;