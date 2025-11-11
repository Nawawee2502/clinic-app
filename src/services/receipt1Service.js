// services/receipt1Service.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class Receipt1Service {
    // ดึงข้อมูลใบรับสินค้าทั้งหมด
    static async getAllReceipt1(page = 1, limit = 50) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1?page=${page}&limit=${limit}`);
            const response = await fetch(`${API_BASE_URL}/receipt1?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching receipt1:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตาม REFNO (พร้อม details)
    static async getReceipt1ByRefno(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/receipt1/${refno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching receipt1:', error);
            throw error;
        }
    }

    // ค้นหาใบรับสินค้า (รองรับค้นหาตามวันที่)
    static async searchReceipt1(searchTerm, dateFrom = null, dateTo = null) {
        try {
            let url = `${API_BASE_URL}/receipt1/search/${encodeURIComponent(searchTerm)}`;
            const params = new URLSearchParams();

            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching receipt1:', error);
            throw error;
        }
    }

    // สร้างเลขที่ใบรับสินค้าอัตโนมัติ
    static async generateRefno(year, month) {
        try {
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);

            const url = `${API_BASE_URL}/receipt1/generate/refno?${params.toString()}`;
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

    // สร้างใบรับสินค้าใหม่
    static async createReceipt1(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1`);
            const response = await fetch(`${API_BASE_URL}/receipt1`, {
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
            console.error('Error creating receipt1:', error);
            throw error;
        }
    }

    // แก้ไขใบรับสินค้า
    static async updateReceipt1(refno, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/receipt1/${refno}`, {
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
            console.error('Error updating receipt1:', error);
            throw error;
        }
    }

    // ลบใบรับสินค้า
    static async deleteReceipt1(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/receipt1/${refno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting receipt1:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getReceipt1Stats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/receipt1/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching receipt1 stats:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตามช่วงเวลา
    static async getReceipt1ByPeriod(year, month) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/receipt1/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/receipt1/period/${year}/${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching receipt1 by period:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูลหัว
    static validateHeaderData(data, requireRefno = true) {
        const errors = [];

        if (requireRefno && !data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่ใบรับสินค้า');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่');
        }

        if (!data.SUPPLIER_CODE?.trim()) {
            errors.push('กรุณาระบุรหัสผู้จำหน่าย');
        }

        return errors;
    }

    // ตรวจสอบความถูกต้องของรายละเอียด
    static validateDetailData(details) {
        const errors = [];

        if (!details || details.length === 0) {
            errors.push('กรุณาเพิ่มรายละเอียดสินค้าอย่างน้อย 1 รายการ');
            return errors;
        }

        details.forEach((detail, index) => {
            if (!detail.DRUG_CODE?.trim()) {
                errors.push(`รายการที่ ${index + 1}: กรุณาเลือกรหัสยา`);
            }

            if (!detail.QTY || parseFloat(detail.QTY) <= 0) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนที่ถูกต้อง`);
            }

            if (!detail.UNIT_COST || parseFloat(detail.UNIT_COST) <= 0) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุราคาต่อหน่วยที่ถูกต้อง`);
            }
        });

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatReceipt1Data(headerData, details) {
        const parsedVat = parseFloat(headerData.VAT1);
        const vatValue = Number.isFinite(parsedVat) ? parsedVat : 7;

        return {
            REFNO: headerData.REFNO?.trim(),
            RDATE: headerData.RDATE,
            TRDATE: headerData.TRDATE || headerData.RDATE,
            MYEAR: headerData.MYEAR || new Date().getFullYear().toString(),
            MONTHH: headerData.MONTHH || (new Date().getMonth() + 1),
            SUPPLIER_CODE: headerData.SUPPLIER_CODE?.trim(),
            DUEDATE: headerData.DUEDATE,
            STATUS: headerData.STATUS || 'ทำงานอยู่',
            VAT1: vatValue,
            TYPE_VAT: headerData.TYPE_VAT || 'include',
            TYPE_PAY: headerData.TYPE_PAY,
            BANK_NO: headerData.BANK_NO,
            details: details.map(detail => ({
                DRUG_CODE: detail.DRUG_CODE,
                QTY: parseFloat(detail.QTY) || 0,
                UNIT_COST: parseFloat(detail.UNIT_COST) || 0,
                UNIT_CODE1: detail.UNIT_CODE1 || '',
                AMT: parseFloat(detail.AMT) || 0,
                LOT_NO: detail.LOT_NO || '',
                EXPIRE_DATE: detail.EXPIRE_DATE || null
            }))
        };
    }

    // คำนวณยอดรวม (รองรับ TYPE_VAT)
    static calculateTotal(details, vatRate = 7, typeVat = 'include') {
        if (!details || details.length === 0) return { total: 0, vamt: 0, gtotal: 0 };

        const detailTotal = details.reduce((sum, item) => {
            const amount = parseFloat(item.AMT) || 0;
            return sum + amount;
        }, 0);

        let total, vamt, gtotal;

        if (typeVat === 'include') {
            // VAT รวมอยู่ในราคาแล้ว
            gtotal = detailTotal;
            vamt = (detailTotal * vatRate) / (100 + vatRate);
            total = detailTotal - vamt;
        } else {
            // VAT ไม่รวมในราคา
            total = detailTotal;
            vamt = total * (vatRate / 100);
            gtotal = total + vamt;
        }

        return {
            total: parseFloat(total.toFixed(2)),
            vamt: parseFloat(vamt.toFixed(2)),
            gtotal: parseFloat(gtotal.toFixed(2))
        };
    }

    // คำนวณจำนวนเงินแต่ละรายการ
    static calculateLineAmount(qty, unitCost) {
        return parseFloat(qty) * parseFloat(unitCost);
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
    // จัดรูปแบบวันที่ (แสดงเป็น พ.ศ.)
    static formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
        const month = date.toLocaleDateString('th-TH', { month: 'long' });
        const day = date.getDate();

        return `${day} ${month} ${year}`;
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
            DRUG_CODE: '',
            QTY: '',
            UNIT_COST: '',
            UNIT_CODE1: '',
            AMT: '',
            LOT_NO: '',
            EXPIRE_DATE: ''
        };
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(receipt1List) {
        const headers = [
            'เลขที่',
            'วันที่',
            'รหัสผู้จำหน่าย',
            'วันครบกำหนด',
            'ยอดรวม',
            'VAT',
            'ยอดรวมทั้งสิ้น',
            'สถานะ'
        ];

        const rows = receipt1List.map(item => [
            item.REFNO,
            this.formatDate(item.RDATE),
            item.SUPPLIER_CODE,
            this.formatDate(item.DUEDATE),
            this.formatCurrency(item.TOTAL),
            this.formatCurrency(item.VAMT),
            this.formatCurrency(item.GTOTAL),
            item.STATUS
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(receipt1List, filename = 'receipt1-records') {
        const csvContent = this.exportToCSV(receipt1List);
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

    // แปลงข้อมูลสำหรับแสดงผลในตาราง
    static formatForTable(receipt1List) {
        return receipt1List.map((item, index) => ({
            no: index + 1,
            refno: item.REFNO,
            date: this.formatDate(item.RDATE),
            supplierCode: item.SUPPLIER_CODE,
            total: this.formatCurrency(item.TOTAL),
            gtotal: this.formatCurrency(item.GTOTAL),
            status: item.STATUS,
            ...item
        }));
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

    static async checkRefnoExists(refno) {
        try {
            console.log('🔗 Checking REFNO:', `${API_BASE_URL}/receipt1/check/${refno}`);
            const response = await fetch(`${API_BASE_URL}/receipt1/check/${encodeURIComponent(refno)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking REFNO:', error);
            throw error;
        }
    }
}

export default Receipt1Service;