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
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  LocalPharmacy as PharmacyIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Save as SaveIcon
} from "@mui/icons-material";

// Import Services จริง
import PatientService from "../services/patientService";
import TreatmentService from "../services/treatmentService";
import QueueService from "../services/queueService";

const Paymentanddispensingmedicine = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentData, setTreatmentData] = useState(null);
  const [loadingTreatment, setLoadingTreatment] = useState(false);

  // Payment states
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'เงินสด',
    receivedAmount: '',
    discount: 0,
    transferAmount: '',
    cashAmount: '',
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // โหลดข้อมูลผู้ป่วยที่เสร็จการรักษาแล้ว (ใช้ API จริง)
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

      // ดึงข้อมูลผู้ป่วยวันนี้ทั้งหมด (ไม่ต้องกรองสถานะ)
      const response = await PatientService.getTodayPatientsFromQueue();

      if (response.success) {
        // เพิ่ม paymentStatus สำหรับแสดงสถานะการชำระเงิน
        const patientsWithPaymentStatus = response.data.map(patient => ({
          ...patient,
          paymentStatus: patient.queueStatus === 'เสร็จแล้ว' ? 'ยังไม่ชำระ' : 'รอเสร็จการรักษา'
        }));

        setPatients(patientsWithPaymentStatus);

        if (patientsWithPaymentStatus.length === 0) {
          setError('ไม่มีผู้ป่วยในคิววันนี้');
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
      console.log('Loading treatment data for VNO:', vno);

      const response = await TreatmentService.getTreatmentByVNO(vno);

      if (response.success) {
        setTreatmentData(response.data);
        console.log('Treatment data loaded:', response.data);
      } else {
        console.error('Failed to load treatment data:', response.message);
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

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handlePatientSelect = (index) => {
    setSelectedPatientIndex(index);
    setTabIndex(0);
    // รีเซ็ต payment data เมื่อเปลี่ยนผู้ป่วย
    setPaymentData({
      paymentMethod: 'เงินสด',
      receivedAmount: '',
      discount: 0,
      transferAmount: '',
      cashAmount: '',
      remarks: ''
    });
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'ชำระแล้ว': return 'success';
      case 'ยังไม่ชำระ': return 'warning';
      case 'รอเสร็จการรักษา': return 'info';
      default: return 'default';
    }
  };

  const calculateTotal = () => {
    if (!treatmentData?.summary) return 0;
    const totalCost = parseFloat(treatmentData.summary.totalCost || 0);
    const discount = parseFloat(paymentData.discount || 0);
    return Math.max(0, totalCost - discount);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const received = parseFloat(paymentData.receivedAmount || 0);
    return Math.max(0, received - total);
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

      // TODO: เรียก API บันทึกการชำระเงิน
      // const paymentRecord = {
      //   VNO: currentPatient.VNO,
      //   totalAmount: calculateTotal(),
      //   receivedAmount: parseFloat(paymentData.receivedAmount),
      //   paymentMethod: paymentData.paymentMethod,
      //   discount: paymentData.discount,
      //   change: calculateChange(),
      //   remarks: paymentData.remarks
      // };

      // const result = await PaymentService.savePayment(paymentRecord);

      // อัพเดตสถานะการชำระเงิน
      const updatedPatients = [...patients];
      updatedPatients[selectedPatientIndex].paymentStatus = 'ชำระแล้ว';
      setPatients(updatedPatients);

      setSnackbar({
        open: true,
        message: 'บันทึกการชำระเงินสำเร็จ',
        severity: 'success'
      });

      // ไปที่แท็บใบเสร็จ
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
          <Card sx={{
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Queue Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 1.5,
              textAlign: 'center',
              flexShrink: 0
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '14px' }}>
                🏥 คิวตรวจรักษาวันนี้
              </Typography>
              <IconButton
                size="small"
                onClick={loadCompletedPatients}
                sx={{ color: 'white' }}
                title="รีเฟรชข้อมูล"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Stats */}
            <Box sx={{
              p: 1,
              bgcolor: '#f8f9fa',
              textAlign: 'center',
              fontSize: '11px',
              borderBottom: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                รวม {patients.length} ราย
              </Typography>
            </Box>

            {/* Navigation */}
            {currentPatient && (
              <Box sx={{
                p: 1,
                bgcolor: '#e3f2fd',
                borderBottom: '1px solid #e0e0e0',
                flexShrink: 0
              }}>
                <Typography sx={{ fontSize: '11px', color: '#666', mb: 1, textAlign: 'center' }}>
                  ผู้ป่วยที่เลือก: คิว {currentPatient.queueNumber}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrevIcon />}
                    onClick={handlePreviousPatient}
                    disabled={selectedPatientIndex === 0}
                    size="small"
                    sx={{ fontSize: '10px', flex: 1, py: 0.5, px: 1 }}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    variant="outlined"
                    endIcon={<NextIcon />}
                    onClick={handleNextPatient}
                    disabled={selectedPatientIndex === patients.length - 1}
                    size="small"
                    sx={{ fontSize: '10px', flex: 1, py: 0.5, px: 1 }}
                  >
                    ถัดไป
                  </Button>
                </Box>
              </Box>
            )}

            {/* Patient List */}
            <List sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              minHeight: 0
            }}>
              {patients.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ไม่มีผู้ป่วยในคิววันนี้
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/clinic/ตรวจรักษา')}
                    sx={{ fontSize: '12px' }}
                  >
                    ไปหน้าตรวจรักษา
                  </Button>
                </Box>
              ) : (
                patients.map((patient, index) => (
                  <ListItemButton
                    key={patient.queueId || index}
                    selected={selectedPatientIndex === index}
                    onClick={() => handlePatientSelect(index)}
                    sx={{
                      borderLeft: selectedPatientIndex === index ? '5px solid #1976d2' : 'none',
                      bgcolor: selectedPatientIndex === index ? '#1976d2' : 'transparent',
                      color: selectedPatientIndex === index ? 'white' : 'inherit',
                      '&:hover': {
                        bgcolor: selectedPatientIndex === index ? '#1565c0' : '#f5f5f5'
                      },
                      py: 1,
                      px: 1.5,
                      mb: 0.5,
                      mx: 0.5,
                      borderRadius: selectedPatientIndex === index ? 1 : 0
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Box sx={{
                        width: 35,
                        height: 35,
                        borderRadius: '50%',
                        bgcolor: selectedPatientIndex === index ? 'rgba(255,255,255,0.2)' : '#1976d2',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {patient.queueNumber}
                      </Box>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold" sx={{
                            fontSize: '13px',
                            color: selectedPatientIndex === index ? 'white' : 'inherit'
                          }}>
                            คิว {patient.queueNumber}
                          </Typography>
                          <Chip
                            size="small"
                            label={patient.paymentStatus}
                            color={getPaymentStatusColor(patient.paymentStatus)}
                            sx={{
                              fontSize: '10px',
                              height: 18,
                              '& .MuiChip-label': { px: 0.8 }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            color: selectedPatientIndex === index ? 'white' : 'black',
                            fontSize: '12px',
                            lineHeight: 1.3
                          }}>
                            {patient.PRENAME}{patient.NAME1} {patient.SURNAME}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{
                            fontSize: '11px',
                            color: selectedPatientIndex === index ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                          }}>
                            VN: {patient.VNO}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{
                            fontSize: '11px',
                            color: selectedPatientIndex === index ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                          }}>
                            HN: {patient.HNCODE}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9.5}>
          {patients.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  ไม่มีผู้ป่วยในคิววันนี้
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  ยังไม่มีผู้ป่วยเข้าคิววันนี้
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
            <Card>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  backgroundColor: "#F0F5FF",
                  "& .MuiTab-root": {
                    color: "#6B7280",
                    fontWeight: "bold",
                    textAlign: "left",
                    minHeight: 48
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#D6E4FF",
                    borderRadius: "8px",
                    color: "#1D4ED8",
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  }
                }}
              >
                <Tab label="ชำระเงิน/จ่ายยา" icon={<PaymentIcon />} iconPosition="start" />
                <Tab label="ใบเสร็จ" icon={<ReceiptIcon />} iconPosition="start" />
                <Tab label="ฉลากยา" icon={<PharmacyIcon />} iconPosition="start" />
              </Tabs>

              <CardContent>
                {tabIndex === 0 && (
                  <Grid container spacing={3}>
                    {/* Patient Info Card - ย้ายขึ้นมาด้านบน แสดงแนวนอน */}
                    {currentPatient && (
                      <Grid item xs={12}>
                        <Card
                          elevation={3}
                          sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                            color: 'white',
                            borderRadius: '16px',
                            mb: 2
                          }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={2}>
                              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Avatar
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    mx: { xs: 'auto', md: 0 }
                                  }}
                                >
                                  {currentPatient.NAME1?.charAt(0) || '?'}
                                </Avatar>
                              </Box>
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                              </Typography>
                              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                อายุ {currentPatient.AGE} ปี • {currentPatient.SEX}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Grid container spacing={2}>
                                <Grid item xs={6} md={4}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>VN Number</Typography>
                                    <Typography variant="h6" fontWeight="bold">{currentPatient.VNO}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>HN Code</Typography>
                                    <Typography variant="h6" fontWeight="bold">{currentPatient.HNCODE}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>คิวที่</Typography>
                                    <Typography variant="h6" fontWeight="bold">{currentPatient.queueNumber}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>เวลา</Typography>
                                    <Typography variant="h6" fontWeight="bold">{currentPatient.queueTime}</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>

                          {/* อาการ */}
                          {currentPatient.SYMPTOM && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>อาการเบื้องต้น:</Typography>
                              <Typography variant="body1">{currentPatient.SYMPTOM}</Typography>
                            </Box>
                          )}
                        </Card>
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
                          {/* Section 1: รายการค่าใช้จ่าย - จัดเรียงแนวนอน */}
                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* LAB/X-ray Card */}
                            <Grid item xs={12} lg={4}>
                              <Card elevation={2} sx={{ height: '100%', borderRadius: '12px' }}>
                                <Box sx={{
                                  bgcolor: '#5698E0',
                                  color: 'white',
                                  p: 2,
                                  textAlign: 'center',
                                  borderTopLeftRadius: '12px',
                                  borderTopRightRadius: '12px'
                                }}>
                                  <Typography variant="h6" fontWeight="bold">🧪 ค่า LAB / X-ray</Typography>
                                </Box>
                                <CardContent sx={{ p: 2 }}>
                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>รายการ</TableCell>
                                          <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>ราคา</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {treatmentData.labTests && treatmentData.labTests.length > 0 ? (
                                          treatmentData.labTests.map((lab, index) => (
                                            <TableRow key={index} hover>
                                              <TableCell>
                                                <Typography variant="body2">{lab.LABNAME || lab.LABCODE}</Typography>
                                              </TableCell>
                                              <TableCell align="right">
                                                <Typography variant="body2" sx={{ color: '#5698E0' }} fontWeight="bold">
                                                  ฿{parseFloat(lab.PRICE || 0).toFixed(2)}
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                              <Typography color="text.secondary">ไม่มีรายการ</Typography>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Procedures Card */}
                            <Grid item xs={12} lg={4}>
                              <Card elevation={2} sx={{ height: '100%', borderRadius: '12px' }}>
                                <Box sx={{
                                  bgcolor: '#2B69AC',
                                  color: 'white',
                                  p: 2,
                                  textAlign: 'center',
                                  borderTopLeftRadius: '12px',
                                  borderTopRightRadius: '12px'
                                }}>
                                  <Typography variant="h6" fontWeight="bold">⚕️ ค่าหัตถการ</Typography>
                                </Box>
                                <CardContent sx={{ p: 2 }}>
                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>รายการ</TableCell>
                                          <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>ราคา</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {treatmentData.procedures && treatmentData.procedures.length > 0 ? (
                                          treatmentData.procedures.map((proc, index) => (
                                            <TableRow key={index} hover>
                                              <TableCell>
                                                <Typography variant="body2">{proc.MED_PRO_NAME_THAI || proc.MEDICAL_PROCEDURE_CODE}</Typography>
                                              </TableCell>
                                              <TableCell align="right">
                                                <Typography variant="body2" sx={{ color: '#2B69AC' }} fontWeight="bold">
                                                  ฿{parseFloat(proc.AMT || 0).toFixed(2)}
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                              <Typography color="text.secondary">ไม่มีรายการ</Typography>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Payment Summary Card */}
                            <Grid item xs={12} lg={4}>
                              <Card
                                elevation={3}
                                sx={{
                                  height: '100%',
                                  borderRadius: '12px',
                                  bgcolor: '#f8f9fa'
                                }}
                              >
                                <Box sx={{
                                  bgcolor: '#5698E0',
                                  color: 'white',
                                  p: 2,
                                  textAlign: 'center',
                                  borderTopLeftRadius: '12px',
                                  borderTopRightRadius: '12px'
                                }}>
                                  <Typography variant="h6" fontWeight="bold">💰 ชำระเงิน</Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                  {/* ยอดเงิน */}
                                  <Box sx={{ mb: 3 }}>
                                    <TextField
                                      label="ยอดที่ต้องชำระ"
                                      fullWidth
                                      margin="normal"
                                      value={`฿${parseFloat(treatmentData.summary?.totalCost || 0).toFixed(2)}`}
                                      InputProps={{
                                        readOnly: true,
                                        sx: { fontWeight: 'bold', fontSize: '1.1em', color: '#d32f2f' }
                                      }}
                                      size="small"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '10px',
                                          bgcolor: 'white'
                                        }
                                      }}
                                    />
                                    <TextField
                                      label="ส่วนลด"
                                      fullWidth
                                      margin="normal"
                                      type="number"
                                      value={paymentData.discount}
                                      onChange={(e) => setPaymentData({ ...paymentData, discount: parseFloat(e.target.value) || 0 })}
                                      size="small"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '10px',
                                          bgcolor: 'white'
                                        }
                                      }}
                                    />

                                    {/* ยอดรวม */}
                                    <Box sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: 'white',
                                      borderRadius: '10px',
                                      textAlign: 'center',
                                      border: '2px solid #d32f2f'
                                    }}>
                                      <Typography variant="caption" color="text.secondary">ยอดชำระสุทธิ</Typography>
                                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                                        ฿{calculateTotal().toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Divider sx={{ my: 2 }} />

                                  {/* วิธีชำระเงิน */}
                                  <FormControl fullWidth margin="normal" size="small">
                                    {/* <InputLabel>วิธีชำระเงิน</InputLabel> */}
                                    <Select
                                      value={paymentData.paymentMethod}
                                      onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                      disabled
                                      sx={{
                                        borderRadius: '10px',
                                        bgcolor: 'white',
                                      }}
                                    >
                                      <MenuItem value="เงินสด">💵 เงินสด</MenuItem>
                                    </Select>
                                  </FormControl>

                                  {/* ฟิลด์เพิ่มเติมตามวิธีชำระ */}
                                  {paymentData.paymentMethod === 'เงินสด' && (
                                    <TextField
                                      label="จำนวนเงินที่รับ"
                                      fullWidth
                                      margin="normal"
                                      type="number"
                                      value={paymentData.receivedAmount}
                                      onChange={(e) => setPaymentData({ ...paymentData, receivedAmount: e.target.value })}
                                      size="small"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '10px',
                                          bgcolor: 'white'
                                        }
                                      }}
                                    />
                                  )}

                                  {paymentData.paymentMethod === 'โอนเงิน' && (
                                    <TextField
                                      label="จำนวนเงินโอน"
                                      fullWidth
                                      margin="normal"
                                      type="number"
                                      value={paymentData.transferAmount}
                                      onChange={(e) => setPaymentData({ ...paymentData, transferAmount: e.target.value })}
                                      size="small"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '10px',
                                          bgcolor: 'white'
                                        }
                                      }}
                                    />
                                  )}

                                  {/* แสดงเงินทอน */}
                                  {paymentData.paymentMethod === 'เงินสด' && paymentData.receivedAmount && (
                                    <Box sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: calculateChange() >= 0 ? '#e8f5e8' : '#ffebee',
                                      borderRadius: '10px',
                                      textAlign: 'center',
                                      border: `2px solid ${calculateChange() >= 0 ? '#4caf50' : '#f44336'}`
                                    }}>
                                      <Typography variant="caption" color="text.secondary">เงินทอน</Typography>
                                      <Typography variant="h6" fontWeight="bold"
                                        color={calculateChange() >= 0 ? 'success.main' : 'error.main'}
                                      >
                                        ฿{Math.abs(calculateChange()).toFixed(2)}
                                        {calculateChange() < 0 && ' (ขาด)'}
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* ปุ่มบันทึก */}
                                  <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handlePayment}
                                    sx={{
                                      backgroundColor: "#5698E0",
                                      fontSize: "1rem",
                                      width: '100%',
                                      fontWeight: 600,
                                      mt: 3,
                                      py: 1.5,
                                      borderRadius: '12px',
                                      '&:hover': {
                                        backgroundColor: "#2B69AC",
                                      }
                                    }}
                                    disabled={!treatmentData?.summary?.totalCost}
                                  >
                                    บันทึกการชำระเงิน
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          {/* Section 2: ตารางยา - แยกออกมาเป็นส่วนใหญ่ */}
                          <Card elevation={2} sx={{ borderRadius: '12px', mb: 3 }}>
                            <Box sx={{
                              bgcolor: '#5698E0',
                              color: 'white',
                              p: 2,
                              textAlign: 'center',
                              borderTopLeftRadius: '12px',
                              borderTopRightRadius: '12px'
                            }}>
                              <Typography variant="h6" fontWeight="bold">
                                💊 รายการยา/เวชภัณฑ์ ({treatmentData.drugs?.length || 0} รายการ)
                              </Typography>
                            </Box>
                            <CardContent sx={{ p: 0 }}>
                              <TableContainer>
                                <Table>
                                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา/รายละเอียด</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคา/หน่วย</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคารวม</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {treatmentData.drugs && treatmentData.drugs.length > 0 ? (
                                      treatmentData.drugs.map((drug, index) => (
                                        <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                          <TableCell>
                                            <Box sx={{
                                              bgcolor: '#5698E0',
                                              color: 'white',
                                              borderRadius: '50%',
                                              width: 32,
                                              height: 32,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold'
                                            }}>
                                              {index + 1}
                                            </Box>
                                          </TableCell>
                                          <TableCell>
                                            <Box>
                                              <Typography variant="body1" fontWeight="bold" sx={{ color: '#2B69AC' }}>
                                                {drug.GENERIC_NAME || drug.DRUG_CODE}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                📋 {drug.NOTE1} • ⏰ {drug.TIME1}
                                              </Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell align="center">
                                            <Box sx={{
                                              bgcolor: '#E3F2FD',
                                              color: '#2B69AC',
                                              px: 2,
                                              py: 0.5,
                                              borderRadius: 2,
                                              fontWeight: 'bold'
                                            }}>
                                              {drug.QTY || 0} {drug.UNIT_CODE || ''}
                                            </Box>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography variant="body2" fontWeight="bold">
                                              ฿{parseFloat(drug.UNIT_PRICE || 0).toFixed(2)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography variant="body1" fontWeight="bold" sx={{ color: '#4caf50' }}>
                                              ฿{parseFloat(drug.AMT || 0).toFixed(2)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="center">
                                            <Checkbox
                                              defaultChecked
                                              sx={{
                                                color: '#4caf50',
                                                '&.Mui-checked': { color: '#4caf50' }
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                          <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                              ไม่มีรายการยา
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              ยังไม่มีการจ่ายยาสำหรับผู้ป่วยรายนี้
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </Card>

                          {/* Section 3: ปุ่มการทำงาน */}
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
                                  disabled={!treatmentData?.summary?.totalCost}
                                  sx={{
                                    backgroundColor: "#5698E0",
                                    height: 48,
                                    minWidth: 160,
                                    borderRadius: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                      backgroundColor: "#2B69AC",
                                    }
                                  }}
                                >
                                  พิมพ์ใบเสร็จ
                                </Button>

                                <Button
                                  variant="contained"
                                  startIcon={<span>💊</span>}
                                  onClick={() => setTabIndex(2)}
                                  disabled={!treatmentData?.drugs?.length}
                                  sx={{
                                    backgroundColor: "#2B69AC",
                                    height: 48,
                                    minWidth: 160,
                                    borderRadius: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                      backgroundColor: "#1e5a94",
                                    }
                                  }}
                                >
                                  พิมพ์ฉลากยา
                                </Button>

                                <Button
                                  variant="outlined"
                                  startIcon={<span>📄</span>}
                                  sx={{
                                    borderColor: "#5698E0",
                                    color: "#5698E0",
                                    height: 48,
                                    minWidth: 160,
                                    borderRadius: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderWidth: '2px',
                                    "&:hover": {
                                      backgroundColor: "#E3F2FD",
                                      borderColor: "#2B69AC",
                                      borderWidth: '2px'
                                    }
                                  }}
                                >
                                  พิมพ์ใบรับรองแพทย์
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      ) : (
                        <Alert
                          severity="warning"
                          sx={{
                            borderRadius: '12px',
                            p: 3,
                            '& .MuiAlert-message': { fontSize: '1.1rem' }
                          }}
                        >
                          {currentPatient ? 'ไม่พบข้อมูลการรักษาสำหรับผู้ป่วยรายนี้' : 'กรุณาเลือกผู้ป่วยเพื่อดูข้อมูลการรักษา'}
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                )}

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
                          <Typography variant="body2">เลขประจำตัวผู้เสียอากร: 1234567890123</Typography>
                        </Box>

                        {/* Patient Info */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>VN:</strong> {currentPatient.VNO}
                            </Typography>
                            <Typography variant="body2">
                              <strong>HN:</strong> {currentPatient.HNCODE}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>วันที่:</strong> {new Date().toLocaleDateString('th-TH')}
                            </Typography>
                            <Typography variant="body2">
                              <strong>เวลา:</strong> {new Date().toLocaleTimeString('th-TH')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              <strong>ชื่อผู้ป่วย:</strong> {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                            </Typography>
                            <Typography variant="body2">
                              <strong>อายุ:</strong> {currentPatient.AGE} ปี <strong>เพศ:</strong> {currentPatient.SEX}
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
                                <TableCell align="right"><strong>ราคา/หน่วย</strong></TableCell>
                                <TableCell align="right"><strong>รวม</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {treatmentData.drugs && treatmentData.drugs.map((drug, index) => (
                                <TableRow key={`drug-${index}`}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {drug.GENERIC_NAME || drug.DRUG_CODE}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {drug.NOTE1} - {drug.TIME1}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">{drug.QTY || 0} {drug.UNIT_CODE || ''}</TableCell>
                                  <TableCell align="right">{parseFloat(drug.UNIT_PRICE || 0).toFixed(2)}</TableCell>
                                  <TableCell align="right">{parseFloat(drug.AMT || 0).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              {treatmentData.procedures && treatmentData.procedures.map((proc, index) => (
                                <TableRow key={`proc-${index}`}>
                                  <TableCell>{proc.MED_PRO_NAME_THAI || proc.MEDICAL_PROCEDURE_CODE}</TableCell>
                                  <TableCell align="center">{proc.QTY || 0}</TableCell>
                                  <TableCell align="right">{parseFloat(proc.UNIT_PRICE || 0).toFixed(2)}</TableCell>
                                  <TableCell align="right">{parseFloat(proc.AMT || 0).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Total */}
                        <Box sx={{ borderTop: '2px solid #ddd', pt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>รวมค่ารักษา:</Typography>
                            <Typography>{parseFloat(treatmentData.summary?.totalCost || 0).toFixed(2)} บาท</Typography>
                          </Box>
                          {paymentData.discount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography>ส่วนลด:</Typography>
                              <Typography>-{paymentData.discount.toFixed(2)} บาท</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <Typography variant="h6">ยอดชำระ:</Typography>
                            <Typography variant="h6" color="primary">
                              {calculateTotal().toFixed(2)} บาท
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>วิธีชำระ:</Typography>
                            <Typography>{paymentData.paymentMethod}</Typography>
                          </Box>
                          {paymentData.receivedAmount && (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>รับเงิน:</Typography>
                                <Typography>{paymentData.receivedAmount} บาท</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>เงินทอน:</Typography>
                                <Typography>{calculateChange().toFixed(2)} บาท</Typography>
                              </Box>
                            </>
                          )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ textAlign: 'center', mt: 4, borderTop: '1px solid #ddd', pt: 2 }}>
                          <Typography variant="body2">*** ขอบคุณที่ใช้บริการ ***</Typography>
                          <Typography variant="caption">เก็บใบเสร็จไว้เป็นหลักฐาน</Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            พิมพ์วันที่: {new Date().toLocaleString('th-TH')}
                          </Typography>
                        </Box>

                        {/* Print Button */}
                        <Box sx={{ textAlign: 'center', mt: 3, '@media print': { display: 'none' } }}>
                          <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={() => {
                              const printContent = document.getElementById('receipt-print');
                              const printWindow = window.open('', '_blank');
                              printWindow.document.write(`
                                <html>
                                  <head><title>ใบเสร็จรับเงิน</title></head>
                                  <body>${printContent.innerHTML}</body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }}
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

                {tabIndex === 2 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                      🏷️ ฉลากยา
                    </Typography>

                    {currentPatient && treatmentData && treatmentData.drugs && treatmentData.drugs.length > 0 ? (
                      <Grid container spacing={2}>
                        {treatmentData.drugs.map((drug, index) => (
                          <Grid item xs={12} md={6} lg={4} key={index}>
                            <Card sx={{
                              p: 2,
                              border: '2px dashed #1976d2',
                              minHeight: 200,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              {/* Header */}
                              <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                  สัมพันธ์คลินิค
                                </Typography>
                                <Typography variant="caption">
                                  Tel: 053-826-524
                                </Typography>
                              </Box>

                              {/* Patient Info */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  <strong>ชื่อ:</strong> {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>HN:</strong> {currentPatient.HNCODE} | <strong>VN:</strong> {currentPatient.VNO}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>วันที่:</strong> {new Date().toLocaleDateString('th-TH')}
                                </Typography>
                              </Box>

                              {/* Drug Info */}
                              <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: 1, mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                  {drug.GENERIC_NAME || drug.DRUG_CODE}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>จำนวน:</strong> {drug.QTY} {drug.UNIT_CODE}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>วิธีใช้:</strong> {drug.NOTE1 || 'ตามแพทย์สั่ง'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>เวลา:</strong> {drug.TIME1 || 'วันละ 1 ครั้ง'}
                                </Typography>
                              </Box>

                              {/* Footer */}
                              <Box sx={{ textAlign: 'center', borderTop: '1px solid #ddd', pt: 1 }}>
                                <Typography variant="caption">
                                  ใช้ตามคำแนะนำของแพทย์
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}

                        {/* Print All Labels Button */}
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                              variant="contained"
                              startIcon={<PrintIcon />}
                              onClick={() => {
                                // Print all labels
                                window.print();
                              }}
                              size="large"
                            >
                              พิมพ์ฉลากยาทั้งหมด ({treatmentData.drugs.length} ฉลาก)
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">
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