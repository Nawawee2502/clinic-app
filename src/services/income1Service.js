// services/income1Service.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class Income1Service {
    // ดึงข้อมูลใบสำคัญรับทั้งหมด
    static async getAllIncome1(page = 1, limit = 50) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1?page=${page}&limit=${limit}`);
            const response = await fetch(`${API_BASE_URL}/income1?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income1:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตาม REFNO (พร้อม details)
    static async getIncome1ByRefno(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/income1/${refno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income1:', error);
            throw error;
        }
    }

    // ค้นหาใบสำคัญรับ
    static async searchIncome1(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/income1/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching income1:', error);
            throw error;
        }
    }

    // สร้างเลขที่ใบสำคัญรับอัตโนมัติ
    static async generateRefno(year, month) {
        try {
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);

            const url = `${API_BASE_URL}/income1/generate/refno?${params.toString()}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating refno:', error);
            throw error;
        }
    }

    // สร้างใบสำคัญรับใหม่
    static async createIncome1(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1`);
            const response = await fetch(`${API_BASE_URL}/income1`, {
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
            console.error('Error creating income1:', error);
            throw error;
        }
    }

    // แก้ไขใบสำคัญรับ
    static async updateIncome1(refno, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/income1/${refno}`, {
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
            console.error('Error updating income1:', error);
            throw error;
        }
    }

    // ลบใบสำคัญรับ
    static async deleteIncome1(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/income1/${refno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting income1:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getIncome1Stats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/income1/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income1 stats:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตามช่วงเวลา
    static async getIncome1ByPeriod(year, month) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/income1/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/income1/period/${year}/${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching income1 by period:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูลหัว
    static validateHeaderData(data, requireRefno = true) {
        const errors = [];

        // เช็ค REFNO เฉพาะตอน edit เท่านั้น
        if (requireRefno && !data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่ใบสำคัญรับ');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่');
        }

        if (!data.NAME1?.trim()) {
            errors.push('กรุณาระบุผู้จ่ายเงิน');
        }

        if (!data.TYPE_PAY?.trim()) {
            errors.push('กรุณาเลือกประเภทรายรับ');
        }

        return errors;
    }

    // ตรวจสอบความถูกต้องของรายละเอียด
    static validateDetailData(details) {
        const errors = [];

        if (!details || details.length === 0) {
            errors.push('กรุณาเพิ่มรายละเอียดการรับอย่างน้อย 1 รายการ');
            return errors;
        }

        details.forEach((detail, index) => {
            if (!detail.TYPE_INCOME_CODE?.trim()) {
                errors.push(`รายการที่ ${index + 1}: กรุณาเลือกประเภทรายรับ`);
            }

            if (!detail.DESCM1?.trim()) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุรายการ`);
            }

            if (!detail.AMT || parseFloat(detail.AMT) <= 0) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนเงินที่ถูกต้อง`);
            }
        });

        return errors;
    }

    // ตรวจสอบข้อมูลทั้งหมด
    static validateIncome1Data(headerData, details, isEditing = false) {
        const headerErrors = this.validateHeaderData(headerData, isEditing);
        const detailErrors = this.validateDetailData(details);

        return [...headerErrors, ...detailErrors];
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatIncome1Data(headerData, details) {
        return {
            REFNO: headerData.REFNO?.trim(),
            RDATE: headerData.RDATE,
            TRDATE: headerData.TRDATE || headerData.RDATE,
            MYEAR: headerData.MYEAR || new Date().getFullYear().toString(),
            MONTHH: headerData.MONTHH || (new Date().getMonth() + 1),
            NAME1: headerData.NAME1?.trim(),
            STATUS: headerData.STATUS || 'ทำงานอยู่',
            TYPE_PAY: headerData.TYPE_PAY?.trim(),
            BANK_NO: headerData.BANK_NO?.trim() || null,
            details: details.map(d => ({
                TYPE_INCOME_CODE: d.TYPE_INCOME_CODE?.trim(),
                DESCM1: d.DESCM1?.trim(),
                AMT: parseFloat(d.AMT)
            }))
        };
    }

    // คำนวณยอดรวม
    static calculateTotal(details) {
        if (!details || details.length === 0) return 0;

        return details.reduce((sum, item) => {
            const amount = parseFloat(item.AMT) || 0;
            return sum + amount;
        }, 0);
    }

    // จัดรูปแบบตัวเลขเป็นเงิน
    static formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    // จัดรูปแบบวันที่
    static formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // จัดรูปแบบวันที่สำหรับ input
    static formatDateForInput(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // สร้างรายการว่างสำหรับรายละเอียด
    static createEmptyDetail() {
        return {
            TYPE_INCOME_CODE: '',
            DESCM1: '',
            AMT: ''
        };
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(income1List) {
        const headers = [
            'เลขที่',
            'วันที่',
            'รับจาก',
            'ประเภทรายรับ',
            'จำนวนเงิน',
            'สถานะ',
            'เลขที่บัญชี'
        ];

        const rows = income1List.map(item => [
            item.REFNO,
            this.formatDate(item.RDATE),
            item.NAME1,
            item.TYPE_INCOME_NAME || item.TYPE_PAY,
            this.formatCurrency(item.TOTAL),
            item.STATUS,
            item.BANK_NO || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(income1List, filename = 'income1-records') {
        const csvContent = this.exportToCSV(income1List);
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
    static filterIncome1(income1List, filterOptions = {}) {
        let filtered = [...income1List];

        // กรองตามคำค้นหา
        if (filterOptions.searchTerm) {
            const search = filterOptions.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.REFNO?.toLowerCase().includes(search) ||
                item.NAME1?.toLowerCase().includes(search) ||
                item.BANK_NO?.toLowerCase().includes(search)
            );
        }

        // กรองตามสถานะ
        if (filterOptions.status) {
            filtered = filtered.filter(item => item.STATUS === filterOptions.status);
        }

        // กรองตามประเภทรายรับ
        if (filterOptions.typeIncome) {
            filtered = filtered.filter(item => item.TYPE_PAY === filterOptions.typeIncome);
        }

        // กรองตามช่วงวันที่
        if (filterOptions.startDate) {
            filtered = filtered.filter(item =>
                new Date(item.RDATE) >= new Date(filterOptions.startDate)
            );
        }

        if (filterOptions.endDate) {
            filtered = filtered.filter(item =>
                new Date(item.RDATE) <= new Date(filterOptions.endDate)
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
    static formatForTable(income1List) {
        return income1List.map((item, index) => ({
            no: index + 1,
            refno: item.REFNO,
            date: this.formatDate(item.RDATE),
            name: item.NAME1,
            typeIncome: item.TYPE_INCOME_NAME || item.TYPE_PAY,
            total: this.formatCurrency(item.TOTAL),
            status: item.STATUS,
            bankNo: item.BANK_NO,
            ...item
        }));
    }

    // สรุปยอดตามประเภทรายรับ
    static summarizeByTypeIncome(income1List) {
        const summary = {};

        income1List.forEach(item => {
            const key = item.TYPE_PAY || 'ไม่ระบุ';

            if (!summary[key]) {
                summary[key] = {
                    typeIncome: key,
                    typeIncomeName: item.TYPE_INCOME_NAME || key,
                    count: 0,
                    total: 0
                };
            }

            summary[key].count++;
            summary[key].total += parseFloat(item.TOTAL) || 0;
        });

        return Object.values(summary);
    }

    // สรุปยอดตามเดือน
    static summarizeByMonth(income1List) {
        const summary = {};

        income1List.forEach(item => {
            const key = `${item.MYEAR}-${String(item.MONTHH).padStart(2, '0')}`;

            if (!summary[key]) {
                summary[key] = {
                    year: item.MYEAR,
                    month: item.MONTHH,
                    period: key,
                    count: 0,
                    total: 0
                };
            }

            summary[key].count++;
            summary[key].total += parseFloat(item.TOTAL) || 0;
        });

        return Object.values(summary).sort((a, b) => b.period.localeCompare(a.period));
    }

    // คัดลอกข้อมูลเพื่อสร้างรายการใหม่
    static cloneIncome1(headerData, details) {
        return {
            header: {
                REFNO: '', // จะ generate ใหม่
                RDATE: new Date().toISOString().slice(0, 10),
                TRDATE: new Date().toISOString().slice(0, 10),
                MYEAR: new Date().getFullYear().toString(),
                MONTHH: new Date().getMonth() + 1,
                NAME1: headerData.NAME1,
                STATUS: 'ทำงานอยู่',
                TYPE_PAY: headerData.TYPE_PAY,
                BANK_NO: headerData.BANK_NO
            },
            details: details.map(d => ({
                TYPE_INCOME_CODE: d.TYPE_INCOME_CODE,
                DESCM1: d.DESCM1,
                AMT: d.AMT
            }))
        };
    }

    // ตรวจสอบสถานะ
    static getStatusOptions() {
        return [
            { value: 'ทำงานอยู่', label: 'ทำงานอยู่', color: 'success' },
            { value: 'ยกเลิก', label: 'ยกเลิก', color: 'error' }
        ];
    }

    // แปลง status เป็น badge color
    static getStatusColor(status) {
        const statusMap = {
            'ทำงานอยู่': 'success',
            'ยกเลิก': 'error'
        };
        return statusMap[status] || 'default';
    }

    // สร้าง summary card data
    static createSummaryData(income1List) {
        const activeRecords = income1List.filter(item => item.STATUS === 'ทำงานอยู่');
        const canceledRecords = income1List.filter(item => item.STATUS === 'ยกเลิก');

        const totalAmount = activeRecords.reduce((sum, item) =>
            sum + (parseFloat(item.TOTAL) || 0), 0
        );

        const avgAmount = activeRecords.length > 0
            ? totalAmount / activeRecords.length
            : 0;

        return {
            totalRecords: income1List.length,
            activeRecords: activeRecords.length,
            canceledRecords: canceledRecords.length,
            totalAmount: totalAmount,
            averageAmount: avgAmount,
            byTypeIncome: this.summarizeByTypeIncome(activeRecords),
            byMonth: this.summarizeByMonth(activeRecords)
        };
    }

    // ตรวจสอบว่าสามารถแก้ไขได้หรือไม่
    static canEdit(income1Record) {
        return income1Record.STATUS === 'ทำงานอยู่';
    }

    // ตรวจสอบว่าสามารถลบได้หรือไม่
    static canDelete(income1Record) {
        return true;
    }

    // แปลงเดือนเป็นชื่อภาษาไทย
    static getThaiMonthName(month) {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
            'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
            'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        return months[parseInt(month) - 1] || '';
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

    // พิมพ์สรุปรายรับ รายจ่ายประจำวัน (สร้าง HTML สำหรับพิมพ์)
    static generatePrintHTML(headerData, details, expenseData = null) {
        const incomeTotal = this.calculateTotal(details);
        const expenseTotal = expenseData ? expenseData.total : 0;
        const balance = incomeTotal - expenseTotal;
        
        // จัดรูปแบบรายการรายรับ
        const incomeItems = details.map(d => ({
            description: `${d.DESCM1} ${headerData.TYPE_PAY === 'เงินสด' ? 'เงินสด' : `ธนาคาร(${headerData.BANK_NO || ''})`}`,
            amount: parseFloat(d.AMT) || 0
        }));

        // จัดรูปแบบรายการรายจ่าย
        const expenseItems = expenseData && expenseData.items ? expenseData.items : [];

        const reportDate = Income1Service.formatDateForPrint(headerData.RDATE);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>สรุปรายรับ รายจ่ายประจำวัน</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Sarabun', sans-serif; 
                        padding: 20px; 
                        font-size: 14px;
                        line-height: 1.5;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 20px; 
                    }
                    .clinic-name { 
                        font-size: 24px; 
                        font-weight: 700; 
                        margin-bottom: 10px; 
                    }
                    .report-title { 
                        font-size: 20px; 
                        font-weight: 600; 
                        margin-bottom: 20px; 
                    }
                    .date-field { 
                        margin-bottom: 20px; 
                        display: flex; 
                        align-items: center; 
                        gap: 10px; 
                        justify-content: center;
                    }
                    .date-label { 
                        font-weight: 500; 
                    }
                    .date-value { 
                        border-bottom: 1px solid #000; 
                        min-width: 150px; 
                        padding-bottom: 5px; 
                        text-align: center;
                    }
                    .note { 
                        margin-bottom: 20px; 
                        font-size: 13px; 
                        text-align: center;
                        font-style: italic;
                    }
                    .summary-table { 
                        width: 100%; 
                        min-width: 900px;
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        font-size: 13px;
                        table-layout: auto;
                    }
                    .summary-table th, 
                    .summary-table td { 
                        border: 1px solid #000; 
                        padding: 12px 10px; 
                        text-align: left; 
                        word-wrap: break-word;
                        word-break: break-word;
                    }
                    .summary-table th { 
                        background-color: #f0f0f0; 
                        font-weight: 600; 
                        text-align: center;
                        padding: 14px 10px;
                    }
                    .income-header { 
                        background-color: #e8f5e9 !important; 
                    }
                    .expense-header { 
                        background-color: #ffebee !important; 
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .text-left { text-align: left; }
                    .total-row { 
                        font-weight: bold; 
                        background-color: #f9f9f9; 
                    }
                    .balance-row { 
                        font-weight: bold; 
                        background-color: #fff9c4; 
                        font-size: 15px;
                    }
                    .item-col { 
                        width: 50%; 
                        min-width: 300px;
                        max-width: 400px;
                    }
                    .amount-col { 
                        width: 25%; 
                        min-width: 150px;
                    }
                    .section-divider {
                        height: 2px;
                        background-color: #000;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="clinic-name">สัมพันธ์คลินิก</div>
                    <div class="report-title">สรุปรายรับ รายจ่ายประจำวัน</div>
                </div>
                
                <div class="date-field">
                    <span class="date-label">วันที่</span>
                    <div class="date-value">${reportDate}</div>
                </div>
                
                <div class="note">รายการ : เงินสด หรือ ธนาคาร(เลขบัญชี)</div>
                
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th class="item-col">รายรับ</th>
                            <th class="amount-col text-right">จำนวนเงิน</th>
                            <th class="item-col">รายจ่าย</th>
                            <th class="amount-col text-right">จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Income1Service.generateReportRows(incomeItems, expenseItems)}
                        <tr class="total-row">
                            <td class="text-right">รวมรายรับ</td>
                            <td class="text-right">${Income1Service.formatCurrency(incomeTotal)}</td>
                            <td class="text-right">รวมรายจ่าย</td>
                            <td class="text-right">${Income1Service.formatCurrency(expenseTotal)}</td>
                        </tr>
                        <tr class="balance-row">
                            <td colspan="2" class="text-right">คงเหลือ</td>
                            <td colspan="2" class="text-right">${Income1Service.formatCurrency(balance)}</td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }

    // สร้างแถวรายงาน (รายรับและรายจ่าย)
    static generateReportRows(incomeItems, expenseItems) {
        const maxRows = Math.max(incomeItems.length, expenseItems.length);
        const rows = [];

        for (let i = 0; i < maxRows; i++) {
            const incomeItem = incomeItems[i] || { description: '', amount: 0 };
            const expenseItem = expenseItems[i] || { description: '', amount: 0 };
            
            rows.push(`
                <tr>
                    <td>${incomeItem.description}</td>
                    <td class="text-right">${incomeItem.amount > 0 ? Income1Service.formatCurrency(incomeItem.amount) : ''}</td>
                    <td>${expenseItem.description}</td>
                    <td class="text-right">${expenseItem.amount > 0 ? Income1Service.formatCurrency(expenseItem.amount) : ''}</td>
                </tr>
            `);
        }

        return rows.join('');
    }

    // จัดรูปแบบวันที่สำหรับพิมพ์
    static formatDateForPrint(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // พิมพ์สรุปรายรับ รายจ่ายประจำวัน
    static printIncome1(headerData, details, expenseData = null) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintHTML(headerData, details, expenseData));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

export default Income1Service;