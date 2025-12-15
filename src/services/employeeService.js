// services/employeeService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class EmployeeService {

    // สร้างพนักงานใหม่
    static async createEmployee(employeeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }

    // ดึงข้อมูลพนักงานทั้งหมด
    static async getAllEmployees(type = null) {
        try {
            const url = type ? `${API_BASE_URL}/employees?type=${encodeURIComponent(type)}` : `${API_BASE_URL}/employees`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    }

    // ดึงข้อมูลพนักงานตามรหัส
    static async getEmployeeByCode(empCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${empCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw error;
        }
    }

    // ดึงพนักงานตามประเภท
    static async getEmployeesByType(empType) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/type/${encodeURIComponent(empType)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching employees by type:', error);
            throw error;
        }
    }

    // ค้นหาพนักงาน
    static async searchEmployees(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching employees:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลพนักงาน
    static async updateEmployee(empCode, employeeData) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${empCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    }

    // ลบพนักงาน
    static async deleteEmployee(empCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${empCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }

    // ดึงสถิติพนักงาน
    static async getEmployeeStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching employee stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateEmployeeData(data) {
        const errors = [];

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!data.EMP_CODE?.trim()) {
            errors.push('กรุณากรอกรหัสพนักงาน');
        }

        if (!data.EMP_NAME?.trim()) {
            errors.push('กรุณากรอกชื่อพนักงาน');
        }

        // ตรวจสอบรูปแบบรหัสพนักงาน (ตัวอย่าง: ต้องเป็นตัวอักษร + ตัวเลข)
        if (data.EMP_CODE && !/^[A-Z]{3}\d{3}$/.test(data.EMP_CODE)) {
            errors.push('รหัสพนักงานต้องมีรูปแบบ ABC123 (ตัวอักษร 3 ตัว + ตัวเลข 3 หลัก)');
        }

        // ตรวจสอบความยาวชื่อ
        if (data.EMP_NAME && data.EMP_NAME.length > 100) {
            errors.push('ชื่อพนักงานต้องไม่เกิน 100 ตัวอักษร');
        }

        if (data.EMP_TYPE && data.EMP_TYPE.length > 100) {
            errors.push('ประเภทพนักงานต้องไม่เกิน 100 ตัวอักษร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatEmployeeData(data) {
        return {
            EMP_CODE: data.EMP_CODE?.trim().toUpperCase(),
            EMP_NAME: data.EMP_NAME?.trim(),
            EMP_TYPE: data.EMP_TYPE?.trim(),
            LICENSE_NO: data.LICENSE_NO?.trim() || null
        };
    }

    // สร้างรหัสพนักงานอัตโนมัติ
    static generateEmployeeCode(empType = 'EMP') {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        // ตัวอย่าง: DOC24010001, NUR24010001
        const prefix = empType === 'หมอ' ? 'DOC' :
            empType === 'พยาบาล' ? 'NUR' : 'EMP';

        return `${prefix}${year}${month}${random}`;
    }

    // ดึงรายการประเภทพนักงาน (สำหรับ dropdown)
    static getEmployeeTypes() {
        return [
            { value: 'หมอ', label: 'แพทย์' },
            { value: 'พยาบาล', label: 'พยาบาล' },
            { value: 'เภสัชกร', label: 'เภสัชกร' },
            { value: 'นักเทคนิค', label: 'นักเทคนิคการแพทย์' },
            { value: 'เจ้าหน้าที่', label: 'เจ้าหน้าที่' },
            { value: 'แอดมิน', label: 'แอดมิน' }
        ];
    }

    // ฟิลเตอร์และเรียงลำดับข้อมูล
    static filterAndSortEmployees(employees, filters = {}) {
        let filtered = [...employees];

        // กรองตามประเภท
        if (filters.type) {
            filtered = filtered.filter(emp => emp.EMP_TYPE === filters.type);
        }

        // กรองตามชื่อ
        if (filters.name) {
            const searchTerm = filters.name.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.EMP_NAME.toLowerCase().includes(searchTerm) ||
                emp.EMP_CODE.toLowerCase().includes(searchTerm)
            );
        }

        // เรียงลำดับ
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                const aVal = a[filters.sortBy] || '';
                const bVal = b[filters.sortBy] || '';

                if (filters.sortOrder === 'desc') {
                    return bVal.localeCompare(aVal, 'th');
                }
                return aVal.localeCompare(bVal, 'th');
            });
        }

        return filtered;
    }

    // ตรวจสอบสิทธิ์การเข้าถึง (สำหรับระบบ authentication)
    static checkPermission(userRole, action) {
        const permissions = {
            'แอดมิน': ['create', 'read', 'update', 'delete'],
            'หมอ': ['read'],
            'พยาบาล': ['read'],
            'เจ้าหน้าที่': ['read', 'update']
        };

        return permissions[userRole]?.includes(action) || false;
    }
}

export default EmployeeService;