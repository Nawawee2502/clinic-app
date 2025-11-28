import React, { useState, useEffect, useMemo } from "react";
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
  ListItem,
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
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  DeleteOutline as DeleteIcon
} from "@mui/icons-material";

// Import Services
import PatientService from "../services/patientService";
import QueueService from "../services/queueService";
import TreatmentService from "../services/treatmentService";

// Import components
import Todaypatientinformation from "../components/ตรวจรักษา/Todaypatientinformation";
import ตรวจวินิจฉัย from "../components/ตรวจรักษา/ตรวจวินิจฉัย";
import Medicalhistory from "../components/ตรวจรักษา/Medicalhistory";
import DxandTreatment from "../components/ตรวจรักษา/DxandTreatment";
import Procedure from "../components/ตรวจรักษา/Procedure";
import Appointment from "../components/ตรวจรักษา/Appointment";
import Medicalcertificate from "../components/ตรวจรักษา/Medicalcertificate";
import Ordermedicine from "../components/ตรวจรักษา/Ordermedicine";

// Commented out unused components
// import LabandXray from "../components/ตรวจรักษา/LabandX-ray";
// import Doctor from "../components/ตรวจรักษา/Doctor";
// import Cerwork from "../components/ตรวจรักษา/cerwork";
// import Cerdriver from "../components/ตรวจรักษา/Cerdriver";

const ตรวจรักษา = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    waiting: 0,
    completed: 0
  });

  // Snackbar สำหรับแสดงข้อความ
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // State สำหรับ Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    patient: null,
    newStatus: null,
    isCompleting: false
  });

  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    patient: null,
    loading: false
  });

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadTodayPatients();
    loadQueueStats();
  }, []);

  // โหลดข้อมูลผู้ป่วยทั้งหมดจากคิว (ไม่กรองตามวันที่, ยกเว้นคนไข้ที่เสร็จสิ้นแล้ว)
  const loadTodayPatients = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getAllPatientsFromQueue();

      if (response.success) {
        // Debug: ตรวจสอบ queueStatus ที่ได้จาก API
        console.log('🔍 Raw queue data:', response.data.map(p => ({
          queueId: p.queueId,
          queueNumber: p.queueNumber,
          queueStatus: p.queueStatus,
          STATUS: p.STATUS
        })));

        // กรองเฉพาะคนไข้ที่ยังไม่ชำระเงินหรือปิดการรักษา
        const activePatients = response.data.filter(patient => {
          const treatmentStatus = (patient.TREATMENT_STATUS || patient.STATUS1 || '').trim();
          return treatmentStatus !== 'ชำระเงินแล้ว' && treatmentStatus !== 'ปิดการรักษา';
        });

        // Debug: ตรวจสอบ queueStatus หลังจากกรอง
        console.log('🔍 Filtered patients:', activePatients.map(p => ({
          queueId: p.queueId,
          queueNumber: p.queueNumber,
          queueStatus: p.queueStatus,
          STATUS: p.STATUS
        })));

        setPatients(activePatients);

        // ถ้าคนไข้ที่เลือกอยู่หายไปหลังจากกรอง ให้เลือกคนแรก
        if (activePatients.length > 0 && selectedPatientIndex >= activePatients.length) {
          setSelectedPatientIndex(0);
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
      }
    } catch (err) {
      console.error('Error loading all patients:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // โหลดสถิติคิว
  const loadQueueStats = async () => {
    try {
      const response = await QueueService.getQueueStats();

      if (response.success) {
        setQueueStats({
          total: response.data.today_queue.total || 0,
          waiting: response.data.today_queue.waiting || 0,
          completed: response.data.today_queue.completed || 0
        });
      }
    } catch (err) {
      console.error('Error loading queue stats:', err);
    }
  };

  // เปิด Confirmation Dialog
  const handleStatusChangeRequest = (newStatus) => {
    if (!patients[selectedPatientIndex]) return;

    const currentPatient = patients[selectedPatientIndex];

    // ถ้าเปลี่ยนเป็น "รอชำระเงิน" ให้แสดง modal ยืนยัน
    if (newStatus === 'รอชำระเงิน') {
      setConfirmDialog({
        open: true,
        patient: currentPatient,
        newStatus: newStatus,
        isCompleting: true
      });
    } else {
      // สถานะอื่นๆ ทำการเปลี่ยนทันที
      handleStatusChangeConfirmed(newStatus, currentPatient);
    }
  };

  // ยืนยันการเปลี่ยนสถานะ
  const handleStatusChangeConfirmed = async (newStatus, patient = null) => {
    const targetPatient = patient || patients[selectedPatientIndex];
    if (!targetPatient) return;

    try {
      // ใช้ API ใหม่ที่ปลอดภัยกว่า
      const response = await QueueService.updateQueueStatusSafe(targetPatient.queueId, newStatus);

      if (response.success) {
        console.log(`✅ Queue status updated safely to: ${newStatus}`);

        // ถ้าเปลี่ยนเป็น "รอชำระเงิน" ให้อัปเดต STATUS1 และ PAYMENT_STATUS ใน treatment
        // หมายเหตุ: updateQueueStatusSafe จะอัพเดต STATUS ใน DAILY_QUEUE และ STATUS1 ใน TREATMENT1 แล้ว
        // แต่เราต้องอัพเดต PAYMENT_STATUS เพิ่มเติม
        if (newStatus === 'รอชำระเงิน') {
          // อัปเดต PAYMENT_STATUS ใน treatment (STATUS1 ถูกอัพเดตโดย updateQueueStatusSafe แล้ว)
          if (targetPatient.VNO) {
            try {
              await TreatmentService.updateTreatment(targetPatient.VNO, {
                PAYMENT_STATUS: 'รอชำระ'
              });
              console.log(`✅ Treatment PAYMENT_STATUS updated to รอชำระ`);
            } catch (treatmentError) {
              console.error('Error updating treatment PAYMENT_STATUS:', treatmentError);
              // ไม่ throw error เพื่อให้ queue status ยังอัปเดตได้
            }
          }

          setSnackbar({
            open: true,
            message: `✅ คนไข้คิว ${targetPatient.queueNumber} เสร็จสิ้นการรักษาแล้ว (รอชำระเงิน)`,
            severity: 'success'
          });

          setTimeout(() => {
            navigate('/clinic/payment', {
              state: {
                completedPatient: targetPatient,
                fromTreatment: true
              }
            });
          }, 2000);

          // อัพเดต queueStatus ใน state
          const updatedPatients = patients.map(p =>
            p.queueId === targetPatient.queueId
              ? { ...p, queueStatus: newStatus, STATUS: newStatus }
              : p
          );
          setPatients(updatedPatients);
          
          // รีโหลดข้อมูลเพื่อให้แน่ใจว่าสถานะถูกต้อง
          setTimeout(() => {
            loadTodayPatients();
          }, 500);
        } else {
          const updatedPatients = [...patients];
          const patientIndex = patients.findIndex(p => p.queueId === targetPatient.queueId);
          if (patientIndex !== -1) {
            updatedPatients[patientIndex].queueStatus = newStatus;
            setPatients(updatedPatients);
          }

          setSnackbar({
            open: true,
            message: 'อัพเดตสถานะสำเร็จ',
            severity: 'success'
          });
        }

        loadQueueStats();
      } else {
        setSnackbar({
          open: true,
          message: 'ไม่สามารถอัพเดตสถานะได้: ' + response.message,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ',
        severity: 'error'
      });
    }

    setConfirmDialog({
      open: false,
      patient: null,
      newStatus: null,
      isCompleting: false
    });
  };

  const handleCancelQueueRequest = (patient, event) => {
    if (event) {
      event.stopPropagation();
    }
    setCancelDialog({
      open: true,
      patient,
      loading: false
    });
  };

  const handleCancelQueueClose = () => {
    setCancelDialog({
      open: false,
      patient: null,
      loading: false
    });
  };

  const handleCancelQueueConfirm = async () => {
    if (!cancelDialog.patient) return;
    setCancelDialog(prev => ({ ...prev, loading: true }));

    try {
      const response = await QueueService.removeQueue(cancelDialog.patient.queueId);
      if (!response.success) {
        throw new Error(response.message || 'ไม่สามารถยกเลิกคิวได้');
      }

      setPatients(prevPatients => {
        const filtered = prevPatients.filter(
          p => p.queueId !== cancelDialog.patient.queueId
        );

        setSelectedPatientIndex(prevIndex => {
          if (filtered.length === 0) {
            return 0;
          }

          const removedIndex = prevPatients.findIndex(
            p => p.queueId === cancelDialog.patient.queueId
          );

          if (removedIndex === -1) {
            return Math.min(prevIndex, filtered.length - 1);
          }

          if (prevIndex === removedIndex) {
            return Math.min(prevIndex, filtered.length - 1);
          }

          if (removedIndex < prevIndex) {
            return Math.max(0, prevIndex - 1);
          }

          return Math.min(prevIndex, filtered.length - 1);
        });

        return filtered;
      });

      setSnackbar({
        open: true,
        message: `🚫 ยกเลิกคิว ${cancelDialog.patient.queueNumber} สำเร็จ`,
        severity: 'success'
      });

      handleCancelQueueClose();
      loadQueueStats();
    } catch (error) {
      console.error('Error cancelling queue:', error);
      setSnackbar({
        open: true,
        message: 'ไม่สามารถยกเลิกคิวได้: ' + error.message,
        severity: 'error'
      });
      setCancelDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // ยกเลิก Confirmation Dialog
  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      patient: null,
      newStatus: null,
      isCompleting: false
    });
  };

  // อัพเดตสถานะผู้ป่วย (เดิม) - ตอนนี้จะเรียก handleStatusChangeRequest แทน
  const handleStatusChange = (event) => {
    handleStatusChangeRequest(event.target.value);
  };

  // รีเฟรชข้อมูล
  const handleRefresh = () => {
    loadTodayPatients();
    loadQueueStats();
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handlePatientSelect = (index) => {
    setSelectedPatientIndex(index);
    setTabIndex(0);
  };

  const handleNextPatient = () => {
    if (selectedPatientIndex < patients.length - 1) {
      setSelectedPatientIndex(selectedPatientIndex + 1);
      setTabIndex(0);
    }
  };

  const handlePreviousPatient = () => {
    if (selectedPatientIndex > 0) {
      setSelectedPatientIndex(selectedPatientIndex - 1);
      setTabIndex(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอตรวจ': return 'warning';
      case 'กำลังตรวจ': return 'info';
      case 'เสร็จแล้ว': return 'success';
      case 'รอชำระเงิน': return 'info';
      default: return 'default';
    }
  };

  // Format วันที่สำหรับแสดงผล
  const formatQueueDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // ถ้าแปลงไม่ได้ ให้แสดง string เดิม
      
      // แปลงเป็น พ.ศ.
      const buddhistYear = date.getFullYear() + 543;
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      
      return `${day} ${month} ${buddhistYear}`;
    } catch (error) {
      return dateString;
    }
  };

  const goToNextTab = () => {
    if (tabIndex < 7) { // Updated to match new tab count (now 8 tabs total: 0-7)
      setTabIndex(tabIndex + 1);
    }
  };

  const goToSpecificTab = (targetTabIndex) => {
    setTabIndex(targetTabIndex);
  };

  const handleDiagnosisSaveSuccess = (skipToTab) => {
    if (skipToTab) {
      setTabIndex(skipToTab);
    } else {
      goToNextTab();
    }
  };

  // ไปหน้าลงทะเบียนผู้ป่วยใหม่
  const goToPatientRegistration = () => {
    navigate('/clinic/patientregistration');
  };

  const displayedPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return patients
      .map((patient, index) => ({ patient, originalIndex: index }))
      .filter(({ patient }) => {
        if (!term) return true;
        const fullName = `${patient.PRENAME || ''}${patient.NAME1 || ''} ${patient.SURNAME || ''}`.toLowerCase();
        const hn = (patient.HNCODE || '').toLowerCase();
        const vn = (patient.VNO || '').toLowerCase();
        const queueNumber = String(patient.queueNumber || '').toLowerCase();
        return (
          fullName.includes(term) ||
          hn.includes(term) ||
          vn.includes(term) ||
          queueNumber.includes(term)
        );
      });
  }, [patients, searchTerm]);

  const currentPatient = patients[selectedPatientIndex];

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            ลองใหม่
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth={false} sx={{ mt: 2, maxWidth: "1600px" }}>
        <Grid container spacing={2}>
          {/* Left Sidebar - Queue Display Only */}
          <Grid item xs={12} md={2.5}>
            <Card sx={{
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {/* Queue Header - Modern Glass Effect */}
              <Box sx={{
                background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                color: 'white',
                p: 2.5,
                textAlign: 'center',
                flexShrink: 0,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px 16px 0 0'
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: '16px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    🏥 คิวตรวจรักษาวันนี้
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    title="รีเฟรชข้อมูล"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Queue Stats - Modern Cards */}
              <Box sx={{
                p: 2,
                bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                flexShrink: 0,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1.5
                }}>
                  <Box sx={{
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                      ทั้งหมด
                    </Typography>
                    <Typography sx={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#2B69AC',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {queueStats.total}
                    </Typography>
                  </Box>

                  <Box sx={{
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                      รอตรวจ
                    </Typography>
                    <Typography sx={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#F59E0B',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {queueStats.waiting}
                    </Typography>
                  </Box>

                  <Box sx={{
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                      เสร็จ
                    </Typography>
                    <Typography sx={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#10B981',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {queueStats.completed}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Search Box */}
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: '#f1f5f9' }}>
                <TextField
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ค้นหา HN / VN / ชื่อผู้ป่วย"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: 'white'
                    }
                  }}
                />
              </Box>

              {/* Current Patient Control - Premium Look */}
              {currentPatient && (
                <Box sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                  color: 'white',
                  flexShrink: 0,
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography sx={{
                    fontSize: '12px',
                    mb: 1.5,
                    textAlign: 'center',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    🎯 ผู้ป่วยที่เลือก: คิว {currentPatient.queueNumber}
                  </Typography>

                  {/* แสดงสถานะปัจจุบัน */}
                  <Box sx={{
                    textAlign: 'center',
                    mb: 1.5,
                    p: 1,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Typography sx={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.9)',
                      mb: 0.5
                    }}>
                      สถานะ:
                    </Typography>
                    <Chip
                      size="small"
                      label={currentPatient.queueStatus || 'รอตรวจ'}
                      color={getStatusColor(currentPatient.queueStatus)}
                      sx={{
                        fontSize: '11px',
                        height: 24,
                        fontWeight: 700,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  </Box>

                  {/* Navigation Buttons - Modern Style */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<PrevIcon />}
                      onClick={handlePreviousPatient}
                      disabled={selectedPatientIndex === 0}
                      size="small"
                      sx={{
                        fontSize: '11px',
                        flex: 1,
                        py: 1,
                        px: 1.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ก่อนหน้า
                    </Button>

                    <Button
                      variant="contained"
                      endIcon={<NextIcon />}
                      onClick={handleNextPatient}
                      disabled={selectedPatientIndex === patients.length - 1}
                      size="small"
                      sx={{
                        fontSize: '11px',
                        flex: 1,
                        py: 1,
                        px: 1.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ถัดไป
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Queue List - Premium Scrollable */}
              <List sx={{
                flex: 1,
                overflow: 'auto',
                p: 1,
                minHeight: 0,
                bgcolor: '#f8fafc',
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(0,0,0,0.1)'
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px'
                }
              }}>
                {patients.length === 0 ? (
                  <Box sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: '16px',
                    margin: 1
                  }}>
                    <Typography variant="body1" sx={{
                      mb: 2,
                      color: '#64748B',
                      fontWeight: 600
                    }}>
                      🔍 ยังไม่มีผู้ป่วยในคิววันนี้
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={goToPatientRegistration}
                      sx={{
                        fontSize: '12px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(86, 152, 224, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ไปหน้าลงทะเบียน
                    </Button>
                  </Box>
                ) : displayedPatients.length === 0 ? (
                  <Box sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(241,245,249,0.8)',
                    borderRadius: '16px',
                    margin: 1,
                    border: '1px dashed rgba(148,163,184,0.6)'
                  }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                      ไม่พบผู้ป่วยที่ตรงกับคำค้นหา
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      ลองค้นหาใหม่อีกครั้ง
                    </Typography>
                  </Box>
                ) : (
                  displayedPatients.map(({ patient, originalIndex }) => {
                    const isActive = selectedPatientIndex === originalIndex;
                    const lockedStatuses = ['รอชำระเงิน', 'ชำระเงินแล้ว', 'ปิดการรักษา'];
                    const canCancel =
                      !lockedStatuses.includes(
                        (patient.queueStatus || patient.STATUS1 || '').trim()
                      );
                    return (
                      <ListItemButton
                        key={patient.queueId || originalIndex}
                        selected={isActive}
                        onClick={() => handlePatientSelect(originalIndex)}
                        sx={{
                          mb: 0.85,
                          mx: 0.4,
                          borderRadius: '16px',
                          border: isActive ? '2px solid #1f4c97' : '1px solid rgba(148,163,184,0.35)',
                          background: isActive
                            ? 'linear-gradient(135deg, #3d74c2 0%, #1f4c97 100%)'
                            : '#f9fbff',
                          alignItems: 'flex-start',
                          py: 1.1,
                          px: 1.4,
                          minHeight: '84px',
                          boxShadow: isActive
                            ? '0 10px 28px rgba(31,76,151,0.25)'
                            : '0 4px 12px rgba(15,23,42,0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#1f4c97',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', gap: 1.2 }}>
                          <Box sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            background: isActive ? '#193c7b' : '#dbeafe',
                            color: isActive ? '#ffffff' : '#1e3a8a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '15px',
                            boxShadow: isActive ? '0 6px 14px rgba(0,0,0,0.2)' : 'none'
                          }}>
                            {patient.queueNumber}
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.4
                            }}>
                            <Typography sx={{
                              fontWeight: 700,
                              color: isActive ? '#ffffff' : '#0f172a',
                              fontSize: '15px',
                              letterSpacing: 0.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {patient.PRENAME}{patient.NAME1} {patient.SURNAME}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip
                                size="small"
                                label={patient.queueStatus}
                                color={getStatusColor(patient.queueStatus)}
                                sx={{
                                  fontSize: '10px',
                                  height: 22,
                                  fontWeight: 700,
                                  borderRadius: '999px',
                                  backgroundColor: isActive ? '#ffffff' : '#f1f5f9',
                                  color: isActive ? '#0f172a' : '#0f172a',
                                  border: '1px solid rgba(15,23,42,0.12)',
                                  boxShadow: '0 4px 10px rgba(15,23,42,0.1)'
                                }}
                              />
                              <Tooltip
                                title={
                                  canCancel
                                    ? 'ยกเลิกคิวนี้'
                                    : 'ไม่สามารถยกเลิกหลังรอ/ชำระเงินแล้ว'
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!canCancel}
                                    onClick={(event) => handleCancelQueueRequest(patient, event)}
                                    sx={{
                                      backgroundColor: canCancel
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(148, 163, 184, 0.2)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)'
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </Box>

                            <Typography sx={{
                              fontSize: '13px',
                              color: isActive ? 'rgba(255,255,255,0.95)' : '#334155',
                              fontWeight: 600,
                              mb: 0.2
                            }}>
                              HN: {patient.HNCODE || '-'} {patient.VNO && `• VN: ${patient.VNO}`}
                            </Typography>

                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                              fontSize: '12px',
                              color: isActive ? 'rgba(255,255,255,0.85)' : '#64748b',
                              mb: patient.SYMPTOM ? 0.3 : 0
                            }}>
                              <span>📅 {formatQueueDate(patient.queueDate)}</span>
                              <span>•</span>
                              <span>⏰ {patient.queueTime || '-'}</span>
                            </Box>

                            {patient.SYMPTOM && (
                              <Box sx={{
                                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                                borderRadius: '10px',
                                padding: '4px 10px',
                                color: isActive ? '#ffffff' : '#475569',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                                border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(148,163,184,0.4)'
                              }}>
                                <span role="img" aria-label="chat">💬</span>
                                <span>{patient.SYMPTOM}</span>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </ListItemButton>
                    );
                  })
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
                    ยังไม่มีผู้ป่วยในคิววันนี้
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    กรุณาไปที่หน้าลงทะเบียนผู้ป่วยเพื่อรับผู้ป่วยเข้าคิว
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={goToPatientRegistration}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    ไปหน้าลงทะเบียนผู้ป่วย
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ borderRadius: '16px' }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="true" // เปลี่ยนจาก "auto" เป็น "true" หรือ true
                  sx={{
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(86, 152, 224, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                    '& .MuiTabs-scroller': {
                      '& .MuiTabs-flexContainer': {
                        gap: '8px'
                      }
                    },
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      fontSize: '13px',
                      textAlign: 'center',
                      minHeight: 48,
                      minWidth: 120,
                      borderRadius: '12px',
                      padding: '12px 16px',
                      textTransform: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                      }
                    },
                    '& .Mui-selected': {
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important',
                      color: '#2B69AC !important',
                      fontWeight: '700 !important',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    },
                    // เพิ่มสไตล์สำหรับ scroll buttons
                    '& .MuiTabs-scrollButtons': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      margin: '0 4px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      '&.Mui-disabled': {
                        opacity: 0.3
                      }
                    }
                  }}
                >
                  {/* Tab 0: ข้อมูลคนไข้วันนี้ */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>👥</span>
                        <span>ข้อมูลวันนี้</span>
                      </Box>
                    }
                  />
                  {/* Tab 1: ตรวจวินิจฉัย */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>🔍</span>
                        <span>ตรวจวินิจฉัย</span>
                      </Box>
                    }
                  />
                  {/* Tab 2: วินิจฉัยและรักษา */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>🩺</span>
                        <span>วินิจฉัยและรักษา</span>
                      </Box>
                    }
                  />
                  {/* Tab 3: ประวัติการรักษา */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>📋</span>
                        <span>ประวัติ</span>
                      </Box>
                    }
                  />
                  {/* Tab 4: หัตถการ */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>⚕️</span>
                        <span>หัตถการ</span>
                      </Box>
                    }
                  />
                  {/* Tab 5: นัดหมายคนไข้ */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>📅</span>
                        <span>นัดหมายคนไข้</span>
                      </Box>
                    }
                  />
                  {/* Tab 6: ใบรับรองแพทย์/การทำงาน/ใบขับขี่ */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>📄</span>
                        <span>ใบรับรอง</span>
                      </Box>
                    }
                  />
                  {/* Tab 7: Order ยา */}
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>💊</span>
                        <span>Order ยา</span>
                      </Box>
                    }
                  />
                </Tabs>

                <CardContent>
                  {/* Tab 0: ข้อมูลวันนี้ */}
                  {tabIndex === 0 && <Todaypatientinformation currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}

                  {/* Tab 1: ตรวจวินิจฉัย */}
                  {tabIndex === 1 && (
                    <ตรวจวินิจฉัย
                      currentPatient={currentPatient}
                      onSaveSuccess={handleDiagnosisSaveSuccess}
                    />
                  )}

                  {/* Tab 3: วินิจฉัยและรักษา */}
                  {tabIndex === 2 && <DxandTreatment currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}

                  {/* Tab 2: ประวัติ */}
                  {tabIndex === 3 && <Medicalhistory currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}

                  {/* Tab 4: หัตถการ */}
                  {tabIndex === 4 && <Procedure currentPatient={currentPatient} />}

                  {/* Tab 5: นัดหมายคนไข้ */}
                  {tabIndex === 5 && <Appointment currentPatient={currentPatient} />}

                  {/* Tab 6: ใบรับรอง (รวมใบรับรองแพทย์/การทำงาน/ใบขับขี่) */}
                  {tabIndex === 6 && <Medicalcertificate currentPatient={currentPatient} />}

                  {/* Tab 7: Order ยา */}
                  {tabIndex === 7 && <Ordermedicine currentPatient={currentPatient} onSaveSuccess={goToNextTab} onCompletePatient={handleStatusChangeRequest} />}

                  {/* Commented out unused tabs */}
                  {/* {tabIndex === X && <LabandXray currentPatient={currentPatient} onSaveSuccess={goToNextTab} />} */}
                  {/* {tabIndex === X && <Doctor />} */}
                  {/* {tabIndex === X && <Cerwork currentPatient={currentPatient} />} */}
                  {/* {tabIndex === X && <Cerdriver currentPatient={currentPatient} />} */}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Snackbar สำหรับแสดงข้อความ */}
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



      {/* Confirmation Modal สำหรับเสร็จสิ้นการรักษา */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="complete-dialog-title"
        aria-describedby="complete-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle
          id="complete-dialog-title"
          sx={{
            textAlign: 'center',
            py: 3,
            px: 3,
            background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px 20px 0 0'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 48, mb: 1, color: 'white' }} />
            <Typography variant="h6" fontWeight={700}>
              ✅ ยืนยันการเสร็จสิ้นการรักษา (รอชำระเงิน)
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: 4 }}>
          <DialogContentText
            id="complete-dialog-description"
            sx={{
              textAlign: 'center',
              color: '#1e293b',
              fontSize: '16px',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            {confirmDialog.patient && (
              <>
                <Box sx={{
                  p: 3,
                  bgcolor: 'rgba(86, 152, 224, 0.1)',
                  borderRadius: '16px',
                  border: '1px solid rgba(86, 152, 224, 0.3)',
                  mb: 3,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="h6" sx={{ color: '#2B69AC', fontWeight: 700, mb: 1 }}>
                    👤 ข้อมูลผู้ป่วย
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#475569', mb: 0.5 }}>
                    <strong>คิว:</strong> {confirmDialog.patient.queueNumber}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#475569', mb: 0.5 }}>
                    <strong>ชื่อ:</strong> {confirmDialog.patient.PRENAME}{confirmDialog.patient.NAME1} {confirmDialog.patient.SURNAME}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#475569', mb: 0.5 }}>
                    <strong>HN:</strong> {confirmDialog.patient.HNCODE}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#475569' }}>
                    <strong>อายุ:</strong> {confirmDialog.patient.AGE} ปี
                  </Typography>
                </Box>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 2,
                  p: 2,
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <WarningIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  <Typography sx={{ color: '#065f46', fontWeight: 600, fontSize: '14px' }}>
                    การรักษาจะถูกทำเครื่องหมายเป็น "รอชำระเงิน"
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: '15px', color: '#64748b', mb: 2 }}>
                  เมื่อยืนยันแล้ว คุณจะถูกนำไปหน้า <strong>ชำระเงินและจ่ายยา</strong> สำหรับผู้ป่วยรายนี้
                </Typography>

                <Typography sx={{ fontSize: '14px', color: '#ef4444', fontWeight: 600 }}>
                  ⚠️ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?
                </Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleConfirmDialogClose}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid #e2e8f0',
              color: '#64748b',
              '&:hover': {
                border: '2px solid #cbd5e1',
                bgcolor: '#f8fafc',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ❌ ยกเลิก
          </Button>
          <Button
            onClick={() => handleStatusChangeConfirmed(confirmDialog.newStatus, confirmDialog.patient)}
            variant="contained"
            size="large"
            autoFocus
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ✅ ยืนยันและไปหน้าชำระเงิน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Queue Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={cancelDialog.loading ? undefined : handleCancelQueueClose}
        aria-labelledby="cancel-queue-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="cancel-queue-title">
          🗑️ ยกเลิกคิวผู้ป่วย
        </DialogTitle>
        <DialogContent dividers>
          {cancelDialog.patient ? (
            <Box>
              <Typography sx={{ mb: 1.5 }}>
                ต้องการยกเลิกคิว {cancelDialog.patient.queueNumber} สำหรับ
                {' '}
                {cancelDialog.patient.PRENAME}{cancelDialog.patient.NAME1} {cancelDialog.patient.SURNAME} หรือไม่?
              </Typography>
              <Alert severity="warning">
                การยกเลิกจะลบคิวและข้อมูลการรักษาที่ผูกกับคิวนี้
              </Alert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelQueueClose}
            disabled={cancelDialog.loading}
          >
            ปิด
          </Button>
          <Button
            onClick={handleCancelQueueConfirm}
            color="error"
            variant="contained"
            disabled={cancelDialog.loading}
          >
            {cancelDialog.loading ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกคิว'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ตรวจรักษา;