// services/treatmentService.js - แก้ไขเพื่อรองรับ Freestyle Procedures
import {
    getCurrentDateForDB,
    getCurrentTimeForDB,
    getCurrentDateForDisplay,
    getCurrentTimeForDisplay,
    formatThaiDate,
    formatThaiDateShort,
    formatThaiDateTime,
    formatThaiTime,
    formatThaiTimeShort
} from '../utils/dateTimeUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TreatmentService {

    // ✅ สร้าง VNO อัตโนมัติ - แก้ไขให้เป็น พ.ศ. รูปแบบ VN680809001
    static generateVNO(date = new Date()) {
        // แปลงเป็น Thailand time
        const thailandTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        const buddhistYear = thailandTime.getFullYear() + 543;
        const year = buddhistYear.toString().slice(-2);
        const month = String(thailandTime.getMonth() + 1).padStart(2, '0');
        const day = String(thailandTime.getDate()).padStart(2, '0');

        const runningNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
        return `VN${year}${month}${day}${runningNumber}`;
    }

    // ✅ สร้างรหัสหัตถการใหม่สำหรับ freestyle procedures
    static generateProcedureCode(procedureName) {
        const timestamp = Date.now().toString().slice(-6);
        const namePrefix = procedureName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        return `${namePrefix}_${timestamp}`;
    }

    // ✅ ตรวจสอบว่าเป็นรหัสหัตถการที่สร้างขึ้นใหม่หรือไม่
    static isCustomProcedureCode(code) {
        return code && (code.startsWith('CUSTOM_') || code.includes('_') || code.startsWith('PROC_'));
    }

    // ✅ เพิ่มหัตถการใหม่เข้าไปในฐานข้อมูล - เพิ่ม timeout
    static async addCustomProcedure(procedureCode, procedureName) {
        try {
            // ✅ เพิ่ม timeout เพื่อป้องกันการค้าง
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

            try {
                const response = await fetch(`${API_BASE_URL}/treatments/procedures/custom`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        MEDICAL_PROCEDURE_CODE: procedureCode,
                        MED_PRO_NAME_THAI: procedureName,
                        MED_PRO_NAME_ENG: procedureName,
                        MED_PRO_TYPE: 'Custom',
                        UNIT_PRICE: 0
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout - การเพิ่มหัตถการใช้เวลานานเกินไป');
                }
                throw error;
            }
        } catch (error) {
            console.error('Error adding custom procedure:', error);
            throw error;
        }
    }

    // ✅ ตรวจสอบและเตรียมข้อมูลหัตถการก่อนบันทึก - ปรับปรุงให้เร็วขึ้น (ไม่เรียก API)
    static async prepareProceduresData(procedures) {
        // ✅ ไม่ต้องเรียก API เพิ่มหัตถการ เพราะ backend จะจัดการเองผ่าน ensureProcedureExists
        // ทำให้เร็วขึ้นมาก
        console.log('🔧 prepareProceduresData - Input:', JSON.stringify(procedures, null, 2));

        const prepared = procedures.map(proc => {
            let procedureCode = proc.procedureCode || proc.PROCEDURE_CODE || proc.MEDICAL_PROCEDURE_CODE;
            const procedureName = proc.procedureName || proc.PROCEDURE_NAME || 'หัตถการที่ไม่ระบุชื่อ';

            // ถ้าไม่มีรหัส หรือเป็นรหัสชั่วคราว ให้สร้างใหม่
            if (!procedureCode || procedureCode.trim() === '' || procedureCode.startsWith('CUSTOM_')) {
                const timestamp = Date.now().toString().slice(-6);
                procedureCode = `PROC_${timestamp}`;
            }

            const result = {
                PROCEDURE_CODE: procedureCode,
                MEDICAL_PROCEDURE_CODE: procedureCode,
                PROCEDURE_NAME: procedureName,
                NOTE1: proc.note || proc.NOTE1 || '',
                DOCTOR_NAME: proc.doctorName || proc.DOCTOR_NAME || 'นพ.ผู้รักษา',
                PROCEDURE_DATE: proc.procedureDate || proc.PROCEDURE_DATE || new Date().toISOString().split('T')[0],
                QTY: proc.qty || proc.QTY || 1,
                UNIT_CODE: proc.unitCode || proc.UNIT_CODE || 'ครั้ง',
                UNIT_PRICE: proc.unitPrice || proc.UNIT_PRICE || 0,
                AMT: proc.amt || proc.AMT || 0
            };

            console.log('🔧 prepareProceduresData - Prepared item:', JSON.stringify(result, null, 2));
            return result;
        });

        console.log('🔧 prepareProceduresData - Output:', JSON.stringify(prepared, null, 2));
        return prepared;
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
            console.log('📤 TreatmentService.createTreatment - Original data:', {
                drugsCount: treatmentData.drugs?.length || 0,
                proceduresCount: treatmentData.procedures?.length || 0,
                drugs: treatmentData.drugs,
                procedures: treatmentData.procedures
            });

            // ✅ เตรียมข้อมูลหัตถการก่อน
            if (treatmentData.procedures && Array.isArray(treatmentData.procedures)) {
                treatmentData.procedures = await this.prepareProceduresData(treatmentData.procedures);
                console.log('✅ Prepared procedures:', treatmentData.procedures);
            }

            console.log('📤 TreatmentService.createTreatment - Sending data:', {
                drugsCount: treatmentData.drugs?.length || 0,
                proceduresCount: treatmentData.procedures?.length || 0,
                drugs: treatmentData.drugs,
                procedures: treatmentData.procedures
            });

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

            // ✅ เตรียมข้อมูลหัตถการก่อน
            if (data.procedures && Array.isArray(data.procedures)) {
                data.procedures = await this.prepareProceduresData(data.procedures);
            }

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

            // ✅ New Filters
            if (params.rights_type) queryParams.append('rights_type', params.rights_type);
            if (params.ucs_payment_date_from) queryParams.append('ucs_payment_date_from', params.ucs_payment_date_from);
            if (params.ucs_payment_date_to) queryParams.append('ucs_payment_date_to', params.ucs_payment_date_to);

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

    // ✅ ตรวจสอบการใช้สิทธิ์บัตรทองในเดือนปัจจุบัน
    static async checkUCSUsageThisMonth(hn) {
        try {
            const response = await fetch(`${API_BASE_URL}/treatments/check-ucs-usage/${hn}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking UCS usage:', error);
            throw error;
        }
    }

    // ✅ ตรวจสอบว่า VNO ซ้ำหรือไม่
    static async checkVNOExists(vno) {
        try {
            const response = await fetch(`${API_BASE_URL}/treatments/check-vno/${vno}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking VNO:', error);
            throw error;
        }
    }

    // ✅ อัพเดทข้อมูลการรักษา - แก้ไขเพื่อรองรับ freestyle procedures
    static async updateTreatment(vno, treatmentData) {
        try {
            console.log('🔄 TreatmentService: Updating treatment', vno, 'with data:', treatmentData);

            // ✅ เตรียมข้อมูลหัตถการก่อนส่ง
            if (treatmentData.procedures && Array.isArray(treatmentData.procedures)) {
                console.log('📋 Preparing procedures data before sending to API...');
                treatmentData.procedures = await this.prepareProceduresData(treatmentData.procedures);
                console.log('✅ Procedures prepared:', treatmentData.procedures);
            }

            // Format the data to ensure no undefined values
            const formattedData = this.formatTreatmentData(treatmentData);

            console.log('📤 Sending formatted treatment data:', {
                ...formattedData,
                proceduresCount: formattedData.procedures?.length || 0,
                drugsCount: formattedData.drugs?.length || 0,
                hasProcedures: formattedData.hasOwnProperty('procedures'),
                hasDrugs: formattedData.hasOwnProperty('drugs'),
                procedures: formattedData.procedures,
                drugs: formattedData.drugs
            });

            // ✅ เพิ่ม timeout เป็น 120 วินาที (2 นาที) เพื่อรองรับการบันทึกที่อาจใช้เวลานาน
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

            try {
                const response = await fetch(`${API_BASE_URL}/treatments/${vno}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout - การบันทึกใช้เวลานานเกินไป');
                }
                throw error;
            }

        } catch (error) {
            console.error('❌ TreatmentService: Error updating treatment:', error);
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

    // ✅ ตรวจสอบความถูกต้องของข้อมูลการรักษา - เพิ่มการตรวจสอบหัตถการ
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

        // ✅ ตรวจสอบข้อมูลหัตถการ
        if (data.procedures && Array.isArray(data.procedures)) {
            data.procedures.forEach((proc, index) => {
                if (!proc.procedureName && !proc.PROCEDURE_NAME) {
                    errors.push(`กรุณากรอกชื่อหัตถการลำดับที่ ${index + 1}`);
                }
            });
        }

        // ตรวจสอบค่าสัญญาณชีพ
        const vitalSigns = {
            WEIGHT1: { min: 0, max: 1000, name: 'น้ำหนัก' },
            HIGHT1: { min: 0, max: 300, name: 'ส่วนสูง' },
            BT1: { min: 30, max: 45, name: 'อุณหภูมิ' },
            BP1: { min: 90, max: 140, name: 'ความดันโลหิตตัวบน' }, // ✅ แก้ไขเป็น 90-140
            BP2: { min: 60, max: 100, name: 'ความดันโลหิตตัวล่าง' }, // ✅ แก้ไขเป็น 60-100
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
            errors.push('Visit Number ต้องเป็นรูปแบบ VN + 9 หลัก');
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

    // ✅ จัดรูปแบบข้อมูลก่อนส่ง API - เพิ่มการจัดการหัตถการ
    static formatTreatmentData(data) {
        // Helper function to convert undefined to null
        const toNull = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };

        const hasStatusField = Object.prototype.hasOwnProperty.call(data, 'STATUS1');
        const statusValue = hasStatusField ? (toNull(data.STATUS1) || 'ทำงานอยู่') : undefined;

        const formattedData = {
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
            STATUS1: statusValue,
            INVESTIGATION_NOTES: toNull(data.INVESTIGATION_NOTES?.trim()),

            // ✅ เพิ่มฟิลด์การชำระเงิน
            TOTAL_AMOUNT: data.TOTAL_AMOUNT !== undefined && data.TOTAL_AMOUNT !== null ? parseFloat(data.TOTAL_AMOUNT) : null,
            TREATMENT_FEE: data.TREATMENT_FEE !== undefined && data.TREATMENT_FEE !== null ? parseFloat(data.TREATMENT_FEE) : null, // ✅ ต้องบันทึก 0 ได้ ห้ามใช้ truthy check
            DISCOUNT_AMOUNT: data.DISCOUNT_AMOUNT !== undefined && data.DISCOUNT_AMOUNT !== null ? parseFloat(data.DISCOUNT_AMOUNT) : null,
            NET_AMOUNT: data.NET_AMOUNT !== undefined && data.NET_AMOUNT !== null ? parseFloat(data.NET_AMOUNT) : null,
            PAYMENT_STATUS: toNull(data.PAYMENT_STATUS),
            PAYMENT_DATE: toNull(data.PAYMENT_DATE),
            PAYMENT_TIME: toNull(data.PAYMENT_TIME),
            PAYMENT_METHOD: toNull(data.PAYMENT_METHOD),
            RECEIVED_AMOUNT: data.RECEIVED_AMOUNT !== undefined && data.RECEIVED_AMOUNT !== null ? parseFloat(data.RECEIVED_AMOUNT) : null,
            CHANGE_AMOUNT: data.CHANGE_AMOUNT !== undefined && data.CHANGE_AMOUNT !== null ? parseFloat(data.CHANGE_AMOUNT) : null,
            CASHIER: toNull(data.CASHIER),
            EXTERNAL_UCS_COUNT: data.EXTERNAL_UCS_COUNT !== undefined ? parseInt(data.EXTERNAL_UCS_COUNT) : undefined, // ✅ เพิ่ม EXTERNAL_UCS_COUNT (ใช้ undefined ถ้าไม่มีค่า เพื่อให้ backend ตัดสินใจ)

            // Diagnosis details
            diagnosis: data.diagnosis ? {
                CHIEF_COMPLAINT: toNull(data.diagnosis.CHIEF_COMPLAINT?.trim()),
                PRESENT_ILL: toNull(data.diagnosis.PRESENT_ILL?.trim()),
                PHYSICAL_EXAM: toNull(data.diagnosis.PHYSICAL_EXAM?.trim()),
                PLAN1: toNull(data.diagnosis.PLAN1?.trim())
            } : null,

            // Arrays for related data - ✅ ส่งเฉพาะเมื่อมีการส่งมาใน data
            ...(data.hasOwnProperty('drugs') ? { drugs: Array.isArray(data.drugs) ? data.drugs : [] } : {}),
            ...(data.hasOwnProperty('procedures') ? { procedures: Array.isArray(data.procedures) ? data.procedures : [] } : {}),
            ...(data.hasOwnProperty('labTests') ? { labTests: Array.isArray(data.labTests) ? data.labTests : [] } : {}),
            ...(data.hasOwnProperty('radioTests') ? { radioTests: Array.isArray(data.radioTests) ? data.radioTests : [] } : {})
        };

        if (!hasStatusField) {
            delete formattedData.STATUS1;
        }

        return formattedData;
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
            // ✅ แก้ไขช่วงความดันปกติ: 90-140 (ตัวบน) / 60-100 (ตัวล่าง)
            const bp1Normal = vitals.BP1 >= 90 && vitals.BP1 <= 140;
            const bp2Normal = vitals.BP2 >= 60 && vitals.BP2 <= 100;

            if (!bp1Normal || !bp2Normal) {
                if (vitals.BP1 > 140 || vitals.BP2 > 100) {
                    warnings.push(`ความดันโลหิตสูง: ${vitals.BP1}/${vitals.BP2} mmHg (ปกติ: 90-140/60-100)`);
                } else if (vitals.BP1 < 90 || vitals.BP2 < 60) {
                    warnings.push(`ความดันโลหิตต่ำ: ${vitals.BP1}/${vitals.BP2} mmHg (ปกติ: 90-140/60-100)`);
                } else {
                    warnings.push(`ความดันโลหิตผิดปกติ: ${vitals.BP1}/${vitals.BP2} mmHg (ปกติ: 90-140/60-100)`);
                }
            }
        } else if (vitals.BP1) {
            // เช็คเฉพาะตัวบน
            if (vitals.BP1 > 140 || vitals.BP1 < 90) {
                warnings.push(`ความดันโลหิตตัวบนผิดปกติ: ${vitals.BP1} mmHg (ปกติ: 90-140)`);
            }
        } else if (vitals.BP2) {
            // เช็คเฉพาะตัวล่าง
            if (vitals.BP2 > 100 || vitals.BP2 < 60) {
                warnings.push(`ความดันโลหิตตัวล่างผิดปกติ: ${vitals.BP2} mmHg (ปกติ: 60-100)`);
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

    // ✅ จัดรูปแบบข้อมูลสำหรับพิมพ์ - เพิ่มการจัดการหัตถการ
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

            // Details - ✅ แยกหัตถการที่สร้างใหม่กับที่มีอยู่เดิม
            drugs: treatment.drugs,
            procedures: treatment.procedures.map(proc => ({
                ...proc,
                isCustom: this.isCustomProcedureCode(proc.MEDICAL_PROCEDURE_CODE)
            })),
            labTests: treatment.labTests,
            radioTests: treatment.radiologicalTests,

            // Summary
            summary: treatment.summary
        };
    }

    // ✅ กรองและเรียงลำดับข้อมูล - เพิ่มการกรองหัตถการ
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

        // ✅ กรองตามประเภทหัตถการ
        if (filters.procedureType) {
            filtered = filtered.filter(t => {
                if (filters.procedureType === 'custom') {
                    return t.procedures?.some(p => this.isCustomProcedureCode(p.MEDICAL_PROCEDURE_CODE));
                } else if (filters.procedureType === 'standard') {
                    return t.procedures?.some(p => !this.isCustomProcedureCode(p.MEDICAL_PROCEDURE_CODE));
                }
                return true;
            });
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

    // ✅ ส่งออกข้อมูลเป็น CSV - เพิ่มข้อมูลหัตถการ
    static exportToCSV(treatments) {
        const headers = [
            'VNO', 'HN', 'วันที่', 'ชื่อผู้ป่วย', 'อายุ', 'เพศ',
            'อาการ', 'การวินิจฉัย', 'การรักษา', 'หัตถการ', 'แพทย์', 'สถานะ'
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
            // ✅ รวมรายการหัตถการ
            t.procedures?.map(p => p.MED_PRO_NAME_THAI || p.PROCEDURE_NAME).join(', ') || '',
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

    // ✅ สร้างข้อมูลการรักษาใหม่จาก Queue - เพิ่มการจัดการหัตถการ
    static createTreatmentFromQueue(queueData) {
        return {
            VNO: this.generateVNO(),
            QUEUE_ID: queueData.QUEUE_ID,
            HNNO: queueData.HNCODE,
            RDATE: new Date().toISOString().split('T')[0],
            SYMPTOM: queueData.CHIEF_COMPLAINT || '',
            STATUS1: 'ทำงานอยู่',

            // ✅ ข้อมูลผู้ป่วยจาก Queue พร้อมบัตร
            patientInfo: {
                HNCODE: queueData.HNCODE,
                PRENAME: queueData.PRENAME,
                NAME1: queueData.NAME1,
                SURNAME: queueData.SURNAME,
                AGE: queueData.AGE,
                SEX: queueData.SEX,
                TEL1: queueData.TEL1,
                // ✅ เพิ่มข้อมูลบัตรจากคิว
                SOCIAL_CARD: queueData.SOCIAL_CARD,
                UCS_CARD: queueData.UCS_CARD
            },

            // ✅ เริ่มต้นด้วยข้อมูลหัตถการว่าง
            procedures: []
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

    // ✅ เพิ่มฟังก์ชันสำหรับจัดการหัตถการพิเศษ
    static getProcedureStatistics(procedures) {
        if (!Array.isArray(procedures)) return null;

        const stats = {
            total: procedures.length,
            custom: 0,
            standard: 0,
            categories: {}
        };

        procedures.forEach(proc => {
            if (this.isCustomProcedureCode(proc.MEDICAL_PROCEDURE_CODE || proc.PROCEDURE_CODE)) {
                stats.custom++;
            } else {
                stats.standard++;
            }

            const category = proc.MED_PRO_TYPE || proc.CATEGORY || 'ไม่ระบุ';
            stats.categories[category] = (stats.categories[category] || 0) + 1;
        });

        return stats;
    }

    // ✅ ค้นหาหัตถการที่คล้ายกัน
    static findSimilarProcedures(procedureName, existingProcedures = []) {
        if (!procedureName || !Array.isArray(existingProcedures)) return [];

        const searchTerm = procedureName.toLowerCase();
        return existingProcedures.filter(proc => {
            const name = (proc.MED_PRO_NAME_THAI || proc.PROCEDURE_NAME || '').toLowerCase();
            return name.includes(searchTerm) || searchTerm.includes(name);
        });
    }

    // ✅ สร้างรายงานหัตถการ
    static generateProcedureReport(treatments) {
        const allProcedures = [];

        treatments.forEach(treatment => {
            if (treatment.procedures && Array.isArray(treatment.procedures)) {
                treatment.procedures.forEach(proc => {
                    allProcedures.push({
                        ...proc,
                        VNO: treatment.VNO,
                        patientName: `${treatment.PRENAME || ''} ${treatment.NAME1} ${treatment.SURNAME || ''}`.trim(),
                        treatmentDate: treatment.RDATE,
                        isCustom: this.isCustomProcedureCode(proc.MEDICAL_PROCEDURE_CODE)
                    });
                });
            }
        });

        const stats = this.getProcedureStatistics(allProcedures);

        return {
            procedures: allProcedures,
            statistics: stats,
            summary: {
                totalTreatments: treatments.length,
                treatmentsWithProcedures: treatments.filter(t => t.procedures && t.procedures.length > 0).length,
                averageProceduresPerTreatment: allProcedures.length / treatments.length,
                customProcedurePercentage: stats ? (stats.custom / stats.total * 100).toFixed(1) + '%' : '0%'
            }
        };
    }

    // ฟังก์ชันใหม่ที่ต้องเพิ่มใน treatmentService.js

    // อัพเดทข้อมูลการชำระเงิน
    static async updatePaymentStatus(vno, paymentData) {
        try {
            console.log('💰 Updating payment status for VNO:', vno, paymentData);

            const updateData = {
                TOTAL_AMOUNT: paymentData.totalAmount,
                DISCOUNT_AMOUNT: paymentData.discountAmount || 0,
                NET_AMOUNT: paymentData.netAmount,
                PAYMENT_STATUS: 'ชำระเงินแล้ว',
                PAYMENT_DATE: getCurrentDateForDB(),
                PAYMENT_TIME: getCurrentTimeForDB(),
                PAYMENT_METHOD: paymentData.paymentMethod || 'เงินสด',
                RECEIVED_AMOUNT: paymentData.receivedAmount,
                CHANGE_AMOUNT: paymentData.changeAmount,
                CASHIER: paymentData.cashier || 'SYSTEM',
                STATUS1: 'ชำระเงินแล้ว'
            };

            const response = await fetch(`${API_BASE_URL}/treatments/${vno}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // ดึงสถิติรายรับ
    static async getRevenueStats(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);

            const url = `${API_BASE_URL}/treatments/stats/revenue${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            throw error;
        }
    }

    // คำนวณยอดรวมจากรายละเอียดการรักษา
    static calculateTreatmentTotal(treatmentData) {
        let total = 0;

        // คำนวณจากยา
        if (treatmentData.drugs && Array.isArray(treatmentData.drugs)) {
            total += treatmentData.drugs.reduce((sum, drug) => {
                return sum + (parseFloat(drug.AMT) || 0);
            }, 0);
        }

        // คำนวณจากหัตถการ
        if (treatmentData.procedures && Array.isArray(treatmentData.procedures)) {
            total += treatmentData.procedures.reduce((sum, proc) => {
                return sum + (parseFloat(proc.AMT) || 0);
            }, 0);
        }

        // คำนวณจากการตรวจ Lab (ราคาคงที่ 100)
        if (treatmentData.labTests && Array.isArray(treatmentData.labTests)) {
            total += treatmentData.labTests.length * 100;
        }

        // คำนวณจากการตรวจเอ็กซเรย์ (ราคาคงที่ 200)
        if (treatmentData.radiologicalTests && Array.isArray(treatmentData.radiologicalTests)) {
            total += treatmentData.radiologicalTests.length * 200;
        }

        return total;
    }

    // ประมวลผลการชำระเงิน
    static async processPayment(vno, paymentInfo) {
        try {
            console.log('💳 Processing payment for VNO:', vno, paymentInfo);

            const netAmount = paymentInfo.totalAmount - (paymentInfo.discount || 0);
            const changeAmount = paymentInfo.receivedAmount - netAmount;

            const paymentData = {
                totalAmount: paymentInfo.totalAmount,
                discountAmount: paymentInfo.discount || 0,
                netAmount: netAmount,
                paymentMethod: paymentInfo.paymentMethod || 'เงินสด',
                receivedAmount: paymentInfo.receivedAmount,
                changeAmount: changeAmount,
                cashier: paymentInfo.cashier || 'SYSTEM'
            };

            return await this.updatePaymentStatus(vno, paymentData);
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    // ฟอร์แมทเงินเป็นสกุลไทย
    static formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    // ตัวเลือกสถานะการชำระเงิน
    static getPaymentStatuses() {
        return [
            { value: 'รอชำระ', label: 'รอชำระ', color: 'warning' },
            { value: 'ชำระเงินแล้ว', label: 'ชำระเงินแล้ว', color: 'success' },
            { value: 'ยกเลิก', label: 'ยกเลิก', color: 'error' }
        ];
    }

    // ✅ คำนวณยอดรวมจากข้อมูล editablePrices (ใช้ใน frontend)
    static calculateTotalFromEditablePrices(editablePrices) {
        if (!editablePrices) return 0;

        const labTotal = editablePrices.labs ?
            editablePrices.labs.reduce((sum, item) => sum + (item.editablePrice || 0), 0) : 0;

        const procedureTotal = editablePrices.procedures ?
            editablePrices.procedures.reduce((sum, item) => sum + (item.editablePrice || 0), 0) : 0;

        const drugTotal = editablePrices.drugs ?
            editablePrices.drugs.reduce((sum, item) => sum + (item.editablePrice || 0), 0) : 0;

        return labTotal + procedureTotal + drugTotal;
    }

    // ✅ สร้างข้อมูลการชำระเงินจาก editablePrices
    static createPaymentDataFromEditablePrices(editablePrices, paymentInfo) {
        // ✅ คำนวณยอดรวมจาก editablePrices (ยังไม่รวม TREATMENT_FEE)
        const baseTotal = this.calculateTotalFromEditablePrices(editablePrices);

        // ✅ เพิ่ม TREATMENT_FEE เข้าไปในยอดรวมก่อนหักส่วนลด
        const treatmentFee = parseFloat(paymentInfo.treatmentFee !== undefined && paymentInfo.treatmentFee !== null ? paymentInfo.treatmentFee : 100.00);
        const totalAmount = baseTotal + treatmentFee;

        // ✅ หักส่วนลดจากยอดรวมที่รวม TREATMENT_FEE แล้ว
        const discount = parseFloat(paymentInfo.discount || 0);
        const netAmount = Math.max(0, totalAmount - discount);

        const receivedAmount = parseFloat(paymentInfo.receivedAmount || 0);
        const changeAmount = Math.max(0, receivedAmount - netAmount);

        return {
            TOTAL_AMOUNT: totalAmount, // ✅ รวม TREATMENT_FEE แล้ว
            TREATMENT_FEE: treatmentFee, // ✅ บันทึกค่ารักษาแยก
            DISCOUNT_AMOUNT: discount,
            NET_AMOUNT: netAmount, // ✅ ยอดชำระสุทธิหลังหักส่วนลด
            PAYMENT_STATUS: 'ชำระเงินแล้ว',
            PAYMENT_DATE: getCurrentDateForDB(),
            PAYMENT_TIME: getCurrentTimeForDB(),
            PAYMENT_METHOD: paymentInfo.paymentMethod || 'เงินสด',
            RECEIVED_AMOUNT: receivedAmount,
            CHANGE_AMOUNT: changeAmount,
            CASHIER: paymentInfo.cashier || 'PAYMENT_SYSTEM',
            STATUS1: 'ชำระเงินแล้ว'
        };
    }

    // ✅ แก้ไข processPayment ให้ใช้ updateTreatment
    static async processPayment(vno, editablePrices, paymentInfo) {
        try {
            console.log('💳 Processing payment for VNO:', vno, { editablePrices, paymentInfo });

            // สร้างข้อมูลการชำระเงิน
            const paymentData = this.createPaymentDataFromEditablePrices(editablePrices, paymentInfo);

            console.log('💰 Payment data created:', paymentData);

            // อัปเดต treatment record พร้อมข้อมูลการชำระเงิน
            return await this.updateTreatment(vno, paymentData);

        } catch (error) {
            console.error('❌ Error processing payment:', error);
            throw error;
        }
    }

    // ✅ ตรวจสอบสถานะการชำระเงิน
    static isPaymentCompleted(treatment) {
        return treatment.PAYMENT_STATUS === 'ชำระเงินแล้ว' ||
            treatment.STATUS1 === 'ชำระเงินแล้ว';
    }

    // ✅ ดึงข้อมูลการรักษาที่รอชำระเงิน
    static async getUnpaidTreatments(params = {}) {
        try {
            const allParams = {
                ...params,
                status: 'เสร็จแล้ว' // เฉพาะที่รักษาเสร็จแล้ว
            };

            const response = await this.getAllTreatments(allParams);

            if (response.success && response.data) {
                // กรองเฉพาะที่ยังไม่ชำระเงิน
                const unpaidTreatments = response.data.filter(treatment =>
                    !this.isPaymentCompleted(treatment)
                );

                return {
                    ...response,
                    data: unpaidTreatments
                };
            }

            return response;
        } catch (error) {
            console.error('Error fetching unpaid treatments:', error);
            throw error;
        }
    }

    // ✅ สร้างข้อมูลสำหรับใบเสร็จ
    static createReceiptData(patient, editablePrices, paymentInfo) {
        const items = [
            ...editablePrices.labs.map(item => ({
                name: item.LABNAME || item.LABCODE || "การตรวจ",
                quantity: 1,
                unit: "ครั้ง",
                price: item.editablePrice || 0
            })),
            ...editablePrices.procedures.map(item => ({
                name: item.MED_PRO_NAME_THAI || item.PROCEDURE_NAME || item.MEDICAL_PROCEDURE_CODE || "หัตถการ",
                quantity: 1,
                unit: "ครั้ง",
                price: item.editablePrice || 0
            })),
            ...editablePrices.drugs.map(item => ({
                name: item.GENERIC_NAME || item.DRUG_CODE || "ยา",
                quantity: item.QTY || 1,
                unit: item.UNIT_CODE || "เม็ด",
                price: item.editablePrice || 0
            }))
        ];

        const totalAmount = this.calculateTotalFromEditablePrices(editablePrices);
        const discount = parseFloat(paymentInfo.discount || 0);
        const netAmount = Math.max(0, totalAmount - discount);
        const receivedAmount = parseFloat(paymentInfo.receivedAmount || 0);
        const changeAmount = Math.max(0, receivedAmount - netAmount);

        return {
            patient: {
                vno: patient.VNO,
                hn: patient.HNCODE,
                name: `${patient.PRENAME || ''} ${patient.NAME1} ${patient.SURNAME || ''}`.trim(),
                age: patient.AGE,
                sex: patient.SEX
            },
            items: items,
            summary: {
                totalAmount: totalAmount,
                discount: discount,
                netAmount: netAmount,
                paymentMethod: paymentInfo.paymentMethod || 'เงินสด',
                receivedAmount: receivedAmount,
                changeAmount: changeAmount
            },
            datetime: {
                date: getCurrentDateForDisplay(),
                time: getCurrentTimeForDisplay()
            }
        };
    }

    // ✅ ดึงข้อมูลผู้ป่วยที่ชำระเงินในช่วงวันที่กำหนด พร้อมรายละเอียดครบถ้วน
    // ✅ ดึงข้อมูลผู้ป่วยที่ชำระเงินในช่วงวันที่กำหนด พร้อมรายละเอียดครบถ้วน (Optimized Bulk Fetch)
    static async getPaidTreatmentsWithDetails(params = {}) {
        try {
            console.log('📊 Fetching paid treatments with full details (Bulk Optimized):', params);

            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.status) queryParams.append('status', params.status);
            if (params.emp_code) queryParams.append('emp_code', params.emp_code);
            if (params.hnno) queryParams.append('hnno', params.hnno);

            // Allow overriding payment_status (default to 'ชำระเงินแล้ว')
            if (params.payment_status !== undefined) {
                if (params.payment_status !== 'all' && params.payment_status !== '') {
                    queryParams.append('payment_status', params.payment_status);
                }
            } else {
                queryParams.append('payment_status', 'ชำระเงินแล้ว');
            }

            // Call the new optimized endpoint
            const url = `${API_BASE_URL}/treatments/reports/bulk-details?${queryParams.toString()}`;
            console.log('🔗 Calling Optimized API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            console.log(`✅ Retrieved ${result.count} detailed paid treatments (Bulk)`);

            return {
                success: true,
                data: result.data || [],
                pagination: {
                    page: parseInt(params.page) || 1,
                    limit: parseInt(params.limit) || 100000,
                    total: result.count || 0
                }
            };
        } catch (error) {
            console.error('❌ Error fetching paid treatments with details:', error);
            throw error;
        }
    }

    // ✅ ดึงสถิติรายรับพร้อมรายละเอียดการรักษา
    static async getRevenueStatsWithDetails(params = {}) {
        try {
            console.log('📈 Fetching revenue stats with treatment details:', params);

            // ดึงสถิติพื้นฐาน
            const statsResponse = await this.getRevenueStats(params);

            // ดึงรายละเอียดการรักษา
            const treatmentsResponse = await this.getPaidTreatmentsWithDetails(params);

            if (!statsResponse.success || !treatmentsResponse.success) {
                throw new Error('Failed to fetch complete data');
            }

            return {
                success: true,
                data: {
                    ...statsResponse.data,
                    treatments: treatmentsResponse.data || []
                }
            };

        } catch (error) {
            console.error('❌ Error fetching revenue stats with details:', error);
            throw error;
        }
    }

    // ดึงการรักษาที่ชำระเงินแล้ว - รองรับ filter หมอและผู้ป่วย
    static async getPaidTreatments(params = {}) {
        try {
            console.log('💰 Fetching paid treatments:', params);

            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.status) queryParams.append('status', params.status); // ✅ Add status filter

            // เพิ่มการส่งพารามิเตอร์ filter หมอและผู้ป่วย
            if (params.emp_code) queryParams.append('emp_code', params.emp_code);
            if (params.hnno) queryParams.append('hnno', params.hnno);

            // ✅ Allow overriding payment_status (default to 'ชำระเงินแล้ว' if not provided)
            if (params.payment_status !== undefined) {
                if (params.payment_status !== 'all' && params.payment_status !== '') {
                    queryParams.append('payment_status', params.payment_status);
                }
            } else {
                queryParams.append('payment_status', 'ชำระเงินแล้ว');
            }

            const url = `${API_BASE_URL}/treatments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('API URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // ✅ Return data directly (client-side filtering removed to support "all" status)
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    pagination: result.pagination
                };
            }

            return result;
        } catch (error) {
            console.error('Error fetching paid treatments:', error);
            throw error;
        }
    }

    static getPatientRight(patient) {
        // ตรวจสอบจากข้อมูลผู้ป่วยโดยตรง หรือจาก treatment
        const socialCard = patient?.PATIENT_SOCIAL_CARD || patient?.SOCIAL_CARD || patient?.treatment?.SOCIAL_CARD || 'N';
        const ucsCard = patient?.PATIENT_UCS_CARD || patient?.UCS_CARD || patient?.treatment?.UCS_CARD || 'N';

        if (socialCard === 'Y') {
            return {
                code: 'SOCIAL',
                name: '🏢 ประกันสังคม',
                color: '#1976d2',
                bgColor: '#e3f2fd'
            };
        } else if (ucsCard === 'Y') {
            return {
                code: 'UCS',
                name: '🏥 บัตรทอง (สปสช.)',
                color: '#2e7d32',
                bgColor: '#e8f5e9'
            };
        } else {
            return {
                code: 'SELF',
                name: '💰 จ่ายเอง',
                color: '#f57c00',
                bgColor: '#fff3e0'
            };
        }
    }

    // ลบข้อมูลการรักษา
    static async deleteTreatment(vno) {
        try {
            console.log('🗑️ Deleting treatment:', vno);
            const response = await fetch(`${API_BASE_URL}/treatments/${vno}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting treatment:', error);
            throw error;
        }
    }

    // ยกเลิกการรักษา (เปลี่ยน STATUS1 เป็น "ยกเลิก")
    static async cancelTreatment(vno) {
        try {
            console.log('❌ Canceling treatment:', vno);
            const response = await fetch(`${API_BASE_URL}/treatments/${vno}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    STATUS1: 'ยกเลิก'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error canceling treatment:', error);
            throw error;
        }
    }

    // ✅ เช็คจำนวนครั้งที่ใช้สิทธิ์บัตรทองในเดือนนี้
    static async checkUCSUsageThisMonth(hncode) {
        try {
            if (!hncode) {
                return {
                    success: false,
                    message: 'กรุณาระบุ HNCODE'
                };
            }

            const response = await fetch(`${API_BASE_URL}/treatments/check/ucs-usage/${hncode}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking UCS usage:', error);
            return {
                success: false,
                message: 'เกิดข้อผิดพลาดในการเช็คจำนวนครั้งที่ใช้สิทธิ์บัตรทอง',
                error: error.message,
                data: {
                    usageCount: 0,
                    isExceeded: false
                }
            };
        }
    }
}

export default TreatmentService;