// services/balMonthDrugService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BalMonthDrugService {
    // ✅ แก้ไข BASE URL
    static get BASE_URL() {
        return `${API_BASE_URL}/bal_month_drug`;
    }

    // ดึงข้อมูลยอดยกมาทั้งหมด
    static async getAllBalances(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.month) params.append('month', filters.month);
            if (filters.drugCode) params.append('drugCode', filters.drugCode);

            const url = `${this.BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching balances:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดยกมาตามปีและเดือน
    static async getBalanceByPeriod(year, month) {
        try {
            const url = `${this.BASE_URL}/period/${year}/${month}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching balance by period:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดยกมาตามรหัสยา
    static async getBalanceByDrug(drugCode) {
        try {
            const url = `${this.BASE_URL}/drug/${drugCode}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching balance by drug:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดยกมาเฉพาะ
    static async getBalance(year, month, drugCode) {
        try {
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }

    // ค้นหายอดยกมา
    static async searchBalance(searchTerm) {
        try {
            const url = `${this.BASE_URL}/search/${encodeURIComponent(searchTerm)}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching balance:', error);
            throw error;
        }
    }

    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    static async checkExists(year, month, drugCode) {
        try {
            const url = `${this.BASE_URL}/check/${year}/${month}/${drugCode}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking balance:', error);
            throw error;
        }
    }

    // ✅ สร้างยอดยกมาใหม่
    static async createBalance(data) {
        try {
            const url = this.BASE_URL;
            console.log('🔗 Calling API:', url);
            console.log('📤 POST Data:', data);

            const response = await fetch(url, {
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
            console.error('Error creating balance:', error);
            throw error;
        }
    }

    // ✅ แก้ไขยอดยกมา
    static async updateBalance(year, month, drugCode, data) {
        try {
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}`;
            console.log('🔗 Calling API:', url);
            console.log('📤 PUT Data:', data);

            const response = await fetch(url, {
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
            console.error('Error updating balance:', error);
            throw error;
        }
    }

    // ✅ ลบยอดยกมา
    static async deleteBalance(year, month, drugCode, lotNo) {
        try {
            const params = new URLSearchParams();
            const isLotNoNull = lotNo === null || lotNo === undefined || lotNo === '';

            params.append('isLotNoNull', isLotNoNull ? 'true' : 'false');

            if (!isLotNoNull) {
                params.append('lotNo', lotNo);
            }

            const queryString = params.toString();
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}${queryString ? `?${queryString}` : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting balance:', error);
            throw error;
        }
    }

    // ลบยอดยกมาทั้งหมดในช่วงเวลา
    static async deleteBalanceByPeriod(year, month) {
        try {
            const url = `${this.BASE_URL}/period/${year}/${month}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting balances:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getStats() {
        try {
            const url = `${this.BASE_URL}/stats/summary`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateBalanceData(data, isEditing = false) {
        const errors = [];

        if (!data.MYEAR) {
            errors.push('กรุณาระบุปี');
        } else if (data.MYEAR.toString().length !== 4 || isNaN(data.MYEAR)) {
            errors.push('ปีต้องเป็นตัวเลข 4 หลัก');
        }

        if (!data.MONTHH) {
            errors.push('กรุณาระบุเดือน');
        } else if (data.MONTHH < 1 || data.MONTHH > 12) {
            errors.push('เดือนต้องอยู่ระหว่าง 1-12');
        }

        if (!data.DRUG_CODE?.trim()) {
            errors.push('กรุณาระบุรหัสยา');
        }

        if (data.QTY === undefined || data.QTY === null) {
            errors.push('กรุณาระบุจำนวน');
        } else if (isNaN(data.QTY) || parseFloat(data.QTY) < 0) {
            errors.push('จำนวนต้องเป็นตัวเลขที่ไม่ติดลบ');
        }

        if (data.UNIT_PRICE === undefined || data.UNIT_PRICE === null) {
            errors.push('กรุณาระบุราคาต่อหน่วย');
        } else if (isNaN(data.UNIT_PRICE) || parseFloat(data.UNIT_PRICE) < 0) {
            errors.push('ราคาต่อหน่วยต้องเป็นตัวเลขที่ไม่ติดลบ');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatBalanceData(data) {
        return {
            MYEAR: parseInt(data.MYEAR),
            MONTHH: parseInt(data.MONTHH),
            DRUG_CODE: data.DRUG_CODE?.trim(),
            UNIT_CODE1: data.UNIT_CODE1?.trim() || null,
            QTY: parseFloat(data.QTY) || 0,
            UNIT_PRICE: parseFloat(data.UNIT_PRICE) || 0,
            AMT: parseFloat(data.AMT) || 0,
            LOT_NO: data.LOT_NO?.trim() || null,
            EXPIRE_DATE: data.EXPIRE_DATE || null
        };
    }

    // คำนวณจำนวนเงิน
    static calculateAmount(qty, unitPrice) {
        const q = parseFloat(qty) || 0;
        const p = parseFloat(unitPrice) || 0;
        return Math.round(q * p * 100) / 100;
    }

    // จัดรูปแบบตัวเลข
    static formatNumber(number, decimals = 2) {
        if (number === null || number === undefined || isNaN(number)) return '0';
        return parseFloat(number).toLocaleString('th-TH', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // จัดรูปแบบเงิน
    static formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
        return parseFloat(amount).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // จัดรูปแบบวันที่
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear(); // ใช้ ค.ศ. ตามที่ user ขอ
        return `${day}/${month}/${year}`;
    }

    // จัดรูปแบบช่วงเวลา
    static formatPeriod(year, month) {
        const m = String(month).padStart(2, '0');
        return `${year}/${m}`;
    }

    // แปลงชื่อเดือนเป็นภาษาไทย
    static getThaiMonthName(month) {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return months[parseInt(month) - 1] || '';
    }

    // แปลงชื่อเดือนเป็นภาษาไทยแบบย่อ
    static getThaiMonthShortName(month) {
        const months = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        return months[parseInt(month) - 1] || '';
    }

    // สร้าง options สำหรับ dropdown เดือน
    static getMonthOptions() {
        return [
            { value: 1, label: 'มกราคม' },
            { value: 2, label: 'กุมภาพันธ์' },
            { value: 3, label: 'มีนาคม' },
            { value: 4, label: 'เมษายน' },
            { value: 5, label: 'พฤษภาคม' },
            { value: 6, label: 'มิถุนายน' },
            { value: 7, label: 'กรกฎาคม' },
            { value: 8, label: 'สิงหาคม' },
            { value: 9, label: 'กันยายน' },
            { value: 10, label: 'ตุลาคม' },
            { value: 11, label: 'พฤศจิกายน' },
            { value: 12, label: 'ธันวาคม' }
        ];
    }

    // สร้าง options สำหรับ dropdown ปี (พ.ศ.)
    static getYearOptions(yearsBack = 5, yearsForward = 1) {
        const currentYear = new Date().getFullYear();
        const options = [];

        for (let i = -yearsBack; i <= yearsForward; i++) {
            const year = currentYear + i;
            options.push({
                value: year.toString(),
                label: year.toString()
            });
        }

        return options.sort((a, b) => b.value - a.value);
    }

    // คำนวณสรุปยอดรวม
    static calculateSummary(balanceList) {
        const totalQty = balanceList.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0);
        const totalAmount = balanceList.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0);

        return {
            totalItems: balanceList.length,
            totalQty: totalQty,
            totalAmount: totalAmount
        };
    }

    // สร้างข้อมูลว่างสำหรับ form
    static createEmptyBalance() {
        return {
            MYEAR: new Date().getFullYear().toString(),
            MONTHH: new Date().getMonth() + 1,
            DRUG_CODE: '',
            UNIT_CODE1: '',
            QTY: 0,
            UNIT_PRICE: 0,
            AMT: 0
        };
    }
}

export default BalMonthDrugService;