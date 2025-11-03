// services/balDrugService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class BalDrugService {
    static get BASE_URL() {
        return `${API_BASE_URL}/bal_drug`;
    }

    // ดึงข้อมูลยอดคงเหลือทั้งหมด
    static async getAllBalances(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const url = `${this.BASE_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drug balances:', error);
            throw error;
        }
    }

    // ดึงข้อมูลยอดคงเหลือตามรหัสยา
    static async getBalanceByDrugCode(drugCode) {
        try {
            const url = `${this.BASE_URL}/${drugCode}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drug balance:', error);
            throw error;
        }
    }

    // ค้นหายอดคงเหลือ
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

    // สร้างยอดคงเหลือใหม่
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

    // แก้ไขยอดคงเหลือ
    static async updateBalance(drugCode, data) {
        try {
            const url = `${this.BASE_URL}/${drugCode}`;
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

    // ลบยอดคงเหลือ
    static async deleteBalance(drugCode) {
        try {
            const url = `${this.BASE_URL}/${drugCode}`;
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
    static validateBalanceData(data) {
        const errors = [];

        if (!data.DRUG_CODE?.trim()) {
            errors.push('กรุณาระบุรหัสยา');
        }

        if (data.QTY === undefined || data.QTY === null) {
            errors.push('กรุณาระบุจำนวน');
        } else if (isNaN(data.QTY) || parseFloat(data.QTY) < 0) {
            errors.push('จำนวนต้องเป็นตัวเลขที่ไม่ติดลบ');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatBalanceData(data) {
        return {
            DRUG_CODE: data.DRUG_CODE?.trim(),
            QTY: parseFloat(data.QTY) || 0,
            UNIT_CODE1: data.UNIT_CODE1?.trim() || null
        };
    }

    // จัดรูปแบบตัวเลข
    static formatNumber(number, decimals = 2) {
        if (number === null || number === undefined || isNaN(number)) return '0';
        return parseFloat(number).toLocaleString('th-TH', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // จัดรูปแบบวันที่
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear() + 543;
        return `${day}/${month}/${year}`;
    }

    // คำนวณสรุปยอดรวม
    static calculateSummary(balanceList) {
        const totalQty = balanceList.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0);

        return {
            totalItems: balanceList.length,
            totalQty: totalQty
        };
    }

    // สร้างข้อมูลว่างสำหรับ form
    static createEmptyBalance() {
        return {
            DRUG_CODE: '',
            QTY: 0,
            UNIT_CODE1: ''
        };
    }

    // ดึงรายการยาที่มียอดคงเหลือน้อย
    static async getLowStockItems(threshold = 10) {
        try {
            const response = await this.getAllBalances({ limit: 1000 });

            if (response.success && response.data) {
                const lowStock = response.data.filter(item =>
                    parseFloat(item.QTY) <= threshold
                );

                return {
                    success: true,
                    data: lowStock
                };
            }

            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching low stock items:', error);
            throw error;
        }
    }

    // ดึงรายการยาที่หมดสต๊อก
    static async getOutOfStockItems() {
        try {
            const response = await this.getAllBalances({ limit: 1000 });

            if (response.success && response.data) {
                const outOfStock = response.data.filter(item =>
                    parseFloat(item.QTY) <= 0
                );

                return {
                    success: true,
                    data: outOfStock
                };
            }

            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching out of stock items:', error);
            throw error;
        }
    }

    // Export ข้อมูลเป็น CSV
    static exportToCSV(balanceList) {
        const headers = ['รหัสยา', 'จำนวน', 'หน่วยนับ'];
        const rows = balanceList.map(item => [
            item.DRUG_CODE || '',
            item.QTY || 0,
            item.UNIT_CODE1 || ''
        ]);

        let csv = headers.join(',') + '\n';
        csv += rows.map(row => row.join(',')).join('\n');
        return csv;
    }

    // ดาวน์โหลดเป็นไฟล์ CSV
    static downloadCSV(balanceList, filename = 'bal_drug.csv') {
        const csv = this.exportToCSV(balanceList);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    static async getLotsByDrugCode(drugCode) {
        try {
            const url = `${this.BASE_URL}/${drugCode}/lots`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching drug lots:', error);
            throw error;
        }
    }
}

export default BalDrugService;