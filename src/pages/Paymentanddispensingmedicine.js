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

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ReceiptPDF from "../components/Paymentanddispensingmedicine/ReceiptPDF";

// Import Services
import PatientService from "../services/patientService";
import TreatmentService from "../services/treatmentService";

// Import Components
import PatientQueueSidebar from "../components/Paymentanddispensingmedicine/PatientQueueSidebar";
import PatientInfoHeader from "../components/Paymentanddispensingmedicine/PatientInfoHeader";
import PaymentSummaryCard from "../components/Paymentanddispensingmedicine/PaymentSummaryCard";
import DrugsTable from "../components/Paymentanddispensingmedicine/DrugsTable";
import LabProceduresTable from "../components/Paymentanddispensingmedicine/LabProceduresTable";

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

  const handlePrintReceipt = () => {
    if (!PrintUtils.checkPrintSupport()) return;

    // ตรวจสอบว่ามีข้อมูลครบถ้วน
    if (!currentPatient || !treatmentData || calculateTotalFromEditablePrices() === 0) {
      setSnackbar({
        open: true,
        message: 'ไม่สามารถพิมพ์ใบเสร็จได้ กรุณาตรวจสอบข้อมูล',
        severity: 'error'
      });
      return;
    }

    PrintUtils.printReceipt();
  };

  // ฟังก์ชันสำหรับจัดการการพิมพ์ฉลากยา
  const handlePrintDrugLabels = () => {
    if (!PrintUtils.checkPrintSupport()) return;

    if (!currentPatient || editablePrices.drugs.length === 0) {
      setSnackbar({
        open: true,
        message: 'ไม่มีรายการยาที่จะพิมพ์ฉลาก',
        severity: 'error'
      });
      return;
    }

    PrintUtils.printDrugLabels();
  };

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

      // ข้อมูลการชำระเงินที่จะบันทึกลง treatment record
      const paymentInfo = {
        PAYMENT_STATUS: 'ชำระเงินแล้ว',
        PAYMENT_DATE: new Date().toISOString().split('T')[0],
        PAYMENT_TIME: new Date().toLocaleTimeString('th-TH'),
        TOTAL_AMOUNT: calculateTotal(),
        DISCOUNT: paymentData.discount || 0,
        PAYMENT_METHOD: paymentData.paymentMethod,
        RECEIVED_AMOUNT: parseFloat(paymentData.receivedAmount),
        CHANGE_AMOUNT: parseFloat(paymentData.receivedAmount) - calculateTotal(),
        CASHIER: 'PAYMENT_SYSTEM'
      };

      // Step 1: อัปเดต treatment record
      console.log('💰 Updating treatment record for VNO:', currentPatient.VNO);

      try {
        // อัปเดต STATUS1 และข้อมูลการชำระเงิน
        const treatmentUpdateData = {
          VNO: currentPatient.VNO,
          STATUS1: 'ชำระเงินแล้ว', // ใช้ฟิลด์ STATUS1 ที่มีอยู่แล้ว
          PAYMENT_INFO: JSON.stringify(paymentInfo), // เก็บข้อมูลการชำระเป็น JSON
          SYSTEM_DATE: new Date().toISOString().split('T')[0],
          SYSTEM_TIME: new Date().toLocaleTimeString('th-TH')
        };

        // เรียก API อัปเดต treatment
        const treatmentResponse = await TreatmentService.updateTreatmentStatus(
          currentPatient.VNO,
          treatmentUpdateData
        );

        if (!treatmentResponse.success) {
          throw new Error('ไม่สามารถอัปเดต treatment record ได้: ' + treatmentResponse.message);
        }

        console.log('✅ Treatment record updated successfully');

      } catch (treatmentError) {
        console.error('❌ Error updating treatment record:', treatmentError);
        throw treatmentError;
      }

      // Step 2: อัปเดตสถานะคิวเป็น 'ชำระเงินแล้ว'
      try {
        const queueUpdateResponse = await QueueService.updateQueueStatus(
          currentPatient.queueId,
          'ชำระเงินแล้ว'
        );

        if (!queueUpdateResponse.success) {
          console.warn('⚠️ Failed to update queue status:', queueUpdateResponse.message);
        } else {
          console.log('✅ Queue status updated successfully');
        }
      } catch (queueError) {
        console.error('❌ Error updating queue status:', queueError);
        // ไม่ throw error เพราะ treatment record สำคัญกว่า
      }

      // Step 3: ลบผู้ป่วยออกจาก state (UI)
      const updatedPatients = patients.filter((_, index) => index !== selectedPatientIndex);
      setPatients(updatedPatients);

      // Step 4: อัพเดต selectedPatientIndex
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

      // Success message
      setSnackbar({
        open: true,
        message: `✅ บันทึกการชำระเงินสำเร็จ ยอดชำระ: ฿${calculateTotal().toFixed(2)} - ${currentPatient.PRENAME} ${currentPatient.NAME1} ${currentPatient.SURNAME}`,
        severity: 'success'
      });

      // Step 5: รีเซ็ตข้อมูลการชำระเงิน
      setPaymentData({
        paymentMethod: 'เงินสด',
        receivedAmount: '',
        discount: 0,
        remarks: ''
      });

      setTabIndex(1); // ไปหน้าใบเสร็จ

      // Step 6: รีเฟรชข้อมูลหลังจาก 1 วินาที
      setTimeout(() => {
        loadCompletedPatients();
      }, 1000);

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน: ' + error.message,
        severity: 'error'
      });
    }
  };

  // แก้ไขฟังก์ชันโหลดข้อมูล - กรองตาม STATUS1
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

        // เพิ่มการดึงข้อมูล treatment status สำหรับแต่ละผู้ป่วย
        const patientsWithTreatmentStatus = await Promise.all(
          response.data.map(async (patient) => {
            try {
              // ดึง treatment status จาก VNO
              if (patient.VNO) {
                const treatmentResponse = await TreatmentService.getTreatmentByVNO(patient.VNO);
                if (treatmentResponse.success && treatmentResponse.data.treatment) {
                  patient.STATUS1 = treatmentResponse.data.treatment.STATUS1;
                }
              }
              return patient;
            } catch (error) {
              console.warn(`Failed to get treatment status for VNO ${patient.VNO}:`, error);
              return patient;
            }
          })
        );

        // กรองเฉพาะผู้ป่วยที่รอชำระเงิน
        const filteredPatients = patientsWithTreatmentStatus.filter(patient => {
          const queueStatus = patient.queueStatus || patient.QUEUE_STATUS || patient.STATUS || 'รอตรวจ';
          const treatmentStatus = patient.STATUS1 || 'กำลังตรวจ';

          console.log(`Patient ${patient.HNCODE}: queueStatus="${queueStatus}", treatmentStatus="${treatmentStatus}"`);

          return queueStatus === 'เสร็จแล้ว' &&
            treatmentStatus !== 'ชำระเงินแล้ว' &&
            treatmentStatus !== 'ปิดแล้ว';
        });

        console.log(`Found ${filteredPatients.length} patients waiting for payment`);

        setPatients(filteredPatients);

        if (filteredPatients.length === 0) {
          setError('ไม่มีผู้ป่วยที่รอการชำระเงิน');
        }

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

  const generateProfessionalReceipt = () => {
    if (!currentPatient) {
      setSnackbar({
        open: true,
        message: 'กรุณาเลือกผู้ป่วยก่อน',
        severity: 'error'
      });
      return;
    }

    const totalAmount = calculateTotalFromEditablePrices();
    const finalAmount = calculateTotal();

    // รวมรายการทั้งหมด
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

    const receiptWindow = window.open('', '_blank', 'width=800,height=900');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>ใบเสร็จรับเงิน - ${currentPatient.VNO}</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Sarabun', Arial, sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #333;
                  background: #f5f5f5;
                  padding: 20px;
              }
              
              .receipt-container {
                  max-width: 700px;
                  margin: 0 auto;
                  background: white;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                  border-radius: 10px;
                  overflow: hidden;
              }
              
              .header {
                  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                  color: white;
                  text-align: center;
                  padding: 30px 20px;
                  position: relative;
              }
              
              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="2" fill="white" opacity="0.1"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.1"/></svg>');
              }
              
              .clinic-name {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 8px;
                  position: relative;
                  z-index: 1;
              }
              
              .clinic-address {
                  font-size: 14px;
                  opacity: 0.9;
                  margin-bottom: 4px;
                  position: relative;
                  z-index: 1;
              }
              
              .receipt-title {
                  font-size: 20px;
                  font-weight: 600;
                  margin-top: 15px;
                  padding: 10px 30px;
                  background: rgba(255,255,255,0.2);
                  border-radius: 20px;
                  display: inline-block;
                  position: relative;
                  z-index: 1;
              }
              
              .content {
                  padding: 30px;
              }
              
              .patient-info {
                  background: #f8f9fa;
                  border-radius: 10px;
                  padding: 20px;
                  margin-bottom: 25px;
                  border-left: 4px solid #1976d2;
              }
              
              .info-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
                  flex-wrap: wrap;
                  gap: 10px;
              }
              
              .info-row:last-child {
                  margin-bottom: 0;
              }
              
              .info-label {
                  font-weight: 600;
                  color: #555;
                  min-width: 80px;
              }
              
              .info-value {
                  font-weight: 500;
                  color: #1976d2;
              }
              
              .items-section {
                  margin-bottom: 25px;
              }
              
              .section-title {
                  font-size: 18px;
                  font-weight: 600;
                  color: #1976d2;
                  margin-bottom: 15px;
                  padding-bottom: 5px;
                  border-bottom: 2px solid #e3f2fd;
              }
              
              .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .items-table th {
                  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                  color: white;
                  font-weight: 600;
                  padding: 15px 10px;
                  text-align: left;
                  font-size: 14px;
              }
              
              .items-table th:nth-child(1) { width: 50%; }
              .items-table th:nth-child(2) { width: 20%; text-align: center; }
              .items-table th:nth-child(3) { width: 30%; text-align: right; }
              
              .items-table td {
                  padding: 12px 10px;
                  border-bottom: 1px solid #eee;
                  font-size: 13px;
              }
              
              .items-table tbody tr:nth-child(even) {
                  background: #f8f9fa;
              }
              
              .items-table tbody tr:hover {
                  background: #e3f2fd;
              }
              
              .item-name {
                  font-weight: 500;
                  color: #333;
              }
              
              .item-quantity {
                  text-align: center;
                  font-weight: 500;
              }
              
              .item-price {
                  text-align: right;
                  font-weight: 600;
                  color: #1976d2;
              }
              
              .summary-section {
                  background: #f8f9fa;
                  border-radius: 10px;
                  padding: 20px;
                  border-top: 3px solid #1976d2;
              }
              
              .summary-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
                  font-size: 15px;
              }
              
              .summary-row:last-child {
                  margin-bottom: 0;
              }
              
              .summary-label {
                  font-weight: 500;
              }
              
              .summary-value {
                  font-weight: 600;
              }
              
              .total-row {
                  background: white;
                  margin: 15px -10px -10px;
                  padding: 15px 10px;
                  border-radius: 8px;
                  border: 2px solid #1976d2;
                  font-size: 18px;
                  font-weight: 700;
                  color: #1976d2;
              }
              
              .footer {
                  background: #f8f9fa;
                  text-align: center;
                  padding: 20px;
                  color: #666;
                  font-size: 12px;
              }
              
              .thank-you {
                  font-size: 16px;
                  font-weight: 600;
                  color: #1976d2;
                  margin-bottom: 10px;
              }
              
              .print-section {
                  text-align: center;
                  padding: 20px;
                  background: white;
              }
              
              .print-btn {
                  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                  color: white;
                  border: none;
                  padding: 12px 30px;
                  font-size: 16px;
                  font-weight: 600;
                  border-radius: 25px;
                  cursor: pointer;
                  margin: 0 10px;
                  transition: all 0.3s ease;
                  font-family: 'Sarabun', Arial, sans-serif;
              }
              
              .print-btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 5px 15px rgba(25,118,210,0.4);
              }
              
              .close-btn {
                  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
              }
              
              .close-btn:hover {
                  box-shadow: 0 5px 15px rgba(244,67,54,0.4);
              }
              
              .empty-state {
                  text-align: center;
                  padding: 40px;
                  color: #999;
                  font-style: italic;
              }
              
              @media print {
                  body {
                      background: white;
                      padding: 0;
                  }
                  .receipt-container {
                      box-shadow: none;
                      border-radius: 0;
                  }
                  .print-section {
                      display: none !important;
                  }
              }
              
              @media (max-width: 600px) {
                  .receipt-container {
                      margin: 0;
                      border-radius: 0;
                  }
                  
                  .content {
                      padding: 20px;
                  }
                  
                  .items-table th,
                  .items-table td {
                      padding: 8px 5px;
                      font-size: 12px;
                  }
                  
                  .info-row {
                      flex-direction: column;
                      align-items: flex-start;
                  }
              }
          </style>
      </head>
      <body>
          <div class="receipt-container">
              <!-- Header -->
              <div class="header">
                  <div class="clinic-name">สัมพันธ์คลินิค</div>
                  <div class="clinic-address">280 หมู่ 4 ถนน เชียงใหม่-ฮอด ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                  <div class="clinic-address">โทรศัพท์: 053-826-524</div>
                  <div class="receipt-title">ใบเสร็จรับเงิน</div>
              </div>
              
              <!-- Content -->
              <div class="content">
                  <!-- Patient Information -->
                  <div class="patient-info">
                      <div class="info-row">
                          <span class="info-label">เลขที่ VN:</span>
                          <span class="info-value">${currentPatient.VNO}</span>
                          <span class="info-label">เลขที่ HN:</span>
                          <span class="info-value">${currentPatient.HNCODE}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">ชื่อผู้ป่วย:</span>
                          <span class="info-value">${currentPatient.PRENAME}${currentPatient.NAME1} ${currentPatient.SURNAME}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">วันที่:</span>
                          <span class="info-value">${new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</span>
                          <span class="info-label">เวลา:</span>
                          <span class="info-value">${new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })}</span>
                      </div>
                  </div>
                  
                  <!-- Items Section -->
                  <div class="items-section">
                      <div class="section-title">รายการค่าใช้จ่าย</div>
                      
                      ${allItems.length > 0 ? `
                      <table class="items-table">
                          <thead>
                              <tr>
                                  <th>รายการ</th>
                                  <th>จำนวน</th>
                                  <th>ราคา (บาท)</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${allItems.map(item => `
                                  <tr>
                                      <td class="item-name">${item.name}</td>
                                      <td class="item-quantity">${item.quantity} ${item.unit}</td>
                                      <td class="item-price">${item.price.toFixed(2)}</td>
                                  </tr>
                              `).join('')}
                          </tbody>
                      </table>
                      ` : '<div class="empty-state">ไม่มีรายการค่าใช้จ่าย</div>'}
                  </div>
                  
                  <!-- Summary Section -->
                  <div class="summary-section">
                      <div class="summary-row">
                          <span class="summary-label">รวมค่ารักษาทั้งหมด:</span>
                          <span class="summary-value">${totalAmount.toFixed(2)} บาท</span>
                      </div>
                      
                      ${paymentData.discount > 0 ? `
                      <div class="summary-row">
                          <span class="summary-label">หักส่วนลด:</span>
                          <span class="summary-value">-${paymentData.discount.toFixed(2)} บาท</span>
                      </div>
                      ` : ''}
                      
                      <div class="summary-row total-row">
                          <span class="summary-label">ยอดชำระสุทธิ:</span>
                          <span class="summary-value">${finalAmount.toFixed(2)} บาท</span>
                      </div>
                  </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                  <div class="thank-you">ขอบคุณที่ใช้บริการ</div>
                  <div>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</div>
              </div>
          </div>
          
          <!-- Print Section -->
          <div class="print-section">
              <button class="print-btn" onclick="window.print()">
                  🖨️ พิมพ์ใบเสร็จ
              </button>
              <button class="print-btn close-btn" onclick="window.close()">
                  ❌ ปิดหน้าต่าง
              </button>
          </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.focus();
  };

  const generateProfessionalDrugLabels = () => {
    if (!currentPatient || editablePrices.drugs.length === 0) {
      setSnackbar({
        open: true,
        message: 'ไม่มีรายการยาที่จะพิมพ์ฉลาก',
        severity: 'error'
      });
      return;
    }

    const labelWindow = window.open('', '_blank', 'width=1200,height=800');

    const labelsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>ฉลากยา - ${currentPatient.PRENAME}${currentPatient.NAME1} ${currentPatient.SURNAME}</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Sarabun', Arial, sans-serif;
                  font-size: 13px;
                  line-height: 1.4;
                  background: #f0f2f5;
                  padding: 20px;
              }
              
              .labels-container {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                  gap: 20px;
                  max-width: 1200px;
                  margin: 0 auto;
              }
              
              .drug-label {
                  width: 340px;
                  height: 480px;
                  background: white;
                  border: 2px solid #1976d2;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  page-break-inside: avoid;
                  display: flex;
                  flex-direction: column;
              }
              
              .label-header {
                  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                  color: white;
                  padding: 15px;
                  text-align: center;
                  position: relative;
                  overflow: hidden;
              }
              
              .label-header::before {
                  content: '💊';
                  position: absolute;
                  left: 15px;
                  top: 50%;
                  transform: translateY(-50%);
                  font-size: 24px;
                  background: white;
                  color: #1976d2;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              
              .clinic-title {
                  font-size: 18px;
                  font-weight: 700;
                  margin-bottom: 2px;
                  letter-spacing: 0.5px;
              }
              
              .clinic-subtitle {
                  font-size: 11px;
                  opacity: 0.95;
                  margin-bottom: 2px;
              }
              
              .clinic-phone {
                  font-size: 12px;
                  font-weight: 500;
              }
              
              .label-content {
                  padding: 18px;
                  flex: 1;
                  display: flex;
                  flex-direction: column;
              }
              
              .patient-section {
                  background: #f8f9fa;
                  border-radius: 8px;
                  padding: 12px;
                  margin-bottom: 15px;
                  border-left: 4px solid #1976d2;
              }
              
              .patient-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 6px;
                  font-size: 12px;
              }
              
              .patient-row:last-child {
                  margin-bottom: 0;
              }
              
              .patient-label {
                  color: #666;
                  font-weight: 500;
                  min-width: 60px;
              }
              
              .patient-value {
                  font-weight: 600;
                  color: #333;
                  flex: 1;
                  margin: 0 8px;
              }
              
              .drug-name-section {
                  text-align: center;
                  margin-bottom: 15px;
              }
              
              .drug-name {
                  font-size: 16px;
                  font-weight: 700;
                  color: #1976d2;
                  background: #e3f2fd;
                  padding: 8px 12px;
                  border-radius: 6px;
                  border: 1px solid #bbdefb;
              }
              
              .dosage-section {
                  background: #fff3e0;
                  border-radius: 8px;
                  padding: 12px;
                  margin-bottom: 15px;
                  border: 1px solid #ffcc02;
              }
              
              .dosage-title {
                  font-size: 13px;
                  font-weight: 600;
                  color: #f57c00;
                  text-align: center;
                  margin-bottom: 8px;
              }
              
              .dosage-info {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 20px;
                  flex-wrap: wrap;
              }
              
              .dosage-item {
                  text-align: center;
              }
              
              .dosage-number {
                  font-size: 18px;
                  font-weight: 700;
                  color: #d32f2f;
                  display: block;
              }
              
              .dosage-label {
                  font-size: 11px;
                  color: #666;
              }
              
              .time-grid {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 8px;
                  margin: 12px 0;
              }
              
              .time-slot {
                  text-align: center;
                  padding: 6px 4px;
                  border-radius: 6px;
                  font-size: 10px;
                  border: 1px solid #e0e0e0;
                  background: white;
              }
              
              .time-slot.active {
                  background: #e3f2fd;
                  border-color: #1976d2;
                  color: #1976d2;
                  font-weight: 600;
              }
              
              .time-icon {
                  display: block;
                  font-size: 14px;
                  margin-bottom: 2px;
              }
              
              .meal-timing {
                  margin: 12px 0;
              }
              
              .meal-option {
                  display: flex;
                  align-items: center;
                  margin-bottom: 4px;
                  font-size: 11px;
              }
              
              .meal-checkbox {
                  width: 12px;
                  height: 12px;
                  border: 1px solid #1976d2;
                  border-radius: 2px;
                  margin-right: 6px;
                  position: relative;
                  background: white;
              }
              
              .meal-checkbox.checked {
                  background: #1976d2;
              }
              
              .meal-checkbox.checked::after {
                  content: '✓';
                  position: absolute;
                  top: -2px;
                  left: 2px;
                  color: white;
                  font-size: 10px;
                  font-weight: bold;
              }
              
              .meal-text {
                  flex: 1;
              }
              
              .meal-english {
                  color: #666;
                  font-size: 9px;
                  margin-left: auto;
              }
              
              .instructions-section {
                  background: #f1f8e9;
                  border-radius: 8px;
                  padding: 12px;
                  margin-top: auto;
                  border: 1px solid #c8e6c9;
              }
              
              .instructions-title {
                  font-size: 12px;
                  font-weight: 600;
                  color: #388e3c;
                  margin-bottom: 8px;
              }
              
              .instructions-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 6px;
                  font-size: 9px;
                  color: #555;
              }
              
              .instruction-item {
                  display: flex;
                  align-items: flex-start;
                  line-height: 1.3;
              }
              
              .instruction-checkbox {
                  width: 10px;
                  height: 10px;
                  border: 1px solid #388e3c;
                  border-radius: 1px;
                  margin-right: 4px;
                  margin-top: 1px;
                  flex-shrink: 0;
                  background: white;
              }
              
              .instruction-checkbox.checked {
                  background: #388e3c;
              }
              
              .instruction-checkbox.checked::after {
                  content: '✓';
                  position: absolute;
                  color: white;
                  font-size: 7px;
                  font-weight: bold;
                  margin-left: -8px;
                  margin-top: -1px;
              }
              
              .expiry-section {
                  text-align: center;
                  margin-top: 15px;
                  padding-top: 12px;
                  border-top: 1px solid #e0e0e0;
              }
              
              .expiry-text {
                  font-size: 11px;
                  color: #666;
              }
              
              .expiry-date {
                  font-weight: 600;
                  color: #d32f2f;
                  margin-left: 5px;
              }
              
              .print-controls {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 1000;
                  display: flex;
                  gap: 10px;
              }
              
              .print-btn {
                  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(25,118,210,0.3);
                  transition: all 0.3s ease;
                  font-family: 'Sarabun', Arial, sans-serif;
              }
              
              .print-btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(25,118,210,0.4);
              }
              
              .close-btn {
                  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
              }
              
              .close-btn:hover {
                  box-shadow: 0 4px 12px rgba(244,67,54,0.4);
              }
              
              @media print {
                  body {
                      background: white;
                      padding: 10px;
                  }
                  
                  .print-controls {
                      display: none !important;
                  }
                  
                  .labels-container {
                      gap: 15px;
                  }
                  
                  .drug-label {
                      box-shadow: none;
                      border-width: 1px;
                  }
              }
              
              @page {
                  margin: 10mm;
                  size: A4;
              }
          </style>
      </head>
      <body>
          <div class="print-controls">
              <button class="print-btn" onclick="window.print()">
                  🖨️ พิมพ์ฉลากยาทั้งหมด (${editablePrices.drugs.length} ฉลาก)
              </button>
              <button class="print-btn close-btn" onclick="window.close()">
                  ❌ ปิดหน้าต่าง
              </button>
          </div>
          
          <div class="labels-container">
              ${editablePrices.drugs.map((drug, index) => {
      const dosage = drug.DOSAGE || '1';
      const frequency = parseInt(drug.FREQUENCY || '3');
      const quantity = drug.QTY || 1;
      const unit = drug.UNIT_CODE || 'เม็ด';
      const drugName = drug.GENERIC_NAME || drug.DRUG_CODE || 'ยา';
      const expireDate = drug.EXPIRE_DATE || '31/12/2025';

      return `
                  <div class="drug-label">
                      <div class="label-header">
                          <div class="clinic-title">สัมพันธ์คลินิค คลินิกเวชกรรม</div>
                          <div class="clinic-subtitle">280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160</div>
                          <div class="clinic-phone">โทร: 053-341-723</div>
                      </div>
                      
                      <div class="label-content">
                          <div class="patient-section">
                              <div class="patient-row">
                                  <span class="patient-label">ชื่อผู้ป่วย</span>
                                  <span class="patient-value">${currentPatient.PRENAME}${currentPatient.NAME1} ${currentPatient.SURNAME}</span>
                                  <span class="patient-label">วันที่</span>
                                  <span class="patient-value">${new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                              </div>
                              <div class="patient-row">
                                  <span class="patient-label">ที่อยู่</span>
                                  <span class="patient-value">HN: ${currentPatient.HNCODE} VN: ${currentPatient.VNO}</span>
                                  <span class="patient-label">จำนวน</span>
                                  <span class="patient-value">${quantity} ${unit}</span>
                              </div>
                          </div>
                          
                          <div class="drug-name-section">
                              <div class="drug-name">${drugName}</div>
                          </div>
                          
                          <div class="dosage-section">
                              <div class="dosage-title">วิธีการใช้ยา</div>
                              <div class="dosage-info">
                                  <div class="dosage-item">
                                      <span class="dosage-number">${dosage}</span>
                                      <span class="dosage-label">เม็ด/ครั้ง</span>
                                  </div>
                                  <div class="dosage-item">
                                      <span class="dosage-number">${frequency}</span>
                                      <span class="dosage-label">ครั้ง/วัน</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="time-grid">
                              <div class="time-slot ${frequency >= 1 ? 'active' : ''}">
                                  <span class="time-icon">🌅</span>
                                  <div>เช้า<br>Morning</div>
                              </div>
                              <div class="time-slot ${frequency >= 2 ? 'active' : ''}">
                                  <span class="time-icon">☀️</span>
                                  <div>กลางวัน<br>Noon</div>
                              </div>
                              <div class="time-slot ${frequency >= 3 ? 'active' : ''}">
                                  <span class="time-icon">🌆</span>
                                  <div>เย็น<br>Evening</div>
                              </div>
                              <div class="time-slot ${frequency >= 4 ? 'active' : ''}">
                                  <span class="time-icon">🌙</span>
                                  <div>ก่อนนอน<br>Bedtime</div>
                              </div>
                          </div>
                          
                          <div class="meal-timing">
                              <div class="meal-option">
                                  <div class="meal-checkbox"></div>
                                  <span class="meal-text">ก่อนอาหาร</span>
                                  <span class="meal-english">Before meal</span>
                              </div>
                              <div class="meal-option">
                                  <div class="meal-checkbox checked"></div>
                                  <span class="meal-text">หลังอาหาร</span>
                                  <span class="meal-english">After meal</span>
                              </div>
                          </div>
                          
                          <div class="instructions-section">
                              <div class="instructions-title">คำแนะนำในการใช้ยา</div>
                              <div class="instructions-grid">
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox"></div>
                                      <span>ก่อนอาหารครึ่ง-1 ชั่วโมง<br><em>30-60 min before meals</em></span>
                                  </div>
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox checked"></div>
                                      <span>ทานยาติดต่อกันจนหมด<br><em>Take until finished</em></span>
                                  </div>
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox"></div>
                                      <span>ทานหลังอาหารทันที<br><em>Immediately after meals</em></span>
                                  </div>
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox checked"></div>
                                      <span>ดื่มน้ำตามมากๆ<br><em>Drink plenty of water</em></span>
                                  </div>
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox"></div>
                                      <span>ยานี้อาจทำให้ง่วงซึม<br><em>May cause drowsiness</em></span>
                                  </div>
                                  <div class="instruction-item">
                                      <div class="instruction-checkbox"></div>
                                      <span>อื่นๆ<br><em>Others</em></span>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="expiry-section">
                              <span class="expiry-text">วันหมดอายุ (Exp.)</span>
                              <span class="expiry-date">${expireDate}</span>
                          </div>
                      </div>
                  </div>
                  `;
    }).join('')}
          </div>
      </body>
      </html>
    `;

    labelWindow.document.write(labelsHTML);
    labelWindow.document.close();
    labelWindow.focus();
  };

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
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  ไม่มีผู้ป่วยรอการชำระเงิน
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  ผู้ป่วยทุกรายได้ชำระเงินเรียบร้อยแล้ว หรือยังไม่มีผู้ป่วยที่รักษาเสร็จ
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/clinic/ตรวจรักษา')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  ไปหน้าตรวจรักษา
                </Button>
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
                  <Grid container spacing={3}>
                    {/* Patient Info Header */}
                    {currentPatient && (
                      <Grid item xs={12}>
                        <PatientInfoHeader patient={currentPatient} />
                      </Grid>
                    )}

                    {/* Treatment Details */}
                    <Grid item xs={12}>
                      {loadingTreatment ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <CircularProgress size={60} sx={{ color: '#5698E0' }} />
                          <Typography variant="h6" sx={{ mt: 2, color: '#2B69AC' }}>กำลังโหลดข้อมูลการรักษา...</Typography>
                        </Box>
                      ) : treatmentData ? (
                        <Box>
                          {/* Lab & Procedures + Payment Summary */}
                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} lg={8}>
                              <LabProceduresTable
                                editablePrices={editablePrices}
                                editingItem={editingItem}
                                onEditPrice={handleEditPrice}
                                onSavePrice={handleSavePrice}
                                onCancelEdit={handleCancelEdit}
                              />
                            </Grid>
                            <Grid item xs={12} lg={4}>
                              <PaymentSummaryCard
                                editablePrices={editablePrices}
                                paymentData={paymentData}
                                onPaymentDataChange={setPaymentData}
                                onPayment={handlePayment}
                                loading={false}
                              />
                            </Grid>
                          </Grid>

                          {/* Drugs Table */}
                          <DrugsTable
                            editablePrices={editablePrices}
                            editingItem={editingItem}
                            onEditPrice={handleEditPrice}
                            onSavePrice={handleSavePrice}
                            onCancelEdit={handleCancelEdit}
                          />

                          {/* Print Buttons */}
                          <Card elevation={2} sx={{ borderRadius: '12px', bgcolor: '#f8f9fa' }}>
                            <CardContent>
                              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#2B69AC' }}>
                                🖨️ การพิมพ์เอกสาร
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: 'wrap' }}>
                                <Button
                                  variant="contained"
                                  startIcon={<span>🧾</span>}
                                  onClick={() => setTabIndex(1)}
                                  disabled={calculateTotalFromEditablePrices() === 0}
                                  sx={{
                                    backgroundColor: "#5698E0",
                                    height: 48,
                                    minWidth: 160,
                                    borderRadius: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': { backgroundColor: "#2B69AC" }
                                  }}
                                >
                                  พิมพ์ใบเสร็จ
                                </Button>

                                <Button
                                  variant="contained"
                                  startIcon={<span>💊</span>}
                                  onClick={() => setTabIndex(2)}
                                  disabled={editablePrices.drugs.length === 0}
                                  sx={{
                                    backgroundColor: "#2B69AC",
                                    height: 48,
                                    minWidth: 160,
                                    borderRadius: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': { backgroundColor: "#1e5a94" }
                                  }}
                                >
                                  พิมพ์ฉลากยา
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      ) : (
                        <Alert severity="warning" sx={{ borderRadius: '12px', p: 3 }}>
                          {currentPatient ? 'ไม่พบข้อมูลการรักษาสำหรับผู้ป่วยรายนี้' : 'กรุณาเลือกผู้ป่วยเพื่อดูข้อมูลการรักษา'}
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                )}

                {/* Tab 1: Receipt */}
                {/* Tab 1: Receipt */}
                {tabIndex === 1 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                      🧾 ใบเสร็จรับเงิน
                    </Typography>

                    {currentPatient && treatmentData ? (
                      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }} id="receipt-print">
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

                        {/* Print Button */}
                        <Box sx={{ textAlign: 'center', mt: 3, '@media print': { display: 'none' } }}>
                          <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={generateProfessionalReceipt}
                            sx={{
                              backgroundColor: "#1976d2",
                              '&:hover': { backgroundColor: "#1565c0" },
                              px: 3,
                              py: 1.5
                            }}
                          >
                            สร้างใบเสร็จ
                          </Button>
                        </Box>
                      </Paper>
                    ) : (
                      <Alert severity="info">กรุณาเลือกผู้ป่วยเพื่อดูใบเสร็จ</Alert>
                    )}
                  </Box>
                )}

                {/* Tab 2: Drug Labels */}

                {tabIndex === 2 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                      🏷️ ฉลากยา
                    </Typography>

                    {currentPatient && editablePrices.drugs.length > 0 ? (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {editablePrices.drugs.map((drug, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                              <Box sx={{
                                width: '320px',
                                minHeight: '450px',
                                background: 'white',
                                border: '2px solid #4a90e2',
                                margin: '10px auto',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                fontFamily: 'Sarabun, sans-serif'
                              }}>
                                {/* Header คลินิก */}
                                <Box sx={{
                                  background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                                  color: 'white',
                                  padding: '12px',
                                  textAlign: 'center',
                                  position: 'relative'
                                }}>
                                  <Box sx={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    color: '#4a90e2'
                                  }}>
                                    💊
                                  </Box>
                                  <Typography sx={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>
                                    สัมพันธ์คลินิค คลินิกเวชกรรม
                                  </Typography>
                                  <Typography sx={{ fontSize: '11px', margin: '2px 0', opacity: 0.95 }}>
                                    280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160
                                  </Typography>
                                  <Typography sx={{ fontSize: '12px', margin: 0, fontWeight: 500 }}>
                                    โทร : 053-341-723
                                  </Typography>
                                </Box>

                                {/* เนื้อหาฉลาก */}
                                <Box sx={{ padding: '15px' }}>
                                  {/* ข้อมูลผู้ป่วย */}
                                  <Box sx={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', marginBottom: '15px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0', fontSize: '13px' }}>
                                      <span style={{ color: '#666', minWidth: '40px' }}>ชื่อผู้ป่วย</span>
                                      <span style={{ flex: 1, margin: '0 10px', fontWeight: 600, color: '#333' }}>
                                        {currentPatient.PRENAME}{currentPatient.NAME1} {currentPatient.SURNAME}
                                      </span>
                                      <span style={{ color: '#666' }}>วันที่</span>
                                      <span style={{ marginLeft: '5px', fontWeight: 600 }}>
                                        {new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                      </span>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 3px 0', fontSize: '13px' }}>
                                      <span style={{ color: '#666', minWidth: '40px' }}>ที่อยู่</span>
                                      <span style={{ flex: 1, margin: '0 10px', fontWeight: 600, color: '#333' }}>
                                        HN: {currentPatient.HNCODE} VN: {currentPatient.VNO}
                                      </span>
                                      <span style={{ color: '#666' }}>จำนวน</span>
                                      <span style={{ marginLeft: '5px', fontWeight: 600 }}>
                                        {drug.QTY} {drug.UNIT_CODE}
                                      </span>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 3px 0', fontSize: '13px' }}>
                                      <span style={{ color: '#666', minWidth: '40px' }}>ชื่อยาใช้</span>
                                      <span style={{ flex: 1, marginLeft: '10px', fontWeight: 600, color: '#2c5aa0' }}>
                                        {drug.GENERIC_NAME || drug.DRUG_CODE}
                                      </span>
                                    </Box>
                                  </Box>

                                  {/* ส่วนวิธีการใช้ยา */}
                                  <Box sx={{ marginTop: '15px' }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#2c5aa0', marginBottom: '8px', textAlign: 'center' }}>
                                      รับประทานครั้งละ <span style={{ fontWeight: 700, color: '#e74c3c' }}>
                                        {drug.DOSAGE || '1'}
                                      </span> เม็ด &nbsp;&nbsp;&nbsp;&nbsp; วันละ <span style={{ fontWeight: 700, color: '#e74c3c' }}>
                                        {drug.FREQUENCY || '3'}
                                      </span> ครั้ง
                                    </Typography>

                                    {/* ไอคอนเวลา */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '10px 0' }}>
                                      <Box sx={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>
                                        <span style={{ fontSize: '16px', display: 'block', marginBottom: '2px' }}>🌅</span>
                                        <div style={{ fontSize: '10px' }}>เช้า<br />Breakfast</div>
                                      </Box>
                                      <Box sx={{
                                        textAlign: 'center',
                                        fontSize: '11px',
                                        color: '#666',
                                        ...(drug.TIME1?.includes('กลางวัน') || drug.FREQUENCY >= 2 ?
                                          { background: '#e8f4fd', borderRadius: '4px', padding: '4px', color: '#2c5aa0', fontWeight: 600 } : {})
                                      }}>
                                        <span style={{ fontSize: '16px', display: 'block', marginBottom: '2px' }}>☀️</span>
                                        <div style={{ fontSize: '10px' }}>กลางวัน<br />Lunch</div>
                                      </Box>
                                      <Box sx={{
                                        textAlign: 'center',
                                        fontSize: '11px',
                                        color: '#666',
                                        ...(drug.TIME1?.includes('เย็น') || drug.FREQUENCY >= 3 ?
                                          { background: '#e8f4fd', borderRadius: '4px', padding: '4px', color: '#2c5aa0', fontWeight: 600 } : {})
                                      }}>
                                        <span style={{ fontSize: '16px', display: 'block', marginBottom: '2px' }}>🌆</span>
                                        <div style={{ fontSize: '10px' }}>เย็น<br />Dinner</div>
                                      </Box>
                                      <Box sx={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>
                                        <span style={{ fontSize: '16px', display: 'block', marginBottom: '2px' }}>🌙</span>
                                        <div style={{ fontSize: '10px' }}>ก่อนนอน<br />At bedtime</div>
                                      </Box>
                                    </Box>

                                    {/* ตัวเลือกเวลาอาหาร */}
                                    <Box sx={{ margin: '10px 0' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', margin: '3px 0', fontSize: '11px' }}>
                                        <Box sx={{ width: '12px', height: '12px', border: '1px solid #4a90e2', marginRight: '6px', borderRadius: '2px' }}></Box>
                                        <span>ก่อนอาหาร</span>
                                        <span style={{ flex: 1, textAlign: 'right', fontSize: '10px' }}>Before meal</span>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', margin: '3px 0', fontSize: '11px' }}>
                                        <Box sx={{
                                          width: '12px',
                                          height: '12px',
                                          border: '1px solid #4a90e2',
                                          marginRight: '6px',
                                          borderRadius: '2px',
                                          background: '#2c5aa0',
                                          position: 'relative'
                                        }}>
                                          <span style={{ color: 'white', fontSize: '8px', position: 'absolute', top: '1px', left: '3px' }}>✓</span>
                                        </Box>
                                        <span style={{ fontWeight: 600, color: '#2c5aa0' }}>หลังอาหาร</span>
                                        <span style={{ flex: 1, textAlign: 'right', fontSize: '10px', color: '#2c5aa0' }}>After meal</span>
                                      </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '11px' }}>
                                      <span>เมื่อมีอาการ</span>
                                      <span style={{ flex: 1, margin: '0 10px', fontWeight: 600, color: '#e74c3c' }}>
                                        {drug.NOTE1?.includes('เมื่อ') ? drug.NOTE1 : 'ตามแพทย์สั่ง'}
                                      </span>
                                      <span>ทุก</span>
                                      <span style={{ margin: '0 5px', fontWeight: 600, color: '#e74c3c' }}>6</span>
                                      <span>ชั่วโมง</span>
                                    </Box>

                                    {/* คำแนะนำ */}
                                    <Box sx={{ borderTop: '1px solid #ccc', margin: '10px 0', paddingTop: '10px' }}>
                                      <Typography sx={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#2c5aa0' }}>
                                        คำแนะนำ
                                      </Typography>

                                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: '#555' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{ width: '10px', height: '10px', border: '1px solid #4a90e2', marginRight: '4px', borderRadius: '1px' }}></Box>
                                          <span>ก่อนอาหารครึ่ง-หนึ่งชั่วโมง<br /><span style={{ fontSize: '9px' }}>30-60 minutes before meals</span></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{
                                            width: '10px',
                                            height: '10px',
                                            border: '1px solid #4a90e2',
                                            marginRight: '4px',
                                            borderRadius: '1px',
                                            background: '#2c5aa0',
                                            position: 'relative'
                                          }}>
                                            <span style={{ color: 'white', fontSize: '6px', position: 'absolute', top: '1px', left: '2px' }}>✓</span>
                                          </Box>
                                          <span style={{ fontWeight: 600, color: '#2c5aa0' }}>ทานยาติดต่อกันจนหมด<br /><span style={{ fontSize: '9px', color: '#2c5aa0' }}>Take this medicine until finished</span></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{ width: '10px', height: '10px', border: '1px solid #4a90e2', marginRight: '4px', borderRadius: '1px' }}></Box>
                                          <span>ทานหลังอาหารทันที<br /><span style={{ fontSize: '9px' }}>Immediately after meals</span></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{
                                            width: '10px',
                                            height: '10px',
                                            border: '1px solid #4a90e2',
                                            marginRight: '4px',
                                            borderRadius: '1px',
                                            background: '#2c5aa0',
                                            position: 'relative'
                                          }}>
                                            <span style={{ color: 'white', fontSize: '6px', position: 'absolute', top: '1px', left: '2px' }}>✓</span>
                                          </Box>
                                          <span style={{ fontWeight: 600, color: '#2c5aa0' }}>ดื่มน้ำตามมากๆ<br /><span style={{ fontSize: '9px', color: '#2c5aa0' }}>Follow with 1-2 glasses of water</span></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{ width: '10px', height: '10px', border: '1px solid #4a90e2', marginRight: '4px', borderRadius: '1px' }}></Box>
                                          <span>ยานี้อาจทำให้ง่วงซึม<br /><span style={{ fontSize: '9px' }}>This drug may cause drowsiness</span></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{ width: '10px', height: '10px', border: '1px solid #4a90e2', marginRight: '4px', borderRadius: '1px' }}></Box>
                                          <span>อื่นๆ..............................<br /><span style={{ fontSize: '9px' }}>Others</span></span>
                                        </Box>
                                      </Box>
                                    </Box>

                                    {/* วันหมดอายุ */}
                                    <Box sx={{ marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                                      <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        วันหมดอายุ (Exp.) <span style={{ fontWeight: 600, color: '#e74c3c' }}>
                                          {drug.EXPIRE_DATE || '31/12/2025'}
                                        </span>
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* ปุ่มพิมพ์ */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <Button
                            variant="contained"
                            startIcon={<span>💊</span>}
                            onClick={generateProfessionalDrugLabels}
                            disabled={editablePrices.drugs.length === 0}
                            sx={{
                              backgroundColor: "#2B69AC",
                              height: 48,
                              minWidth: 160,
                              borderRadius: 3,
                              fontSize: '1rem',
                              fontWeight: 600,
                              '&:hover': { backgroundColor: "#1e5a94" }
                            }}
                          >
                            พิมพ์ฉลากยา
                          </Button>
                        </Box>

                        {/* CSS สำหรับการพิมพ์ */}
                        <style jsx>{`
          @media print {
            .MuiContainer-root {
              margin: 0 !important;
              padding: 0 !important;
            }
            .MuiButton-root {
              display: none !important;
            }
            .MuiTabs-root {
              display: none !important;
            }
            .MuiTypography-h5 {
              display: none !important;
            }
          }
        `}</style>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: '12px', textAlign: 'center', py: 4 }}>
                        {!currentPatient ? 'กรุณาเลือกผู้ป่วยเพื่อดูฉลากยา' : 'ผู้ป่วยรายนี้ไม่มีการสั่งยา'}
                      </Alert>
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