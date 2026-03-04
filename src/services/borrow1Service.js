// services/borrow1Service.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class Borrow1Service {
    // ดึงข้อมูลใบเบิกสินค้าทั้งหมด
    static async getAllBorrow1(page = 1, limit = 50) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1?page=${page}&limit=${limit}`);
            const response = await fetch(`${API_BASE_URL}/borrow1?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching borrow1:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตาม REFNO (พร้อม details)
    static async getBorrow1ByRefno(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/borrow1/${refno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching borrow1:', error);
            throw error;
        }
    }

    // ค้นหาใบเบิกสินค้า
    static async searchBorrow1(searchTerm) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/search/${encodeURIComponent(searchTerm)}`);
            const response = await fetch(`${API_BASE_URL}/borrow1/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching borrow1:', error);
            throw error;
        }
    }

    // สร้างเลขที่ใบเบิกสินค้าอัตโนมัติ
    static async generateRefno(year, month) {
        try {
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);

            const url = `${API_BASE_URL}/borrow1/generate/refno?${params.toString()}`;
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

    // สร้างใบเบิกสินค้าใหม่
    static async createBorrow1(data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1`);
            const response = await fetch(`${API_BASE_URL}/borrow1`, {
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
            console.error('Error creating borrow1:', error);
            throw error;
        }
    }

    // แก้ไขใบเบิกสินค้า
    static async updateBorrow1(refno, data) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/borrow1/${refno}`, {
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
            console.error('Error updating borrow1:', error);
            throw error;
        }
    }

    // ลบใบเบิกสินค้า
    static async deleteBorrow1(refno) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/${refno}`);
            const response = await fetch(`${API_BASE_URL}/borrow1/${refno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting borrow1:', error);
            throw error;
        }
    }

    // ดึงสถิติ
    static async getBorrow1Stats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/stats/summary`);
            const response = await fetch(`${API_BASE_URL}/borrow1/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching borrow1 stats:', error);
            throw error;
        }
    }

    // ดึงข้อมูลตามช่วงเวลา
    static async getBorrow1ByPeriod(year, month) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/borrow1/period/${year}/${month}`);
            const response = await fetch(`${API_BASE_URL}/borrow1/period/${year}/${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching borrow1 by period:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูลหัว
    static validateHeaderData(data, requireRefno = true) {
        const errors = [];

        if (requireRefno && !data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่ใบเบิกสินค้า');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่');
        }

        if (!data.EMP_CODE?.trim()) {
            errors.push('กรุณาระบุรหัสพนักงาน');
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

            // อนุญาตให้ UNIT_COST เป็น 0 ได้
            const unitCost = parseFloat(detail.UNIT_COST);
            if (detail.UNIT_COST === null || detail.UNIT_COST === undefined || detail.UNIT_COST === '') {
                errors.push(`รายการที่ ${index + 1}: กรุณาระบุราคาต่อหน่วย`);
            } else if (isNaN(unitCost)) {
                errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องเป็นตัวเลข`);
            } else if (unitCost < 0) {
                errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องไม่ติดลบ`);
            }
        });

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatBorrow1Data(headerData, details) {
        return {
            REFNO: headerData.REFNO?.trim(),
            RDATE: headerData.RDATE,
            TRDATE: headerData.TRDATE || headerData.RDATE,
            MYEAR: headerData.MYEAR || new Date().getFullYear().toString(),
            MONTHH: headerData.MONTHH || (new Date().getMonth() + 1),
            EMP_CODE: headerData.EMP_CODE?.trim(),
            STATUS: headerData.STATUS || 'ทำงานอยู่',
            details: details.map(d => ({
                DRUG_CODE: d.DRUG_CODE?.trim(),
                QTY: parseFloat(d.QTY),
                UNIT_COST: parseFloat(d.UNIT_COST),
                UNIT_CODE1: d.UNIT_CODE1?.trim(),
                AMT: parseFloat(d.AMT),
                LOT_NO: d.LOT_NO?.trim(),
                EXPIRE_DATE: d.EXPIRE_DATE
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
    static formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // จัดรูปแบบวันที่ (CE) สำหรับวันหมดอายุ
    static formatDateCE(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

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
            QTY: '',
            UNIT_COST: '',
            UNIT_CODE1: '',
            AMT: '',
            LOT_NO: '',
            EXPIRE_DATE: ''
        };
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(borrow1List) {
        const headers = [
            'เลขที่',
            'วันที่',
            'รหัสพนักงาน',
            'ยอดรวม',
            'สถานะ'
        ];

        const rows = borrow1List.map(item => [
            item.REFNO,
            this.formatDate(item.RDATE),
            item.EMP_CODE,
            this.formatCurrency(item.TOTAL),
            item.STATUS
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(borrow1List, filename = 'borrow1-records') {
        const csvContent = this.exportToCSV(borrow1List);
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
    static formatForTable(borrow1List) {
        return borrow1List.map((item, index) => ({
            no: index + 1,
            refno: item.REFNO,
            date: this.formatDate(item.RDATE),
            empCode: item.EMP_CODE,
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

    // พิมพ์ใบเบิกสินค้า
    static generatePrintHTML(headerData, details) {
        const total = this.calculateTotal(details);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบเบิกสินค้า ${headerData.REFNO}</title>
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
                <h1>ใบเบิกสินค้า</h1>
                <p><strong>เลขที่:</strong> ${headerData.REFNO}</p>
                <p><strong>วันที่:</strong> ${this.formatDate(headerData.RDATE)}</p>
                <p><strong>รหัสพนักงาน:</strong> ${headerData.EMP_CODE}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 60px;">ลำดับ</th>
                            <th>รหัสยา</th>
                            <th class="text-right" style="width: 100px;">จำนวน</th>
                            <th class="text-right" style="width: 120px;">ราคา/หน่วย</th>
                            <th class="text-right" style="width: 150px;">จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.map((item, index) => `
                            <tr>
                                <td class="text-center">${index + 1}</td>
                                <td>${item.DRUG_CODE}</td>
                                <td class="text-right">${item.QTY} ${item.UNIT_CODE1 || ''}</td>
                                <td class="text-right">${this.formatCurrency(item.UNIT_COST)}</td>
                                <td class="text-right">${this.formatCurrency(item.AMT)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="4" class="text-right">รวมทั้งสิ้น</td>
                            <td class="text-right">${this.formatCurrency(total)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="margin-top: 40px;">
                    <p>ผู้เบิก: _____________________</p>
                    <p>ผู้อนุมัติ: _____________________</p>
                </div>
            </body>
            </html>
        `;
    }

    // พิมพ์ใบเบิกสินค้า
    static printBorrow1(headerData, details) {
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

export default Borrow1Service;