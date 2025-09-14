import React from 'react';
import {
  Card,
  Typography,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Box,
  Button,
  IconButton,
  Avatar
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';

const PatientQueueSidebar = ({
  patients,
  selectedPatientIndex,
  onPatientSelect,
  onNextPatient,
  onPreviousPatient,
  onRefresh
}) => {
  const navigate = useNavigate();
  const currentPatient = patients[selectedPatientIndex];

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'ชำระแล้ว': return 'success';
      case 'ยังไม่ชำระ': return 'warning';
      case 'รอเสร็จการรักษา': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card sx={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #2B69AC 0%, #5698E0 100%)',
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
            💰 คิวชำระเงินวันนี้
          </Typography>
          <IconButton
            size="small"
            onClick={onRefresh}
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

      {/* Stats */}
      <Box sx={{
        p: 2,
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
        flexShrink: 0,
        textAlign: 'center'
      }}>
        <Box sx={{
          p: 2,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography sx={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748B',
            mb: 0.5
          }}>
            รวมทั้งหมด
          </Typography>
          <Typography sx={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#2B69AC',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {patients.length} ราย
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      {currentPatient && (
        <Box sx={{
          p: 2,
          background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
          color: 'white',
          flexShrink: 0
        }}>
          <Typography sx={{
            fontSize: '12px',
            mb: 1.5,
            textAlign: 'center',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            💳 ผู้ป่วยที่เลือก: คิว {currentPatient.queueNumber}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PrevIcon />}
              onClick={onPreviousPatient}
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
              onClick={onNextPatient}
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

      {/* Patient List */}
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
              💸 ไม่มีผู้ป่วยในคิววันนี้
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/clinic/ตรวจรักษา')}
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
              ไปหน้าตรวจรักษา
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
                onClick={() => onPatientSelect(index)}
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
                        label={patient.paymentStatus}
                        color={getPaymentStatusColor(patient.paymentStatus)}
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
                        🏷️ VN: {patient.VNO}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{
                        fontSize: '11px',
                        color: selectedPatientIndex === index ? 'rgba(255,255,255,0.8)' : '#64748b',
                        fontWeight: 500,
                        mb: 0.3
                      }}>
                        🏥 HN: {patient.HNCODE}
                      </Typography>

                      {patient.totalAmount && (
                        <Box sx={{
                          mt: 0.5,
                          p: 1,
                          bgcolor: selectedPatientIndex === index
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(34, 197, 94, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Typography variant="caption" sx={{
                            fontSize: '11px',
                            color: selectedPatientIndex === index ? 'white' : '#059669',
                            fontWeight: 600
                          }}>
                            💰 ยอดชำระ: ฿{parseFloat(patient.totalAmount || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="caption" display="block" sx={{
                        fontSize: '10px',
                        mt: 0.5,
                        color: selectedPatientIndex === index ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                        fontWeight: 500
                      }}>
                        ⏰ อัพเดท: {new Date().toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </Box>
          ))
        )}
      </List>
    </Card>
  );
};

export default PatientQueueSidebar;