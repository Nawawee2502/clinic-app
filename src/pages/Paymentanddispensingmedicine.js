import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { Print as PrintIcon, Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";

// Import Services
import PatientService from "../services/patientService";
import TreatmentService from "../services/treatmentService";
import DrugService from "../services/drugService";
import Swal from "sweetalert2";

// Import Utilities
import {
  getCurrentDateForDB,
  getCurrentTimeForDB,
  getCurrentDateForDisplay,
  getCurrentTimeForDisplay
} from "../utils/dateTimeUtils";

// Import Components
import PatientQueueSidebar from "../components/Paymentanddispensingmedicine/PatientQueueSidebar";
import PatientInfoHeader from "../components/Paymentanddispensingmedicine/PatientInfoHeader";
import PaymentSummaryCard from "../components/Paymentanddispensingmedicine/PaymentSummaryCard";
import DrugsTable from "../components/Paymentanddispensingmedicine/DrugsTable";
import LabProceduresTable from "../components/Paymentanddispensingmedicine/LabProceduresTable";
import ReceiptPrint from "../components/Paymentanddispensingmedicine/ReceiptPrint";
import DrugLabelsPrint from "../components/Paymentanddispensingmedicine/DrugLabelsPrint";
import CloseCaseButton from "../components/Paymentanddispensingmedicine/CloseCaseButton";


const Paymentanddispensingmedicine = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentData, setTreatmentData] = useState(null);
  const [loadingTreatment, setLoadingTreatment] = useState(false);

  // State สำหรับแก้ไขราคา
  const [editablePrices, setEditablePrices] = useState({
    labs: [],
    procedures: [],
    drugs: []
  });
  const [editingItem, setEditingItem] = useState({ type: null, index: null });

  // Payment states
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'เงินสด',
    receivedAmount: '',
    discount: 0,
    treatmentFee: undefined, // ✅ ไม่ force default, จะตั้งค่าเมื่อโหลดข้อมูลผู้ป่วย
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // State สำหรับเก็บข้อมูลการใช้งานสิทธิ์บัตรทอง
  const [ucsUsageInfo, setUcsUsageInfo] = useState({
    isExceeded: false,
    usageCount: 0,
    maxUsage: 2,
    remainingUsage: 2
  });

  // โหลดข้อมูลผู้ป่วย
  useEffect(() => {
    loadCompletedPatients();

    // เพิ่ม Google Fonts Sarabun สำหรับฉลากยา preview
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Listen สำหรับ event เมื่อมีการเพิ่มคิวหรือเปลี่ยนสถานะ
    const handleQueueAdded = (event) => {
      console.log('🔄 Queue added event received, refreshing payment queue...');
      loadCompletedPatients(false); // ไม่แสดง loading spinner
    };

    const handleQueueStatusChanged = (event) => {
      console.log('🔄 Queue status changed event received, refreshing payment queue...');
      loadCompletedPatients(false); // ไม่แสดง loading spinner
    };

    window.addEventListener('queueAdded', handleQueueAdded);
    window.addEventListener('queueStatusChanged', handleQueueStatusChanged);

    return () => {
      // Cleanup: ลบ link tag เมื่อ component unmount (optional)
      const existingLink = document.querySelector(`link[href="${link.href}"]`);
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
      window.removeEventListener('queueAdded', handleQueueAdded);
      window.removeEventListener('queueStatusChanged', handleQueueStatusChanged);
    };
  }, []);

  // โหลดข้อมูลการรักษาเมื่อเปลี่ยนผู้ป่วย
  useEffect(() => {
    if (patients[selectedPatientIndex]) {
      loadTreatmentData(patients[selectedPatientIndex].VNO);
    }
  }, [selectedPatientIndex, patients]);

  // ✅ แจ้งเตือนแพ้ยาและโรคประจำตัว เมื่อเลือกผู้ป่วย
  useEffect(() => {
    const currentPatient = patients[selectedPatientIndex];
    if (currentPatient) {
      const allergy = currentPatient.DRUG_ALLERGY && currentPatient.DRUG_ALLERGY !== '-' ? currentPatient.DRUG_ALLERGY : null;
      const disease = currentPatient.DISEASE1 && currentPatient.DISEASE1 !== '-' ? currentPatient.DISEASE1 : null;

      if (allergy || disease) {
        let htmlContent = '<div style="text-align: left;">';
        if (allergy) {
          htmlContent += `<p style="color: #d32f2f; font-weight: bold; margin-bottom: 8px;">🚫 ประวัติแพ้ยา: ${allergy}</p>`;
        }
        if (disease) {
          htmlContent += `<p style="color: #1976d2; font-weight: bold;">🏥 โรคประจำตัว: ${disease}</p>`;
        }
        htmlContent += '</div>';

        // ใช้ setTimeout เล็กน้อยเพื่อให้แน่ใจว่าไม่ได้ชนกับ alert อื่นๆ
        setTimeout(() => {
          Swal.fire({
            title: '⚠️ แจ้งเตือนข้อมูลสำคัญ',
            html: htmlContent,
            icon: 'warning',
            confirmButtonText: 'รับทราบ',
            confirmButtonColor: '#d32f2f',
            timer: 5000,
            timerProgressBar: true
          });
        }, 100);
      }
    }
  }, [selectedPatientIndex, patients]); // เช็คเมื่อเปลี่ยนคนหรือโหลดข้อมูลเสร็จ

  const handlePayment = async () => {
    try {
      if (!treatmentData) {
        setSnackbar({
          open: true,
          message: 'ไม่พบข้อมูลการรักษา',
          severity: 'error'
        });
        return;
      }

      const currentPatient = patients[selectedPatientIndex];
      const totalAmount = calculateTotalFromEditablePrices();
      const discount = parseFloat(paymentData.discount || 0);
      // ✅ คำนวณยอดชำระสุทธิโดยใช้ส่วนลดจาก paymentData โดยตรง (ไม่ใช่จาก treatmentData)
      const netAmount = Math.max(0, totalAmount - discount);

      // ✅ Validation: ใช้ netAmount ที่คำนวณจาก paymentData.discount โดยตรง
      if (!paymentData.receivedAmount || parseFloat(paymentData.receivedAmount) < netAmount) {
        setSnackbar({
          open: true,
          message: `จำนวนเงินที่รับไม่เพียงพอ (ยอดชำระ: ${netAmount.toFixed(2)} บาท, รับมา: ${parseFloat(paymentData.receivedAmount || 0).toFixed(2)} บาท)`,
          severity: 'error'
        });
        return;
      }
      const receivedAmount = parseFloat(paymentData.receivedAmount);
      const changeAmount = receivedAmount - netAmount;

      console.log('💰 Processing payment for VNO:', currentPatient.VNO, {
        totalAmount,
        discount,
        netAmount,
        receivedAmount,
        changeAmount
      });

      // อัปเดตเฉพาะ PAYMENT_STATUS และข้อมูลการชำระเงิน
      try {
        const treatmentUpdateData = {
          VNO: currentPatient.VNO,
          // ไม่เปลี่ยน STATUS1 ให้ยังคงเป็น 'เสร็จแล้ว'

          // ข้อมูลการชำระเงิน
          TOTAL_AMOUNT: totalAmount,
          TREATMENT_FEE: (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null ? parseFloat(paymentData.treatmentFee) : 100.00), // ✅ บันทึกค่ารักษาแยก (รองรับ 0)
          DISCOUNT_AMOUNT: discount,
          NET_AMOUNT: netAmount,
          PAYMENT_STATUS: 'ชำระเงินแล้ว', // เปลี่ยนเฉพาะตัวนี้
          PAYMENT_DATE: getCurrentDateForDB(), // ✅ ใช้ utility สำหรับบันทึก DB (ค.ศ.)
          PAYMENT_TIME: getCurrentTimeForDB(), // ✅ ใช้ utility สำหรับบันทึก DB (เวลาไทย)
          PAYMENT_METHOD: paymentData.paymentMethod,
          RECEIVED_AMOUNT: receivedAmount,
          CHANGE_AMOUNT: changeAmount,
          CASHIER: 'PAYMENT_SYSTEM'
        };

        console.log('🔄 Updating treatment with payment data only:', treatmentUpdateData);

        const treatmentResponse = await TreatmentService.processPayment(
          currentPatient.VNO,
          editablePrices,
          paymentData
        );

        if (!treatmentResponse.success) {
          throw new Error('ไม่สามารถอัปเดต payment status ได้: ' + treatmentResponse.message);
        }

        console.log('✅ Payment status updated successfully');

      } catch (treatmentError) {
        console.error('❌ Error updating payment status:', treatmentError);
        throw treatmentError;
      }

      // อัปเดต local state - เปลี่ยนสถานะการชำระเงินในตัวแปร patients
      const updatedPatients = patients.map((patient, index) => {
        if (index === selectedPatientIndex) {
          return {
            ...patient,
            PAYMENT_STATUS: 'ชำระเงินแล้ว',
            paymentStatus: 'ชำระแล้ว',
            totalAmount: netAmount,
            paymentData: {
              totalAmount,
              discount,
              netAmount,
              receivedAmount,
              changeAmount,
              paymentMethod: paymentData.paymentMethod,
              paymentDate: getCurrentDateForDB(), // ✅ ใช้ utility สำหรับบันทึก DB (ค.ศ.)
              paymentTime: getCurrentTimeForDB() // ✅ ใช้ utility สำหรับบันทึก DB (เวลาไทย)
            }
          };
        }
        return patient;
      });

      setPatients(updatedPatients);

      // Success message
      setSnackbar({
        open: true,
        message: `✅ บันทึกการชำระเงินสำเร็จ ยอดชำระ: ฿${netAmount.toFixed(2)} - ${currentPatient.PRENAME} ${currentPatient.NAME1} ${currentPatient.SURNAME}`,
        severity: 'success'
      });

      // รีเซ็ตข้อมูลการชำระเงิน
      setPaymentData({
        paymentMethod: 'เงินสด',
        receivedAmount: '',
        discount: 0,
        treatmentFee: undefined, // ✅ ไม่ force เป็น 100, ให้ใช้ค่า default จาก loadTreatmentData
        remarks: ''
      });

      setTabIndex(1); // ไปหน้าใบเสร็จ

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน: ' + error.message,
        severity: 'error'
      });
    }
  };

  const loadCompletedPatients = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      // ✅ ใช้ getAllPatientsFromQueue แทน getTodayPatientsFromQueue เพื่อไม่ล็อควันที่
      const response = await PatientService.getAllPatientsFromQueue();

      if (response.success) {
        console.log('Raw queue data:', response.data.length, 'patients');

        const patientsWithTreatmentStatus = await Promise.all(
          response.data.map(async (patient) => {
            try {
              if (patient.VNO) {
                const treatmentResponse = await TreatmentService.getTreatmentByVNO(patient.VNO);
                if (treatmentResponse.success && treatmentResponse.data.treatment) {
                  patient.STATUS1 = treatmentResponse.data.treatment.STATUS1;
                  patient.PAYMENT_STATUS = treatmentResponse.data.treatment.PAYMENT_STATUS; // เพิ่มบรรทัดนี้
                }
              }
              return patient;
            } catch (error) {
              console.warn(`Failed to get treatment status for VNO ${patient.VNO}:`, error);
              return patient;
            }
          })
        );

        // ✅ กรองผู้ป่วย: แสดงเฉพาะผู้ป่วยที่มี STATUS1 === 'รอชำระเงิน' หรือ 'ชำระเงินแล้ว'
        const filteredPatients = patientsWithTreatmentStatus.filter(patient => {
          const treatmentStatus = patient.STATUS1 || 'กำลังตรวจ';

          console.log(`Patient ${patient.HNCODE}: STATUS1="${treatmentStatus}"`);

          // ✅ แสดงเฉพาะผู้ป่วยที่มี STATUS1 === 'รอชำระเงิน' หรือ 'ชำระเงินแล้ว'
          return treatmentStatus === 'รอชำระเงิน' || treatmentStatus === 'ชำระเงินแล้ว';
        });

        // ✅ เรียงลำดับตาม QUEUE_DATE และ QUEUE_TIME (วันที่ก่อนขึ้นก่อน, เวลาก่อนขึ้นก่อน)
        const sortedPatients = filteredPatients.sort((a, b) => {
          // เรียงตามวันที่ก่อน (QUEUE_DATE)
          if (a.QUEUE_DATE && b.QUEUE_DATE) {
            const dateA = new Date(a.QUEUE_DATE).getTime();
            const dateB = new Date(b.QUEUE_DATE).getTime();
            if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
              return dateA - dateB; // วันที่ก่อนขึ้นก่อน
            }
          }

          // ถ้าวันที่เท่ากัน ให้เรียงตาม QUEUE_TIME (เวลาก่อนขึ้นก่อน)
          if (a.QUEUE_TIME && b.QUEUE_TIME) {
            const timeA = new Date(a.QUEUE_TIME).getTime();
            const timeB = new Date(b.QUEUE_TIME).getTime();
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
              return timeA - timeB; // เวลาก่อนขึ้นก่อน
            }
          }

          // ถ้าไม่มี QUEUE_TIME หรือเวลาเท่ากัน ให้เรียงตาม QUEUE_NUMBER (คิวน้อยกว่าขึ้นก่อน)
          const queueNumA = parseInt(a.QUEUE_NUMBER || a.queueNumber || a.QUEUE_ID || 999999);
          const queueNumB = parseInt(b.QUEUE_NUMBER || b.queueNumber || b.QUEUE_ID || 999999);
          return queueNumA - queueNumB;
        });

        console.log(`Found ${sortedPatients.length} patients (รอชำระเงิน + ชำระเงินแล้ว)`);
        console.log('Sorted patients:', sortedPatients.map(p => ({
          HN: p.HNCODE,
          queueNum: p.QUEUE_NUMBER || p.queueNumber,
          paymentStatus: p.PAYMENT_STATUS || 'null/undefined',
          treatmentStatus: p.STATUS1 || 'null/undefined'
        })));

        setPatients(sortedPatients);


      } else {
        if (showLoading) {
          setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้: ' + response.message);
        }
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      if (showLoading) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleCloseCase = async () => {
    try {
      const currentPatient = patients[selectedPatientIndex];

      if (!currentPatient) {
        setSnackbar({
          open: true,
          message: 'ไม่พบข้อมูลผู้ป่วย',
          severity: 'error'
        });
        return;
      }

      // ✅ เช็ค UCS_CARD: ถ้าเป็น 'Y' ไม่ต้องชำระเงิน, ถ้าเป็น 'N' ต้องชำระเงินก่อน
      const ucsCard = currentPatient?.UCS_CARD ||
        currentPatient?.PATIENT_UCS_CARD ||
        treatmentData?.treatment?.UCS_CARD ||
        treatmentData?.patient?.UCS_CARD ||
        'N';
      const paymentStatus = currentPatient.PAYMENT_STATUS || 'รอชำระ';

      // ✅ เช็คว่าใช้สิทธิ์บัตรทองเกิน 2 ครั้งหรือไม่
      let isUcsExceeded = ucsUsageInfo.isExceeded;
      if (ucsCard === 'Y' && currentPatient?.HNCODE) {
        const ucsUsageCheck = await TreatmentService.checkUCSUsageThisMonth(currentPatient.HNCODE);
        if (ucsUsageCheck.success && ucsUsageCheck.data) {
          isUcsExceeded = ucsUsageCheck.data.isExceeded;
        }
      }

      // ✅ คำนวณยอดที่ต้องชำระ (ถ้าใช้สิทธิ์เกิน 2 ครั้ง ให้คิดเงินทั้งหมด, ถ้ายังไม่เกินให้คิดเฉพาะยาที่ต้องจ่าย)
      const totalAmount = calculateTotalFromEditablePrices();
      const hasPayableAmount = totalAmount > 0;

      // ✅ ตรวจสอบว่ามียาที่ต้องจ่ายหรือไม่ (ยาที่ UCS_CARD = 'N')
      const payableDrugs = editablePrices.drugs.filter(drug => drug.DRUG_UCS_CARD === 'N' && drug.editablePrice > 0);
      const payableDrugAmount = payableDrugs.reduce((sum, drug) => sum + drug.editablePrice, 0);
      const hasPayableDrugs = payableDrugAmount > 0;

      console.log('🔍 Close Case Check:', {
        HNCODE: currentPatient.HNCODE,
        UCS_CARD: ucsCard,
        PAYMENT_STATUS: paymentStatus,
        isUcsExceeded: isUcsExceeded,
        hasPayableAmount: hasPayableAmount,
        totalAmount: totalAmount,
        hasPayableDrugs,
        payableDrugAmount,
        payableDrugsCount: payableDrugs.length
      });

      // ✅ ถ้าเป็นบัตรทอง แต่ใช้สิทธิ์เกิน 2 ครั้ง หรือมียาที่ต้องจ่าย (UCS_CARD = 'N') ต้องชำระเงินก่อน
      if (ucsCard === 'Y' && (isUcsExceeded || hasPayableDrugs) && paymentStatus !== 'ชำระเงินแล้ว') {
        // ✅ ถ้ายอดรวมเป็น 0 ให้แสดง modal ยืนยันให้ปิดได้
        if (totalAmount === 0 || totalAmount < 0.01) {
          const reasonText = isUcsExceeded
            ? `ผู้ป่วยรายนี้ใช้สิทธิ์บัตรทองเกิน 2 ครั้งในเดือนนี้<br/>`
            : `ผู้ป่วยรายนี้เป็นบัตรทอง แต่มียาที่ต้องจ่ายเงิน<br/>`;

          const confirmResult = await Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการปิดการรักษา',
            html: `
            ${reasonText}
            <p>ยอดรวม: ฿${totalAmount.toFixed(2)}</p>
            <p>ผู้ป่วยรายนี้ยังไม่ได้ทำการชำระเงิน</p>
            <p>ต้องการปิดการรักษาแม้ว่ายังไม่มีการชำระเงินหรือไม่?</p>
          `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยันปิดการรักษา',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#5698E0',
            cancelButtonColor: '#64748b'
          });

          if (!confirmResult.isConfirmed) {
            return; // ถ้ายกเลิก ไม่ต้องทำอะไร
          }
          // ถ้ายืนยันแล้ว ให้ดำเนินการปิดการรักษาต่อ (ไม่ return)
        } else {
          // ถ้ายอดรวมมากกว่า 0 ต้องชำระเงินก่อน
          const reasonText = isUcsExceeded
            ? `ผู้ป่วยรายนี้ใช้สิทธิ์บัตรทองเกิน 2 ครั้งในเดือนนี้<br/>`
            : `ผู้ป่วยรายนี้เป็นบัตรทอง แต่มียาที่ต้องจ่ายเงิน<br/>`;
          const amountText = isUcsExceeded
            ? `<strong>ยอดรวม ฿${totalAmount.toFixed(2)}</strong><br/>`
            : `<strong>จำนวน ${payableDrugs.length} รายการ</strong> รวมเป็นเงิน <strong>฿${payableDrugAmount.toFixed(2)}</strong><br/>`;

          await Swal.fire({
            icon: 'warning',
            title: 'ยังไม่สามารถปิดการรักษาได้',
            html: `${reasonText}${amountText}กรุณาชำระเงินก่อนปิดการรักษา`,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#5698E0'
          });
          return;
        }
      }

      // ✅ ถ้า UCS_CARD เป็น 'N' หรือใช้สิทธิ์บัตรทองเกิน 2 ครั้ง และยังไม่ชำระเงิน
      if ((ucsCard !== 'Y' || isUcsExceeded) && paymentStatus !== 'ชำระเงินแล้ว') {
        // ✅ เช็คว่ายอดรวมเป็น 0 หรือไม่ (ถ้าเป็น 0 ให้สามารถปิดได้ แต่ต้องยืนยัน)
        if (totalAmount === 0 || totalAmount < 0.01) {
          // ถ้ายอดรวมเป็น 0 หรือน้อยมาก ให้แสดง modal ยืนยันให้ปิดได้
          const confirmResult = await Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการปิดการรักษา',
            html: `
            <p>ผู้ป่วยรายนี้ยังไม่ได้ทำการชำระเงิน</p>
            <p><strong>ยอดรวม: ฿${totalAmount.toFixed(2)}</strong></p>
            <p>ต้องการปิดการรักษาแม้ว่ายังไม่มีการชำระเงินหรือไม่?</p>
          `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยันปิดการรักษา',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#5698E0',
            cancelButtonColor: '#64748b'
          });

          if (!confirmResult.isConfirmed) {
            return; // ถ้ายกเลิก ไม่ต้องทำอะไร
          }
          // ถ้ายืนยันแล้ว ให้ดำเนินการปิดการรักษาต่อ (ไม่ return)
        } else {
          // ถ้ายอดรวมไม่เป็น 0 ต้องชำระเงินก่อน
          await Swal.fire({
            icon: 'warning',
            title: 'ยังไม่สามารถปิดการรักษาได้',
            html: `
            <p>ผู้ป่วยรายนี้ยังไม่ได้ทำการชำระเงิน</p>
            <p><strong>ยอดรวม: ฿${totalAmount.toFixed(2)}</strong></p>
            <p>กรุณาชำระเงินก่อนปิดการรักษา</p>
          `,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#5698E0'
          });
          return;
        }
      }

      // ✅ ถ้าเป็นบัตรทอง (UCS_CARD = 'Y') ไม่ได้ใช้สิทธิ์เกิน 2 ครั้ง และไม่มียาที่ต้องจ่าย แสดงข้อความยืนยัน
      if (ucsCard === 'Y' && !isUcsExceeded && !hasPayableDrugs) {
        const confirmResult = await Swal.fire({
          icon: 'info',
          title: 'ยืนยันการปิดการรักษา',
          text: 'ผู้ป่วยรายนี้เป็นบัตรทอง (ไม่ต้องชำระเงิน) ต้องการปิดการรักษาหรือไม่?',
          showCancelButton: true,
          confirmButtonText: 'ยืนยันปิดการรักษา',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#5698E0',
          cancelButtonColor: '#64748b'
        });

        if (!confirmResult.isConfirmed) {
          return; // ถ้ายกเลิก ไม่ต้องทำอะไร
        }
      }

      // ✅ อัปเดต STATUS1 เป็น 'ปิดการรักษา'
      const treatmentUpdateData = {
        STATUS1: 'ปิดการรักษา',
        // เพิ่มข้อมูลเวลาปิดการรักษา (optional)
        CLOSE_DATE: getCurrentDateForDB(), // ✅ ใช้ utility สำหรับบันทึก DB (ค.ศ.)
        CLOSE_TIME: getCurrentTimeForDB(), // ✅ ใช้ utility สำหรับบันทึก DB (เวลาไทย)
        CLOSED_BY: 'PAYMENT_SYSTEM'
      };

      console.log('🔒 Closing case for VNO:', currentPatient.VNO);

      // ใช้ updateTreatment แทน updateTreatmentStatus
      const treatmentResponse = await TreatmentService.updateTreatment(
        currentPatient.VNO,
        treatmentUpdateData
      );

      if (!treatmentResponse.success) {
        throw new Error('ไม่สามารถปิดการรักษาได้: ' + treatmentResponse.message);
      }

      // ✅ ไม่ต้องลบคิวออก เพราะจะกรองด้วย STATUS1 === 'ปิดการรักษา' แทน
      // ลบผู้ป่วยออกจาก state
      const updatedPatients = patients.filter((_, index) => index !== selectedPatientIndex);
      setPatients(updatedPatients);

      // อัพเดต selectedPatientIndex
      if (updatedPatients.length === 0) {
        setSelectedPatientIndex(0);
        setTreatmentData(null);
        setEditablePrices({
          labs: [],
          procedures: [],
          drugs: []
        });
      } else {
        if (selectedPatientIndex >= updatedPatients.length) {
          setSelectedPatientIndex(updatedPatients.length - 1);
        }
      }

      setSnackbar({
        open: true,
        message: `✅ ปิดการรักษาเรียบร้อย - ${currentPatient.PRENAME} ${currentPatient.NAME1} ${currentPatient.SURNAME}`,
        severity: 'success'
      });

      // รีเฟรชข้อมูล
      setTimeout(() => {
        loadCompletedPatients(true); // true = แสดง loading spinner
      }, 1000);

    } catch (error) {
      console.error('❌ Error closing case:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการปิดการรักษา: ' + error.message,
        severity: 'error'
      });
    }
  };

  // ✅ ฟังก์ชั่นส่งคืนแพทย์ (Unlock)
  const handleReturnToDoctor = async () => {
    try {
      if (!patients[selectedPatientIndex]) return;
      const currentPatient = patients[selectedPatientIndex];

      const confirmResult = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการส่งคืนแพทย์',
        text: 'สถานะจะเปลี่ยนกลับเป็น "กำลังตรวจ" และแพทย์จะสามารถแก้ไขรายการยาได้',
        showCancelButton: true,
        confirmButtonText: 'ยืนยันส่งคืน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ff9800',
        cancelButtonColor: '#64748b'
      });

      if (!confirmResult.isConfirmed) return;

      setLoading(true);

      const updateData = {
        STATUS1: 'กำลังตรวจ'
      };

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, updateData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: `✅ ส่งคืนผู้ป่วยกลับไปห้องตรวจเรียบร้อย - ${currentPatient.PRENAME}${currentPatient.NAME1}`,
          severity: 'success'
        });

        // Refresh data (Patient should disappear from this list)
        loadCompletedPatients(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error returning to doctor:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการส่งคืนแพทย์: ' + error.message,
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const loadTreatmentData = async (vno) => {
    if (!vno) {
      setTreatmentData(null);
      return;
    }

    try {
      setLoadingTreatment(true);
      console.log('🔍 Loading treatment data for VNO:', vno);
      const response = await TreatmentService.getTreatmentByVNO(vno);

      console.log('📥 Treatment response:', {
        success: response.success,
        hasData: !!response.data,
        drugsCount: response.data?.drugs?.length || 0,
        proceduresCount: response.data?.procedures?.length || 0,
        labTestsCount: response.data?.labTests?.length || 0,
        radioTestsCount: response.data?.radiologicalTests?.length || 0
      });

      if (response.success) {
        setTreatmentData(response.data);

        console.log('💊 Drugs data:', response.data?.drugs);
        console.log('🔧 Procedures data:', response.data?.procedures);

        // สร้าง Labs และ Procedures arrays จากข้อมูลที่ได้
        let labsArray = [];
        let proceduresArray = [];

        // ดึงข้อมูล Lab/X-ray จาก INVESTIGATION_NOTES (รูปแบบใหม่)
        const investigationNotes = response.data.treatment?.INVESTIGATION_NOTES || '';

        if (investigationNotes) {
          console.log('📝 Payment - Loading investigation notes:', investigationNotes);

          // แยกข้อมูล [Laboratory] และ [Imaging] จาก INVESTIGATION_NOTES
          const lines = investigationNotes.split('\n\n');

          lines.forEach(line => {
            if (line.startsWith('[Laboratory]')) {
              const labNote = line.replace('[Laboratory]', '').trim();
              if (labNote) {
                // สร้าง lab object จาก note
                labsArray.push({
                  LABNAME: labNote,
                  LABCODE: 'LAB_FROM_NOTE',
                  PRICE: 100, // ราคาเริ่มต้น
                  NOTE1: labNote,
                  editablePrice: 100,
                  originalPrice: 100
                });
              }
            } else if (line.startsWith('[Imaging]')) {
              const imagingNote = line.replace('[Imaging]', '').trim();
              if (imagingNote) {
                // สร้าง lab object สำหรับ X-ray/Imaging
                labsArray.push({
                  LABNAME: imagingNote,
                  LABCODE: 'XRAY_FROM_NOTE',
                  PRICE: 200, // ราคาเริ่มต้นสำหรับ X-ray
                  NOTE1: imagingNote,
                  editablePrice: 200,
                  originalPrice: 200
                });
              }
            }
          });
        }

        // ดึงข้อมูล Lab/X-ray จากรูปแบบเก่า (สำหรับ backward compatibility)
        if (response.data.labTests && response.data.labTests.length > 0) {
          const oldLabTests = response.data.labTests.map(item => ({
            ...item,
            editablePrice: parseFloat(item.PRICE || 100),
            originalPrice: parseFloat(item.PRICE || 100)
          }));
          labsArray = [...labsArray, ...oldLabTests];
        }

        // ดึงข้อมูล radiological tests จากรูปแบบเก่า
        if (response.data.radiologicalTests && response.data.radiologicalTests.length > 0) {
          const oldRadioTests = response.data.radiologicalTests.map(item => ({
            ...item,
            LABNAME: item.RLNAME || item.PROCEDURE_NAME,
            LABCODE: item.RLCODE || item.PROCEDURE_CODE,
            PRICE: item.PRICE || 200,
            editablePrice: parseFloat(item.PRICE || 200),
            originalPrice: parseFloat(item.PRICE || 200)
          }));
          labsArray = [...labsArray, ...oldRadioTests];
        }

        // ดึงข้อมูล Procedures
        console.log('🔍 Checking procedures:', {
          hasProcedures: !!response.data.procedures,
          proceduresLength: response.data.procedures?.length || 0,
          proceduresData: response.data.procedures
        });

        if (response.data.procedures && response.data.procedures.length > 0) {
          // ✅ Deduplicate procedures โดยใช้ MEDICAL_PROCEDURE_CODE หรือ PROCEDURE_CODE
          const seenProcedures = new Map();
          const uniqueProcedures = [];

          response.data.procedures.forEach(item => {
            const procedureCode = item.MEDICAL_PROCEDURE_CODE || item.PROCEDURE_CODE;
            const procedureName = item.MED_PRO_NAME_THAI || item.PROCEDURE_NAME;
            const key = procedureCode || procedureName;

            // ถ้ายังไม่เคยเห็น procedure นี้ ให้เพิ่มเข้าไป
            if (key && !seenProcedures.has(key)) {
              seenProcedures.set(key, true);
              uniqueProcedures.push(item);
            }
          });

          proceduresArray = uniqueProcedures.map(item => ({
            ...item,
            editablePrice: parseFloat(item.AMT || item.UNIT_PRICE || 200),
            originalPrice: parseFloat(item.AMT || item.UNIT_PRICE || 200)
          }));
          console.log('✅ Mapped procedures array (deduplicated):', proceduresArray);
        } else {
          console.warn('⚠️ No procedures found in response.data.procedures');
        }

        // ดึงข้อมูล Drugs พร้อม UCS_CARD และชื่อหน่วย (UNIT_NAME)
        let drugsArray = [];
        console.log('🔍 Checking drugs:', {
          hasDrugs: !!response.data.drugs,
          drugsLength: response.data.drugs?.length || 0,
          drugsData: response.data.drugs
        });

        if (response.data.drugs && response.data.drugs.length > 0) {
          // ✅ Deduplicate drugs โดยใช้ DRUG_CODE
          const seenDrugs = new Map();
          const uniqueDrugs = [];

          response.data.drugs.forEach(item => {
            const drugCode = item.DRUG_CODE;
            if (drugCode && !seenDrugs.has(drugCode)) {
              seenDrugs.set(drugCode, true);
              uniqueDrugs.push(item);
            }
          });

          // map สำหรับชื่อหน่วยสวยๆ
          const unitNameMap = {
            TAB: 'เม็ด',
            CAP: 'แคปซูล',
            BOT: 'ขวด',
            AMP: 'แอมพูล',
            VIAL: 'ไวออล',
            TUBE: 'หลอด',
            SACHET: 'ซอง',
            BOX: 'กล่อง',
            SPRAY: 'สเปรย์',
            DROP: 'หยด',
            ML: 'มิลลิลิตร',
            G: 'กรัม',
            PACK: 'แพ็ค',
            TIMES: 'ครั้ง'
          };

          // ดึงข้อมูล UCS_CARD, Indication1, GENERIC_NAME และ TRADE_NAME ของยาแต่ละตัว (เฉพาะยาที่ไม่ซ้ำ)
          drugsArray = await Promise.all(
            uniqueDrugs.map(async (item) => {
              let drugUcsCard = item.UCS_CARD || 'N';
              // ✅ ดึง Indication1 จาก NOTE1 (ที่บันทึกไว้) หรือจาก Indication1 field
              let indication1 = item.NOTE1 || item.Indication1 || '';
              let genericName = item.GENERIC_NAME || '';
              let tradeName = item.TRADE_NAME || '';
              const rawUnitCode = item.UNIT_CODE || '';
              const rawUnitName =
                item.UNIT_NAME ||
                item.UNIT_NAME1 ||
                item.unitName ||
                '';

              // แปลงชื่อหน่วยสำหรับแสดงผล: ถ้าเป็นรหัส เช่น TAB ให้แสดงชื่อไทย
              let displayUnitName = rawUnitName;
              if (!displayUnitName) {
                displayUnitName = unitNameMap[rawUnitCode] || rawUnitCode;
              } else if (displayUnitName === rawUnitCode && unitNameMap[rawUnitCode]) {
                displayUnitName = unitNameMap[rawUnitCode];
              }

              // ✅ ดึงข้อมูลเพิ่มเติมจาก DrugService เพื่อให้ได้ข้อมูลที่ถูกต้อง
              // เช็คว่าข้อมูลปัจจุบันดูเหมือนจะมีปัญหา (เช่น GENERIC_NAME เป็น "ยา D0054" แทนชื่อยาจริง)
              const needsUpdate =
                !drugUcsCard ||
                drugUcsCard === 'N' ||
                !indication1 ||
                !genericName ||
                !tradeName ||
                genericName.toLowerCase().startsWith('ยา ') ||
                tradeName.toLowerCase().startsWith('ยา ');

              if (needsUpdate) {
                try {
                  const drugResponse = await DrugService.getDrugByCode(item.DRUG_CODE);
                  if (drugResponse.success && drugResponse.data) {
                    // อัปเดต UCS_CARD ถ้ายังไม่มี
                    if (!drugUcsCard || drugUcsCard === 'N') {
                      drugUcsCard = drugResponse.data.UCS_CARD || 'N';
                    }
                    // ✅ อัปเดต Indication1 ถ้ายังไม่มี
                    if (!indication1) {
                      indication1 = drugResponse.data.Indication1 || '';
                    }
                    // ✅ อัปเดต GENERIC_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                    if (!genericName || genericName.toLowerCase().startsWith('ยา ')) {
                      genericName = drugResponse.data.GENERIC_NAME || genericName || '';
                    }
                    // ✅ อัปเดต TRADE_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                    if (!tradeName || tradeName.toLowerCase().startsWith('ยา ')) {
                      tradeName = drugResponse.data.TRADE_NAME || tradeName || '';
                    }
                  }
                } catch (error) {
                  console.warn(`Could not fetch drug details for ${item.DRUG_CODE}:`, error);
                  if (!drugUcsCard || drugUcsCard === 'N') {
                    drugUcsCard = 'N';
                  }
                }
              }

              return {
                ...item,
                GENERIC_NAME: genericName || item.GENERIC_NAME || '', // ✅ ใช้ GENERIC_NAME ที่ถูกต้อง
                TRADE_NAME: tradeName || item.TRADE_NAME || '', // ✅ ใช้ TRADE_NAME ที่ถูกต้อง
                editablePrice: parseFloat(item.AMT || 0),
                originalPrice: parseFloat(item.AMT || 0),
                DRUG_UCS_CARD: drugUcsCard, // เก็บ UCS_CARD ของยาแต่ละตัว
                Indication1: indication1, // เก็บ Indication1 สำหรับแสดงในฉลากยา
                UNIT_NAME: rawUnitName,
                DISPLAY_UNIT_NAME: displayUnitName
              };
            })
          );
        }

        // ✅ เช็คบัตรทอง (UCS_CARD) จาก patient หรือ treatment
        const currentPatient = patients[selectedPatientIndex];
        const isGoldCard = currentPatient?.UCS_CARD === 'Y' ||
          response.data.treatment?.UCS_CARD === 'Y' ||
          response.data.patient?.UCS_CARD === 'Y';

        // ✅ เช็คจำนวนครั้งที่ใช้สิทธิ์บัตรทองในเดือนนี้
        let ucsUsageExceeded = false;
        if (isGoldCard && currentPatient?.HNCODE) {
          const ucsUsageCheck = await TreatmentService.checkUCSUsageThisMonth(currentPatient.HNCODE);

          if (ucsUsageCheck.success && ucsUsageCheck.data) {
            const { usageCount, maxUsage, isExceeded, remainingUsage } = ucsUsageCheck.data;

            // บันทึกข้อมูลการใช้งานสิทธิ์
            setUcsUsageInfo({
              isExceeded: isExceeded,
              usageCount: usageCount,
              maxUsage: maxUsage,
              remainingUsage: remainingUsage
            });

            ucsUsageExceeded = isExceeded;

            // แจ้งเตือนถ้าใช้เกิน 2 ครั้ง
            if (isExceeded) {
              setSnackbar({
                open: true,
                message: `⚠️ ผู้ป่วยใช้สิทธิ์บัตรทองเกิน 2 ครั้งในเดือนนี้ (ใช้แล้ว ${usageCount} ครั้ง) - จะคิดเงินตามปกติ`,
                severity: 'warning'
              });
            }
          }
        } else {
          // ถ้าไม่ใช่บัตรทอง ให้รีเซ็ตข้อมูล
          setUcsUsageInfo({
            isExceeded: false,
            usageCount: 0,
            maxUsage: 2,
            remainingUsage: 2
          });
        }

        // ✅ ถ้าผู้ป่วยเป็นบัตรทองและยังใช้สิทธิ์ไม่เกิน 2 ครั้ง ให้ตั้งราคาเริ่มต้นเป็น 0
        // แต่ถ้าใช้เกิน 2 ครั้งแล้ว ให้คิดเงินตามปกติ (ไม่ตั้งราคาเป็น 0)
        // และถ้ายามี UCS_CARD = 'N' ให้เก็บราคาไว้เสมอ
        if (isGoldCard && !ucsUsageExceeded) {
          labsArray = labsArray.map(item => ({
            ...item,
            editablePrice: 0, // ตั้งราคาเริ่มต้นเป็น 0
            originalPrice: item.originalPrice // เก็บราคาเดิมไว้
          }));
          proceduresArray = proceduresArray.map(item => ({
            ...item,
            editablePrice: 0,
            originalPrice: item.originalPrice
          }));
          // ✅ สำหรับยา: ถ้า UCS_CARD = 'N' ให้เก็บราคาไว้, ถ้า = 'Y' ให้เป็น 0
          drugsArray = drugsArray.map(item => ({
            ...item,
            editablePrice: item.DRUG_UCS_CARD === 'N' ? item.originalPrice : 0,
            originalPrice: item.originalPrice
          }));
        }
        // ถ้า isGoldCard แต่ ucsUsageExceeded = true ไม่ต้องตั้งราคาเป็น 0 (ให้คิดเงินตามปกติ)

        // เซ็ตราคาที่แก้ไขได้
        console.log('💰 Setting editable prices:', {
          labsCount: labsArray.length,
          proceduresCount: proceduresArray.length,
          drugsCount: drugsArray.length,
          procedures: proceduresArray,
          drugs: drugsArray
        });

        setEditablePrices({
          labs: labsArray,
          procedures: proceduresArray,
          drugs: drugsArray
        });

        console.log('✅ Editable prices set successfully');

        // ✅ ดึงส่วนลดจาก treatmentData มาใส่ใน paymentData ถ้ามี
        const discountFromTreatment = parseFloat(response.data.treatment?.DISCOUNT_AMOUNT || 0);

        // ✅ ตั้งค่ารักษา: ถ้าเป็นบัตรทองและยังใช้สิทธิ์ไม่เกิน 2 ครั้ง ให้เป็น 0, ถ้าไม่ใช่ให้เป็น 100.00
        // ✅ แต่ไม่ override ถ้า user แก้ไขค่าไว้แล้ว (รวมถึง 0)
        setPaymentData(prev => {
          let treatmentFee;
          if (isGoldCard && !ucsUsageExceeded) {
            treatmentFee = 0.00;
          } else {
            // ถ้า user แก้ไขค่าไว้แล้ว (รวมถึง 0) ให้เก็บไว้, ถ้าไม่ใช่ให้ใช้ 100.00
            // ✅ ต้องเช็คว่า prev.treatmentFee เป็น 0 ได้ (0 !== undefined && 0 !== null)
            if (prev.treatmentFee !== undefined && prev.treatmentFee !== null) {
              treatmentFee = prev.treatmentFee; // เก็บค่าที่ user แก้ไขไว้ (รวมถึง 0)
            } else {
              treatmentFee = 100.00; // ถ้ายังไม่มีค่า ให้ใช้ default
            }
          }

          return {
            ...prev,
            discount: discountFromTreatment,
            treatmentFee: treatmentFee
          };
        });

        console.log('💰 Payment - Final editable prices:', {
          labs: labsArray,
          procedures: proceduresArray,
          drugs: drugsArray,
          discount: discountFromTreatment
        });

      } else {
        setTreatmentData(null);
        setSnackbar({
          open: true,
          message: 'ไม่พบข้อมูลการรักษา: ' + response.message,
          severity: 'warning'
        });
      }
    } catch (err) {
      console.error('Error loading treatment data:', err);
      setTreatmentData(null);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลการรักษา: ' + err.message,
        severity: 'error'
      });
    } finally {
      setLoadingTreatment(false);
    }
  };

  // ฟังก์ชันจัดการการแก้ไขราคา
  const handleEditPrice = (type, index) => {
    setEditingItem({ type, index });
    // เซ็ต global function ให้ EditablePriceCell ใช้
    window.editPrice = (type, index) => {
      setEditingItem({ type, index });
    };
  };

  const handleSavePrice = (type, index, newPrice) => {
    const price = parseFloat(newPrice) || 0;

    setEditablePrices(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, editablePrice: price } : item
      )
    }));

    setEditingItem({ type: null, index: null });

    setSnackbar({
      open: true,
      message: 'บันทึกราคาใหม่เรียบร้อย',
      severity: 'success'
    });
  };

  const handleCancelEdit = () => {
    setEditingItem({ type: null, index: null });
  };

  // คำนวณยอดรวม
  const calculateTotalFromEditablePrices = () => {
    const labTotal = editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0);
    const procedureTotal = editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0);

    // ✅ สำหรับผู้ป่วยบัตรทอง: คำนวณยาที่ UCS_CARD = 'N' หรือยาที่แก้ราคาแล้ว (editablePrice > 0)
    const currentPatient = patients[selectedPatientIndex];
    const isGoldCard = currentPatient?.UCS_CARD === 'Y' ||
      treatmentData?.treatment?.UCS_CARD === 'Y' ||
      treatmentData?.patient?.UCS_CARD === 'Y';

    // ✅ เช็คว่าใช้สิทธิ์บัตรทองเกิน 2 ครั้งหรือไม่
    const isUcsExceeded = ucsUsageInfo.isExceeded;

    let drugTotal = 0;
    if (isGoldCard && !isUcsExceeded) {
      // ถ้าเป็นบัตรทองและยังใช้สิทธิ์ไม่เกิน 2 ครั้ง: คำนวณยาที่ UCS_CARD = 'N' หรือยาที่แก้ราคาแล้ว (editablePrice > 0)
      drugTotal = editablePrices.drugs.reduce((sum, item) => {
        // ถ้าเป็นยาที่ต้องจ่าย (UCS_CARD = 'N') หรือแก้ราคาแล้ว (editablePrice > 0) ให้นับ
        if (item.DRUG_UCS_CARD === 'N' || (item.DRUG_UCS_CARD === 'Y' && item.editablePrice > 0)) {
          return sum + item.editablePrice;
        }
        return sum;
      }, 0);
    } else {
      // ผู้ป่วยไม่ใช่บัตรทอง หรือใช้สิทธิ์บัตรทองเกิน 2 ครั้งแล้ว: คำนวณยาทั้งหมด
      drugTotal = editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0);
    }

    // ✅ เพิ่มค่ารักษา (ถ้าไม่ใช่บัตรทอง หรือใช้สิทธิ์เกิน 2 ครั้ง)
    // ✅ ใช้ ?? แทน || เพื่อให้ 0 ถูกยอมรับได้
    const treatmentFee = (isGoldCard && !isUcsExceeded) ? 0 : (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null ? parseFloat(paymentData.treatmentFee) : 100.00);

    return labTotal + procedureTotal + drugTotal + treatmentFee;
  };

  const calculateTotal = () => {
    const totalCost = calculateTotalFromEditablePrices();
    // ✅ ดึงส่วนลดจาก paymentData ก่อน (เพราะ user อาจแก้ไขใน UI) แล้วค่อย fallback ไปที่อื่น
    const discount = parseFloat(
      (paymentData.discount !== undefined && paymentData.discount !== null) ? paymentData.discount :
      treatmentData?.treatment?.DISCOUNT_AMOUNT ||
      currentPatient?.paymentData?.discount ||
      0
    );
    return Math.max(0, totalCost - discount);
  };

  // การจัดการผู้ป่วย
  const handlePatientSelect = (index) => {
    setSelectedPatientIndex(index);
    setTabIndex(0);
    setPaymentData({
      paymentMethod: 'เงินสด',
      receivedAmount: '',
      discount: 0,
      treatmentFee: undefined, // ✅ ไม่ force default, จะตั้งค่าเมื่อโหลดข้อมูลผู้ป่วย
      remarks: ''
    });
    setEditingItem({ type: null, index: null });
  };

  const handleNextPatient = () => {
    if (selectedPatientIndex < patients.length - 1) {
      setSelectedPatientIndex(selectedPatientIndex + 1);
    }
  };

  const handlePreviousPatient = () => {
    if (selectedPatientIndex > 0) {
      setSelectedPatientIndex(selectedPatientIndex - 1);
    }
  };

  // Prepare data for receipt printing
  const getReceiptItems = () => {
    const allItems = [
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
        name: [item.GENERIC_NAME, item.TRADE_NAME].filter(Boolean).join(' / ') || item.GENERIC_NAME || item.TRADE_NAME || item.DRUG_CODE || "ยา",
        quantity: item.QTY || 1,
        unit: item.DISPLAY_UNIT_NAME || item.UNIT_NAME || item.UNIT_CODE || "เม็ด",
        price: item.editablePrice || 0
      }))
    ];
    return allItems;
  };

  const currentPatient = patients[selectedPatientIndex];

  // Loading state
  if (loading) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูลผู้ป่วย...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => loadCompletedPatients(true)}>
            ลองใหม่
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, maxWidth: "1600px" }}>
      {/* Header */}
      <Typography sx={{
        fontWeight: '600',
        fontSize: '24px',
        fontFamily: 'Instrument Sans',
        letterSpacing: '1.5px',
        lineHeight: '2',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        mb: 3
      }}>
        ชำระเงิน/จ่ายยา
      </Typography>

      <Grid container spacing={2}>
        {/* Left Sidebar - Patient Queue */}
        <Grid item xs={12} md={2.5}>
          <PatientQueueSidebar
            patients={patients}
            selectedPatientIndex={selectedPatientIndex}
            onPatientSelect={handlePatientSelect}
            onNextPatient={handleNextPatient}
            onPreviousPatient={handlePreviousPatient}
            onRefresh={() => loadCompletedPatients(true)}
          />
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9.5}>
          {patients.length === 0 ? (
            <Card sx={{
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Background decoration */}
              <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                filter: 'blur(20px)'
              }} />

              <CardContent sx={{
                textAlign: 'center',
                py: 8,
                px: 6,
                position: 'relative',
                zIndex: 1
              }}>
                {/* Icon */}
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
                  mb: 4,
                  boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)',
                  position: 'relative'
                }}>
                  <Box sx={{
                    fontSize: 60,
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}>
                    ✓
                  </Box>
                </Box>

                {/* Main Message */}
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 2,
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ทุกอย่างเรียบร้อย
                </Typography>

                <Typography variant="h6" sx={{
                  color: '#64748b',
                  mb: 4,
                  fontWeight: 500,
                  lineHeight: 1.6
                }}>
                  ไม่มีผู้ป่วยรอการชำระเงินในขณะนี้
                </Typography>

                {/* Status Cards */}
                {/* Status Cards */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography sx={{ color: '#22c55e', mb: 1, fontSize: 32 }}>✅</Typography>
                      <Typography variant="body1" fontWeight={600} color="#166534">
                        ชำระเงินครบทุกราย
                      </Typography>
                      <Typography variant="body2" color="#166534" sx={{ opacity: 0.8 }}>
                        ผู้ป่วยทุกรายได้ชำระเงินเรียบร้อย
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography sx={{ color: '#3b82f6', mb: 1, fontSize: 32 }}>📊</Typography>
                      <Typography variant="body1" fontWeight={600} color="#1e40af">
                        ระบบพร้อมใช้งาน
                      </Typography>
                      <Typography variant="body2" color="#1e40af" sx={{ opacity: 0.8 }}>
                        พร้อมรับผู้ป่วยรายถัดไป
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography sx={{ color: '#f59e0b', mb: 1, fontSize: 32 }}>⏰</Typography>
                      <Typography variant="body1" fontWeight={600} color="#92400e">
                        เวลาปัจจุบัน
                      </Typography>
                      <Typography variant="body2" color="#92400e" sx={{ opacity: 0.8 }}>
                        {getCurrentTimeForDisplay()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Action */}
                <Typography variant="body1" sx={{
                  color: '#64748b',
                  mb: 3,
                  fontWeight: 500
                }}>
                  ต้องการดำเนินการอื่น?
                </Typography>

                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/clinic/ตรวจรักษา')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    ไปหน้าตรวจรักษา
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => window.location.reload()}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '12px',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: 'rgba(148, 163, 184, 0.05)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    รีเฟรชหน้า
                  </Button>
                </Box>

                {/* Footer tip */}
                <Box sx={{
                  mt: 5,
                  p: 3,
                  borderRadius: '12px',
                  background: 'rgba(148, 163, 184, 0.05)',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <Typography variant="body2" sx={{
                    color: '#64748b',
                    fontStyle: 'italic'
                  }}>
                    เคล็ดลับ: หน้านี้จะอัปเดตอัตโนมัติเมื่อมีผู้ป่วยรอการชำระเงิน
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: '16px' }}>
              {/* Tabs */}
              <Tabs
                value={tabIndex}
                onChange={(event, newIndex) => setTabIndex(newIndex)}
                variant="standard"
                sx={{
                  backgroundColor: 'transparent',
                  backgroundImage: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 8px 32px rgba(86, 152, 224, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  mb: 2,
                  '& .MuiTabs-flexContainer': {
                    gap: '12px',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch'
                  },
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'center',
                    minWidth: 160,
                    maxWidth: 200,
                    borderRadius: '14px',
                    padding: '16px 20px',
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)'
                    }
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important',
                    color: '#2B69AC !important',
                    fontWeight: '700 !important',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.9)'
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  }
                }}
              >
                <Tab label="💰 ชำระเงิน/จ่ายยา" />
                <Tab label="🧾 ใบเสร็จ" />
                <Tab label="💊 ฉลากยา" />
              </Tabs>

              <CardContent>
                {/* Tab 0: Payment */}
                {tabIndex === 0 && (
                  <Box>
                    {/* Patient Info Header */}
                    {currentPatient && (
                      <Box sx={{ mb: 3 }}>
                        <PatientInfoHeader patient={currentPatient} treatmentData={treatmentData} />
                      </Box>
                    )}

                    {/* Treatment Details */}
                    {loadingTreatment ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress size={60} sx={{ color: '#5698E0' }} />
                        <Typography variant="h6" sx={{ mt: 2, color: '#2B69AC' }}>
                          กำลังโหลดข้อมูลการรักษา...
                        </Typography>
                      </Box>
                    ) : treatmentData ? (
                      <Box>
                        {/* Main Content Grid */}
                        <Grid container spacing={3}>
                          {/* Left Column - Tables */}
                          <Grid item xs={12} lg={8}>
                            {/* Lab & Procedures Table */}
                            <Box sx={{ mb: 3 }}>
                              <LabProceduresTable
                                editablePrices={editablePrices}
                                editingItem={editingItem}
                                onEditPrice={handleEditPrice}
                                onSavePrice={handleSavePrice}
                                onCancelEdit={handleCancelEdit}
                              />
                            </Box>

                            {/* Drugs Table */}
                            <Box sx={{ mb: 3 }}>
                              <DrugsTable
                                editablePrices={editablePrices}
                                editingItem={editingItem}
                                onEditPrice={handleEditPrice}
                                onSavePrice={handleSavePrice}
                                onCancelEdit={handleCancelEdit}
                              />
                            </Box>

                            {/* ✅ ปุ่มแก้ไขยา (ส่งคืนแพทย์) อยู่ใต้ตารางยา */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                              <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleReturnToDoctor}
                                startIcon={<EditIcon />}
                                sx={{
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  py: 1,
                                  px: 2,
                                  borderRadius: '10px',
                                  borderColor: '#ff9800',
                                  color: '#ed6c02',
                                  '&:hover': {
                                    borderColor: '#ed6c02',
                                    backgroundColor: '#fff3e0'
                                  }
                                }}
                              >
                                แก้ไขยา (ส่งคืนแพทย์)
                              </Button>
                            </Box>
                          </Grid>

                          {/* Right Column - Payment Summary */}
                          <Grid item xs={12} lg={4}>
                            <Box sx={{ position: 'sticky', top: 20 }}>
                              <PaymentSummaryCard
                                editablePrices={editablePrices}
                                paymentData={paymentData}
                                onPaymentDataChange={setPaymentData}
                                onPayment={handlePayment}
                                onCloseCase={handleCloseCase} // เพิ่ม prop ใหม่
                                patient={currentPatient} // เพิ่ม prop ใหม่
                                ucsUsageInfo={ucsUsageInfo} // ✅ ส่งข้อมูลการใช้งานสิทธิ์บัตรทอง
                                loading={false}
                              />


                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      <Alert
                        severity="warning"
                        sx={{
                          borderRadius: '12px',
                          p: 3,
                          '& .MuiAlert-message': {
                            fontSize: '1.1rem'
                          }
                        }}
                      >
                        {currentPatient
                          ? 'ไม่พบข้อมูลการรักษาสำหรับผู้ป่วยรายนี้'
                          : 'กรุณาเลือกผู้ป่วยเพื่อดูข้อมูลการรักษา'
                        }
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Tab 1: Receipt */}
                {tabIndex === 1 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                      ใบเสร็จรับเงิน
                    </Typography>

                    {currentPatient && treatmentData ? (
                      <Box>
                        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mb: 3 }} id="receipt-print">
                          {/* Receipt Header */}
                          <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1976d2', pb: 2 }}>
                            <Typography variant="h5" fontWeight="bold">สัมพันธ์คลินิค</Typography>
                            <Typography variant="body2">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ. จอมทอง จ. เชียงใหม่ 50160</Typography>
                            <Typography variant="body2">Tel: 053-826-524</Typography>
                          </Box>

                          {/* Patient Info */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2"><strong>VN:</strong> {currentPatient.VNO}</Typography>
                              <Typography variant="body2"><strong>HN:</strong> {currentPatient.HNCODE}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2"><strong>วันที่:</strong> {getCurrentDateForDisplay()}</Typography>
                              <Typography variant="body2"><strong>เวลา:</strong> {getCurrentTimeForDisplay()}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                <strong>ชื่อผู้ป่วย:</strong> {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Items Table */}
                          <TableContainer sx={{ mb: 3 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                  <TableCell><strong>รายการ</strong></TableCell>
                                  <TableCell align="center"><strong>จำนวน</strong></TableCell>
                                  <TableCell align="right"><strong>ราคา</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {editablePrices.labs.map((lab, index) => (
                                  <TableRow key={`lab-${index}`}>
                                    <TableCell>{lab.LABNAME || lab.LABCODE}</TableCell>
                                    <TableCell align="center">1</TableCell>
                                    <TableCell align="right">{lab.editablePrice.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                                {editablePrices.procedures.map((proc, index) => (
                                  <TableRow key={`proc-${index}`}>
                                    <TableCell>{proc.MED_PRO_NAME_THAI || proc.PROCEDURE_NAME || proc.MEDICAL_PROCEDURE_CODE}</TableCell>
                                    <TableCell align="center">1</TableCell>
                                    <TableCell align="right">{proc.editablePrice.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                                {editablePrices.drugs.map((drug, index) => (
                                  <TableRow key={`drug-${index}`}>
                                    <TableCell>
                                      {[drug.GENERIC_NAME, drug.TRADE_NAME].filter(Boolean).join(' / ') || drug.GENERIC_NAME || drug.TRADE_NAME || drug.DRUG_CODE}
                                    </TableCell>
                                    <TableCell align="center">
                                      {drug.QTY || 0}{' '}
                                      {drug.DISPLAY_UNIT_NAME || drug.UNIT_NAME || drug.UNIT_CODE || ''}
                                    </TableCell>
                                    <TableCell align="right">{drug.editablePrice.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {/* Total */}
                          <Box sx={{ borderTop: '2px solid #ddd', pt: 2 }}>
                            {/* ✅ แสดงค่ารักษาแยก */}
                            {(() => {
                              const currentPatient = patients[selectedPatientIndex];
                              const isGoldCard = currentPatient?.UCS_CARD === 'Y' ||
                                treatmentData?.treatment?.UCS_CARD === 'Y' ||
                                treatmentData?.patient?.UCS_CARD === 'Y';
                              const isUcsExceeded = ucsUsageInfo.isExceeded;
                              const treatmentFee = (isGoldCard && !isUcsExceeded) ? 0.00 : parseFloat(paymentData.treatmentFee || 100.00);

                              if (treatmentFee > 0) {
                                return (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>ค่ารักษา:</Typography>
                                    <Typography>{treatmentFee.toFixed(2)} บาท</Typography>
                                  </Box>
                                );
                              }
                              return null;
                            })()}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography>รวมค่ารักษา:</Typography>
                              <Typography>{calculateTotalFromEditablePrices().toFixed(2)} บาท</Typography>
                            </Box>
                            {(() => {
                              // ✅ ดึงส่วนลดจาก paymentData ก่อน (เพราะ user อาจแก้ไขใน UI) แล้วค่อย fallback ไปที่อื่น
                              const discount = parseFloat(
                                (paymentData.discount !== undefined && paymentData.discount !== null) ? paymentData.discount :
                                treatmentData?.treatment?.DISCOUNT_AMOUNT ||
                                currentPatient?.paymentData?.discount ||
                                0
                              );
                              return discount > 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography>ส่วนลด:</Typography>
                                  <Typography color="error">-{discount.toFixed(2)} บาท</Typography>
                                </Box>
                              ) : null;
                            })()}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
                              <Typography variant="h6">ยอดชำระ:</Typography>
                              <Typography variant="h6" color="primary">{calculateTotal().toFixed(2)} บาท</Typography>
                            </Box>
                          </Box>
                        </Paper>

                        {/* Buttons */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 2,
                          mt: 3,
                          '@media print': { display: 'none' }
                        }}>
                          <ReceiptPrint
                            patient={currentPatient}
                            items={getReceiptItems()}
                            paymentData={{
                              ...paymentData,
                              // ✅ ส่งส่วนลดจาก paymentData ก่อน (เพราะ user อาจแก้ไขใน UI) แล้วค่อย fallback ไปที่อื่น
                              discount: parseFloat(
                                (paymentData.discount !== undefined && paymentData.discount !== null) ? paymentData.discount :
                                treatmentData?.treatment?.DISCOUNT_AMOUNT ||
                                currentPatient?.paymentData?.discount ||
                                0
                              )
                            }}
                          />

                          {/* ปุ่มปิดการรักษา */}
                          <CloseCaseButton
                            patient={currentPatient}
                            onCloseCase={handleCloseCase}
                          />

                          {/* ✅ ปุ่มแก้ไขยา (ส่งคืนแพทย์) ในหน้าใบเสร็จ */}
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleReturnToDoctor}
                            startIcon={<EditIcon />}
                            sx={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              borderRadius: '12px',
                              borderColor: '#ff9800',
                              color: '#ed6c02',
                              '&:hover': {
                                borderColor: '#ed6c02',
                                backgroundColor: '#fff3e0'
                              }
                            }}
                          >
                            แก้ไขยา
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info">กรุณาเลือกผู้ป่วยเพื่อดูใบเสร็จ</Alert>
                    )}
                  </Box>
                )}

                {/* Tab 2: Drug Labels */}
                {tabIndex === 2 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                      ฉลากยา
                    </Typography>

                    {currentPatient && editablePrices.drugs.length > 0 ? (
                      <Box>
                        {/* Drug Labels Preview */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {editablePrices.drugs.map((drug, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                              <Box sx={{
                                width: '320px',
                                minHeight: '200px',
                                background: 'white',
                                border: '2px solid #4a90e2',
                                margin: '10px auto',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                p: 2,
                                fontFamily: "'Sarabun', sans-serif"
                              }}>
                                <Typography variant="h6" sx={{ color: '#4a90e2', mb: 1, fontFamily: "'Sarabun', sans-serif" }}>
                                  {[drug.GENERIC_NAME, drug.TRADE_NAME].filter(Boolean).join(' / ') || drug.GENERIC_NAME || drug.TRADE_NAME || drug.DRUG_CODE}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: "'Sarabun', sans-serif" }}>
                                  จำนวน: {drug.QTY} {drug.DISPLAY_UNIT_NAME || drug.UNIT_NAME || drug.UNIT_CODE}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: "'Sarabun', sans-serif" }}>วิธีใช้: ครั้งละ {drug.DOSAGE || 1} วันละ {drug.FREQUENCY || 3} ครั้ง</Typography>
                                <Typography variant="body2" sx={{ fontFamily: "'Sarabun', sans-serif" }}>ผู้ป่วย: {currentPatient.PRENAME}{currentPatient.NAME1} {currentPatient.SURNAME}</Typography>
                                {drug.Indication1 && (
                                  <Typography variant="body2" sx={{ mt: 1, fontFamily: "'Sarabun', sans-serif" }}>
                                    ข้อบ่งใช้: {drug.Indication1}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Buttons */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 2,
                          mt: 3
                        }}>
                          <DrugLabelsPrint
                            patient={currentPatient}
                            drugs={editablePrices.drugs}
                          />

                          {/* ปุ่มปิดการรักษา */}
                          <CloseCaseButton
                            patient={currentPatient}
                            onCloseCase={handleCloseCase}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Alert severity="info" sx={{ borderRadius: '12px', textAlign: 'center', py: 4, mb: 3 }}>
                          {!currentPatient ? 'กรุณาเลือกผู้ป่วยเพื่อดูฉลากยา' : 'ผู้ป่วยรายนี้ไม่มีการสั่งยา'}
                        </Alert>

                        {/* ปุ่มปิดการรักษาแม้ไม่มียา */}
                        {currentPatient && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CloseCaseButton
                              patient={currentPatient}
                              onCloseCase={handleCloseCase}
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container >
  );
};

export default Paymentanddispensingmedicine;