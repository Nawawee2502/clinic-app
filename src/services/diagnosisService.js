// services/diagnosisService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class DiagnosisService {

    // สร้างรหัสการวินิจฉัยใหม่
    static async createDiagnosis(diagnosisData) {
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(diagnosisData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating diagnosis:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการวินิจฉัยทั้งหมด
    static async getAllDiagnosis(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const url = `${API_BASE_URL}/diagnosis${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching diagnosis:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการวินิจฉัยตามรหัส
    static async getDiagnosisByCode(dxCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/${dxCode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching diagnosis:', error);
            throw error;
        }
    }

    // ค้นหาการวินิจฉัย
    static async searchDiagnosis(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching diagnosis:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลการวินิจฉัย
    static async updateDiagnosis(dxCode, diagnosisData) {
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/${dxCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(diagnosisData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating diagnosis:', error);
            throw error;
        }
    }

    // ลบการวินิจฉัย
    static async deleteDiagnosis(dxCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/${dxCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting diagnosis:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateDiagnosisData(data) {
        const errors = [];

        if (!data.DXCODE?.trim()) {
            errors.push('กรุณากรอกรหัสการวินิจฉัย');
        }

        if (data.DXCODE && !/^[A-Z0-9]{2,10}$/.test(data.DXCODE)) {
            errors.push('รหัสการวินิจฉัยต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 2-10 หลัก');
        }

        if (data.DXNAME_ENG && data.DXNAME_ENG.length > 100) {
            errors.push('ชื่อการวินิจฉัยภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร');
        }

        if (data.DXNAME_THAI && data.DXNAME_THAI.length > 100) {
            errors.push('ชื่อการวินิจฉัยภาษาไทยต้องไม่เกิน 100 ตัวอักษร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatDiagnosisData(data) {
        return {
            DXCODE: data.DXCODE?.trim().toUpperCase(),
            DXNAME_ENG: data.DXNAME_ENG?.trim(),
            DXNAME_THAI: data.DXNAME_THAI?.trim()
        };
    }

    // สร้างรหัสการวินิจฉัยอัตโนมัติ
    static generateDXCode(prefix = 'DX') {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${prefix}${year}${month}${random}`;
    }

    // ดึงรายการหมวดหมู่การวินิจฉัย
    static getDiagnosisCategories() {
        return [
            { value: 'อุบัติเหตุ', label: 'อุบัติเหตุและการบาดเจ็บ' },
            { value: 'หัวใจ', label: 'โรคหัวใจและหลอดเลือด' },
            { value: 'ทางเดินหายใจ', label: 'โรคระบบทางเดินหายใจ' },
            { value: 'ระบบย่อยอาหาร', label: 'โรคระบบย่อยอาหาร' },
            { value: 'ระบบประสาท', label: 'โรคระบบประสาท' },
            { value: 'ผิวหนัง', label: 'โรคผิวหนัง' },
            { value: 'กล้ามเนื้อกระดูก', label: 'โรคกล้ามเนื้อและกระดูก' },
            { value: 'ติดเชื้อ', label: 'โรคติดเชื้อ' },
            { value: 'เมแทบอลิก', label: 'โรคเมแทบอลิก' },
            { value: 'จิตเวช', label: 'โรคทางจิตเวช' },
            { value: 'อื่นๆ', label: 'อื่นๆ' }
        ];
    }

    // ดึงรายการการวินิจฉัยที่ใช้บ่อย
    static getCommonDiagnosis() {
        return [
            { code: 'COMMON01', name_thai: 'ไข้หวัดใหญ่', name_eng: 'Influenza' },
            { code: 'COMMON02', name_thai: 'โรคความดันโลหิตสูง', name_eng: 'Hypertension' },
            { code: 'COMMON03', name_thai: 'โรคเบาหวาน', name_eng: 'Diabetes Mellitus' },
            { code: 'COMMON04', name_thai: 'โรคกรดไหลย้อน', name_eng: 'GERD' },
            { code: 'COMMON05', name_thai: 'ปวดหลัง', name_eng: 'Back Pain' },
            { code: 'COMMON06', name_thai: 'ปวดหัว', name_eng: 'Headache' },
            { code: 'COMMON07', name_thai: 'โรคภูมิแพ้', name_eng: 'Allergic Rhinitis' },
            { code: 'COMMON08', name_thai: 'โรคกระเพาะอาหาร', name_eng: 'Gastritis' },
            { code: 'COMMON09', name_thai: 'โรคไขมันในเลือดสูง', name_eng: 'Hyperlipidemia' },
            { code: 'COMMON10', name_thai: 'โรคข้อเข่าเสื่อม', name_eng: 'Osteoarthritis' }
        ];
    }

    // ค้นหาการวินิจฉัยที่คล้ายกัน
    static findSimilarDiagnosis(searchTerm, diagnosisList) {
        if (!searchTerm || !diagnosisList || diagnosisList.length === 0) {
            return [];
        }

        const searchLower = searchTerm.toLowerCase();

        return diagnosisList.filter(diagnosis => {
            const thaiName = diagnosis.DXNAME_THAI?.toLowerCase() || '';
            const engName = diagnosis.DXNAME_ENG?.toLowerCase() || '';
            const code = diagnosis.DXCODE?.toLowerCase() || '';

            return thaiName.includes(searchLower) ||
                engName.includes(searchLower) ||
                code.includes(searchLower);
        }).slice(0, 10); // จำกัดผลลัพธ์ 10 รายการ
    }

    // ตรวจสอบรหัสการวินิจฉัยซ้ำ
    static async checkDuplicateCode(dxCode) {
        try {
            const response = await this.getDiagnosisByCode(dxCode);
            return response.success; // ถ้าเจอข้อมูลแสดงว่าซ้ำ
        } catch (error) {
            return false; // ถ้าไม่เจอข้อมูลแสดงว่าไม่ซ้ำ
        }
    }

    // สร้างรายการ options สำหรับ dropdown
    static formatForDropdown(diagnosisList) {
        return diagnosisList.map(diagnosis => ({
            value: diagnosis.DXCODE,
            label: `${diagnosis.DXCODE} - ${diagnosis.DXNAME_THAI || diagnosis.DXNAME_ENG}`,
            data: diagnosis
        }));
    }

    // กรองและเรียงลำดับข้อมูล
    static filterAndSortDiagnosis(diagnosisList, filters = {}) {
        let filtered = [...diagnosisList];

        // กรองตามคำค้นหา
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(diagnosis =>
                diagnosis.DXCODE?.toLowerCase().includes(searchTerm) ||
                diagnosis.DXNAME_THAI?.toLowerCase().includes(searchTerm) ||
                diagnosis.DXNAME_ENG?.toLowerCase().includes(searchTerm)
            );
        }

        // เรียงลำดับ
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                const aVal = a[filters.sortBy] || '';
                const bVal = b[filters.sortBy] || '';

                if (filters.sortOrder === 'desc') {
                    return bVal.localeCompare(aVal, 'th');
                }
                return aVal.localeCompare(bVal, 'th');
            });
        }

        return filtered;
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(diagnosisList) {
        const headers = ['รหัสการวินิจฉัย', 'ชื่อภาษาไทย', 'ชื่อภาษาอังกฤษ'];

        const rows = diagnosisList.map(diagnosis => [
            diagnosis.DXCODE || '',
            diagnosis.DXNAME_THAI || '',
            diagnosis.DXNAME_ENG || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(diagnosisList, filename = 'diagnosis') {
        const csvContent = this.exportToCSV(diagnosisList);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // นำเข้าข้อมูลจาก CSV
    static parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());

                if (values.length >= 3) {
                    data.push({
                        DXCODE: values[0],
                        DXNAME_THAI: values[1],
                        DXNAME_ENG: values[2]
                    });
                }
            }
        }

        return data;
    }

    // ตรวจสอบข้อมูลที่นำเข้า
    static validateImportData(diagnosisData) {
        const errors = [];
        const validData = [];

        diagnosisData.forEach((diagnosis, index) => {
            const rowErrors = this.validateDiagnosisData(diagnosis);

            if (rowErrors.length > 0) {
                errors.push({
                    row: index + 1,
                    data: diagnosis,
                    errors: rowErrors
                });
            } else {
                validData.push(diagnosis);
            }
        });

        return { validData, errors };
    }

    // นำเข้าข้อมูลจำนวนมาก
    static async bulkCreate(diagnosisDataList) {
        const results = {
            success: [],
            failed: []
        };

        for (const diagnosisData of diagnosisDataList) {
            try {
                const result = await this.createDiagnosis(diagnosisData);
                results.success.push({
                    data: diagnosisData,
                    result: result
                });
            } catch (error) {
                results.failed.push({
                    data: diagnosisData,
                    error: error.message
                });
            }
        }

        return results;
    }

    // สร้างรายงานสรุป
    static generateSummaryReport(diagnosisList) {
        const totalDiagnosis = diagnosisList.length;

        // นับตามภาษา
        const hasThaiCount = diagnosisList.filter(d => d.DXNAME_THAI).length;
        const hasEngCount = diagnosisList.filter(d => d.DXNAME_ENG).length;

        // รหัสที่ขึ้นต้นด้วยอะไร
        const codePrefix = {};
        diagnosisList.forEach(diagnosis => {
            const prefix = diagnosis.DXCODE?.substring(0, 2) || 'N/A';
            codePrefix[prefix] = (codePrefix[prefix] || 0) + 1;
        });

        return {
            totalDiagnosis,
            hasThaiName: hasThaiCount,
            hasEngName: hasEngCount,
            codeDistribution: Object.entries(codePrefix)
                .sort((a, b) => b[1] - a[1])
                .map(([prefix, count]) => ({ prefix, count }))
        };
    }

    // ค้นหาการวินิจฉัยโดยใช้ AI/Fuzzy Search (ตัวอย่าง)
    static fuzzySearch(searchTerm, diagnosisList, threshold = 0.6) {
        if (!searchTerm || !diagnosisList) return [];

        const results = [];
        const searchLower = searchTerm.toLowerCase();

        diagnosisList.forEach(diagnosis => {
            const thaiName = diagnosis.DXNAME_THAI?.toLowerCase() || '';
            const engName = diagnosis.DXNAME_ENG?.toLowerCase() || '';

            // คำนวณคะแนนความคล้าย (แบบง่าย)
            let score = 0;

            if (thaiName.includes(searchLower)) score += 1;
            if (engName.includes(searchLower)) score += 1;

            // คำนวณความคล้ายของคำ
            const thaiWords = thaiName.split(' ');
            const engWords = engName.split(' ');
            const searchWords = searchLower.split(' ');

            searchWords.forEach(searchWord => {
                thaiWords.forEach(thaiWord => {
                    if (thaiWord.includes(searchWord) || searchWord.includes(thaiWord)) {
                        score += 0.5;
                    }
                });

                engWords.forEach(engWord => {
                    if (engWord.includes(searchWord) || searchWord.includes(engWord)) {
                        score += 0.5;
                    }
                });
            });

            if (score >= threshold) {
                results.push({
                    ...diagnosis,
                    score: score
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 20);
    }
}

export default DiagnosisService;