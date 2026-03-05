// services/checkStockService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class CheckStockService {
    // ดึงข้อมูลใบตรวจนับสต๊อกทั้งหมด
    static async getAllCheckStock(page = 1, limit = 50) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock?page=${page}&limit=${limit}`);
            const response = await fetch(`${API_BASE_URL}/check_stock?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching check_stock:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตาม REFNO (พร้อม details)
    static async getCheckStockByRefno(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/${refno}`);
            const response = await fetch(`${API_BASE_URL}/check_stock/${refno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching check_stock:', error);
            throw error;
        }
    }

    // ค้นหาใบตรวจนับสต๊อก
    static async searchCheckStock(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/check_stock/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching check_stock:', error);
            throw error;
        }
    }

    // สร้างเลขที่ใบตรวจนับสต๊อกอัตโนมัติ
    static async generateRefno(year, month) {
        try {
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);

            const url = `${API_BASE_URL}/check_stock/generate/refno?${params.toString()}`;
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

    // สร้างใบตรวจนับสต๊อกใหม่
    static async createCheckStock(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock`);
            const response = await fetch(`${API_BASE_URL}/check_stock`, {
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
            console.error('Error creating check_stock:', error);
            throw error;
        }
    }

    // แก้ไขใบตรวจนับสต๊อก
    static async updateCheckStock(refno, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/${refno}`);
            const response = await fetch(`${API_BASE_URL}/check_stock/${refno}`, {
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
            console.error('Error updating check_stock:', error);
            throw error;
        }
    }

    // ลบใบตรวจนับสต๊อก
    static async deleteCheckStock(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/${refno}`);
            const response = await fetch(`${API_BASE_URL}/check_stock/${refno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting check_stock:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getCheckStockStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/check_stock/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching check_stock stats:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตามช่วงเวลา
    static async getCheckStockByPeriod(year, month) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/check_stock/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/check_stock/period/${year}/${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching check_stock by period:', error);
            throw error;
        }
    }

    // ดึงจำนวนในโปรแกรมจาก BAL_DRUG
    // ดึงจำนวนในโปรแกรมจาก BAL_DRUG (ถ้าไม่มีให้ดึงจาก DRUG)
    static async getDrugBalance(drugCode) {
        try {
            // ลองดึงจาก BAL_DRUG ก่อน
            let response = await fetch(`${API_BASE_URL}/bal_drug/${drugCode}`);

            if (response.ok) {
                const result = await response.json();
                return result.success && result.data ? parseFloat(result.data.QTY) || 0 : 0;
            }

            // ถ้าไม่มีใน BAL_DRUG ให้ return 0
            return 0;

        } catch (error) {
            console.error('Error fetching drug balance:', error);
            return 0;
        }
    }
    // ตรวจสอบความถูกต้องของข้อมูลหัว
    static validateHeaderData(data, requireRefno = true) {
        const errors = [];

        if (requireRefno && !data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่ใบตรวจนับสต๊อก');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่');
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

            if (detail.QTY_BAL === undefined || detail.QTY_BAL === '' || parseFloat(detail.QTY_BAL) < 0) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุจำนวนคงเหลือที่ถูกต้อง`);
            }

            if (!detail.UNIT_COST || parseFloat(detail.UNIT_COST) <= 0) {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุราคาต่อหน่วยที่ถูกต้อง`);
            }
        });

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatCheckStockData(headerData, details) {
        return {
            REFNO: headerData.REFNO?.trim(),
            RDATE: headerData.RDATE,
            TRDATE: headerData.TRDATE || headerData.RDATE,
            MYEAR: headerData.MYEAR || new Date().getFullYear().toString(),
            MONTHH: headerData.MONTHH || (new Date().getMonth() + 1),
            STATUS: headerData.STATUS || 'ทำงานอยู่',
            details: details.map(d => {
                const qtyProgram = parseFloat(d.QTY_PROGRAM) || 0;
                const qtyBal = parseFloat(d.QTY_BAL) || 0;
                const qtyAdjust = qtyBal - qtyProgram;

                // ✅ เอา Math.abs() ออก
                const amt = qtyAdjust * parseFloat(d.UNIT_COST);

                return {
                    DRUG_CODE: d.DRUG_CODE?.trim(),
                    QTY_PROGRAM: qtyProgram,
                    QTY_BAL: qtyBal,
                    QTY: qtyAdjust,
                    UNIT_COST: parseFloat(d.UNIT_COST),
                    UNIT_CODE1: d.UNIT_CODE1?.trim(),
                    AMT: amt  // ✅ ส่งค่าที่มีเครื่องหมาย
                };
            })
        };
    }

    // คำนวณจำนวนเงินแต่ละรายการ (ใช้จำนวนปรับปรุง)
    static calculateLineAmount(qtyAdjust, unitCost) {
        // ✅ เอา Math.abs() ออก เพื่อให้แสดงค่าติดลบได้
        return parseFloat(qtyAdjust) * parseFloat(unitCost);
    }

    // คำนวณจำนวนปรับปรุง
    static calculateAdjustment(qtyBal, qtyProgram) {
        return (parseFloat(qtyBal) || 0) - (parseFloat(qtyProgram) || 0);
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

    // จัดรูปแบบวันที่ (CE)
    static formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear(); // CE format

        return `${day}/${month}/${year}`;
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
            QTY_PROGRAM: 0,
            QTY_BAL: '',
            QTY: 0,
            UNIT_COST: '',
            UNIT_CODE1: '',
            AMT: ''
        };
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(checkStockList) {
        const headers = [
            'เลขที่',
            'วันที่',
            'ยอดรวม',
            'สถานะ'
        ];

        const rows = checkStockList.map(item => [
            item.REFNO,
            this.formatDate(item.RDATE),
            this.formatCurrency(item.TOTAL),
            item.STATUS
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(checkStockList, filename = 'check-stock-records') {
        const csvContent = this.exportToCSV(checkStockList);
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
    static formatForTable(checkStockList) {
        return checkStockList.map((item, index) => ({
            no: index + 1,
            refno: item.REFNO,
            date: this.formatDate(item.RDATE),
            total: this.formatCurrency(item.TOTAL),
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

    // พิมพ์ใบตรวจนับสต๊อก
    static generatePrintHTML(headerData, details) {
        const total = this.calculateTotal(details);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบตรวจนับสต๊อก ${headerData.REFNO}</title>
                <style>
                    body { font-family: 'Sarabun', sans-serif; padding: 20px; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f0f0f0; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row { font-weight: bold; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>ใบตรวจนับสต๊อก</h1>
                <p><strong>เลขที่:</strong> ${headerData.REFNO}</p>
                <p><strong>วันที่:</strong> ${this.formatDate(headerData.RDATE)}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 50px;">ลำดับ</th>
                            <th>รหัสยา</th>
                            <th class="text-right" style="width: 90px;">จน.ในโปรแกรม</th>
                            <th class="text-right" style="width: 90px;">จน.คงเหลือ</th>
                            <th class="text-right" style="width: 90px;">จน.ปรับปรุง</th>
                            <th class="text-right" style="width: 100px;">ราคา/หน่วย</th>
                            <th class="text-right" style="width: 120px;">จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.map((item, index) => {
            const qtyAdjust = this.calculateAdjustment(item.QTY_BAL, item.QTY_PROGRAM);
            return `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>${item.DRUG_CODE}</td>
                                    <td class="text-right">${item.QTY_PROGRAM || 0}</td>
                                    <td class="text-right">${item.QTY_BAL || 0}</td>
                                    <td class="text-right">${qtyAdjust}</td>
                                    <td class="text-right">${this.formatCurrency(item.UNIT_COST)}</td>
                                    <td class="text-right">${this.formatCurrency(item.AMT)}</td>
                                </tr>
                            `;
        }).join('')}
                        <tr class="total-row">
                            <td colspan="6" class="text-right">รวมทั้งสิ้น</td>
                            <td class="text-right">${this.formatCurrency(total)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="margin-top: 40px;">
                    <p>ผู้ตรวจนับ: _____________________</p>
                    <p>ผู้อนุมัติ: _____________________</p>
                </div>
            </body>
            </html>
        `;
    }

    // พิมพ์ใบตรวจนับสต๊อก
    static printCheckStock(headerData, details) {
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

export default CheckStockService;