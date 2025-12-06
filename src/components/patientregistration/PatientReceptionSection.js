import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Autocomplete
} from "@mui/material";
import {
    Queue as QueueIcon,
    History as HistoryIcon,
    CheckCircle as CheckIcon,
    PersonAdd as PersonAddIcon
} from "@mui/icons-material";

// Import Services
import PatientService from "../../services/patientService";
import QueueService from "../../services/queueService";
import TreatmentService from "../../services/treatmentService";
import AppointmentService from "../../services/appointmentService";
import Swal from "sweetalert2";

const PatientReceptionSection = ({
    onRefresh,
    showSnackbar,
    newlyRegisteredPatient,
    onClearNewlyRegistered
}) => {
    const [loading, setLoading] = useState(false);
    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientLoading, setPatientLoading] = useState(false);
    const [vitalsLoading, setVitalsLoading] = useState(false);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    
    // ✅ เพิ่ม useRef เพื่อป้องกันการเรียก function ซ้ำ
    const isProcessingRef = useRef(false);

    // Vitals State
    const [vitalsData, setVitalsData] = useState({
        WEIGHT1: '',
        HIGH1: '',  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
        BT1: '',
        BP1: '',
        BP2: '',
        RR1: '',
        PR1: '',
        SPO2: '',
        SYMPTOM: ''
    });

    // ✅ useEffect สำหรับจัดการผู้ป่วยที่เพิ่งลงทะเบียน
    useEffect(() => {
        if (newlyRegisteredPatient) {
            console.log('🎯 Auto selecting newly registered patient:', newlyRegisteredPatient);

            // ตั้งค่าผู้ป่วยที่เพิ่งลงทะเบียนให้เป็นผู้ป่วยที่เลือก
            setSelectedPatient(newlyRegisteredPatient);
            setPatientOptions([newlyRegisteredPatient]);

            // โหลด Vital Signs เดิม (ถ้ามี)
            loadPatientVitals(newlyRegisteredPatient.HNCODE);

            // แสดงข้อความแจ้งเตือน
            showSnackbar(`✅ เลือกผู้ป่วย ${newlyRegisteredPatient.PRENAME}${newlyRegisteredPatient.NAME1} ${newlyRegisteredPatient.SURNAME} เรียบร้อยแล้ว กรุณากรอก Vital Signs`, 'success');
        }
    }, [newlyRegisteredPatient]);

    // ✅ โหลดนัดหมายวันนี้
    useEffect(() => {
        loadTodayAppointments();
    }, []);

    const loadTodayAppointments = async () => {
        try {
            setLoadingAppointments(true);
            const response = await AppointmentService.getTodayAppointments();
            if (response.success) {
                // กรองเฉพาะนัดที่ยังไม่ได้เข้าคิว (status = 'นัดไว้' หรือ 'ยืนยันแล้ว')
                const activeAppointments = response.data.filter(apt => 
                    apt.STATUS === 'นัดไว้' || apt.STATUS === 'ยืนยันแล้ว'
                );
                setTodayAppointments(activeAppointments);
            }
        } catch (error) {
            console.error('Error loading today appointments:', error);
        } finally {
            setLoadingAppointments(false);
        }
    };

    // Search patients
    const handleSearchPatients = async (searchTerm) => {
        if (!searchTerm || searchTerm.length === 0) {
            setPatientOptions([]);
            return;
        }

        setPatientLoading(true);
        try {
            const response = await PatientService.searchPatients(searchTerm);

            if (response.success) {
                setPatientOptions(response.data);
            } else {
                showSnackbar('ไม่สามารถค้นหาผู้ป่วยได้: ' + response.message, 'error');
                setPatientOptions([]);
            }
        } catch (error) {
            console.error('Error searching patients:', error);
            showSnackbar('เกิดข้อผิดพลาดในการค้นหา', 'error');
            setPatientOptions([]);
        } finally {
            setPatientLoading(false);
        }
    };

    // ✅ แก้ไข: Select patient และโหลด Vital Signs เดิม
    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);

        // ✅ หากเป็นผู้ป่วยที่เพิ่งลงทะเบียน ให้เคลียร์สถานะ
        if (newlyRegisteredPatient && patient?.HNCODE === newlyRegisteredPatient.HNCODE) {
            onClearNewlyRegistered();
        }

        if (patient) {
            showSnackbar(`เลือกผู้ป่วย: ${patient.PRENAME} ${patient.NAME1} ${patient.SURNAME}`, 'success');

            // ✅ โหลด Vital Signs เดิมของผู้ป่วย
            await loadPatientVitals(patient.HNCODE);
        } else {
            // ถ้าไม่มีผู้ป่วย ให้เคลียร์ข้อมูล Vitals
            setVitalsData({
                WEIGHT1: '',
                HIGH1: '',  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
                BT1: '',
                BP1: '',
                BP2: '',
                RR1: '',
                PR1: '',
                SPO2: '',
                SYMPTOM: ''
            });
        }
    };

    // ✅ ฟังก์ชันโหลด Vital Signs เดิม
    // ✅ ฟังก์ชันโหลด Vital Signs เดิม - เฉพาะน้ำหนักและส่วนสูงเท่านั้น
    const loadPatientVitals = async (hncode) => {
        setVitalsLoading(true);

        try {
            console.log('🔍 Loading previous weight and height for HN:', hncode);

            // วิธีที่ 1: ลองดึงจาก Patient Service ก่อน
            const patientWithVitals = await PatientService.getPatientWithVitals(hncode);

            if (patientWithVitals && (patientWithVitals.WEIGHT1 || patientWithVitals.HIGH1)) {
                console.log('✅ Found weight/height from patient service:', patientWithVitals);

                setVitalsData(prev => ({
                    ...prev,
                    WEIGHT1: patientWithVitals.WEIGHT1 || '',
                    HIGH1: patientWithVitals.HIGH1 || '',  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
                    // เคลียร์ข้อมูลอื่นๆ ให้กรอกใหม่
                    BT1: '',
                    BP1: '',
                    BP2: '',
                    RR1: '',
                    PR1: '',
                    SPO2: '',
                    SYMPTOM: '' // เคลียร์อาการเดิม เพื่อให้กรอกใหม่
                }));

                showSnackbar('โหลดข้อมูลน้ำหนักและส่วนสูงเดิมสำเร็จ', 'info');
                return;
            }

            // วิธีที่ 2: ลองดึงจาก Treatment Service (ล่าสุด)
            try {
                const latestTreatment = await TreatmentService.getLatestTreatmentByHN(hncode);

                if (latestTreatment.success && latestTreatment.data) {
                    console.log('✅ Found weight/height from latest treatment:', latestTreatment.data);

                    const treatmentData = latestTreatment.data;
                    setVitalsData(prev => ({
                        ...prev,
                        WEIGHT1: treatmentData.WEIGHT1 || '',
                        HIGH1: treatmentData.HIGH1 || treatmentData.HIGHT1 || '',  // ✅ รองรับทั้งสอง format
                        // เคลียร์ข้อมูลอื่นๆ ให้กรอกใหม่
                        BT1: '',
                        BP1: '',
                        BP2: '',
                        RR1: '',
                        PR1: '',
                        SPO2: '',
                        SYMPTOM: '' // เคลียร์อาการเดิม
                    }));

                    showSnackbar('โหลดข้อมูลน้ำหนักและส่วนสูงจากการรักษาครั้งล่าสุดสำเร็จ', 'info');
                    return;
                }
            } catch (treatmentError) {
                console.log('⚠️ No treatment data found:', treatmentError.message);
            }

            // ถ้าไม่พบข้อมูลเลย - เคลียร์ทุกอย่าง
            console.log('🔍 No previous weight/height found, starting fresh');
            setVitalsData(prev => ({
                ...prev,
                WEIGHT1: '',
                HIGH1: '',
                BT1: '',
                BP1: '',
                BP2: '',
                RR1: '',
                PR1: '',
                SPO2: '',
                SYMPTOM: ''
            }));
            showSnackbar('ไม่พบข้อมูลน้ำหนักและส่วนสูงเดิม กรุณากรอกข้อมูลใหม่', 'warning');

        } catch (error) {
            console.error('❌ Error loading patient weight/height:', error);
            showSnackbar('ไม่สามารถโหลดข้อมูลน้ำหนักและส่วนสูงเดิมได้', 'error');

            // เคลียร์ข้อมูลทั้งหมดในกรณีเกิด error
            setVitalsData(prev => ({
                ...prev,
                WEIGHT1: '',
                HIGH1: '',
                BT1: '',
                BP1: '',
                BP2: '',
                RR1: '',
                PR1: '',
                SPO2: '',
                SYMPTOM: ''
            }));
        } finally {
            setVitalsLoading(false);
        }
    };

    // ✅ ฟังก์ชันเคลียร์ข้อมูล Vitals
    const clearVitalsData = () => {
        setVitalsData({
            WEIGHT1: '',
            HIGH1: '',  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
            BT1: '',
            BP1: '',
            BP2: '',
            RR1: '',
            PR1: '',
            SPO2: '',
            SYMPTOM: ''
        });
        showSnackbar('เคลียร์ข้อมูล Vital Signs แล้ว', 'info');
    };

    // Calculate BMI
    const calculateBMI = (weight, height) => {
        if (!weight || !height) return null;
        const heightM = height / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        let category = '';

        if (bmi < 18.5) category = 'ต่ำกว่าเกณฑ์';
        else if (bmi < 25) category = 'ปกติ';
        else if (bmi < 30) category = 'เกินเกณฑ์';
        else category = 'อ้วน';

        return { value: bmi, category };
    };

    // บันทึก Vital Signs และสร้างคิว + Treatment record
    const handleSaveVitalsAndCreateQueue = async () => {
        // ✅ ป้องกันการเรียกซ้ำทันที
        if (isProcessingRef.current || loading) {
            console.log('⚠️ Already processing, ignoring duplicate call');
            return;
        }

        if (!selectedPatient) {
            showSnackbar('กรุณาเลือกผู้ป่วยก่อน', 'error');
            return;
        }

        // ✅ ตั้งค่า flag เพื่อป้องกันการเรียกซ้ำ
        isProcessingRef.current = true;
        setLoading(true);

        try {
            // ✅ Step 0: ตรวจสอบว่า HN นี้มีอยู่ในคิวแล้วหรือยัง (ตรวจสอบใน database โดยตรง)
            console.log('🔍 Checking if patient already in queue:', selectedPatient.HNCODE);
            const allQueueResponse = await PatientService.getAllPatientsFromQueue();
            
            if (allQueueResponse.success) {
                // หาคิวที่มี HN นี้และยังไม่ปิดการรักษา
                const existingQueues = allQueueResponse.data.filter(patient => {
                    return patient.HNCODE === selectedPatient.HNCODE;
                });

                if (existingQueues.length > 0) {
                    // ตรวจสอบ STATUS1 ของแต่ละคิว
                    for (const queue of existingQueues) {
                        // ตรวจสอบ STATUS1 จาก TREATMENT_STATUS หรือ STATUS1
                        const status1 = queue.TREATMENT_STATUS || queue.STATUS1 || queue.queueStatus || '';
                        
                        // ถ้า STATUS1 = 'รอตรวจ', 'ทำงานอยู่', 'รอชำระเงิน', 'ชำระเงินแล้ว' -> ห้ามเพิ่ม
                        const blockedStatuses = ['รอตรวจ', 'ทำงานอยู่', 'รอชำระเงิน', 'ชำระเงินแล้ว'];
                        
                        if (blockedStatuses.includes(status1)) {
                            showSnackbar(
                                `⚠️ ผู้ป่วย HN: ${selectedPatient.HNCODE} มีอยู่ในคิวแล้ว (สถานะ: ${status1}) ไม่สามารถเพิ่มได้ กรุณารอให้ปิดการรักษาก่อน`,
                                'error'
                            );
                            setLoading(false);
                            isProcessingRef.current = false;
                            return;
                        }
                    }
                    // ถ้าทุกคิวมี STATUS1 = 'ปิดการรักษา' หรือไม่มี STATUS1 -> สามารถเพิ่มได้
                    console.log('✅ All existing queues are closed, can create new queue');
                }
            }

            // ✅ Step 0.5: เช็คสิทธิ์บัตรทอง - ถ้าใช้เกิน 2 ครั้งในเดือนนี้ให้แจ้งเตือน
            const ucsCard = selectedPatient?.UCS_CARD || 'N';
            if (ucsCard === 'Y') {
                const ucsUsageCheck = await TreatmentService.checkUCSUsageThisMonth(selectedPatient.HNCODE);
                
                if (ucsUsageCheck.success && ucsUsageCheck.data) {
                    const { usageCount, maxUsage, isExceeded, remainingUsage } = ucsUsageCheck.data;
                    
                    if (isExceeded) {
                        // ถ้าใช้เกิน 2 ครั้งแล้ว ให้แจ้งเตือนว่าต้องจ่ายเงิน
                        const confirmResult = await Swal.fire({
                            icon: 'warning',
                            title: '⚠️ ใช้สิทธิ์บัตรทองเกินกำหนด',
                            html: `
                                <div style="text-align: left; padding: 10px;">
                                    <p style="font-size: 16px; margin-bottom: 15px;">
                                        ผู้ป่วย HN: <strong>${selectedPatient.HNCODE}</strong> 
                                        (${selectedPatient.PRENAME}${selectedPatient.NAME1} ${selectedPatient.SURNAME})
                                    </p>
                                    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                        <strong>📊 สถิติการใช้สิทธิ์บัตรทองในเดือนนี้:</strong>
                                    </p>
                                    <ul style="font-size: 14px; color: #666; margin-left: 20px;">
                                        <li>ใช้แล้ว: <strong style="color: #f59e0b;">${usageCount} ครั้ง</strong></li>
                                        <li>จำกัด: ${maxUsage} ครั้งต่อเดือน</li>
                                    </ul>
                                    <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #ef4444;">
                                        <p style="font-size: 15px; color: #991b1b; margin: 0; font-weight: 600;">
                                            ⚠️ ใช้สิทธิ์เกินกำหนดแล้ว!<br/>
                                            การรักษาครั้งนี้จะคิดเงินตามปกติ
                                        </p>
                                    </div>
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'ดำเนินการต่อ (คิดเงินตามปกติ)',
                            cancelButtonText: 'ยกเลิก',
                            confirmButtonColor: '#f59e0b',
                            cancelButtonColor: '#64748b',
                            width: '600px'
                        });

                        if (!confirmResult.isConfirmed) {
                            setLoading(false);
                            isProcessingRef.current = false;
                            return;
                        }
                    } else if (remainingUsage === 0) {
                        // ถ้าใช้ครบ 2 ครั้งแล้ว แต่ยังไม่เกิน (ยังพอใช้ได้ 1 ครั้ง)
                        await Swal.fire({
                            icon: 'info',
                            title: '💡 ใช้สิทธิ์บัตรทองครั้งสุดท้าย',
                            html: `
                                <div style="text-align: left; padding: 10px;">
                                    <p style="font-size: 16px; margin-bottom: 15px;">
                                        ผู้ป่วย HN: <strong>${selectedPatient.HNCODE}</strong>
                                    </p>
                                    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                        <strong>📊 สถิติการใช้สิทธิ์บัตรทองในเดือนนี้:</strong>
                                    </p>
                                    <ul style="font-size: 14px; color: #666; margin-left: 20px;">
                                        <li>ใช้แล้ว: ${usageCount} ครั้ง</li>
                                        <li>จำกัด: ${maxUsage} ครั้งต่อเดือน</li>
                                        <li>เหลือ: <strong style="color: #059669;">${remainingUsage} ครั้ง</strong></li>
                                    </ul>
                                    <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #3b82f6;">
                                        <p style="font-size: 14px; color: #1e40af; margin: 0;">
                                            💡 นี่เป็นการใช้สิทธิ์ครั้งสุดท้ายในเดือนนี้<br/>
                                            ครั้งถัดไปจะต้องจ่ายเงินตามปกติ
                                        </p>
                                    </div>
                                </div>
                            `,
                            confirmButtonText: 'ตกลง',
                            confirmButtonColor: '#3b82f6',
                            width: '500px'
                        });
                    } else {
                        // ยังใช้ไม่ครบ ให้แจ้งจำนวนที่เหลือ
                        await Swal.fire({
                            icon: 'info',
                            title: '📊 สถิติการใช้สิทธิ์บัตรทอง',
                            html: `
                                <div style="text-align: left; padding: 10px;">
                                    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                        <strong>ผู้ป่วย HN:</strong> ${selectedPatient.HNCODE}
                                    </p>
                                    <ul style="font-size: 14px; color: #666; margin-left: 20px;">
                                        <li>ใช้แล้ว: ${usageCount} ครั้ง</li>
                                        <li>เหลือ: <strong style="color: #059669;">${remainingUsage} ครั้ง</strong></li>
                                    </ul>
                                </div>
                            `,
                            confirmButtonText: 'ตกลง',
                            confirmButtonColor: '#3b82f6',
                            width: '400px'
                        });
                    }
                }
            }

            // ✅ Step 1: ตรวจสอบอีกครั้งก่อนสร้างคิว (ป้องกัน race condition)
            const doubleCheckResponse = await PatientService.getAllPatientsFromQueue();
            if (doubleCheckResponse.success) {
                const existingActiveQueues = doubleCheckResponse.data.filter(patient => {
                    if (patient.HNCODE !== selectedPatient.HNCODE) return false;
                    const status1 = patient.TREATMENT_STATUS || patient.STATUS1 || patient.queueStatus || '';
                    const blockedStatuses = ['รอตรวจ', 'กำลังตรวจ', 'ทำงานอยู่', 'รอชำระเงิน', 'ชำระเงินแล้ว'];
                    return blockedStatuses.includes(status1);
                });

                if (existingActiveQueues.length > 0) {
                    showSnackbar(
                        `⚠️ ผู้ป่วย HN: ${selectedPatient.HNCODE} มีอยู่ในคิวแล้ว (คิวที่ ${existingActiveQueues[0].queueNumber || existingActiveQueues[0].QUEUE_NUMBER}) ไม่สามารถเพิ่มได้`,
                        'error'
                    );
                    setLoading(false);
                    isProcessingRef.current = false;
                    return;
                }
            }

            // ✅ Step 2: สร้างคิวพร้อมข้อมูลบัตร (เพิ่ม REQUEST_ID เพื่อป้องกันการเรียกซ้ำ)
            const requestId = `${selectedPatient.HNCODE}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const queueData = {
                HNCODE: selectedPatient.HNCODE,
                CHIEF_COMPLAINT: vitalsData.SYMPTOM || 'รับบริการทั่วไป',
                CREATED_BY: 'RECEPTION_SYSTEM',
                REQUEST_ID: requestId, // ✅ เพิ่ม REQUEST_ID เพื่อป้องกันการเรียกซ้ำ
                // ✅ เพิ่มข้อมูลบัตรที่นี่
                SOCIAL_CARD: selectedPatient.SOCIAL_CARD,
                UCS_CARD: selectedPatient.UCS_CARD
            };

            console.log('🏥 Creating queue with card info:', queueData);
            console.log('🔑 Request ID:', requestId);
            const queueResponse = await QueueService.createWalkInQueue(queueData);

            if (!queueResponse.success) {
                throw new Error('ไม่สามารถสร้างคิวได้: ' + queueResponse.message);
            }

            console.log('✅ Queue created:', queueResponse.data);

            // Step 3: สร้าง Treatment record พร้อม Vital Signs
            const vnNumber = TreatmentService.generateVNO();

            const treatmentData = {
                VNO: vnNumber,
                QUEUE_ID: queueResponse.data.QUEUE_ID,
                HNNO: selectedPatient.HNCODE,
                RDATE: new Date().toISOString().split('T')[0],

                // Vital Signs ที่กรอกในหน้ารับผู้ป่วย (ถ้าไม่กรอกจะส่งเป็น null)
                WEIGHT1: vitalsData.WEIGHT1 ? parseFloat(vitalsData.WEIGHT1) : null,
                HIGHT1: vitalsData.HIGH1 ? parseFloat(vitalsData.HIGH1) : null,
                BT1: vitalsData.BT1 ? parseFloat(vitalsData.BT1) : null,
                BP1: vitalsData.BP1 ? parseInt(vitalsData.BP1) : null,
                BP2: vitalsData.BP2 ? parseInt(vitalsData.BP2) : null,
                RR1: vitalsData.RR1 ? parseInt(vitalsData.RR1) : null,
                PR1: vitalsData.PR1 ? parseInt(vitalsData.PR1) : null,
                SPO2: vitalsData.SPO2 ? parseInt(vitalsData.SPO2) : null,
                SYMPTOM: vitalsData.SYMPTOM || 'รับบริการทั่วไป',

                // ข้อมูลพื้นฐาน
                EMP_CODE: 'DOC001',
                STATUS1: 'ทำงานอยู่'
            };

            console.log('💊 Creating treatment record with vitals...');
            const treatmentResponse = await TreatmentService.createTreatmentWithQueue(treatmentData, queueResponse.data.QUEUE_ID);

            if (!treatmentResponse.success) {
                console.warn('⚠️ Failed to create treatment record, but queue is created');
                showSnackbar(`สร้างคิวสำเร็จ! คิวที่ ${queueResponse.data.QUEUE_NUMBER} (แต่ยังไม่ได้บันทึก Vital Signs)`, 'warning');
            } else {
                console.log('✅ Treatment record created with vitals');
                const queueNumber = queueResponse.data.QUEUE_NUMBER;
                showSnackbar(`สร้างคิวสำเร็จ! คิวที่ ${queueNumber} | VN: ${vnNumber} (พร้อม Vital Signs)`, 'success');
            }

            // Step 4: Reset forms
            setVitalsData({
                WEIGHT1: '',
                HIGH1: '',
                BT1: '',
                BP1: '',
                BP2: '',
                RR1: '',
                PR1: '',
                SPO2: '',
                SYMPTOM: ''
            });
            setSelectedPatient(null);
            setPatientOptions([]);

            // ✅ เก็บข้อมูลไว้ก่อน reset เพื่อใช้ใน event
            const createdQueueData = {
                queueId: queueResponse.data.QUEUE_ID,
                queueNumber: queueResponse.data.QUEUE_NUMBER,
                hncode: selectedPatient.HNCODE
            };

            // Step 4: Reset forms ก่อน refresh
            setVitalsData({
                WEIGHT1: '',
                HIGH1: '',
                BT1: '',
                BP1: '',
                BP2: '',
                RR1: '',
                PR1: '',
                SPO2: '',
                SYMPTOM: ''
            });
            setSelectedPatient(null);
            setPatientOptions([]);

            // ✅ Delay refresh และ dispatch event เพื่อป้องกันการสร้างซ้ำ
            setTimeout(() => {
                // Refresh data
                onRefresh();

                // Dispatch event เพื่อแจ้งหน้าอื่นๆ ว่ามีการเพิ่มคิว
                window.dispatchEvent(new CustomEvent('queueAdded', {
                    detail: createdQueueData
                }));
            }, 500);

        } catch (error) {
            console.error('Error creating queue with vitals:', error);
            showSnackbar('เกิดข้อผิดพลาด: ' + error.message, 'error');
        } finally {
            setLoading(false);
            // ✅ Reset flag หลังเสร็จสิ้น (รอ 1 วินาทีเพื่อป้องกันการเรียกซ้ำ)
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 1000);
        }
    };

    // ✅ ฟังก์ชันเข้าคิวจากนัดหมาย
    const handleCheckInAppointment = async (appointment) => {
        try {
            setLoading(true);
            
            // เรียก API check-in appointment
            const response = await QueueService.checkInAppointment(appointment.APPOINTMENT_ID);
            
            if (response.success) {
                showSnackbar(`✅ เข้าคิวสำเร็จ! คิวที่ ${response.data.QUEUE_NUMBER} | VN: ${response.data.VNO}`, 'success');
                
                // อัพเดทสถานะนัดหมาย
                await AppointmentService.updateAppointmentStatus(appointment.APPOINTMENT_ID, 'เข้าพบแล้ว');
                
                // Refresh data
                loadTodayAppointments();
                onRefresh();
                
                // Dispatch event เพื่อแจ้งหน้าอื่นๆ ว่ามีการเพิ่มคิว
                window.dispatchEvent(new CustomEvent('queueAdded', {
                    detail: { 
                        queueId: response.data.QUEUE_ID,
                        queueNumber: response.data.QUEUE_NUMBER,
                        hncode: appointment.HNCODE
                    }
                }));
            } else {
                showSnackbar('ไม่สามารถเข้าคิวได้: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('Error checking in appointment:', error);
            showSnackbar('เกิดข้อผิดพลาด: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันแปลงวันที่
    const formatThaiDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            const buddhistYear = date.getFullYear() + 543;
            const monthNames = [
                'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
            ];
            const day = date.getDate();
            const month = monthNames[date.getMonth()];
            if (!day || !month || !buddhistYear) return '-';
            return `${day} ${month} ${buddhistYear}`;
        } catch (error) {
            return '-';
        }
    };

    const bmiInfo = calculateBMI(vitalsData.WEIGHT1, vitalsData.HIGH1);

    return (
        <Card>
            <CardContent>
                {/* Today's Appointments Section */}
                {todayAppointments.length > 0 && (
                    <Card sx={{ mb: 3, bgcolor: '#fff3cd', border: '2px solid #ffc107' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#856404', fontWeight: 'bold' }}>
                                    📅 นัดหมายวันนี้ ({todayAppointments.length} รายการ)
                                </Typography>
                                {loadingAppointments && <CircularProgress size={20} />}
                            </Box>
                            <Grid container spacing={2}>
                                {todayAppointments.map((appointment) => (
                                    <Grid item xs={12} sm={6} md={4} key={appointment.APPOINTMENT_ID}>
                                        <Card 
                                            sx={{ 
                                                bgcolor: 'white',
                                                border: '1px solid #ffc107',
                                                '&:hover': { boxShadow: 3 }
                                            }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                    <Avatar sx={{ bgcolor: '#ffc107', width: 40, height: 40 }}>
                                                        {appointment.NAME1?.charAt(0) || 'P'}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {appointment.PRENAME}{appointment.NAME1} {appointment.SURNAME}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            HN: {appointment.HNCODE}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Box sx={{ mt: 1, mb: 1.5 }}>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        ⏰ <strong>เวลา:</strong> {appointment.APPOINTMENT_TIME || '-'}
                                                    </Typography>
                                                    {appointment.DOCTOR_NAME && (
                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                            👨‍⚕️ <strong>แพทย์:</strong> {appointment.DOCTOR_NAME}
                                                        </Typography>
                                                    )}
                                                    {appointment.REASON && (
                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                            💊 <strong>เหตุผล:</strong> {appointment.REASON}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => handleCheckInAppointment(appointment)}
                                                    disabled={loading}
                                                    startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                                                    sx={{
                                                        bgcolor: '#28a745',
                                                        '&:hover': { bgcolor: '#218838' },
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    เข้าคิวแทน
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Search Section */}
                <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                            🔍 ค้นหาผู้ป่วย
                        </Typography>

                        {/* ✅ แสดงข้อความพิเศษหากมีผู้ป่วยที่เพิ่งลงทะเบียน */}
                        {newlyRegisteredPatient && (
                            <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                                <Typography variant="body2">
                                    🎉 <strong>ผู้ป่วยที่เพิ่งลงทะเบียน:</strong> {newlyRegisteredPatient.PRENAME}{newlyRegisteredPatient.NAME1} {newlyRegisteredPatient.SURNAME} (HN: {newlyRegisteredPatient.HNCODE})
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    ✅ ระบบได้เลือกผู้ป่วยให้อัตโนมัติแล้ว กรุณากรอก Vital Signs ด้านล่าง
                                </Typography>
                            </Alert>
                        )}

                        <Autocomplete
                            value={selectedPatient}
                            onChange={(event, newValue) => handleSelectPatient(newValue)}
                            onInputChange={(event, newInputValue) => {
                                handleSearchPatients(newInputValue);
                            }}
                            options={patientOptions}
                            loading={patientLoading}
                            getOptionLabel={(option) => `${option.PRENAME}${option.NAME1} ${option.SURNAME} (HN: ${option.HNCODE})`}
                            isOptionEqualToValue={(option, value) => option.HNCODE === value.HNCODE}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="ค้นหาด้วย HN, ชื่อ-นามสกุล, หรือเลขบัตรประชาชน"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {patientLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                                        {option.NAME1.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {option.PRENAME}{option.NAME1} {option.SURNAME}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            HN: {option.HNCODE} • อายุ {option.AGE} ปี • {option.SEX}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            📱 {option.TEL1}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            noOptionsText="ไม่พบข้อมูลผู้ป่วย"
                            loadingText="กำลังค้นหา..."
                        />

                        {/* แสดงผลการเลือก */}
                        {selectedPatient && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                <Typography variant="body2" color="primary" fontWeight="bold">
                                    ✅ เลือกผู้ป่วย: {selectedPatient.PRENAME}{selectedPatient.NAME1} {selectedPatient.SURNAME}
                                </Typography>
                                <Typography variant="caption">
                                    HN: {selectedPatient.HNCODE} • อายุ {selectedPatient.AGE} ปี • {selectedPatient.SEX}
                                </Typography>

                                {/* ✅ แสดงสถานะการโหลด Vitals */}
                                {vitalsLoading && (
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="caption" color="text.secondary">
                                            กำลังโหลดข้อมูล Vital Signs เดิม...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Selected Patient + Vitals */}
                {selectedPatient && (
                    <Card>
                        <CardContent>
                            {/* Patient Info */}
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2' }}>
                                            {selectedPatient.NAME1.charAt(0)}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6">
                                            {selectedPatient.PRENAME} {selectedPatient.NAME1} {selectedPatient.SURNAME}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            HN: {selectedPatient.HNCODE} • อายุ {selectedPatient.AGE} ปี • {selectedPatient.SEX}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            📱 {selectedPatient.TEL1}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* คำแนะนำสำคัญ */}
                            <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
                                <Typography variant="body2">
                                    🩺 <strong>Vital Signs ที่กรอกจะถูกส่งไปยังหน้าตรวจรักษาให้หมอดูอัตโนมัติ</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                    📋 ระบบจะโหลดข้อมูล Vital Signs เดิมมาให้อัตโนมัติ • VN Number จะถูกสร้างใหม่เมื่อบันทึก
                                </Typography>
                            </Alert>

                            {/* Vital Signs Form */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                                    🩺 Vital Signs (สัญญาณชีพ)
                                </Typography>

                                {/* ✅ ปุ่มเคลียร์ข้อมูล */}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearVitalsData}
                                    startIcon={<HistoryIcon />}
                                    sx={{ fontSize: '12px' }}
                                >
                                    เคลียร์ข้อมูล
                                </Button>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="น้ำหนัก (kg)"
                                        type="number"
                                        value={vitalsData.WEIGHT1}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, WEIGHT1: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 0, max: 1000, step: 0.1 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.WEIGHT1 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="ส่วนสูง (cm)"
                                        type="number"
                                        value={vitalsData.HIGH1}  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, HIGH1: e.target.value }))}  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 0, max: 300, step: 0.1 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.HIGH1 ? '#f0f8ff' : 'inherit'  // ✅ แก้ไขจาก HIGHT1 เป็น HIGH1
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="อุณหภูมิ (°C)"
                                        type="number"
                                        value={vitalsData.BT1}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, BT1: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 30, max: 45, step: 0.1 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.BT1 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="SpO2 (%)"
                                        type="number"
                                        value={vitalsData.SPO2}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, SPO2: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 0, max: 100 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.SPO2 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="ความดันตัวบน"
                                        type="number"
                                        value={vitalsData.BP1}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, BP1: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 50, max: 300 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.BP1 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="ความดันตัวล่าง"
                                        type="number"
                                        value={vitalsData.BP2}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, BP2: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 30, max: 200 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.BP2 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="อัตราการหายใจ"
                                        type="number"
                                        value={vitalsData.RR1}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, RR1: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 5, max: 60 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.RR1 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="ชีพจร (bpm)"
                                        type="number"
                                        value={vitalsData.PR1}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, PR1: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: 30, max: 200 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: vitalsData.PR1 ? '#f0f8ff' : 'inherit'
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* BMI Display */}
                                {bmiInfo && (
                                    <Grid item xs={12}>
                                        <Alert
                                            severity={bmiInfo.category === 'ปกติ' ? 'success' : 'warning'}
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            <Typography variant="body2">
                                                <strong>BMI: {bmiInfo.value}</strong> ({bmiInfo.category})
                                            </Typography>
                                        </Alert>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <TextField
                                        label="อาการเบื้องต้น / Chief Complaint"
                                        multiline
                                        rows={3}
                                        value={vitalsData.SYMPTOM}
                                        onChange={(e) => setVitalsData(prev => ({ ...prev, SYMPTOM: e.target.value }))}
                                        fullWidth
                                        placeholder="กรอกอาการเบื้องต้นของผู้ป่วยวันนี้..."
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={(e) => {
                                            // ✅ ป้องกันการกดซ้ำทันที
                                            if (loading || isProcessingRef.current) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            handleSaveVitalsAndCreateQueue();
                                        }}
                                        disabled={loading || isProcessingRef.current}
                                        startIcon={loading ? <CircularProgress size={20} /> : <QueueIcon />}
                                        sx={{
                                            borderRadius: '10px',
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            bgcolor: '#4caf50',
                                            '&:hover': { bgcolor: '#45a049' },
                                            '&:disabled': { bgcolor: '#a5d6a7', color: '#fff' }
                                        }}
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึก Vital Signs และสร้างคิว'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Instructions */}
                {!selectedPatient && (
                    <Alert severity="info" sx={{ borderRadius: '10px' }}>
                        <Typography variant="body1">
                            📋 ค้นหาผู้ป่วยเดิม ↑ ระบบจะโหลดข้อมูล Vital Signs เดิม ↑ แก้ไขหรือกรอกเพิ่มเติม ↑ สร้างคิว<br />
                            ข้อมูล Vital Signs จะถูกส่งไปยังหน้าตรวจรักษาโดยอัตโนมัติ
                        </Typography>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default PatientReceptionSection;