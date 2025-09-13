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

  const loadCompletedPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await PatientService.getTodayPatientsFromQueue();

      if (response.success) {
        // กรองให้เหลือเฉพาะผู้ป่วยที่ยังไม่ได้ชำระเงิน
        const filteredPatients = response.data
          .filter(patient => patient.queueStatus === 'เสร็จแล้ว') // เฉพาะที่รักษาเสร็จแล้ว
          .map(patient => ({
            ...patient,
            paymentStatus: 'ยังไม่ชำระ'
          }));

        setPatients(filteredPatients);

        if (filteredPatients.length === 0) {
          setError('ไม่มีผู้ป่วยที่รอการชำระเงิน');
        }

        // รีเซ็ต selectedPatientIndex ถ้าจำนวนผู้ป่วยลดลง
        if (selectedPatientIndex >= filteredPatients.length) {
          setSelectedPatientIndex(Math.max(0, filteredPatients.length - 1));
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

      // ลบผู้ป่วยที่ชำระเงินแล้วออกจากคิว
      const currentPatient = patients[selectedPatientIndex];
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
        // ถ้าลบผู้ป่วยคนสุดท้าย ให้เลื่อนไปผู้ป่วยคนก่อนหน้า
        if (selectedPatientIndex >= updatedPatients.length) {
          setSelectedPatientIndex(updatedPatients.length - 1);
        }
        // ถ้าไม่ใช่ ให้อยู่ที่ index เดิม (จะแสดงผู้ป่วยคนถัดไป)
      }

      setSnackbar({
        open: true,
        message: `บันทึกการชำระเงินสำเร็จ ยอดชำระ: ฿${calculateTotal().toFixed(2)} - ${currentPatient.PRENAME} ${currentPatient.NAME1} ${currentPatient.SURNAME}`,
        severity: 'success'
      });

      // รีเซ็ตข้อมูลการชำระเงิน
      setPaymentData({
        paymentMethod: 'เงินสด',
        receivedAmount: '',
        discount: 0,
        remarks: ''
      });

      setTabIndex(1);
    } catch (error) {
      console.error('Error saving payment:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน',
        severity: 'error'
      });
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
                            onClick={() => window.print()}
                          >
                            พิมพ์ใบเสร็จ
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
                            startIcon={<PrintIcon />}
                            onClick={() => window.print()}
                            size="large"
                            sx={{
                              backgroundColor: "#5698E0",
                              '&:hover': { backgroundColor: "#2B69AC" },
                              px: 4,
                              py: 1.5,
                              fontSize: '16px',
                              fontWeight: 600
                            }}
                          >
                            🖨️ พิมพ์ฉลากยาทั้งหมด ({editablePrices.drugs.length} ฉลาก)
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