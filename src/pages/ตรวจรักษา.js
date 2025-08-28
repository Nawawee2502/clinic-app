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

                <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                  <InputLabel sx={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.9)',
                    '&.Mui-focused': { color: 'white' }
                  }}>
                    สถานะ
                  </InputLabel>
                  <Select
                    value={currentPatient.queueStatus}
                    label="สถานะ"
                    onChange={(e) => handleStatusChange(e.target.value)}
                    sx={{
                      fontSize: '12px',
                      height: '40px',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '10px',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white'
                      }
                    }}
                  >
                    <MenuItem value="รอตรวจ" sx={{ fontSize: '12px' }}>
                      ⏳ รอตรวจ
                    </MenuItem>
                    <MenuItem value="กำลังตรวจ" sx={{ fontSize: '12px' }}>
                      🔍 กำลังตรวจ
                    </MenuItem>
                    <MenuItem value="เสร็จแล้ว" sx={{ fontSize: '12px' }}>
                      ✅ เสร็จแล้ว
                    </MenuItem>
                  </Select>
                </FormControl>

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
              ) : (
                patients.map((patient, index) => (
                  <Box
                    key={patient.queueId || index}
                    sx={{
                      mb: 1.5,
                      mx: 1,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: selectedPatientIndex === index ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.02) translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <ListItemButton
                      selected={selectedPatientIndex === index}
                      onClick={() => handlePatientSelect(index)}
                      sx={{
                        background: selectedPatientIndex === index
                          ? 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        color: selectedPatientIndex === index ? 'white' : '#1e293b',
                        backdropFilter: 'blur(10px)',
                        border: selectedPatientIndex === index
                          ? '2px solid rgba(255,255,255,0.3)'
                          : '1px solid rgba(0,0,0,0.1)',
                        py: 2,
                        px: 2,
                        borderRadius: '16px',
                        boxShadow: selectedPatientIndex === index
                          ? '0 8px 32px rgba(86, 152, 224, 0.3)'
                          : '0 4px 16px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: selectedPatientIndex === index ? undefined : 'rgba(248, 250, 252, 0.8)'
                        }
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 50 }}>
                        <Box sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          background: selectedPatientIndex === index
                            ? 'rgba(255,255,255,0.2)'
                            : 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 800,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                        }}>
                          {patient.queueNumber}
                        </Box>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body1" fontWeight={700} sx={{
                              fontSize: '14px',
                              color: selectedPatientIndex === index ? 'white' : '#1e293b'
                            }}>
                              คิว {patient.queueNumber}
                            </Typography>
                            <Chip
                              size="small"
                              label={patient.queueStatus}
                              color={getStatusColor(patient.queueStatus)}
                              sx={{
                                fontSize: '9px',
                                height: 22,
                                fontWeight: 600,
                                borderRadius: '8px',
                                '& .MuiChip-label': { px: 1 },
                                bgcolor: selectedPatientIndex === index ? 'rgba(255,255,255,0.2)' : undefined,
                                color: selectedPatientIndex === index ? 'white' : undefined,
                                backdropFilter: 'blur(10px)'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body1" sx={{
                              fontWeight: 600,
                              color: selectedPatientIndex === index ? 'white' : '#0f172a',
                              fontSize: '13px',
                              lineHeight: 1.4,
                              mb: 0.5
                            }}>
                              {patient.PRENAME}{patient.NAME1} {patient.SURNAME}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{
                              fontSize: '11px',
                              color: selectedPatientIndex === index ? 'rgba(255,255,255,0.9)' : '#64748b',
                              fontWeight: 500,
                              mb: 0.3
                            }}>
                              ⏰ {patient.queueTime} • 👤 อายุ {patient.AGE} ปี
                            </Typography>
                            <Typography variant="caption" display="block" sx={{
                              fontSize: '11px',
                              color: selectedPatientIndex === index ? 'rgba(255,255,255,0.8)' : '#64748b',
                              fontWeight: 500
                            }}>
                              🏥 HN: {patient.HNCODE}
                            </Typography>
                            {patient.SYMPTOM && (
                              <Typography variant="caption" display="block" sx={{
                                fontSize: '11px',
                                mt: 0.5,
                                p: 1,
                                bgcolor: selectedPatientIndex === index
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'rgba(86, 152, 224, 0.1)',
                                borderRadius: '8px',
                                color: selectedPatientIndex === index ? 'white' : '#2B69AC',
                                fontWeight: 500,
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}>
                                💬 {patient.SYMPTOM}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </Box>
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
            <Card sx={{ borderRadius: '16px' }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
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
                      transform: 'translateY(-2px)',
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
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%) !important',
                      transform: 'translateY(-3px)'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  },
                  '& .MuiTabs-scrollButtons': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>👥</span>
                      <span>ข้อมูลคนไข้วันนี้</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📋</span>
                      <span>ประวัติการรักษา</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🔍</span>
                      <span>ตรวจวินิจฉัย</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🧪</span>
                      <span>ส่งLAB/X-ray</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📝</span>
                      <span>Dx/ สรุป Treatment</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>💊</span>
                      <span>Order ยา</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>⚕️</span>
                      <span>หัตถการ</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📅</span>
                      <span>นัดหมายคนไข้</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📄</span>
                      <span>ใบรับรองแพทย์</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🕐</span>
                      <span>ตารางแพทย์</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>💼</span>
                      <span>ใบรับรองการทำงาน</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🚗</span>
                      <span>ใบรับรองขับรถ</span>
                    </Box>
                  }
                />
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
                {tabIndex === 3 && <LabandXray currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
                {tabIndex === 4 && <DxandTreatment currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
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