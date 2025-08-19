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
  ListItem,
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
  Snackbar
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

// Import Services
import PatientService from "../services/patientService";
import QueueService from "../services/queueService";

// Import components
import Todaypatientinformation from "../components/ตรวจรักษา/Todaypatientinformation";
import Medicalhistory from "../components/ตรวจรักษา/Medicalhistory";
import ตรวจวินิจฉัย from "../components/ตรวจรักษา/ตรวจวินิจฉัย";
import LabandXray from "../components/ตรวจรักษา/LabandX-ray";
import DxandTreatment from "../components/ตรวจรักษา/DxandTreatment";
import Ordermedicine from "../components/ตรวจรักษา/Ordermedicine";
import Procedure from "../components/ตรวจรักษา/Procedure";
import Appointment from "../components/ตรวจรักษา/Appointment";
import Medicalcertificate from "../components/ตรวจรักษา/Medicalcertificate";
import Doctor from "../components/ตรวจรักษา/Doctor";
import Cerwork from "../components/ตรวจรักษา/cerwork";
import Cerdriver from "../components/ตรวจรักษา/Cerdriver";

const ตรวจรักษา = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [patients, setPatients] = useState([]);
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

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadTodayPatients();
    loadQueueStats();
  }, []);

  // โหลดข้อมูลผู้ป่วยวันนี้จากคิว
  const loadTodayPatients = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getTodayPatientsFromQueue();

      if (response.success) {
        setPatients(response.data);
        if (response.data.length > 0 && selectedPatientIndex >= response.data.length) {
          setSelectedPatientIndex(0);
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
      }
    } catch (err) {
      console.error('Error loading today patients:', err);
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

  // อัพเดตสถานะผู้ป่วย
  const handleStatusChange = async (newStatus) => {
    if (!patients[selectedPatientIndex]) return;

    try {
      const currentPatient = patients[selectedPatientIndex];
      const response = await QueueService.updateQueueStatus(currentPatient.queueId, newStatus);

      if (response.success) {
        // อัพเดต state
        const updatedPatients = [...patients];
        updatedPatients[selectedPatientIndex].queueStatus = newStatus;
        setPatients(updatedPatients);

        // อัพเดตสถิติ
        loadQueueStats();

        // แสดงข้อความสำเร็จ
        setSnackbar({
          open: true,
          message: 'อัพเดตสถานะสำเร็จ',
          severity: 'success'
        });
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
      default: return 'default';
    }
  };

  const goToNextTab = () => {
    if (tabIndex < 11) {
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
    <Container maxWidth={false} sx={{ mt: 2, maxWidth: "1600px" }}>
      <Grid container spacing={2}>
        {/* Left Sidebar - Queue Display Only */}
        <Grid item xs={12} md={2.5}>
          <Card sx={{
            height: '100%',
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
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  sx={{ color: 'white' }}
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Queue Stats */}
            <Box sx={{
              p: 1,
              bgcolor: '#f8f9fa',
              textAlign: 'center',
              fontSize: '11px',
              borderBottom: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>ทั้งหมด</Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
                    {queueStats.total}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>รอตรวจ</Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#ff9800' }}>
                    {queueStats.waiting}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>เสร็จ</Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50' }}>
                    {queueStats.completed}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Current Patient Status Control */}
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
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: '12px' }}>สถานะ</InputLabel>
                  <Select
                    value={currentPatient.queueStatus}
                    label="สถานะ"
                    onChange={(e) => handleStatusChange(e.target.value)}
                    sx={{ fontSize: '12px', height: '32px' }}
                  >
                    <MenuItem value="รอตรวจ" sx={{ fontSize: '12px' }}>รอตรวจ</MenuItem>
                    <MenuItem value="กำลังตรวจ" sx={{ fontSize: '12px' }}>กำลังตรวจ</MenuItem>
                    <MenuItem value="เสร็จแล้ว" sx={{ fontSize: '12px' }}>เสร็จแล้ว</MenuItem>
                  </Select>
                </FormControl>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrevIcon />}
                    onClick={handlePreviousPatient}
                    disabled={selectedPatientIndex === 0}
                    size="small"
                    sx={{
                      fontSize: '10px',
                      flex: 1,
                      py: 0.5,
                      px: 1
                    }}
                  >
                    ก่อนหน้า
                  </Button>

                  <Button
                    variant="outlined"
                    endIcon={<NextIcon />}
                    onClick={handleNextPatient}
                    disabled={selectedPatientIndex === patients.length - 1}
                    size="small"
                    sx={{
                      fontSize: '10px',
                      flex: 1,
                      py: 0.5,
                      px: 1
                    }}
                  >
                    ถัดไป
                  </Button>
                </Box>
              </Box>
            )}

            {/* Queue List */}
            <List sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              minHeight: 0
            }}>
              {patients.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ยังไม่มีผู้ป่วยในคิววันนี้
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={goToPatientRegistration}
                    sx={{ fontSize: '12px' }}
                  >
                    ไปหน้าลงทะเบียน
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
                            label={patient.queueStatus}
                            color={getStatusColor(patient.queueStatus)}
                            sx={{
                              fontSize: '10px',
                              height: 18,
                              '& .MuiChip-label': { px: 0.8 },
                              bgcolor: selectedPatientIndex === index ? 'rgba(255,255,255,0.2)' : undefined,
                              color: selectedPatientIndex === index ? 'white' : undefined
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
                            {patient.queueTime} • อายุ {patient.AGE} ปี • HN: {patient.HNCODE}
                          </Typography>
                          {patient.SYMPTOM && (
                            <Typography variant="caption" display="block" sx={{
                              fontSize: '11px',
                              mt: 0.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: selectedPatientIndex === index ? 'rgba(255,255,255,0.9)' : 'primary.main'
                            }}>
                              {patient.SYMPTOM}
                            </Typography>
                          )}
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
                <Tab label="ข้อมูลคนไข้วันนี้" />
                <Tab label="ประวัติการรักษา" />
                <Tab label="ตรวจวินิจฉัย" />
                <Tab label="ส่งLAB/X-ray" />
                <Tab label="Dx/ สรุป Treatment" />
                <Tab label="Order ยา" />
                <Tab label="หัตถการ" />
                <Tab label="นัดหมายคนไข้" />
                <Tab label="ใบรับรองแพทย์" />
                <Tab label="ตารางแพทย์" />
                <Tab label="ใบรับรองการทำงาน" />
                <Tab label="ใบรับรองขับรถ" />
              </Tabs>

              <CardContent>
                {tabIndex === 0 && <Todaypatientinformation currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
                {tabIndex === 1 && <Medicalhistory currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
                {tabIndex === 2 && (
                  <ตรวจวินิจฉัย
                    currentPatient={currentPatient}
                    onSaveSuccess={handleDiagnosisSaveSuccess}
                  />
                )}
                {tabIndex === 3 && <LabandXray currentPatient={currentPatient} />}
                {tabIndex === 4 && <DxandTreatment currentPatient={currentPatient} />}
                {tabIndex === 5 && <Ordermedicine currentPatient={currentPatient} />}
                {tabIndex === 6 && <Procedure currentPatient={currentPatient} />}
                {tabIndex === 7 && <Appointment currentPatient={currentPatient} />}
                {tabIndex === 8 && <Medicalcertificate currentPatient={currentPatient} />}
                {tabIndex === 9 && <Doctor />}
                {tabIndex === 10 && <Cerwork currentPatient={currentPatient} />}
                {tabIndex === 11 && <Cerdriver currentPatient={currentPatient} />}
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
  );
};

export default ตรวจรักษา;