// services/icd10Service.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ICD10Service {

    // สร้างรหัส ICD-10 ใหม่
    static async createICD10(icd10Data) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(icd10Data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating ICD-10:', error);
            throw error;
        }
    }

    // ดึงข้อมูล ICD-10 ทั้งหมด
    static async getAllICD10(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.medical_term) queryParams.append('medical_term', params.medical_term);

            const url = `${API_BASE_URL}/icd10${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ICD-10:', error);
            throw error;
        }
    }

    // ดึงข้อมูล ICD-10 ตามรหัส
    static async getICD10ByCode(icd10Code) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/${icd10Code}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ICD-10:', error);
            throw error;
        }
    }

    // ค้นหา ICD-10
    static async searchICD10(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/search/${encodeURIComponent(searchTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching ICD-10:', error);
            throw error;
        }
    }

    // ดึง ICD-10 ตามหมวดหมู่
    static async getICD10ByCategory(medicalTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/category/${encodeURIComponent(medicalTerm)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ICD-10 by category:', error);
            throw error;
        }
    }

    // ดึงรายการหมวดหมู่ ICD-10
    static async getICD10Categories() {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/categories/list`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ICD-10 categories:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูล ICD-10
    static async updateICD10(icd10Code, icd10Data) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/${icd10Code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(icd10Data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating ICD-10:', error);
            throw error;
        }
    }

    // ลบ ICD-10
    static async deleteICD10(icd10Code) {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/${icd10Code}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting ICD-10:', error);
            throw error;
        }
    }

    // ดึงสถิติ ICD-10
    static async getICD10Stats() {
        try {
            const response = await fetch(`${API_BASE_URL}/icd10/stats/summary`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ICD-10 stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validateICD10Data(data) {
        const errors = [];

        if (!data.ICD10CODE?.trim()) {
            errors.push('กรุณากรอกรหัส ICD-10');
        }

        if (data.ICD10CODE && !this.isValidICD10Code(data.ICD10CODE)) {
            errors.push('รหัส ICD-10 ต้องมีรูปแบบ A00 หรือ A00.0 เช่น J44.1');
        }

        if (data.ICD10NAME_THAI && data.ICD10NAME_THAI.length > 100) {
            errors.push('ชื่อโรคภาษาไทยต้องไม่เกิน 100 ตัวอักษร');
        }

        if (data.ICD10NAME_ENG && data.ICD10NAME_ENG.length > 255) {
            errors.push('ชื่อโรคภาษาอังกฤษต้องไม่เกิน 255 ตัวอักษร');
        }

        if (data.MEDICAL_TERM && data.MEDICAL_TERM.length > 255) {
            errors.push('หมวดหมู่โรคต้องไม่เกิน 255 ตัวอักษร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatICD10Data(data) {
        return {
            ICD10CODE: this.normalizeICD10Code(data.ICD10CODE),
            ICD10NAME_THAI: data.ICD10NAME_THAI?.trim(),
            ICD10NAME_ENG: data.ICD10NAME_ENG?.trim(),
            MEDICAL_TERM: data.MEDICAL_TERM?.trim(),
            NOTE1: data.NOTE1?.trim()
        };
    }

    // แปลงรหัส ICD-10 ให้อยู่ในรูปแบบมาตรฐาน
    static normalizeICD10Code(code) {
        if (!code) return '';

        // แปลงเป็นตัวพิมพ์ใหญ่และเอาช่องว่างออก
        let normalized = code.trim().toUpperCase().replace(/\s/g, '');

        // ตรวจสอบและแก้ไขรูปแบบ
        const match = normalized.match(/^([A-Z])(\d{2})\.?(\d*)$/);
        if (match) {
            const [, letter, mainCode, subCode] = match;
            if (subCode) {
                return `${letter}${mainCode}.${subCode}`;
            } else {
                return `${letter}${mainCode}`;
            }
        }

        return normalized;
    }

    // ตรวจสอบความถูกต้องของรหัส ICD-10
    static isValidICD10Code(code) {
        if (!code) return false;

        const normalized = this.normalizeICD10Code(code);
        return /^[A-Z]\d{2}(\.\d{1,3})?$/.test(normalized);
    }

    // ดึงรายการหมวดหมู่หลัก ICD-10
    static getMainCategories() {
        return [
            { code: 'A00-B99', name: 'โรคติดเชื้อและปรสิต', description: 'Certain infectious and parasitic diseases' },
            { code: 'C00-D48', name: 'เนื้องอก', description: 'Neoplasms' },
            { code: 'D50-D89', name: 'โรคเลือดและอวัยวะสร้างเลือด', description: 'Diseases of the blood and blood-forming organs' },
            { code: 'E00-E89', name: 'โรคต่อมไร้ท่อ โภชนาการ และเมแทบอลิซึม', description: 'Endocrine, nutritional and metabolic diseases' },
            { code: 'F01-F99', name: 'ความผิดปกติทางจิต', description: 'Mental and behavioural disorders' },
            { code: 'G00-G99', name: 'โรคระบบประสาท', description: 'Diseases of the nervous system' },
            { code: 'H00-H59', name: 'โรคตาและส่วนประกอบ', description: 'Diseases of the eye and adnexa' },
            { code: 'H60-H95', name: 'โรคหูและกระดูกฟัน', description: 'Diseases of the ear and mastoid process' },
            { code: 'I00-I99', name: 'โรคระบบไหลเวียนเลือด', description: 'Diseases of the circulatory system' },
            { code: 'J00-J99', name: 'โรคระบบหายใจ', description: 'Diseases of the respiratory system' },
            { code: 'K00-K95', name: 'โรคระบบย่อยอาหาร', description: 'Diseases of the digestive system' },
            { code: 'L00-L99', name: 'โรคผิวหนังและเนื้อเยื่อใต้ผิวหนัง', description: 'Diseases of the skin and subcutaneous tissue' },
            { code: 'M00-M99', name: 'โรคระบบกล้ามเนื้อและกระดูก', description: 'Diseases of the musculoskeletal system' },
            { code: 'N00-N99', name: 'โรคระบบปัสสาวะและระบบสืบพันธุ์', description: 'Diseases of the genitourinary system' },
            { code: 'O00-O9A', name: 'การตั้งครรภ์ การคลอด และระยะหลังคลอด', description: 'Pregnancy, childbirth and the puerperium' },
            { code: 'P00-P96', name: 'สภาวะที่เกิดขึ้นในระยะปริกำเนิด', description: 'Certain conditions originating in the perinatal period' },
            { code: 'Q00-Q99', name: 'ความผิดปกติแต่กำเนิด', description: 'Congenital malformations, deformations and chromosomal abnormalities' },
            { code: 'R00-R99', name: 'อาการและสัญญาณผิดปกติ', description: 'Symptoms, signs and abnormal clinical and laboratory findings' },
            { code: 'S00-T88', name: 'การบาดเจ็บ การเป็นพิษ และผลที่ตามมา', description: 'Injury, poisoning and certain other consequences of external causes' },
            { code: 'V00-Y99', name: 'สาเหตุภายนอกของการเจ็บป่วยและเสียชีวิต', description: 'External causes of morbidity and mortality' },
            { code: 'Z00-Z99', name: 'ปัจจัยที่มีผลต่อสุขภาพและการติดต่อบริการสุขภาพ', description: 'Factors influencing health status and contact with health services' }
        ];
    }

    // ค้นหาหมวดหมู่จากรหัส ICD-10
    static getCategoryFromCode(icd10Code) {
        if (!icd10Code) return null;

        const letter = icd10Code.charAt(0);
        const number = parseInt(icd10Code.substring(1, 3));

        const categories = this.getMainCategories();

        for (const category of categories) {
            const [start, end] = category.code.split('-');
            const startLetter = start.charAt(0);
            const startNumber = parseInt(start.substring(1, 3));
            const endLetter = end.charAt(0);
            const endNumber = parseInt(end.substring(1, 3));

            if (letter >= startLetter && letter <= endLetter) {
                if (letter === startLetter && number >= startNumber) {
                    if (letter === endLetter && number <= endNumber) {
                        return category;
                    } else if (letter < endLetter) {
                        return category;
                    }
                } else if (letter > startLetter && letter < endLetter) {
                    return category;
                } else if (letter === endLetter && number <= endNumber) {
                    return category;
                }
            }
        }

        return null;
    }

    // ดึงรายการ ICD-10 ที่ใช้บ่อย
    static getCommonICD10() {
        return [
            { code: 'J11.1', name_thai: 'ไข้หวัดใหญ่ที่มีปอดบวม', name_eng: 'Influenza with pneumonia' },
            { code: 'I10', name_thai: 'ความดันโลหิตสูงเบื้องต้น', name_eng: 'Essential hypertension' },
            { code: 'E11.9', name_thai: 'เบาหวานชนิดที่ 2 ไม่มีภาวะแทรกซ้อน', name_eng: 'Type 2 diabetes mellitus without complications' },
            { code: 'K21.9', name_thai: 'โรคกรดไหลย้อน', name_eng: 'Gastro-oesophageal reflux disease' },
            { code: 'M54.9', name_thai: 'ปวดหลัง', name_eng: 'Dorsalgia, unspecified' },
            { code: 'R51', name_thai: 'ปวดหัว', name_eng: 'Headache' },
            { code: 'J30.9', name_thai: 'โรคภูมิแพ้จมูก', name_eng: 'Allergic rhinitis, unspecified' },
            { code: 'K29.9', name_thai: 'โรคกระเพาะอาหารอักเสบ', name_eng: 'Gastritis, unspecified' },
            { code: 'E78.5', name_thai: 'ไขมันในเลือดสูง', name_eng: 'Hyperlipidaemia, unspecified' },
            { code: 'M17.9', name_thai: 'โรคข้อเข่าเสื่อม', name_eng: 'Gonarthrosis, unspecified' }
        ];
    }

    // สร้างรายการ options สำหรับ dropdown
    static formatForDropdown(icd10List) {
        return icd10List.map(icd10 => ({
            value: icd10.ICD10CODE,
            label: `${icd10.ICD10CODE} - ${icd10.ICD10NAME_THAI || icd10.ICD10NAME_ENG}`,
            data: icd10
        }));
    }

    // ค้นหา ICD-10 ที่คล้ายกัน
    static findSimilarICD10(searchTerm, icd10List) {
        if (!searchTerm || !icd10List || icd10List.length === 0) {
            return [];
        }

        const searchLower = searchTerm.toLowerCase();

        return icd10List.filter(icd10 => {
            const thaiName = icd10.ICD10NAME_THAI?.toLowerCase() || '';
            const engName = icd10.ICD10NAME_ENG?.toLowerCase() || '';
            const code = icd10.ICD10CODE?.toLowerCase() || '';
            const medicalTerm = icd10.MEDICAL_TERM?.toLowerCase() || '';

            return thaiName.includes(searchLower) ||
                engName.includes(searchLower) ||
                code.includes(searchLower) ||
                medicalTerm.includes(searchLower);
        }).slice(0, 15); // จำกัดผลลัพธ์ 15 รายการ
    }

    // ตรวจสอบรหัส ICD-10 ซ้ำ
    static async checkDuplicateCode(icd10Code) {
        try {
            const response = await this.getICD10ByCode(icd10Code);
            return response.success; // ถ้าเจอข้อมูลแสดงว่าซ้ำ
        } catch (error) {
            return false; // ถ้าไม่เจอข้อมูลแสดงว่าไม่ซ้ำ
        }
    }

    // กรองและเรียงลำดับข้อมูล
    static filterAndSortICD10(icd10List, filters = {}) {
        let filtered = [...icd10List];

        // กรองตามคำค้นหา
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(icd10 =>
                icd10.ICD10CODE?.toLowerCase().includes(searchTerm) ||
                icd10.ICD10NAME_THAI?.toLowerCase().includes(searchTerm) ||
                icd10.ICD10NAME_ENG?.toLowerCase().includes(searchTerm) ||
                icd10.MEDICAL_TERM?.toLowerCase().includes(searchTerm)
            );
        }

        // กรองตามหมวดหมู่
        if (filters.category) {
            const category = this.getMainCategories().find(cat => cat.code === filters.category);
            if (category) {
                const [start, end] = category.code.split('-');
                const startLetter = start.charAt(0);
                const endLetter = end.charAt(0);

                filtered = filtered.filter(icd10 => {
                    const letter = icd10.ICD10CODE?.charAt(0);
                    return letter >= startLetter && letter <= endLetter;
                });
            }
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
    static exportToCSV(icd10List) {
        const headers = ['รหัส ICD-10', 'ชื่อโรคภาษาไทย', 'ชื่อโรคภาษาอังกฤษ', 'หมวดหมู่', 'หมายเหตุ'];

        const rows = icd10List.map(icd10 => [
            icd10.ICD10CODE || '',
            icd10.ICD10NAME_THAI || '',
            icd10.ICD10NAME_ENG || '',
            icd10.MEDICAL_TERM || '',
            icd10.NOTE1 || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(icd10List, filename = 'icd10') {
        const csvContent = this.exportToCSV(icd10List);
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
                        ICD10CODE: values[0],
                        ICD10NAME_THAI: values[1],
                        ICD10NAME_ENG: values[2],
                        MEDICAL_TERM: values[3] || '',
                        NOTE1: values[4] || ''
                    });
                }
            }
        }

        return data;
    }

    // ตรวจสอบข้อมูลที่นำเข้า
    static validateImportData(icd10Data) {
        const errors = [];
        const validData = [];

        icd10Data.forEach((icd10, index) => {
            const rowErrors = this.validateICD10Data(icd10);

            if (rowErrors.length > 0) {
                errors.push({
                    row: index + 1,
                    data: icd10,
                    errors: rowErrors
                });
            } else {
                validData.push(icd10);
            }
        });

        return { validData, errors };
    }

    // นำเข้าข้อมูลจำนวนมาก
    static async bulkCreate(icd10DataList) {
        const results = {
            success: [],
            failed: []
        };

        for (const icd10Data of icd10DataList) {
            try {
                const result = await this.createICD10(icd10Data);
                results.success.push({
                    data: icd10Data,
                    result: result
                });
            } catch (error) {
                results.failed.push({
                    data: icd10Data,
                    error: error.message
                });
            }
        }

        return results;
    }

    // สร้างรายงานสรุป
    static generateSummaryReport(icd10List) {
        const totalICD10 = icd10List.length;

        // นับตามหมวดหมู่หลัก
        const categoryCount = {};
        const categories = this.getMainCategories();

        categories.forEach(category => {
            categoryCount[category.name] = 0;
        });

        icd10List.forEach(icd10 => {
            const category = this.getCategoryFromCode(icd10.ICD10CODE);
            if (category) {
                categoryCount[category.name] = (categoryCount[category.name] || 0) + 1;
            }
        });

        // นับตามภาษา
        const hasThaiCount = icd10List.filter(d => d.ICD10NAME_THAI).length;
        const hasEngCount = icd10List.filter(d => d.ICD10NAME_ENG).length;

        return {
            totalICD10,
            hasThaiName: hasThaiCount,
            hasEngName: hasEngCount,
            categoryDistribution: Object.entries(categoryCount)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => ({ category, count }))
        };
    }

    // ค้นหา ICD-10 โดยใช้ AI/Fuzzy Search
    static fuzzySearch(searchTerm, icd10List, threshold = 0.6) {
        if (!searchTerm || !icd10List) return [];

        const results = [];
        const searchLower = searchTerm.toLowerCase();

        icd10List.forEach(icd10 => {
            const thaiName = icd10.ICD10NAME_THAI?.toLowerCase() || '';
            const engName = icd10.ICD10NAME_ENG?.toLowerCase() || '';
            const code = icd10.ICD10CODE?.toLowerCase() || '';

            // คำนวณคะแนนความคล้าย
            let score = 0;

            // ตรงกับรหัส
            if (code.includes(searchLower)) score += 2;

            // ตรงกับชื่อ
            if (thaiName.includes(searchLower)) score += 1.5;
            if (engName.includes(searchLower)) score += 1.5;

            // ตรงกับคำใดคำหนึ่ง
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
                    ...icd10,
                    score: score
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 25);
    }

    // ตรวจสอบความสมบูรณ์ของรหัส ICD-10
    static validateCodeCompleteness(icd10Code) {
        if (!icd10Code) return { isValid: false, message: 'ไม่มีรหัส' };

        const normalized = this.normalizeICD10Code(icd10Code);

        if (!this.isValidICD10Code(normalized)) {
            return { isValid: false, message: 'รูปแบบรหัสไม่ถูกต้อง' };
        }

        const category = this.getCategoryFromCode(normalized);
        if (!category) {
            return { isValid: false, message: 'ไม่พบหมวดหมู่ของรหัสนี้' };
        }

        // ตรวจสอบความละเอียด
        const hasSubCode = normalized.includes('.');
        const suggestion = hasSubCode ?
            'รหัสมีความละเอียดสูง' :
            'อาจเพิ่มรหัสย่อยเพื่อความละเอียดมากขึ้น';

        return {
            isValid: true,
            message: 'รหัสถูกต้อง',
            category: category,
            hasSubCode: hasSubCode,
            suggestion: suggestion
        };
    }

    // แนะนำรหัส ICD-10 จากอาการ
    static suggestICD10FromSymptoms(symptoms) {
        const symptomKeywords = {
            'ไข้': ['J11', 'A09', 'R50'],
            'ปวดหัว': ['R51', 'G44'],
            'ปวดท้อง': ['R10', 'K59'],
            'ไอ': ['R05', 'J44'],
            'เบาหวาน': ['E11', 'E10'],
            'ความดัน': ['I10', 'I15'],
            'ปวดหลัง': ['M54', 'M79'],
            'ภูมิแพ้': ['J30', 'L20'],
            'กระเพาะ': ['K29', 'K25']
        };

        const suggestions = [];
        const searchLower = symptoms.toLowerCase();

        Object.entries(symptomKeywords).forEach(([symptom, codes]) => {
            if (searchLower.includes(symptom)) {
                codes.forEach(code => {
                    if (!suggestions.includes(code)) {
                        suggestions.push(code);
                    }
                });
            }
        });

        return suggestions;
    }
}

export default ICD10Service;