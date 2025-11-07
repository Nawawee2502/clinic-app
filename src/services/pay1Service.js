// services/pay1Service.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class Pay1Service {
    // ดึงข้อมูลใบสำคัญจ่ายทั้งหมด
    static async getAllPay1(page = 1, limit = 50) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1?page=${page}&limit=${limit}`);
            const response = await fetch(`${API_BASE_URL}/pay1?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pay1:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตาม REFNO (พร้อม details)
    static async getPay1ByRefno(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/pay1/${refno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pay1:', error);
            throw error;
        }
    }

    // ค้นหาใบสำคัญจ่าย
    static async searchPay1(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/pay1/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching pay1:', error);
            throw error;
        }
    }

    // สร้างเลขที่ใบสำคัญจ่ายอัตโนมัติ
    static async generateRefno(year, month) {
        try {
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);

            const url = `${API_BASE_URL}/pay1/generate/refno?${params.toString()}`;
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

    // สร้างใบสำคัญจ่ายใหม่
    static async createPay1(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1`);
            const response = await fetch(`${API_BASE_URL}/pay1`, {
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
            console.error('Error creating pay1:', error);
            throw error;
        }
    }

    // แก้ไขใบสำคัญจ่าย
    static async updatePay1(refno, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/pay1/${refno}`, {
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
            console.error('Error updating pay1:', error);
            throw error;
        }
    }

    // ลบใบสำคัญจ่าย
    static async deletePay1(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/pay1/${refno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting pay1:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getPay1Stats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/pay1/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pay1 stats:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตามช่วงเวลา
    static async getPay1ByPeriod(year, month) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/pay1/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/pay1/period/${year}/${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pay1 by period:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูลหัว
    static validateHeaderData(data, requireRefno = true) {
        const errors = [];

        // เช็ค REFNO เฉพาะตอน edit เท่านั้น
        if (requireRefno && !data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่ใบสำคัญจ่าย');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่');
        }

        if (!data.NAME1?.trim()) {
            errors.push('กรุณาระบุผู้รับเงิน');
        }

        if (!data.TYPE_PAY?.trim()) {
            errors.push('กรุณาเลือกวิธีจ่ายเงิน');
        }

        return errors;
    }

    // ตรวจสอบความถูกต้องของรายละเอียด
    static validateDetailData(details) {
        const errors = [];

        if (!details || details.length === 0) {
            errors.push('กรุณาเพิ่มรายละเอียดการจ่ายอย่างน้อย 1 รายการ');
            return errors;
        }

        details.forEach((detail, index) => {
            if (!detail.TYPE_PAY_CODE?.trim()) {
                errors.push(`รายการที่ ${index + 1}: กรุณาเลือกประเภทรายจ่าย`);
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
    static validatePay1Data(headerData, details, isEditing = false) {
        const headerErrors = this.validateHeaderData(headerData, isEditing);
        const detailErrors = this.validateDetailData(details);

        return [...headerErrors, ...detailErrors];
    }


    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatPay1Data(headerData, details) {
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
                TYPE_PAY_CODE: d.TYPE_PAY_CODE?.trim(),
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
            TYPE_PAY_CODE: '',
            DESCM1: '',
            AMT: ''
        };
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(pay1List) {
        const headers = [
            'เลขที่',
            'วันที่',
            'จ่ายให้',
            'วิธีจ่ายเงิน',
            'จำนวนเงิน',
            'สถานะ',
            'เลขที่บัญชี'
        ];

        const rows = pay1List.map(item => [
            item.REFNO,
            this.formatDate(item.RDATE),
            item.NAME1,
            item.type_pay_name || item.TYPE_PAY,
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
    static downloadCSV(pay1List, filename = 'pay1-records') {
        const csvContent = this.exportToCSV(pay1List);
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
    static filterPay1(pay1List, filterOptions = {}) {
        let filtered = [...pay1List];

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

        // กรองตามวิธีจ่ายเงิน
        if (filterOptions.typePay) {
            filtered = filtered.filter(item => item.TYPE_PAY === filterOptions.typePay);
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

        // กรองตามปี-เดือน
        if (filterOptions.year) {
            filtered = filtered.filter(item => item.MYEAR === filterOptions.year);
        }

        if (filterOptions.month) {
            filtered = filtered.filter(item =>
                parseInt(item.MONTHH) === parseInt(filterOptions.month)
            );
        }

        // กรองตามช่วงยอดเงิน
        if (filterOptions.minAmount !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.TOTAL) >= parseFloat(filterOptions.minAmount)
            );
        }

        if (filterOptions.maxAmount !== undefined) {
            filtered = filtered.filter(item =>
                parseFloat(item.TOTAL) <= parseFloat(filterOptions.maxAmount)
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
    static formatForTable(pay1List) {
        return pay1List.map((item, index) => ({
            no: index + 1,
            refno: item.REFNO,
            date: this.formatDate(item.RDATE),
            name: item.NAME1,
            typePay: item.type_pay_name || item.TYPE_PAY,
            total: this.formatCurrency(item.TOTAL),
            status: item.STATUS,
            bankNo: item.BANK_NO,
            ...item
        }));
    }

    // สรุปยอดตามประเภทการจ่าย
    static summarizeByTypePay(pay1List) {
        const summary = {};

        pay1List.forEach(item => {
            const key = item.TYPE_PAY || 'ไม่ระบุ';

            if (!summary[key]) {
                summary[key] = {
                    typePay: key,
                    typePayName: item.type_pay_name || key,
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
    static summarizeByMonth(pay1List) {
        const summary = {};

        pay1List.forEach(item => {
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
    static clonePay1(headerData, details) {
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
                TYPE_PAY_CODE: d.TYPE_PAY_CODE,
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
    static createSummaryData(pay1List) {
        const activeRecords = pay1List.filter(item => item.STATUS === 'ทำงานอยู่');
        const canceledRecords = pay1List.filter(item => item.STATUS === 'ยกเลิก');

        const totalAmount = activeRecords.reduce((sum, item) =>
            sum + (parseFloat(item.TOTAL) || 0), 0
        );

        const avgAmount = activeRecords.length > 0
            ? totalAmount / activeRecords.length
            : 0;

        return {
            totalRecords: pay1List.length,
            activeRecords: activeRecords.length,
            canceledRecords: canceledRecords.length,
            totalAmount: totalAmount,
            averageAmount: avgAmount,
            byTypePay: this.summarizeByTypePay(activeRecords),
            byMonth: this.summarizeByMonth(activeRecords)
        };
    }

    // ตรวจสอบว่าสามารถแก้ไขได้หรือไม่
    static canEdit(pay1Record) {
        // สามารถแก้ไขได้ถ้าสถานะยังเป็น "ทำงานอยู่"
        return pay1Record.STATUS === 'ทำงานอยู่';
    }

    // ตรวจสอบว่าสามารถลบได้หรือไม่
    static canDelete(pay1Record) {
        // สามารถลบได้เสมอ (หรือกำหนดเงื่อนไขตามต้องการ)
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

    // ✅ แปลงตัวเลขเป็นตัวอักษรภาษาไทย
    static numberToThaiText(number) {
        const num = Math.floor(parseFloat(number) || 0);
        if (num === 0) return 'ศูนย์บาทถ้วน';
        
        const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
        const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
        
        let result = '';
        const numStr = num.toString();
        const len = numStr.length;
        
        for (let i = 0; i < len; i++) {
            const digit = parseInt(numStr[i]);
            const position = len - i - 1;
            
            if (digit !== 0) {
                if (position === 1) {
                    // ตำแหน่งสิบ
                    if (digit === 1) {
                        result += 'สิบ';
                    } else if (digit === 2) {
                        result += 'ยี่สิบ';
                    } else {
                        result += thaiNumbers[digit] + 'สิบ';
                    }
                } else if (position === 0) {
                    // ตำแหน่งหน่วย
                    if (digit === 1 && len > 1) {
                        result += 'เอ็ด';
                    } else {
                        result += thaiNumbers[digit];
                    }
                } else {
                    // ตำแหน่งอื่นๆ
                    result += thaiNumbers[digit] + thaiUnits[position];
                }
            }
        }
        
        return result + 'บาทถ้วน';
    }

    // ✅ แปลงวันที่เป็น พ.ศ. สำหรับพิมพ์
    static formatDateBEForPrint(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear() + 543; // ✅ แปลงเป็น พ.ศ.
        return `${day}/${month}/${year}`;
    }

    // ✅ พิมพ์ใบสำคัญจ่ายเงิน (รูปแบบคลินิก)
    static generatePrintHTML(headerData, details) {
        const total = this.calculateTotal(details);
        const totalText = this.numberToThaiText(total);
        const payeeName = headerData.NAME1 || '';
        const paymentMethod = headerData.TYPE_PAY === 'เงินสด' ? 'ชำระโดยเงินสด' : 'ชำระโดยเงินโอน';
        const bankInfo = headerData.TYPE_PAY === 'เงินโอน' && headerData.BANK_NO && headerData.BANK_NO !== '-'
            ? ` (${headerData.BANK_NO})`
            : '';

        const dateBE = this.formatDateBEForPrint(headerData.RDATE);
        const detailRows = details.map((item, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td>${item.DESCM1 || ''}</td>
                                <td class="text-center">${item.QTY || ''}</td>
                                <td class="text-right">${this.formatCurrency(item.AMT)}</td>
                            </tr>`).join('\n');
        const emptyRows = Array.from({ length: Math.max(0, 4 - details.length) }, () => `
                            <tr>
                                <td>&nbsp;</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>`).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบสำคัญจ่ายเงิน - ${headerData.REFNO || ''}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                    body {
                        font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif;
                        font-size: 13.5px;
                        color: #000;
                        line-height: 1.45;
                    }
                    .container {
                        width: 100%;
                        max-width: 188mm;
                        margin: 0 auto;
                    }
                    .document-header {
                        text-align: center;
                        margin-bottom: 8px;
                    }
                    .org-name {
                        font-size: 18px;
                        font-weight: 700;
                    }
                    .org-address,
                    .org-phone {
                        font-size: 12px;
                    }
                    .title {
                        font-size: 20px;
                        font-weight: 700;
                        text-align: right;
                        margin: 18px 0 10px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 6px;
                        font-size: 13px;
                    }
                    .info-left,
                    .info-right {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex: 1;
                    }
                    .info-right {
                        justify-content: flex-end;
                    }
                    .info-label {
                        font-weight: 600;
                        min-width: 70px;
                    }
                    .info-value {
                        border-bottom: 1px solid #000;
                        min-width: 120px;
                        padding: 0 6px 2px;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .items-table th,
                    .items-table td {
                        border: 1px solid #000;
                        padding: 6px 8px;
                    }
                    .items-table th {
                        background: #f0f0f0;
                        font-weight: 600;
                        text-align: center;
                    }
                    .items-table .col-no { width: 45px; }
                    .items-table .col-desc { width: 55%; }
                    .items-table .col-qty { width: 120px; text-align: center; }
                    .items-table .col-amount { width: 120px; text-align: right; }
                    .amount-text {
                        border: 1px solid #000;
                        padding: 8px 10px;
                        font-size: 13px;
                        margin: 12px 0;
                    }
                    .amount-text span { font-weight: 600; }
                    .remark-box {
                        border: 1px solid #000;
                        min-height: 60px;
                        padding: 6px 10px;
                        font-size: 13px;
                    }
                    .remark-box span { font-weight: 600; }
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 28px;
                        font-size: 13px;
                        text-align: center;
                    }
                    .signature-box {
                        flex: 1;
                        padding: 0 12px;
                    }
                    .signature-line {
                        height: 55px;
                        border-bottom: 1px solid #000;
                        margin-bottom: 6px;
                    }
                    .signature-label {
                        font-weight: 600;
                    }
                    .small-text { font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="document-header">
                        <div class="org-name">สัมพันธ์คลินิก</div>
                        <div class="org-address">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                        <div class="org-phone">โทร. 053-826-524</div>
                    </div>
                    <div class="title">ใบสำคัญจ่ายเงิน</div>

                    <div class="info-row">
                        <div class="info-left">
                            <span class="info-label">จ่ายให้</span>
                            <span class="info-value">${payeeName || '&nbsp;'}</span>
                        </div>
                        <div class="info-right">
                            <span class="info-label">เลขที่</span>
                            <span class="info-value">${headerData.REFNO || ''}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-left">
                            <span class="info-label">ที่อยู่</span>
                            <span class="info-value">-</span>
                        </div>
                        <div class="info-right">
                            <span class="info-label">วันที่</span>
                            <span class="info-value">${dateBE}</span>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="col-no">ที่</th>
                                <th class="col-desc">รายการ</th>
                                <th class="col-qty">จำนวน</th>
                                <th class="col-amount">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
${detailRows}
${emptyRows}
                            <tr>
                                <td colspan="3" style="text-align:right; font-weight:700; background:#f9f9f9;">รวม</td>
                                <td style="text-align:right; font-weight:700; background:#f9f9f9;">${this.formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="amount-text">
                        <span>(จำนวนเงินเป็นตัวอักษร)</span> ${totalText}
                    </div>
                    <div class="remark-box">
                        <span>หมายเหตุ</span> ${paymentMethod}${bankInfo}
                    </div>
                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">ผู้จ่ายเงิน</div>
                            <div class="small-text">( ร้านดูดีธรรม )</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">ผู้รับเงิน</div>
                            <div class="small-text">( ${payeeName || '................................'} )</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
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

    // ✅ พิมพ์ใบสำคัญจ่ายเงิน (รูปแบบคลินิก)
    static printPay1(headerData, details) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintHTML(headerData, details));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

export default Pay1Service;