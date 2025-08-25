// services/treatmentService.js - แก้ไข VN Number ให้เป็น พ.ศ.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TreatmentService {

    // ✅ สร้าง VNO อัตโนมัติ - แก้ไขให้เป็น พ.ศ. รูปแบบ VN680809001
    static generateVNO(date = new Date()) {
        const buddhistYear = date.getFullYear() + 543;
        const year = buddhistYear.toString().slice(-2); // เอาแค่ 2 หลัก เช่น 2568 -> 68
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // ✅ รูปแบบใหม่: VN[ปี พ.ศ. 2 หลัก][เดือน][วัน][เลขรันนิ่ง 3 หลัก]
        // สร้างเลขรันนิ่ง 3 หลัก (001-999)
        const runningNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

        return `VN${year}${month}${day}${runningNumber}`;
    }

    // ✅ แปลงวันที่เป็นรูปแบบไทย - แก้ไขให้แสดง พ.ศ.
    static formatThaiDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // ✅ แปลงเป็น พ.ศ.

        return `${day} ${month} ${year}`;
    }

    // ✅ เพิ่มฟังก์ชันแปลงวันที่จาก พ.ศ. เป็น ค.ศ.
    static convertBuddhistToChristian(buddhistDateString) {
        if (!buddhistDateString) return '';
        try {
            const [year, month, day] = buddhistDateString.split('-');
            const christianYear = parseInt(year) - 543;
            return `${christianYear}-${month}-${day}`;
        } catch (error) {
            console.error('Error converting Buddhist date:', error);
            return buddhistDateString;
        }
    }

    // ✅ เพิ่มฟังก์ชันแปลงวันที่จาก ค.ศ. เป็น พ.ศ.
    static convertChristianToBuddhist(christianDateString) {
        if (!christianDateString) return '';
        try {
            const [year, month, day] = christianDateString.split('-');
            const buddhistYear = parseInt(year) + 543;
            return `${buddhistYear}-${month}-${day}`;
        } catch (error) {
            console.error('Error converting Christian date:', error);
            return christianDateString;
        }
    }

    // ✅ ตรวจสอบรูปแบบ VN Number ใหม่
    static isValidVNO(vno) {
        // รูปแบบใหม่: VN + 2 หลักปี พ.ศ. + 2 หลักเดือน + 2 หลักวัน + 3 หลักรันนิ่ง = VN + 9 หลัก
        const vnPattern = /^VN\d{9}$/;
        return vnPattern.test(vno);
    }

    // ✅ สกัดข้อมูลวันที่จาก VN Number
    static extractDateFromVNO(vno) {
        if (!this.isValidVNO(vno)) {
            return null;
        }

        try {
            const dateString = vno.substring(2); // เอาส่วนหลัง VN
            const year = '25' + dateString.substring(0, 2); // เติม 25 หน้า เช่น 68 -> 2568
            const month = dateString.substring(2, 4);
            const day = dateString.substring(4, 6);
            const runningNumber = dateString.substring(6, 9); // เลขรันนิ่ง 3 หลัก

            // แปลงเป็น ค.ศ. สำหรับ JavaScript Date
            const christianYear = parseInt(year) - 543;

            return {
                buddhistYear: parseInt(year),
                christianYear: christianYear,
                month: parseInt(month),
                day: parseInt(day),
                runningNumber: parseInt(runningNumber),
                dateString: `${christianYear}-${month}-${day}`,
                buddhistDateString: `${year}-${month}-${day}`,
                vnoFormat: 'VN[YY][MM][DD][NNN]'
            };
        } catch (error) {
            console.error('Error extracting date from VNO:', error);
            return null;
        }
    }

    // สร้างการรักษาใหม่
    static async createTreatment(treatmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/treatments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(treatmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating treatment:', error);
            throw error;
        }
    }

    // สร้างการรักษาพร้อมเชื่อมกับคิว
    static async createTreatmentWithQueue(treatmentData, queueId) {
        try {
            const data = {
                ...treatmentData,
                QUEUE_ID: queueId
            };

            const response = await fetch(`${API_BASE_URL}/treatments`, {
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
            console.error('Error creating treatment with queue:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการรักษาทั้งหมด
    static async getAllTreatments(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status) queryParams.append('status', params.status);
            if (params.emp_code) queryParams.append('emp_code', params.emp_code);
            if (params.hnno) queryParams.append('hnno', params.hnno);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.dx_code) queryParams.append('dx_code', params.dx_code);
            if (params.icd10_code) queryParams.append('icd10_code', params.icd10_code);

            const url = `${API_BASE_URL}/treatments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching treatments:', error);
            throw error;
        }
    }

    // ดึงข้อมูลการรักษาตาม VNO พร้อมรายละเอียดครบถ้วน
    static async getTreatmentByVNO(vno) {
        try {
            const response = await fetch(`${API_BASE_URL}/treatments/${vno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching treatment:', error);
            throw error;
        }
    }

    // ดึงการรักษาของผู้ป่วยตาม HN
    static async getTreatmentsByPatient(hn, params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // ตรวจสอบและแปลง parameters
            if (params.page) queryParams.append('page', parseInt(params.page).toString());
            if (params.limit) queryParams.append('limit', parseInt(params.limit).toString());

            const url = `${API_BASE_URL}/treatments/patient/${hn}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            console.log('🔗 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 API Response:', result);

            return result;
        } catch (error) {
            console.error('Error fetching treatments by patient:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลการรักษา
    static async updateTreatment(vno, treatmentData) {
        try {
            // Format the data to ensure no undefined values
            const formattedData = this.formatTreatmentData(treatmentData);

            console.log('📤 Sending formatted treatment data:', formattedData);

            const response = await fetch(`${API_BASE_URL}/treatments/${vno}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating treatment:', error);
            throw error;
        }
    }


    // อัพเดทสถานะการรักษา
    static async updateTreatmentStatus(vno, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/treatments/${vno}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating treatment status:', error);
            throw error;
        }
    }

    // ดึงสถิติการรักษา
    static async getTreatmentStats(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);

            const url = `${API_BASE_URL}/treatments/stats/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching treatment stats:', error);
            throw error;
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูลการรักษา
    static validateTreatmentData(data) {
        const errors = [];

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!data.VNO?.trim()) {
            errors.push('กรุณากรอก Visit Number');
        }

        if (!data.HNNO?.trim()) {
            errors.push('กรุณากรอก Hospital Number');
        }

        if (!data.EMP_CODE?.trim()) {
            errors.push('กรุณาเลือกแพทย์ผู้รักษา');
        }

        if (!data.RDATE) {
            errors.push('กรุณาระบุวันที่รับบริการ');
        }

        // ตรวจสอบค่าสัญญาณชีพ
        const vitalSigns = {
            WEIGHT1: { min: 0, max: 1000, name: 'น้ำหนัก' },
            HIGHT1: { min: 0, max: 300, name: 'ส่วนสูง' },
            BT1: { min: 30, max: 45, name: 'อุณหภูมิ' },
            BP1: { min: 50, max: 300, name: 'ความดันโลหิตตัวบน' },
            BP2: { min: 30, max: 200, name: 'ความดันโลหิตตัวล่าง' },
            RR1: { min: 5, max: 60, name: 'อัตราการหายใจ' },
            PR1: { min: 30, max: 200, name: 'อัตราการเต้นของชีพจร' },
            SPO2: { min: 50, max: 100, name: 'ค่าออกซิเจน' }
        };

        Object.entries(vitalSigns).forEach(([field, config]) => {
            if (data[field] && (isNaN(data[field]) || data[field] < config.min || data[field] > config.max)) {
                errors.push(`${config.name} ต้องอยู่ระหว่าง ${config.min}-${config.max}`);
            }
        });

        // ✅ ตรวจสอบรูปแบบ VNO ใหม่
        if (data.VNO && !this.isValidVNO(data.VNO)) {
            errors.push('Visit Number ต้องเป็นรูปแบบ VN + 12 หลัก');
        }

        // ตรวจสอบรูปแบบวันที่
        if (data.RDATE && !this.isValidDate(data.RDATE)) {
            errors.push('รูปแบบวันที่รับบริการไม่ถูกต้อง');
        }

        if (data.APPOINTMENT_DATE && !this.isValidDate(data.APPOINTMENT_DATE)) {
            errors.push('รูปแบบวันที่นัดหมายไม่ถูกต้อง');
        }

        return errors;
    }

    // ตรวจสอบรูปแบบวันที่
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatTreatmentData(data) {
        // Helper function to convert undefined to null
        const toNull = (value) => value === undefined ? null : value;

        return {
            VNO: toNull(data.VNO?.trim()),
            QUEUE_ID: toNull(data.QUEUE_ID?.trim()),
            HNNO: toNull(data.HNNO?.trim()),
            RDATE: toNull(data.RDATE),
            TRDATE: toNull(data.TRDATE) || toNull(data.RDATE),
            WEIGHT1: data.WEIGHT1 ? parseFloat(data.WEIGHT1) : null,
            HIGHT1: data.HIGHT1 ? parseFloat(data.HIGHT1) : null,
            BT1: data.BT1 ? parseFloat(data.BT1) : null,
            BP1: data.BP1 ? parseFloat(data.BP1) : null,
            BP2: data.BP2 ? parseFloat(data.BP2) : null,
            RR1: data.RR1 ? parseFloat(data.RR1) : null,
            PR1: data.PR1 ? parseFloat(data.PR1) : null,
            SPO2: data.SPO2 ? parseFloat(data.SPO2) : null,
            SYMPTOM: toNull(data.SYMPTOM?.trim()),
            DXCODE: toNull(data.DXCODE?.trim()),
            ICD10CODE: toNull(data.ICD10CODE?.trim()),
            TREATMENT1: toNull(data.TREATMENT1?.trim()),
            APPOINTMENT_DATE: toNull(data.APPOINTMENT_DATE),
            APPOINTMENT_TDATE: toNull(data.APPOINTMENT_TDATE) || toNull(data.APPOINTMENT_DATE),
            EMP_CODE: toNull(data.EMP_CODE?.trim()),
            EMP_CODE1: toNull(data.EMP_CODE1?.trim()),
            STATUS1: toNull(data.STATUS1) || 'ทำงานอยู่',

            // Diagnosis details - Handle undefined values
            diagnosis: data.diagnosis ? {
                CHIEF_COMPLAINT: toNull(data.diagnosis.CHIEF_COMPLAINT?.trim()),
                PRESENT_ILL: toNull(data.diagnosis.PRESENT_ILL?.trim()),
                PHYSICAL_EXAM: toNull(data.diagnosis.PHYSICAL_EXAM?.trim()),
                PLAN1: toNull(data.diagnosis.PLAN1?.trim())
            } : null,

            // Arrays for related data - Ensure they're arrays, not undefined
            drugs: Array.isArray(data.drugs) ? data.drugs : [],
            procedures: Array.isArray(data.procedures) ? data.procedures : [],
            labTests: Array.isArray(data.labTests) ? data.labTests : [],
            radioTests: Array.isArray(data.radioTests) ? data.radioTests : []
        };
    }

    // ดึงรายการสถานะการรักษา
    static getTreatmentStatuses() {
        return [
            { value: 'ทำงานอยู่', label: 'ทำงานอยู่', color: 'blue' },
            { value: 'ปิดแล้ว', label: 'ปิดแล้ว', color: 'green' },
            { value: 'ยกเลิก', label: 'ยกเลิก', color: 'red' }
        ];
    }

    // คำนวณ BMI
    static calculateBMI(weight, height) {
        if (!weight || !height || height <= 0) return null;

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        return {
            value: Math.round(bmi * 10) / 10,
            category: this.getBMICategory(bmi)
        };
    }

    // จัดกลุ่ม BMI
    static getBMICategory(bmi) {
        if (bmi < 18.5) return 'ผอม';
        if (bmi < 25) return 'ปกติ';
        if (bmi < 30) return 'อ้วน';
        return 'อ้วนมาก';
    }

    // ตรวจสอบค่าสัญญาณชีพผิดปกติ
    static checkAbnormalVitals(vitals) {
        const warnings = [];

        if (vitals.BT1 && (vitals.BT1 < 36 || vitals.BT1 > 37.5)) {
            warnings.push(`อุณหภูมิผิดปกติ: ${vitals.BT1}°C`);
        }

        if (vitals.BP1 && vitals.BP2) {
            if (vitals.BP1 > 140 || vitals.BP2 > 90) {
                warnings.push(`ความดันโลหิตสูง: ${vitals.BP1}/${vitals.BP2} mmHg`);
            } else if (vitals.BP1 < 90 || vitals.BP2 < 60) {
                warnings.push(`ความดันโลหิตต่ำ: ${vitals.BP1}/${vitals.BP2} mmHg`);
            }
        }

        if (vitals.PR1 && (vitals.PR1 < 60 || vitals.PR1 > 100)) {
            warnings.push(`ชีพจรผิดปกติ: ${vitals.PR1} ครั้ง/นาที`);
        }

        if (vitals.SPO2 && vitals.SPO2 < 95) {
            warnings.push(`ค่าออกซิเจนต่ำ: ${vitals.SPO2}%`);
        }

        return warnings;
    }

    // จัดรูปแบบข้อมูลสำหรับพิมพ์
    static formatForPrint(treatmentData) {
        const treatment = treatmentData.data;

        return {
            // Header
            vno: treatment.treatment.VNO,
            date: this.formatThaiDate(treatment.treatment.RDATE),

            // Patient Info
            patient: {
                hn: treatment.treatment.HNNO,
                name: `${treatment.treatment.PRENAME || ''} ${treatment.treatment.NAME1} ${treatment.treatment.SURNAME || ''}`.trim(),
                age: treatment.treatment.AGE,
                sex: treatment.treatment.SEX,
                tel: treatment.treatment.TEL1
            },

            // Vital Signs
            vitals: {
                weight: treatment.treatment.WEIGHT1,
                height: treatment.treatment.HIGHT1,
                bt: treatment.treatment.BT1,
                bp: treatment.treatment.BP1 && treatment.treatment.BP2 ? `${treatment.treatment.BP1}/${treatment.treatment.BP2}` : null,
                rr: treatment.treatment.RR1,
                pr: treatment.treatment.PR1,
                spo2: treatment.treatment.SPO2
            },

            // Medical Info
            symptom: treatment.treatment.SYMPTOM,
            diagnosis: treatment.treatment.DXNAME_THAI,
            treatment: treatment.treatment.TREATMENT1,
            doctor: treatment.treatment.EMP_NAME,

            // Details
            drugs: treatment.drugs,
            procedures: treatment.procedures,
            labTests: treatment.labTests,
            radioTests: treatment.radiologicalTests,

            // Summary
            summary: treatment.summary
        };
    }

    // กรองและเรียงลำดับข้อมูล
    static filterAndSortTreatments(treatments, filters = {}) {
        let filtered = [...treatments];

        // กรองตามสถานะ
        if (filters.status) {
            filtered = filtered.filter(t => t.STATUS1 === filters.status);
        }

        // กรองตามแพทย์
        if (filters.doctor) {
            filtered = filtered.filter(t => t.EMP_NAME?.includes(filters.doctor));
        }

        // กรองตามช่วงวันที่
        if (filters.dateFrom) {
            filtered = filtered.filter(t => new Date(t.RDATE) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            filtered = filtered.filter(t => new Date(t.RDATE) <= new Date(filters.dateTo));
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
    static exportToCSV(treatments) {
        const headers = [
            'VNO', 'HN', 'วันที่', 'ชื่อผู้ป่วย', 'อายุ', 'เพศ',
            'อาการ', 'การวินิจฉัย', 'การรักษา', 'แพทย์', 'สถานะ'
        ];

        const rows = treatments.map(t => [
            t.VNO,
            t.HNNO,
            this.formatThaiDate(t.RDATE),
            `${t.PRENAME || ''} ${t.NAME1} ${t.SURNAME || ''}`.trim(),
            t.AGE,
            t.SEX,
            t.SYMPTOM,
            t.DXNAME_THAI,
            t.TREATMENT1,
            t.EMP_NAME,
            t.STATUS1
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field || ''}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(treatments, filename = 'treatments') {
        const csvContent = this.exportToCSV(treatments);
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

    // สร้างข้อมูลการรักษาใหม่จาก Queue
    static createTreatmentFromQueue(queueData) {
        return {
            VNO: this.generateVNO(),
            QUEUE_ID: queueData.QUEUE_ID,
            HNNO: queueData.HNCODE,
            RDATE: new Date().toISOString().split('T')[0],
            SYMPTOM: queueData.CHIEF_COMPLAINT || '',
            STATUS1: 'ทำงานอยู่',

            // ข้อมูลผู้ป่วยจาก Queue
            patientInfo: {
                HNCODE: queueData.HNCODE,
                PRENAME: queueData.PRENAME,
                NAME1: queueData.NAME1,
                SURNAME: queueData.SURNAME,
                AGE: queueData.AGE,
                SEX: queueData.SEX,
                TEL1: queueData.TEL1
            }
        };
    }

    // อัพเดทสถานะคิวเมื่อเปลี่ยนสถานะการรักษา
    static async syncQueueStatus(queueId, treatmentStatus) {
        try {
            // แมปสถานะการรักษาเป็นสถานะคิว
            const statusMapping = {
                'ทำงานอยู่': 'กำลังตรวจ',
                'ปิดแล้ว': 'เสร็จแล้ว',
                'ยกเลิก': 'รอตรวจ'
            };

            const queueStatus = statusMapping[treatmentStatus] || 'รอตรวจ';

            // เรียก QueueService (ต้อง import)
            const QueueService = await import('./queueService');
            return await QueueService.default.updateQueueStatus(queueId, queueStatus);
        } catch (error) {
            console.error('Error syncing queue status:', error);
            // ไม่ throw error เพื่อไม่ให้กระทบกับการอัพเดทการรักษา
            return null;
        }
    }
}

export default TreatmentService;