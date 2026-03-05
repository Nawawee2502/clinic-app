// services/stockCardService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class StockCardService {
    // ✅ BASE URL
    static get BASE_URL() {
        return `${API_BASE_URL}/stock_card`;
    }

    // ดึงข้อมูล STOCK_CARD ทั้งหมด
    static async getAllStockCards(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.month) params.append('month', filters.month);
            if (filters.drugCode) params.append('drugCode', filters.drugCode);
            if (filters.refno) params.append('refno', filters.refno);
            if (filters.lotNo) params.append('lotNo', filters.lotNo);

            const url = `${this.BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stock cards:', error);
            throw error;
        }
    }

    // ดึงข้อมูล STOCK_CARD ตามช่วงเวลา
    static async getStockCardsByPeriod(year, month) {
        try {
            const url = `${this.BASE_URL}/period/${year}/${month}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stock cards by period:', error);
            throw error;
        }
    }

    // ดึงข้อมูล STOCK_CARD ตามรหัสยา
    static async getStockCardsByDrug(drugCode) {
        try {
            const url = `${this.BASE_URL}/drug/${drugCode}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stock cards by drug:', error);
            throw error;
        }
    }

    // ดึงข้อมูล STOCK_CARD ตาม REFNO
    static async getStockCardsByRefno(refno) {
        try {
            const url = `${this.BASE_URL}/refno/${refno}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stock cards by refno:', error);
            throw error;
        }
    }

    // ดึงข้อมูล STOCK_CARD เฉพาะ
    static async getStockCard(year, month, drugCode, refno) {
        try {
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}/${refno}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stock card:', error);
            throw error;
        }
    }

    // ค้นหา STOCK_CARD
    static async searchStockCards(searchTerm) {
        try {
            const url = `${this.BASE_URL}/search/${encodeURIComponent(searchTerm)}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching stock cards:', error);
            throw error;
        }
    }

    // ✅ สร้าง STOCK_CARD ใหม่
    static async createStockCard(data) {
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
            console.error('Error creating stock card:', error);
            throw error;
        }
    }

    // ✅ แก้ไข STOCK_CARD
    static async updateStockCard(year, month, drugCode, refno, data) {
        try {
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}/${refno}`;
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
            console.error('Error updating stock card:', error);
            throw error;
        }
    }

    // ✅ ลบ STOCK_CARD
    static async deleteStockCard(year, month, drugCode, refno) {
        try {
            const url = `${this.BASE_URL}/${year}/${month}/${drugCode}/${refno}`;
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
            console.error('Error deleting stock card:', error);
            throw error;
        }
    }

    // ลบ STOCK_CARD ตาม REFNO
    static async deleteStockCardsByRefno(refno) {
        try {
            const url = `${this.BASE_URL}/refno/${refno}`;
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
            console.error('Error deleting stock cards by refno:', error);
            throw error;
        }
    }

    // ลบ STOCK_CARD ทั้งหมดในช่วงเวลา
    static async deleteStockCardsByPeriod(year, month) {
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
            console.error('Error deleting stock cards by period:', error);
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
    static validateStockCardData(data) {
        const errors = [];

        if (!data.REFNO?.trim()) {
            errors.push('กรุณาระบุเลขที่เอกสาร');
        }

        if (!data.RDATE?.trim()) {
            errors.push('กรุณาระบุวันที่');
        }

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

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatStockCardData(data) {
        return {
            REFNO: data.REFNO?.trim(),
            RDATE: data.RDATE?.trim(),
            TRDATE: data.TRDATE?.trim() || data.RDATE?.trim(),
            MYEAR: parseInt(data.MYEAR),
            MONTHH: parseInt(data.MONTHH),
            DRUG_CODE: data.DRUG_CODE?.trim(),
            UNIT_CODE1: data.UNIT_CODE1?.trim() || null,
            BEG1: parseFloat(data.BEG1) || 0,
            IN1: parseFloat(data.IN1) || 0,
            OUT1: parseFloat(data.OUT1) || 0,
            UPD1: parseFloat(data.UPD1) || 0,
            UNIT_COST: parseFloat(data.UNIT_COST) || 0,
            BEG1_AMT: parseFloat(data.BEG1_AMT) || 0,
            IN1_AMT: parseFloat(data.IN1_AMT) || 0,
            OUT1_AMT: parseFloat(data.OUT1_AMT) || 0,
            UPD1_AMT: parseFloat(data.UPD1_AMT) || 0,
            LOTNO: data.LOTNO?.trim() || '-',
            EXPIRE_DATE: data.EXPIRE_DATE?.trim() || '-'
        };
    }

    // จัดรูปแบบเงิน
    static formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
        return parseFloat(amount).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // จัดรูปแบบวันที่ (CE)
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear(); // CE format
        return `${day}/${month}/${year}`;
    }

    // จัดรูปแบบวันที่สำหรับ input
    static formatDateForInput(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 10);
        } catch (error) {
            return '';
        }
    }

    // คำนวณสรุปยอดรวม
    static calculateSummary(stockCardList) {
        const totalItems = stockCardList.length;
        const totalBEG1 = stockCardList.reduce((sum, item) => sum + (parseFloat(item.BEG1) || 0), 0);
        const totalIN1 = stockCardList.reduce((sum, item) => sum + (parseFloat(item.IN1) || 0), 0);
        const totalOUT1 = stockCardList.reduce((sum, item) => sum + (parseFloat(item.OUT1) || 0), 0);
        const totalUPD1 = stockCardList.reduce((sum, item) => sum + (parseFloat(item.UPD1) || 0), 0);
        const totalBEG1_AMT = stockCardList.reduce((sum, item) => sum + (parseFloat(item.BEG1_AMT) || 0), 0);
        const totalIN1_AMT = stockCardList.reduce((sum, item) => sum + (parseFloat(item.IN1_AMT) || 0), 0);
        const totalOUT1_AMT = stockCardList.reduce((sum, item) => sum + (parseFloat(item.OUT1_AMT) || 0), 0);
        const totalUPD1_AMT = stockCardList.reduce((sum, item) => sum + (parseFloat(item.UPD1_AMT) || 0), 0);

        return {
            totalItems,
            totalBEG1,
            totalIN1,
            totalOUT1,
            totalUPD1,
            totalBEG1_AMT,
            totalIN1_AMT,
            totalOUT1_AMT,
            totalUPD1_AMT
        };
    }

    // ✅ ดึงรายงานสต็อกการ์ดแบบคำนวณย้อนกลับ (Reverse Calculation)
    static async getReverseStockReport(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.month) params.append('month', filters.month);
            if (filters.drugCode) params.append('drugCode', filters.drugCode);
            if (filters.lotNo) params.append('lotNo', filters.lotNo);

            const url = `${this.BASE_URL}/reverse-report?${params.toString()}`;
            console.log('🔗 Calling API (Reverse):', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching reverse stock report:', error);
            throw error;
        }
    }
}

export default StockCardService;

