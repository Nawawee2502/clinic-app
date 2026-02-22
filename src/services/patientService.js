// services/patientService.js - แก้ไข API_BASE_URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class PatientService {
    // ดึงข้อมูลผู้ป่วยทั้งหมด (จาก DB จริง) - รองรับ pagination
    static async getAllPatients(page = 1, limit = 50) {
        try {
            const url = `${API_BASE_URL}/patients?page=${page}&limit=${limit}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ป่วยตาม HN (จาก DB จริง)
    static async getPatientByHN(hn) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients/${hn}`);
            const response = await fetch(`${API_BASE_URL}/patients/${hn}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    }

    // ค้นหาผู้ป่วย (จาก DB จริง)
    static async searchPatients(searchTerm, page = 1, limit = 50) {
        try {
            const url = `${API_BASE_URL}/patients/search/${encodeURIComponent(searchTerm)}?page=${page}&limit=${limit}`;
            console.log('🔗 Calling API:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching patients:', error);
            throw error;
        }
    }

    // สร้างผู้ป่วยใหม่
    static async createPatient(patientData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients`);
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    // เชื่อมข้อมูลผู้ป่วยกับ Vital Signs จาก Treatment
    static async getPatientWithVitals(hncode) {
        try {
            console.log('🔍 Getting patient with vitals for HN:', hncode);

            // ดึงข้อมูลผู้ป่วย
            const patientResponse = await this.getPatientByHN(hncode);

            if (!patientResponse.success) {
                throw new Error('Patient not found');
            }

            const patient = patientResponse.data;
            console.log('✅ Patient data loaded:', patient.HNCODE);

            // ลองดึงข้อมูล Treatment ล่าสุด (ถ้ามี)
            try {
                const TreatmentService = await import('./treatmentService');
                console.log('🔍 Fetching latest treatment for patient...');

                const treatmentResponse = await TreatmentService.default.getTreatmentsByPatient(hncode, { limit: 1 });

                if (treatmentResponse.success && treatmentResponse.data.length > 0) {
                    const latestTreatment = treatmentResponse.data[0];
                    console.log('✅ Latest treatment found:', latestTreatment.VNO);

                    // ดึงรายละเอียดการรักษาล่าสุด
                    const detailResponse = await TreatmentService.default.getTreatmentByVNO(latestTreatment.VNO);

                    if (detailResponse.success) {
                        const treatmentDetail = detailResponse.data.treatment;
                        console.log('✅ Treatment details loaded');

                        // ✅ รวมข้อมูล Vital Signs + SOCIAL_CARD + UCS_CARD
                        return {
                            ...patient,
                            WEIGHT1: treatmentDetail.WEIGHT1 || patient.WEIGHT1,
                            HIGHT1: treatmentDetail.HIGHT1 || patient.HIGH1,
                            BT1: treatmentDetail.BT1,
                            BP1: treatmentDetail.BP1,
                            BP2: treatmentDetail.BP2,
                            RR1: treatmentDetail.RR1,
                            PR1: treatmentDetail.PR1,
                            SPO2: treatmentDetail.SPO2,
                            SYMPTOM: treatmentDetail.SYMPTOM,
                            VNO: treatmentDetail.VNO,
                            // ✅ เพิ่มข้อมูลบัตร
                            SOCIAL_CARD: patient.SOCIAL_CARD,
                            UCS_CARD: patient.UCS_CARD
                        };
                    }
                } else {
                    console.log('⚠️ No treatment history found for patient');
                }
            } catch (treatmentError) {
                console.log('⚠️ Could not load treatment history:', treatmentError.message);
            }

            // ✅ ส่งคืนข้อมูลผู้ป่วยพร้อมบัตร
            console.log('✅ Returning patient data without vitals');
            return {
                ...patient,
                SOCIAL_CARD: patient.SOCIAL_CARD,
                UCS_CARD: patient.UCS_CARD
            };

        } catch (error) {
            console.error('Error getting patient with vitals:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ป่วยจากคิววันนี้ (เชื่อมกับ QueueService)
    static async getTodayPatientsFromQueue() {
        try {
            // Import QueueService dynamically to avoid circular dependency
            const QueueService = await import('./queueService');
            const queueResponse = await QueueService.default.getTodayQueue();

            if (!queueResponse.success) {
                throw new Error('Failed to fetch today queue');
            }

            // แปลงข้อมูลจากคิวให้เป็นรูปแบบที่ component ใช้งานได้
            const patientsWithQueue = queueResponse.data.map(queueItem => ({
                // ข้อมูลคิว
                queueNumber: queueItem.QUEUE_NUMBER,
                queueTime: queueItem.QUEUE_TIME,
                queueStatus: queueItem.STATUS,
                queueType: queueItem.TYPE,
                queueId: queueItem.QUEUE_ID,

                // ข้อมูลผู้ป่วย
                HNCODE: queueItem.HNCODE,
                PRENAME: queueItem.PRENAME,
                NAME1: queueItem.NAME1,
                SURNAME: queueItem.SURNAME,
                AGE: queueItem.AGE,
                SEX: queueItem.SEX,
                TEL1: queueItem.TEL1,

                // ข้อมูล VN ถ้ามี
                VNO: queueItem.VNO,
                TREATMENT_STATUS: queueItem.TREATMENT_STATUS,

                // อาการเบื้องต้น
                SYMPTOM: queueItem.CHIEF_COMPLAINT,

                // Avatar placeholder
                avatar: this.generateAvatarUrl(queueItem.SEX, queueItem.NAME1),

                // ✅ เพิ่มข้อมูลบัตร
                SOCIAL_CARD: queueItem.SOCIAL_CARD,
                UCS_CARD: queueItem.UCS_CARD,

                // ✅ เพิ่มข้อมูลประวัติแพ้ยาและโรคประจำตัว
                DRUG_ALLERGY: queueItem.DRUG_ALLERGY || null,
                DISEASE1: queueItem.DISEASE1 || null,

                // ข้อมูลสำหรับ Vital Signs (ยังไม่มี จะได้จาก Treatment)
                WEIGHT1: queueItem.WEIGHT1 || null,
                HIGHT1: null,
                BT1: null,
                BP1: null,
                BP2: null,
                RR1: null,
                PR1: null,
                SPO2: null
            }));

            return {
                success: true,
                data: patientsWithQueue,
                count: patientsWithQueue.length
            };

        } catch (error) {
            console.error('Error fetching today patients from queue:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ป่วยจากคิวทั้งหมด (ไม่กรองตามวันที่)
    static async getAllPatientsFromQueue() {
        try {
            // Import QueueService dynamically to avoid circular dependency
            const QueueService = await import('./queueService');
            const queueResponse = await QueueService.default.getAllQueue();

            if (!queueResponse.success) {
                throw new Error('Failed to fetch all queue');
            }

            // แปลงข้อมูลจากคิวให้เป็นรูปแบบที่ component ใช้งานได้
            const patientsWithQueue = queueResponse.data.map(queueItem => {
                // Debug: ตรวจสอบ STATUS จาก backend
                console.log(`🔍 Queue Item ${queueItem.QUEUE_ID}: STATUS="${queueItem.STATUS}"`);

                // ✅ ใช้ STATUS1 จาก TREATMENT1 เป็นหลัก ถ้าไม่มีให้ใช้ STATUS จาก DAILY_QUEUE
                const finalStatus = queueItem.TREATMENT_STATUS || queueItem.STATUS || 'รอตรวจ';

                return {
                    // ข้อมูลคิว
                    queueNumber: queueItem.QUEUE_NUMBER,
                    queueTime: queueItem.QUEUE_TIME,
                    queueStatus: finalStatus, // ใช้ STATUS1 จาก TREATMENT1 เป็นหลัก
                    STATUS: queueItem.STATUS || 'รอตรวจ', // เก็บ STATUS จาก DAILY_QUEUE ไว้ด้วย
                    queueType: queueItem.TYPE,
                    queueId: queueItem.QUEUE_ID,
                    queueDate: queueItem.QUEUE_DATE,

                    // ข้อมูลผู้ป่วย
                    HNCODE: queueItem.HNCODE,
                    PRENAME: queueItem.PRENAME,
                    NAME1: queueItem.NAME1,
                    SURNAME: queueItem.SURNAME,
                    AGE: queueItem.AGE,
                    SEX: queueItem.SEX,
                    TEL1: queueItem.TEL1,

                    // ข้อมูล VN ถ้ามี
                    VNO: queueItem.VNO,
                    TREATMENT_STATUS: queueItem.TREATMENT_STATUS,
                    STATUS1: queueItem.TREATMENT_STATUS, // เก็บ STATUS1 ไว้ด้วย

                    // อาการเบื้องต้น
                    SYMPTOM: queueItem.CHIEF_COMPLAINT,

                    // Avatar placeholder
                    avatar: this.generateAvatarUrl(queueItem.SEX, queueItem.NAME1),

                    // ✅ เพิ่มข้อมูลบัตร
                    SOCIAL_CARD: queueItem.SOCIAL_CARD,
                    UCS_CARD: queueItem.UCS_CARD,
                    PATIENT_UCS_CARD: queueItem.PATIENT_UCS_CARD, // ✅ Live status from Patient table

                    // ✅ เพิ่มข้อมูลประวัติแพ้ยาและโรคประจำตัว
                    DRUG_ALLERGY: queueItem.DRUG_ALLERGY || null,
                    DISEASE1: queueItem.DISEASE1 || null,

                    // ข้อมูลสำหรับ Vital Signs (ยังไม่มี จะได้จาก Treatment)
                    WEIGHT1: queueItem.WEIGHT1 || null,
                    HIGHT1: null,
                    BT1: null,
                    BP1: null,
                    BP2: null,
                    RR1: null,
                    PR1: null,
                    SPO2: null
                };
            });

            return {
                success: true,
                data: patientsWithQueue,
                count: patientsWithQueue.length
            };

        } catch (error) {
            console.error('Error fetching all patients from queue:', error);
            throw error;
        }
        // ดึงข้อมูลผู้ป่วยสำหรับหน้าชำระเงิน (Optimized: No N+1 Loop)
    }
    static async getPaymentQueue() {
        try {
            // Import QueueService dynamically
            const QueueService = await import('./queueService');
            // ✅ ใช้ endpoint ใหม่ที่ดึงข้อมูลครบจบใน query เดียว (JOIN TREATMENT1 มาให้แล้ว)
            const queueResponse = await QueueService.default.getAllQueueWithPaymentStatus();

            if (!queueResponse.success) {
                throw new Error('Failed to fetch payment queue');
            }

            // แปลงข้อมูลจากคิวให้เป็นรูปแบบที่ component ใช้งานได้
            const patientsWithQueue = queueResponse.data.map(queueItem => {
                // Debug: ตรวจสอบ STATUS
                // console.log(`🔍 Payment Queue Item ${queueItem.QUEUE_ID}: STATUS="${queueItem.STATUS}"`);

                // ✅ ใช้ STATUS1 จาก TREATMENT1 เป็นหลัก (ซึ่ง Backend endpoint ใหม่ join มาให้แล้วในชื่อ TREATMENT_STATUS)
                const finalStatus = queueItem.TREATMENT_STATUS || queueItem.STATUS || 'รอตรวจ';

                return {
                    // ข้อมูลคิว
                    queueNumber: queueItem.QUEUE_NUMBER,
                    queueTime: queueItem.QUEUE_TIME,
                    queueStatus: finalStatus,
                    STATUS: queueItem.STATUS || 'รอตรวจ',
                    queueType: queueItem.TYPE,
                    queueId: queueItem.QUEUE_ID,
                    queueDate: queueItem.QUEUE_DATE,

                    // ข้อมูลผู้ป่วย
                    HNCODE: queueItem.HNCODE,
                    PRENAME: queueItem.PRENAME,
                    NAME1: queueItem.NAME1,
                    SURNAME: queueItem.SURNAME,
                    AGE: queueItem.AGE,
                    SEX: queueItem.SEX,
                    TEL1: queueItem.TEL1,

                    // ข้อมูล VN (มีค่าแล้วเพราะ join มาให้)
                    VNO: queueItem.VNO,
                    TREATMENT_STATUS: queueItem.TREATMENT_STATUS,
                    STATUS1: queueItem.TREATMENT_STATUS, // มีค่าแน่นอนถ้ามี Treatment

                    // ✅ ข้อมูลการชำระเงิน (จาก TREATMENT1 โดยตรง ไม่ต้องยิงแยก)
                    PAYMENT_STATUS: queueItem.PAYMENT_STATUS,
                    TOTAL_AMOUNT: queueItem.TOTAL_AMOUNT,
                    TREATMENT_FEE: queueItem.TREATMENT_FEE,

                    // อาการเบื้องต้น
                    SYMPTOM: queueItem.CHIEF_COMPLAINT,

                    // Avatar placeholder
                    avatar: this.generateAvatarUrl(queueItem.SEX, queueItem.NAME1),

                    // ✅ ข้อมูลบัตร (Priority: Treatment > Patient > Queue)
                    // - UCS_CARD (from Queue)
                    // - PATIENT_UCS_CARD (from Patient)
                    // - TREATMENT_UCS_CARD (from Treatment)
                    SOCIAL_CARD: queueItem.PATIENT_SOCIAL_CARD || queueItem.SOCIAL_CARD,
                    UCS_CARD: queueItem.TREATMENT_UCS_CARD || queueItem.PATIENT_UCS_CARD || queueItem.UCS_CARD,
                    PATIENT_UCS_CARD: queueItem.PATIENT_UCS_CARD,
                    EXTERNAL_UCS_COUNT: queueItem.EXTERNAL_UCS_COUNT,

                    // ✅ ข้อมูลประวัติแพ้ยาและโรคประจำตัว
                    DRUG_ALLERGY: queueItem.DRUG_ALLERGY || null,
                    DISEASE1: queueItem.DISEASE1 || null,

                    // ข้อมูลสำหรับ Vital Signs (ยังไม่มีใน endpoint นี้ แต่หน้า Payment ไม่ได้ใช้ vitals ใน list)
                    WEIGHT1: queueItem.WEIGHT1 || null,
                };
            });

            return {
                success: true,
                data: patientsWithQueue,
                count: patientsWithQueue.length
            };

        } catch (error) {
            console.error('Error fetching payment queue:', error);
            throw error;
        }
    }

    // ดึงข้อมูลนัดหมายวันนี้
    static async getTodayAppointments() {
        try {
            const QueueService = await import('./queueService');
            return await QueueService.default.getTodayAppointments();
        } catch (error) {
            console.error('Error fetching today appointments:', error);
            throw error;
        }
    }

    // Helper function for fetch with timeout and retry
    static async fetchWithTimeout(url, options = {}, timeout = 20000, retries = 2) {
        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            const controller = new AbortController();
            let timeoutId = null;

            try {
                timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                return response;
            } catch (error) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                lastError = error;

                // ถ้าเป็น AbortError (timeout) และยังมี retry อยู่ ให้ retry
                if (error.name === 'AbortError' && attempt < retries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }

                // ถ้าเป็น error อื่นๆ หรือหมด retry แล้ว ให้ throw
                if (attempt === retries) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }

        // Fallback: throw last error if somehow we got here
        throw lastError || new Error('Request failed after retries');
    }

    // อัพเดทข้อมูลผู้ป่วย
    static async updatePatient(hn, patientData) {
        try {
            if (!hn) {
                throw new Error('HN is required');
            }
            const safeHN = encodeURIComponent(hn.toString().trim());
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients/${safeHN}`);
            const response = await this.fetchWithTimeout(
                `${API_BASE_URL}/patients/${safeHN}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(patientData)
                },
                20000, // 20 second timeout
                2 // 2 retries
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating patient:', error);
            if (error.name === 'AbortError') {
                throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
            }
            throw error;
        }
    }

    // ลบผู้ป่วย
    static async deletePatient(hn) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients/${hn}`);
            const response = await fetch(`${API_BASE_URL}/patients/${hn}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }

    // ดึงสถิติผู้ป่วย
    static async getPatientStats() {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients/stats/basic`);
            const response = await fetch(`${API_BASE_URL}/patients/stats/basic`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient stats:', error);
            throw error;
        }
    }

    // ดึงผู้ป่วยตามจังหวัด
    static async getPatientsByProvince(provinceCode) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/patients/province/${provinceCode}`);
            const response = await fetch(`${API_BASE_URL}/patients/province/${provinceCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patients by province:', error);
            throw error;
        }
    }

    // สร้าง Avatar URL อัตโนมัติ
    static generateAvatarUrl(sex, name) {
        const maleAvatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        ];

        const femaleAvatars = [
            'https://images.unsplash.com/photo-1494790108755-2616b612b567?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        ];

        if (sex === 'หญิง' || sex === 'นาง' || sex === 'นางสาว') {
            const index = name ? name.length % femaleAvatars.length : 0;
            return femaleAvatars[index];
        } else {
            const index = name ? name.length % maleAvatars.length : 0;
            return maleAvatars[index];
        }
    }

    // ตรวจสอบความถูกต้องของข้อมูล
    static validatePatientData(data) {
        const errors = [];

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!data.HNCODE?.trim()) {
            errors.push('กรุณากรอกรหัส HN');
        }

        if (!data.NAME1?.trim()) {
            errors.push('กรุณากรอกชื่อ');
        }

        if (!data.SURNAME?.trim()) {
            errors.push('กรุณากรอกนามสกุล');
        }

        if (!data.IDNO?.trim()) {
            errors.push('กรุณากรอกเลขบัตรประชาชน');
        }

        // ตรวจสอบรูปแบบบัตรประชาชน/พาสปอร์ต
        if (data.IDNO) {
            const isPassport = data.ID_TYPE === 'PASSPORT';
            if (isPassport) {
                // พาสปอร์ต: จำกัดแค่ 13 ตัว ไม่จำกัดรูปแบบ
                if (data.IDNO.length > 13) {
                    errors.push('เลขที่พาสปอร์ตต้องไม่เกิน 13 ตัวอักษร');
                }
            } else {
                // บัตรประชาชน: ต้องเป็นตัวเลข 13 หลัก
                if (!/^\d{13}$/.test(data.IDNO.replace(/-/g, ''))) {
                    errors.push('รูปแบบเลขบัตรประชาชนไม่ถูกต้อง (ต้องเป็นตัวเลข 13 หลัก)');
                }
            }
        }

        // ตรวจสอบอีเมล
        if (data.EMAIL1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.EMAIL1)) {
            errors.push('รูปแบบอีเมลไม่ถูกต้อง');
        }

        // ตรวจสอบเบอร์โทรศัพท์
        if (data.TEL1 && !/^[\d\-\s\+\(\)]+$/.test(data.TEL1)) {
            errors.push('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
        }

        // ตรวจสอบอายุ (รองรับรูปแบบ "X เดือน" สำหรับเดือน หรือตัวเลขสำหรับปี)
        if (data.AGE) {
            const ageStr = data.AGE.toString();
            // ถ้าเป็นรูปแบบ "X เดือน" (เช่น "6 เดือน")
            if (ageStr.includes('เดือน')) {
                const months = parseInt(ageStr.replace(' เดือน', ''));
                if (isNaN(months) || months < 1 || months > 12) {
                    errors.push('อายุเป็นเดือนต้องอยู่ระหว่าง 1-12 เดือน');
                }
            } else {
                // ถ้าเป็นตัวเลข (ปี)
                const age = parseFloat(data.AGE);
                if (isNaN(age) || age < 0 || age > 150) {
                    errors.push('อายุต้องเป็นตัวเลขระหว่าง 0-150');
                }
            }
        }

        // ตรวจสอบน้ำหนัก
        if (data.WEIGHT1 && (isNaN(data.WEIGHT1) || data.WEIGHT1 < 0 || data.WEIGHT1 > 1000)) {
            errors.push('น้ำหนักต้องเป็นตัวเลขระหว่าง 0-1000 กิโลกรัม');
        }

        // ตรวจสอบส่วนสูง
        if (data.HIGH1 && (isNaN(data.HIGH1) || data.HIGH1 < 0 || data.HIGH1 > 300)) {
            errors.push('ส่วนสูงต้องเป็นตัวเลขระหว่าง 0-300 เซนติเมตร');
        }

        return errors;
    }

    // จัดรูปแบบข้อมูลก่อนส่ง API
    static formatPatientData(data) {
        return {
            // ฟิลด์หลัก
            HNCODE: (data.HNCODE || '').toString().trim(),
            IDNO: (data.IDNO || '').toString().replace(/-/g, ''), // เอาเครื่องหมาย - ออก
            PRENAME: (data.PRENAME || '').toString().trim(),
            NAME1: (data.NAME1 || '').toString().trim(),
            SURNAME: (data.SURNAME || '').toString().trim(),
            SEX: (data.SEX || '').toString().trim(),
            BDATE: (data.BDATE || '').toString().trim(),
            // ถ้า AGE เป็นรูปแบบ "X เดือน" (เช่น "6 เดือน") ให้แปลงเป็น 0 (อายุน้อยกว่า 1 ปี)
            // เพราะ database เก็บ AGE เป็น INT ไม่สามารถเก็บข้อมูลเดือนได้
            // ข้อมูลเดือนจะคำนวณจาก BDATE ใน frontend
            AGE: data.AGE ? (
                data.AGE.toString().includes('เดือน')
                    ? 0
                    : parseInt(data.AGE, 10)
            ) : 0,
            BLOOD_GROUP1: (data.BLOOD_GROUP1 || '').toString().trim(),
            OCCUPATION1: (data.OCCUPATION1 || '').toString().trim(),
            ORIGIN1: (data.ORIGIN1 || '').toString().trim(),
            NATIONAL1: (data.NATIONAL1 || '').toString().trim(),
            RELIGION1: (data.RELIGION1 || '').toString().trim(),
            STATUS1: (data.STATUS1 || '').toString().trim(),
            WEIGHT1: data.WEIGHT1 ? parseFloat(data.WEIGHT1) : 0,
            HIGH1: data.HIGH1 ? parseFloat(data.HIGH1) : 0,

            // ที่อยู่ตามบัตรประชาชน
            CARD_ADDR1: (data.CARD_ADDR1 || '').toString().trim(),
            CARD_TUMBOL_CODE: (data.CARD_TUMBOL_CODE || '').toString().trim(),
            CARD_AMPHER_CODE: (data.CARD_AMPHER_CODE || '').toString().trim(),
            CARD_PROVINCE_CODE: (data.CARD_PROVINCE_CODE || '').toString().trim(),

            // ที่อยู่ปัจจุบัน
            ADDR1: (data.useCardAddress ? data.CARD_ADDR1 : data.ADDR1 || '').toString().trim(),
            TUMBOL_CODE: (data.useCardAddress ? data.CARD_TUMBOL_CODE : data.TUMBOL_CODE || '').toString().trim(),
            AMPHER_CODE: (data.useCardAddress ? data.CARD_AMPHER_CODE : data.AMPHER_CODE || '').toString().trim(),
            PROVINCE_CODE: (data.useCardAddress ? data.CARD_PROVINCE_CODE : data.PROVINCE_CODE || '').toString().trim(),
            ZIPCODE: (data.useCardAddress ? data.CARD_ZIPCODE : data.ZIPCODE || '').toString().trim(),

            TEL1: (data.TEL1 || '').toString().trim(),
            EMAIL1: (data.EMAIL1 || '').toString().trim(),

            // ประวัติสุขภาพ
            DISEASE1: (data.DISEASE1 || '').toString().trim(),
            DRUG_ALLERGY: (data.DRUG_ALLERGY || '').toString().trim(),
            FOOD_ALLERGIES: (data.FOOD_ALLERGIES || '').toString().trim(),

            // ข้อมูลสิทธิ์การรักษา (คอลัมน์ใน DB เป็น NOT NULL และมีค่า default)
            TREATMENT_CARD: (data.TREATMENT_CARD || 'จ่ายเอง').toString().trim(),
            SOCIAL_CARD: (data.SOCIAL_CARD || 'N').toString().trim(),
            UCS_CARD: (data.UCS_CARD || 'N').toString().trim()
        };
    }

    // สร้าง HN อัตโนมัติ
    static generateHN() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-4);

        return `HN${year}${month}${day}${time}`;
    }

    // สร้างรายการ dropdown สำหรับเลือกผู้ป่วย
    static formatForDropdown(patients) {
        return patients.map(patient => ({
            value: patient.HNCODE,
            label: `${patient.HNCODE} - ${patient.PRENAME || ''} ${patient.NAME1} ${patient.SURNAME || ''}`.trim(),
            data: patient
        }));
    }

    // ส่งออกข้อมูลเป็น CSV
    static exportToCSV(patients) {
        const headers = [
            'HN', 'เลขบัตรประชาชน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'เพศ', 'อายุ',
            'เบอร์โทร', 'อีเมล', 'ที่อยู่', 'อาชีพ', 'สัญชาติ', 'ศาสนา'
        ];

        const rows = patients.map(p => [
            p.HNCODE,
            p.IDNO,
            p.PRENAME,
            p.NAME1,
            p.SURNAME,
            p.SEX,
            p.AGE,
            p.TEL1,
            p.EMAIL1,
            p.ADDR1,
            p.OCCUPATION1,
            p.NATIONAL1,
            p.RELIGION1
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field || ''}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // ดาวน์โหลดไฟล์ CSV
    static downloadCSV(patients, filename = 'patients') {
        const csvContent = this.exportToCSV(patients);
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

    // สร้างนัดหมายใหม่
    static async createAppointment(appointmentData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments`);
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    // แก้ไขนัดหมาย
    static async updateAppointment(appointmentId, appointmentData) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    // ลบนัดหมาย
    static async deleteAppointment(appointmentId) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    // อัพเดทสถานะนัดหมาย
    static async updateAppointmentStatus(appointmentId, status) {
        try {
            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/${appointmentId}/status`);
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
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
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }

    // ✅ ดึงนัดหมายของผู้ป่วยตาม HNCODE
    static async getPatientAppointments(hncode, params = {}) {
        try {
            const { page = 1, limit = 50, status } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (status) {
                queryParams.append('status', status);
            }

            console.log('🔗 Calling API:', `${API_BASE_URL}/appointments/patient/${hncode}?${queryParams}`);
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${hncode}?${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            throw error;
        }
    }
}

export default PatientService;