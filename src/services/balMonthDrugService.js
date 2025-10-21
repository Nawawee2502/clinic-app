// services/balMonthDrugService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BalMonthDrugService {
    // ดึงข้อมูลยอดยกมาทั้งหมด
    static async getAllBalances(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.month) params.append('month', filters.month);
            if (filters.drugCode) params.append('drugCode', filters.drugCode);

            const url = `${API_BASE_URL}/bal_month_drug${params.toString() ? '?' + params.toString() : ''}`;
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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/period/${year}/${month}`);

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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/drug/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/drug/${drugCode}`);

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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`);

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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/search/${encodeURIComponent(searchTerm)}`);

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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/check/${year}/${month}/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/check/${year}/${month}/${drugCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking balance:', error);
            throw error;
        }
    }

    // สร้างยอดยกมาใหม่
    static async createBalance(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug`, {
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

    // แก้ไขยอดยกมา
    static async updateBalance(year, month, drugCode, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`, {
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

    // ลบยอดยกมา
    static async deleteBalance(year, month, drugCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/${year}/${month}/${drugCode}`, {
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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/period/${year}/${month}`, {
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
            console.log('🔗 Calling API:', `${API_BASE_URL}/bal_month_drug/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/bal_month_drug/stats/summary`);

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

        // ตรวจสอบปี
        if (!data.MYEAR) {
            errors.push('กรุณาระบุปี');
        } else if (data.MYEAR.length !== 4 || isNaN(data.MYEAR)) {
            errors.push('ปีต้องเป็นตัวเลข 4 หลัก');
        }

        // ตรวจสอบเดือน
        if (!data.MONTHH) {
            errors.push('กรุณาระบุเดือน');
        } else if (data.MONTHH < 1 || data.MONTHH > 12) {
            errors.push('เดือนต้องอยู่ระหว่าง 1-12');
        }

        // ตรวจสอบรหัสยา
        if (!data.DRUG_CODE?.trim()) {
            errors.push('กรุณาระบุรหัสยา');
        } else if (data.DRUG_CODE.length > 10) {
            errors.push('รหัสยาต้องไม่เกิน 10 ตัวอักษร');
        }

        // ตรวจสอบจำนวน
        if (data.QTY !== undefined && data.QTY !== null) {
            if (isNaN(data.QTY) || data.QTY < 0) {
                errors.push('จำนวนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
            }
        }

        // ตรวจสอบราคาต่อหน่วย
        if (data.UNIT_PRICE !== undefined && data.UNIT_PRICE !== null) {
            if (isNaN(data.UNIT_PRICE) || data.UNIT_PRICE < 0) {
                errors.push('ราคาต่อหน่วยต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
            }
        }

        // ตรวจสอบจำนวนเงิน
        if (data.AMT !== undefined && data.AMT !== null) {
            if (isNaN(data.AMT) || data.AMT < 0) {
                errors.push('จำนวนเงินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
            }
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatBalanceData(data) {
        return {
            MYEAR: data.MYEAR?.toString().trim(),
            MONTHH: parseInt(data.MONTHH),
            DRUG_CODE: data.DRUG_CODE?.trim().toUpperCase(),
            UNIT_CODE1: data.UNIT_CODE1?.trim() || null,
            QTY: data.QTY ? parseFloat(data.QTY) : 0,
            UNIT_PRICE: data.UNIT_PRICE ? parseFloat(data.UNIT_PRICE) : 0,
            AMT: data.AMT ? parseFloat(data.AMT) : 0
        };
    }

    // คำนวณจำนวนเงิน
    static calculateAmount(qty, unitPrice) {
        return parseFloat(qty || 0) * parseFloat(unitPrice || 0);
    }

    // จัดรูปแบบตัวเลขเป็นเงิน
    static formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    // จัดรูปแบบตัวเลข
    static formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number || 0);
    }

    // จัดรูปแบบชื่อเดือนภาษาไทย
    static getThaiMonthName(month) {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
            'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
            'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return months[parseInt(month) - 1] || '';
    }

    // จัดรูปแบบช่วงเวลา
    static formatPeriod(year, month) {
        return `${this.getThaiMonthName(month)} ${parseInt(year) + 543}`;
    }

    // สร้าง dropdown options สำหรับเดือน
    static getMonthOptions() {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: this.getThaiMonthName(i + 1)
        }));
    }

    // สร้าง dropdown options สำหรับปี
    static getYearOptions(yearsBack = 5) {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: yearsBack + 1 }, (_, i) => ({
            value: currentYear - i,
            label: (currentYear - i).toString()
        }));
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(balanceList) {
        const headers = [
            'ปี',
            'เดือน',
            'รหัสยา',
            'หน่วยนับ',
            'จำนวน',
            'ราคาต่อหน่วย',
            'จำนวนเงิน'
        ];

        const rows = balanceList.map(item => [
            item.MYEAR,
            item.MONTHH,
            item.DRUG_CODE,
            item.UNIT_CODE1 || '',
            this.formatNumber(item.QTY, 2),
            this.formatCurrency(item.UNIT_PRICE),
            this.formatCurrency(item.AMT)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(balanceList, filename = 'balance-records') {
        const csvContent = this.exportToCSV(balanceList);
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

    // กรองข้อมูลตามเงื่อนไข
    static filterBalance(balanceList, filterOptions = {}) {
        let filtered = [...balanceList];

        // กรองตามคำค้นหา
        if (filterOptions.searchTerm) {
            const search = filterOptions.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.DRUG_CODE?.toLowerCase().includes(search) ||
                item.UNIT_CODE1?.toLowerCase().includes(search)
            );
        }

        // กรองตามปี
        if (filterOptions.year) {
            filtered = filtered.filter(item => item.MYEAR === filterOptions.year);
        }

        // กรองตามเดือน
        if (filterOptions.month) {
            filtered = filtered.filter(item =>
                parseInt(item.MONTHH) === parseInt(filterOptions.month)
            );
        }

        // กรองตามรหัสยา
        if (filterOptions.drugCode) {
            filtered = filtered.filter(item =>
                item.DRUG_CODE?.toLowerCase().includes(filterOptions.drugCode.toLowerCase())
            );
        }

        // กรองตามจำนวนขั้นต่ำ
        if (filterOptions.minQty !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.QTY) >= parseFloat(filterOptions.minQty)
            );
        }

        // กรองตามจำนวนสูงสุด
        if (filterOptions.maxQty !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.QTY) <= parseFloat(filterOptions.maxQty)
            );
        }

        // กรองตามมูลค่าขั้นต่ำ
        if (filterOptions.minAmount !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.AMT) >= parseFloat(filterOptions.minAmount)
            );
        }

        // กรองตามมูลค่าสูงสุด
        if (filterOptions.maxAmount !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.AMT) <= parseFloat(filterOptions.maxAmount)
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

    // แปลงข้อมูลสำหรับแสดงผลในตาราง
    static formatForTable(balanceList) {
        return balanceList.map((item, index) => ({
            no: index + 1,
            year: item.MYEAR,
            month: item.MONTHH,
            monthName: this.getThaiMonthName(item.MONTHH),
            period: this.formatPeriod(item.MYEAR, item.MONTHH),
            drugCode: item.DRUG_CODE,
            unitCode: item.UNIT_CODE1,
            qty: this.formatNumber(item.QTY, 2),
            unitPrice: this.formatCurrency(item.UNIT_PRICE),
            amount: this.formatCurrency(item.AMT),
            ...item
        }));
    }

    // คำนวณสรุปยอดรวม
    static calculateSummary(balanceList) {
        const totalQty = balanceList.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0);
        const totalAmount = balanceList.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0);
        const avgUnitPrice = totalQty > 0 ? totalAmount / totalQty : 0;

        return {
            totalRecords: balanceList.length,
            totalQty: totalQty,
            totalAmount: totalAmount,
            avgUnitPrice: avgUnitPrice,
            formattedTotalQty: this.formatNumber(totalQty, 2),
            formattedTotalAmount: this.formatCurrency(totalAmount),
            formattedAvgUnitPrice: this.formatCurrency(avgUnitPrice)
        };
    }

    // สรุปยอดตามปี-เดือน
    static summarizeByPeriod(balanceList) {
        const summary = {};

        balanceList.forEach(item => {
            const key = `${item.MYEAR}-${String(item.MONTHH).padStart(2, '0')}`;

            if (!summary[key]) {
                summary[key] = {
                    year: item.MYEAR,
                    month: item.MONTHH,
                    period: this.formatPeriod(item.MYEAR, item.MONTHH),
                    count: 0,
                    totalQty: 0,
                    totalAmount: 0
                };
            }

            summary[key].count++;
            summary[key].totalQty += parseFloat(item.QTY) || 0;
            summary[key].totalAmount += parseFloat(item.AMT) || 0;
        });

        return Object.values(summary).sort((a, b) => {
            const periodA = `${a.year}-${String(a.month).padStart(2, '0')}`;
            const periodB = `${b.year}-${String(b.month).padStart(2, '0')}`;
            return periodB.localeCompare(periodA);
        });
    }

    // สรุปยอดตามรหัสยา
    static summarizeByDrug(balanceList) {
        const summary = {};

        balanceList.forEach(item => {
            const key = item.DRUG_CODE;

            if (!summary[key]) {
                summary[key] = {
                    drugCode: item.DRUG_CODE,
                    unitCode: item.UNIT_CODE1,
                    count: 0,
                    totalQty: 0,
                    totalAmount: 0,
                    avgUnitPrice: 0
                };
            }

            summary[key].count++;
            summary[key].totalQty += parseFloat(item.QTY) || 0;
            summary[key].totalAmount += parseFloat(item.AMT) || 0;
        });

        // คำนวณราคาเฉลี่ย
        Object.values(summary).forEach(item => {
            item.avgUnitPrice = item.totalQty > 0 ? item.totalAmount / item.totalQty : 0;
        });

        return Object.values(summary).sort((a, b) => b.totalAmount - a.totalAmount);
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

    // คัดลอกข้อมูลสำหรับเดือนถัดไป
    static cloneToNextMonth(balanceData) {
        const currentDate = new Date(balanceData.MYEAR, balanceData.MONTHH - 1);
        currentDate.setMonth(currentDate.getMonth() + 1);

        return {
            MYEAR: currentDate.getFullYear().toString(),
            MONTHH: currentDate.getMonth() + 1,
            DRUG_CODE: balanceData.DRUG_CODE,
            UNIT_CODE1: balanceData.UNIT_CODE1,
            QTY: balanceData.QTY,
            UNIT_PRICE: balanceData.UNIT_PRICE,
            AMT: balanceData.AMT
        };
    }

    // ตรวจสอบว่าเป็นเดือนปัจจุบันหรือไม่
    static isCurrentPeriod(year, month) {
        const now = new Date();
        return parseInt(year) === now.getFullYear() && parseInt(month) === (now.getMonth() + 1);
    }

    // ตรวจสอบว่าเป็นอดีตหรือไม่
    static isPastPeriod(year, month) {
        const now = new Date();
        const checkDate = new Date(year, month - 1);
        const currentDate = new Date(now.getFullYear(), now.getMonth());
        return checkDate < currentDate;
    }

    // แปลงเป็น options สำหรับ autocomplete
    static toAutocompleteOptions(balanceList) {
        return balanceList.map(item => ({
            value: item.DRUG_CODE,
            label: `${item.DRUG_CODE} (${this.formatPeriod(item.MYEAR, item.MONTHH)})`,
            data: item
        }));
    }

    // จัดกลุ่มตามปี
    static groupByYear(balanceList) {
        const grouped = {};

        balanceList.forEach(item => {
            const year = item.MYEAR;
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(item);
        });

        return grouped;
    }

    // จัดกลุ่มตามเดือน
    static groupByMonth(balanceList) {
        const grouped = {};

        balanceList.forEach(item => {
            const key = `${item.MYEAR}-${String(item.MONTHH).padStart(2, '0')}`;
            if (!grouped[key]) {
                grouped[key] = {
                    year: item.MYEAR,
                    month: item.MONTHH,
                    period: this.formatPeriod(item.MYEAR, item.MONTHH),
                    items: []
                };
            }
            grouped[key].items.push(item);
        });

        return Object.values(grouped).sort((a, b) => {
            const periodA = `${a.year}-${String(a.month).padStart(2, '0')}`;
            const periodB = `${b.year}-${String(b.month).padStart(2, '0')}`;
            return periodB.localeCompare(periodA);
        });
    }
}

export default BalMonthDrugService;