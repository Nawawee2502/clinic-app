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
import { Print as PrintIcon } from "@mui/icons-material";

// Import Services
import PatientService from "../services/patientService";
import TreatmentService from "../services/treatmentService";

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
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // โหลดข้อมูลผู้ป่วย
  useEffect(() => {
    loadCompletedPatients();
  }, []);

  // โหลดข้อมูลการรักษาเมื่อเปลี่ยนผู้ป่วย
  useEffect(() => {
    if (patients[selectedPatientIndex]) {
      loadTreatmentData(patients[selectedPatientIndex].VNO);
    }
  }, [selectedPatientIndex, patients]);

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

      if (!paymentData.receivedAmount || parseFloat(paymentData.receivedAmount) < calculateTotal()) {
        setSnackbar({
          open: true,
          message: 'จำนวนเงินที่รับไม่เพียงพอ',
          severity: 'error'
        });
        return;
      }

      const currentPatient = patients[selectedPatientIndex];
      const totalAmount = calculateTotalFromEditablePrices();
      const discount = parseFloat(paymentData.discount || 0);
      const netAmount = calculateTotal();
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
          DISCOUNT_AMOUNT: discount,
          NET_AMOUNT: netAmount,
          PAYMENT_STATUS: 'ชำระเงินแล้ว', // เปลี่ยนเฉพาะตัวนี้
          PAYMENT_DATE: new Date().toISOString().split('T')[0],
          PAYMENT_TIME: new Date().toLocaleTimeString('th-TH', { hour12: false }),
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
              paymentDate: new Date().toISOString().split('T')[0],
              paymentTime: new Date().toLocaleTimeString('th-TH', { hour12: false })
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

  const loadCompletedPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await PatientService.getTodayPatientsFromQueue({
        refresh: true,
        timestamp: Date.now()
      });

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

        // แก้ไขเงื่อนไขการกรอง
        const filteredPatients = patientsWithTreatmentStatus.filter(patient => {
          const queueStatus = patient.queueStatus || patient.QUEUE_STATUS || patient.STATUS || 'รอตรวจ';
          const treatmentStatus = patient.STATUS1 || 'กำลังตรวจ';
          const paymentStatus = patient.PAYMENT_STATUS || 'รอชำระ'; // เพิ่มบรรทัดนี้

          console.log(`Patient ${patient.HNCODE}: queueStatus="${queueStatus}", treatmentStatus="${treatmentStatus}", paymentStatus="${paymentStatus}"`);

          return queueStatus === 'เสร็จแล้ว' &&
            treatmentStatus === 'เสร็จแล้ว' &&
            paymentStatus !== 'ชำระเงินแล้ว'; // เช็ค PAYMENT_STATUS แทน
        });

        console.log(`Found ${filteredPatients.length} patients waiting for payment`);

        setPatients(filteredPatients);


      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้: ' + response.message);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setLoading(false);
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

      // อัปเดต STATUS1 เป็น 'ปิดแล้ว' ใช้ updateTreatment แทน updateTreatmentStatus
      const treatmentUpdateData = {
        STATUS1: 'เสร็จแล้ว',
        // เพิ่มข้อมูลเวลาปิดการรักษา (optional)
        CLOSE_DATE: new Date().toISOString().split('T')[0],
        CLOSE_TIME: new Date().toLocaleTimeString('th-TH', { hour12: false }),
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
        loadCompletedPatients();
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

  const loadTreatmentData = async (vno) => {
    if (!vno) {
      setTreatmentData(null);
      return;
    }

    try {
      setLoadingTreatment(true);
      const response = await TreatmentService.getTreatmentByVNO(vno);

      if (response.success) {
        setTreatmentData(response.data);

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
        if (response.data.procedures && response.data.procedures.length > 0) {
          proceduresArray = response.data.procedures.map(item => ({
            ...item,
            editablePrice: parseFloat(item.AMT || 200),
            originalPrice: parseFloat(item.AMT || 200)
          }));
        }

        // ดึงข้อมูล Drugs
        let drugsArray = [];
        if (response.data.drugs && response.data.drugs.length > 0) {
          drugsArray = response.data.drugs.map(item => ({
            ...item,
            editablePrice: parseFloat(item.AMT || 0),
            originalPrice: parseFloat(item.AMT || 0)
          }));
        }

        // เซ็ตราคาที่แก้ไขได้
        setEditablePrices({
          labs: labsArray,
          procedures: proceduresArray,
          drugs: drugsArray
        });

        console.log('💰 Payment - Final editable prices:', {
          labs: labsArray,
          procedures: proceduresArray,
          drugs: drugsArray
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
    const drugTotal = editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0);

    return labTotal + procedureTotal + drugTotal;
  };

  const calculateTotal = () => {
    const totalCost = calculateTotalFromEditablePrices();
    const discount = parseFloat(paymentData.discount || 0);
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
        name: item.GENERIC_NAME || item.DRUG_CODE || "ยา",
        quantity: item.QTY || 1,
        unit: item.UNIT_CODE || "เม็ด",
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
          <Button color="inherit" size="small" onClick={loadCompletedPatients}>
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
            onRefresh={loadCompletedPatients}
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
                        {new Date().toLocaleTimeString('th-TH')}
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
                        <PatientInfoHeader patient={currentPatient} />
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
                              <Typography variant="body2"><strong>วันที่:</strong> {new Date().toLocaleDateString('th-TH')}</Typography>
                              <Typography variant="body2"><strong>เวลา:</strong> {new Date().toLocaleTimeString('th-TH')}</Typography>
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
                                    <TableCell>{drug.GENERIC_NAME || drug.DRUG_CODE}</TableCell>
                                    <TableCell align="center">{drug.QTY || 0} {drug.UNIT_CODE || ''}</TableCell>
                                    <TableCell align="right">{drug.editablePrice.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {/* Total */}
                          <Box sx={{ borderTop: '2px solid #ddd', pt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography>รวมค่ารักษา:</Typography>
                              <Typography>{calculateTotalFromEditablePrices().toFixed(2)} บาท</Typography>
                            </Box>
                            {paymentData.discount > 0 && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>ส่วนลด:</Typography>
                                <Typography>-{paymentData.discount.toFixed(2)} บาท</Typography>
                              </Box>
                            )}
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
                            paymentData={paymentData}
                          />

                          {/* ปุ่มปิดการรักษา */}
                          <CloseCaseButton
                            patient={currentPatient}
                            onCloseCase={handleCloseCase}
                          />
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
                                p: 2
                              }}>
                                <Typography variant="h6" sx={{ color: '#4a90e2', mb: 1 }}>
                                  {drug.GENERIC_NAME || drug.DRUG_CODE}
                                </Typography>
                                <Typography variant="body2">จำนวน: {drug.QTY} {drug.UNIT_CODE}</Typography>
                                <Typography variant="body2">วิธีใช้: ครั้งละ {drug.DOSAGE || 1} วันละ {drug.FREQUENCY || 3} ครั้ง</Typography>
                                <Typography variant="body2">ผู้ป่วย: {currentPatient.PRENAME}{currentPatient.NAME1} {currentPatient.SURNAME}</Typography>
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
    </Container>
  );
};

export default Paymentanddispensingmedicine;