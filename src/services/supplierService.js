// services/supplierService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class SupplierService {
    // ดึงข้อมูลผู้จัดจำหน่ายทั้งหมด
    static async getAllSuppliers() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier`);
            const response = await fetch(`${API_BASE_URL}/supplier`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้จัดจำหน่ายตามรหัส
    static async getSupplierByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/${code}`);
            const response = await fetch(`${API_BASE_URL}/supplier/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching supplier:', error);
            throw error;
        }
    }

    // ค้นหาผู้จัดจำหน่าย
    static async searchSupplier(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/supplier/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching suppliers:', error);
            throw error;
        }
    }

    // ตรวจสอบว่ารหัสมีอยู่แล้วหรือไม่
    static async checkCodeExists(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/check/${code}`);
            const response = await fetch(`${API_BASE_URL}/supplier/check/${code}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking supplier code:', error);
            throw error;
        }
    }

    // สร้างผู้จัดจำหน่ายใหม่
    static async createSupplier(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier`);
            const response = await fetch(`${API_BASE_URL}/supplier`, {
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
            console.error('Error creating supplier:', error);
            throw error;
        }
    }

    // แก้ไขผู้จัดจำหน่าย
    static async updateSupplier(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/${code}`);
            const response = await fetch(`${API_BASE_URL}/supplier/${code}`, {
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
            console.error('Error updating supplier:', error);
            throw error;
        }
    }

    // ลบผู้จัดจำหน่าย
    static async deleteSupplier(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/${code}`);
            const response = await fetch(`${API_BASE_URL}/supplier/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    }

    // ดึงสถิติผู้จัดจำหน่าย
    static async getSupplierStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/supplier/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/supplier/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching supplier stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateSupplierData(data, isEditing = false) {
        const errors = [];

        // ตรวจสอบรหัส - เฉพาะตอน EDIT เท่านั้น
        if (isEditing) {
            if (!data.SUPPLIER_CODE?.trim()) {
                errors.push('กรุณากรอกรหัสผู้จัดจำหน่าย');
            } else if (data.SUPPLIER_CODE.length > 20) {
                errors.push('รหัสผู้จัดจำหน่ายต้องไม่เกิน 20 ตัวอักษร');
            }
        }

        // ตรวจสอบชื่อ - ทั้ง CREATE และ EDIT
        if (!data.SUPPLIER_NAME?.trim()) {
            errors.push('กรุณากรอกชื่อผู้จัดจำหน่าย');
        } else if (data.SUPPLIER_NAME.length > 200) {
            errors.push('ชื่อผู้จัดจำหน่ายต้องไม่เกิน 200 ตัวอักษร');
        }

        // ตรวจสอบที่อยู่ 1
        if (data.ADDR1 && data.ADDR1.length > 100) {
            errors.push('ที่อยู่ 1 ต้องไม่เกิน 100 ตัวอักษร');
        }

        // ตรวจสอบที่อยู่ 2
        if (data.ADDR2 && data.ADDR2.length > 100) {
            errors.push('ที่อยู่ 2 ต้องไม่เกิน 100 ตัวอักษร');
        }

        // ตรวจสอบผู้ติดต่อ
        if (data.CONTACT1 && data.CONTACT1.length > 100) {
            errors.push('ผู้ติดต่อต้องไม่เกิน 100 ตัวอักษร');
        }

        // ตรวจสอบเบอร์โทร
        if (data.TEL1 && data.TEL1.length > 50) {
            errors.push('เบอร์โทรต้องไม่เกิน 50 ตัวอักษร');
        }

        // ตรวจสอบจำนวนวันเครดิต
        if (data.DAY1 && (isNaN(data.DAY1) || data.DAY1 < 0)) {
            errors.push('จำนวนวันเครดิตต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatSupplierData(data) {
        return {
            SUPPLIER_CODE: data.SUPPLIER_CODE?.trim().toUpperCase(),
            SUPPLIER_NAME: data.SUPPLIER_NAME?.trim(),
            ADDR1: data.ADDR1?.trim() || null,
            ADDR2: data.ADDR2?.trim() || null,
            CONTACT1: data.CONTACT1?.trim() || null,
            TEL1: data.TEL1?.trim() || null,
            DAY1: data.DAY1 ? parseInt(data.DAY1) : null
        };
    }

    // สร้างรายการ dropdown สำหรับเลือกผู้จัดจำหน่าย
    static formatForDropdown(supplierList) {
        return supplierList.map(item => ({
            value: item.SUPPLIER_CODE,
            label: `${item.SUPPLIER_CODE} - ${item.SUPPLIER_NAME}`,
            data: item
        }));
    }

    // แปลงเป็น options สำหรับ select/dropdown
    static toOptions(supplierList) {
        return supplierList.map(item => ({
            value: item.SUPPLIER_CODE,
            label: item.SUPPLIER_NAME,
            code: item.SUPPLIER_CODE,
            name: item.SUPPLIER_NAME,
            contact: item.CONTACT1,
            tel: item.TEL1
        }));
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(supplierList) {
        const headers = [
            'รหัสผู้จัดจำหน่าย',
            'ชื่อผู้จัดจำหน่าย',
            'ที่อยู่ 1',
            'ที่อยู่ 2',
            'ผู้ติดต่อ',
            'เบอร์โทร',
            'จำนวนวันเครดิต'
        ];

        const rows = supplierList.map(item => [
            item.SUPPLIER_CODE,
            item.SUPPLIER_NAME,
            item.ADDR1 || '',
            item.ADDR2 || '',
            item.CONTACT1 || '',
            item.TEL1 || '',
            item.DAY1 || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(supplierList, filename = 'suppliers') {
        const csvContent = this.exportToCSV(supplierList);
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

    // สร้างรหัสอัตโนมัติ (SUP + เลข 3 หลัก)
    static generateCode(existingCodes = []) {
        // หารหัสที่มีอยู่แล้ว (เฉพาะที่ขึ้นต้นด้วย SUP)
        const usedNumbers = existingCodes
            .filter(code => code.startsWith('SUP'))
            .map(code => parseInt(code.substring(3)))
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

        // แปลงเป็นรหัส SUP + 3 หลัก
        return 'SUP' + nextNumber.toString().padStart(3, '0');
    }

    // กรองข้อมูลตามเงื่อนไข
    static filterSupplier(supplierList, filterOptions = {}) {
        let filtered = [...supplierList];

        // กรองตามคำค้นหา
        if (filterOptions.searchTerm) {
            const search = filterOptions.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.SUPPLIER_CODE?.toLowerCase().includes(search) ||
                item.SUPPLIER_NAME?.toLowerCase().includes(search) ||
                item.CONTACT1?.toLowerCase().includes(search) ||
                item.TEL1?.toLowerCase().includes(search)
            );
        }

        // กรองตามจำนวนวันเครดิต
        if (filterOptions.minCreditDays !== undefined) {
            filtered = filtered.filter(item =>
                (item.DAY1 || 0) >= filterOptions.minCreditDays
            );
        }

        if (filterOptions.maxCreditDays !== undefined) {
            filtered = filtered.filter(item =>
                (item.DAY1 || 0) <= filterOptions.maxCreditDays
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

    // นับจำนวนการใช้งานผู้จัดจำหน่าย (ถ้ามีการเชื่อมโยงกับตารางอื่น)
    static async getUsageCount(code) {
        try {
            // TODO: Implement endpoint for counting usage
            console.log(`Checking usage count for supplier: ${code}`);
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
    static formatForTable(supplierList) {
        return supplierList.map((item, index) => ({
            no: index + 1,
            code: item.SUPPLIER_CODE,
            name: item.SUPPLIER_NAME,
            address: [item.ADDR1, item.ADDR2].filter(Boolean).join(' '),
            contact: item.CONTACT1,
            tel: item.TEL1,
            creditDays: item.DAY1 || 0,
            ...item
        }));
    }

    // จัดรูปแบบที่อยู่เต็ม
    static formatFullAddress(supplier) {
        const addressParts = [
            supplier.ADDR1,
            supplier.ADDR2
        ].filter(Boolean);

        return addressParts.join(' ') || 'ไม่ระบุที่อยู่';
    }

    // จัดรูปแบบข้อมูลติดต่อ
    static formatContactInfo(supplier) {
        const contacts = [];

        if (supplier.CONTACT1) {
            contacts.push(`ผู้ติดต่อ: ${supplier.CONTACT1}`);
        }

        if (supplier.TEL1) {
            contacts.push(`โทร: ${supplier.TEL1}`);
        }

        return contacts.join(' | ') || 'ไม่ระบุข้อมูลติดต่อ';
    }

    // คำนวณวันครบกำหนดชำระ
    static calculateDueDate(startDate, creditDays = 0) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + creditDays);
        return date;
    }

    // จัดรูปแบบวันครบกำหนด
    static formatDueDate(startDate, creditDays = 0) {
        const dueDate = this.calculateDueDate(startDate, creditDays);
        return dueDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ตรวจสอบว่าเกินกำหนดชำระหรือไม่
    static isOverdue(startDate, creditDays = 0) {
        const dueDate = this.calculateDueDate(startDate, creditDays);
        return new Date() > dueDate;
    }
}

export default SupplierService;