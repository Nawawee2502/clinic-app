// services/typeIncomeService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TypeIncomeService {
    // ดึงข้อมูลประเภทรายรับทั้งหมด
    static async getAllTypeIncome() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome`);
            const response = await fetch(`${API_BASE_URL}/typeincome`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income types:', error);
            throw error;
        }
    }

    // ดึงข้อมูลประเภทรายรับตามรหัส
    static async getTypeIncomeByCode(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/${code}`);
            const response = await fetch(`${API_BASE_URL}/typeincome/${code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income type:', error);
            throw error;
        }
    }

    // ค้นหาประเภทรายรับ
    static async searchTypeIncome(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/typeincome/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching income types:', error);
            throw error;
        }
    }

    // ตรวจสอบว่ารหัสมีอยู่แล้วหรือไม่
    static async checkCodeExists(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/check/${code}`);
            const response = await fetch(`${API_BASE_URL}/typeincome/check/${code}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking income type code:', error);
            throw error;
        }
    }

    // สร้างประเภทรายรับใหม่
    static async createTypeIncome(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome`);
            const response = await fetch(`${API_BASE_URL}/typeincome`, {
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
            console.error('Error creating income type:', error);
            throw error;
        }
    }

    // แก้ไขประเภทรายรับ
    static async updateTypeIncome(code, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/${code}`);
            const response = await fetch(`${API_BASE_URL}/typeincome/${code}`, {
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
            console.error('Error updating income type:', error);
            throw error;
        }
    }

    // ลบประเภทรายรับ
    static async deleteTypeIncome(code) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/${code}`);
            const response = await fetch(`${API_BASE_URL}/typeincome/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting income type:', error);
            throw error;
        }
    }

    // ดึงสถิติประเภทรายรับ (ถ้ามี endpoint)
    static async getTypeIncomeStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/typeincome/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/typeincome/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income type stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateTypeIncomeData(data, isEditing = false) {
        const errors = [];

        // ตรวจสอบรหัส - เฉพาะตอน EDIT เท่านั้น
        if (isEditing) {
            if (!data.TYPE_INCOME_CODE?.trim()) {
                errors.push('กรุณากรอกรหัสประเภทรายรับ');
            } else if (data.TYPE_INCOME_CODE.length > 3) {
                errors.push('รหัสประเภทรายรับต้องไม่เกิน 3 ตัวอักษร');
            }
        }

        // ตรวจสอบชื่อ - ทั้ง CREATE และ EDIT
        if (!data.TYPE_INCOME_NAME?.trim()) {
            errors.push('กรุณากรอกชื่อประเภทรายรับ');
        } else if (data.TYPE_INCOME_NAME.length > 100) {
            errors.push('ชื่อประเภทรายรับต้องไม่เกิน 100 ตัวอักษร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatTypeIncomeData(data) {
        return {
            TYPE_INCOME_CODE: data.TYPE_INCOME_CODE?.trim().toUpperCase(),
            TYPE_INCOME_NAME: data.TYPE_INCOME_NAME?.trim()
        };
    }

    // สร้างรายการ dropdown สำหรับเลือกประเภทรายรับ
    static formatForDropdown(typeIncomeList) {
        return typeIncomeList.map(item => ({
            value: item.TYPE_INCOME_CODE,
            label: `${item.TYPE_INCOME_CODE} - ${item.TYPE_INCOME_NAME}`,
            data: item
        }));
    }

    // แปลงเป็น options สำหรับ select/dropdown
    static toOptions(typeIncomeList) {
        return typeIncomeList.map(item => ({
            value: item.TYPE_INCOME_CODE,
            label: item.TYPE_INCOME_NAME,
            code: item.TYPE_INCOME_CODE,
            name: item.TYPE_INCOME_NAME
        }));
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(typeIncomeList) {
        const headers = ['รหัสประเภทรายรับ', 'ชื่อประเภทรายรับ'];

        const rows = typeIncomeList.map(item => [
            item.TYPE_INCOME_CODE,
            item.TYPE_INCOME_NAME
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field || ''}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(typeIncomeList, filename = 'income-types') {
        const csvContent = this.exportToCSV(typeIncomeList);
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
    static filterTypeIncome(typeIncomeList, filterOptions = {}) {
        let filtered = [...typeIncomeList];

        // กรองตามคำค้นหา
        if (filterOptions.searchTerm) {
            const search = filterOptions.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.TYPE_INCOME_CODE.toLowerCase().includes(search) ||
                item.TYPE_INCOME_NAME.toLowerCase().includes(search)
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

    // นับจำนวนการใช้งานประเภทรายรับ (ถ้ามีการเชื่อมโยงกับตารางอื่น)
    static async getUsageCount(code) {
        try {
            // TODO: Implement endpoint for counting usage
            console.log(`Checking usage count for income type: ${code}`);
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
    static formatForTable(typeIncomeList) {
        return typeIncomeList.map((item, index) => ({
            no: index + 1,
            code: item.TYPE_INCOME_CODE,
            name: item.TYPE_INCOME_NAME,
            ...item
        }));
    }

    // รวมข้อมูลประเภทรายรับและรายจ่าย (ถ้าต้องการใช้ร่วมกัน)
    static async getAllFinanceTypes() {
        try {
            const [incomeResponse, payResponse] = await Promise.all([
                this.getAllTypeIncome(),
                fetch(`${API_BASE_URL}/typepay`).then(res => res.json())
            ]);

            return {
                success: true,
                data: {
                    income: incomeResponse.data || [],
                    payment: payResponse.data || []
                }
            };
        } catch (error) {
            console.error('Error fetching all finance types:', error);
            throw error;
        }
    }
}

export default TypeIncomeService;