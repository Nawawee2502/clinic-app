import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Alert,
  Paper
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import InvestigationService from "../../services/investigationService";

const ตรวจวินิจฉัย = ({ currentPatient, onSaveSuccess }) => {
  // State สำหรับข้อมูลการตรวจวินิจฉัย
  const [diagnosisData, setDiagnosisData] = useState({
    CHIEF_COMPLAINT: '',
    PRESENT_ILL: '',
    PHYSICAL_EXAM: '',
    PLAN1: '',
    investigations: {
      na: false,
      imaging: false,
      lab: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient) {
      loadDiagnosisData();
    }
  }, [currentPatient]);

  // โหลดข้อมูลการตรวจวินิจฉัย
  const loadDiagnosisData = async () => {
    try {
      setLoading(true);

      // ถ้ามี VNO ให้ดึงข้อมูลการรักษาปัจจุบัน
      if (currentPatient.VNO) {
        const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

        if (response.success) {
          const treatment = response.data;
          setCurrentTreatment(treatment);

          // ตั้งค่าข้อมูลการวินิจฉัยจากฐานข้อมูล
          if (treatment.diagnosis) {
            setDiagnosisData(prev => ({
              ...prev,
              CHIEF_COMPLAINT: treatment.diagnosis.CHIEF_COMPLAINT || currentPatient.SYMPTOM || '',
              PRESENT_ILL: treatment.diagnosis.PRESENT_ILL || '',
              PHYSICAL_EXAM: treatment.diagnosis.PHYSICAL_EXAM || '',
              PLAN1: treatment.diagnosis.PLAN1 || ''
            }));
          } else {
            // ถ้าไม่มีข้อมูลการวินิจฉัย ให้ใช้อาการเบื้องต้นจากคิว
            setDiagnosisData(prev => ({
              ...prev,
              CHIEF_COMPLAINT: currentPatient.SYMPTOM || ''
            }));
          }
        }
      } else {
        // ถ้าไม่มี VNO ให้ใช้อาการเบื้องต้นจากคิว
        setDiagnosisData(prev => ({
          ...prev,
          CHIEF_COMPLAINT: currentPatient.SYMPTOM || ''
        }));
      }

      // โหลดประวัติผู้ป่วย
      const historyResponse = await TreatmentService.getTreatmentsByPatient(
        currentPatient.HNCODE,
        { limit: 5 }
      );

      if (historyResponse.success) {
        setPatientHistory(historyResponse.data);
      }

    } catch (error) {
      console.error('Error loading diagnosis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // จัดการการเปลี่ยนแปลงข้อมูล
  const handleDataChange = (field, value) => {
    setDiagnosisData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // จัดการการเปลี่ยนแปลง Investigation
  const handleInvestigationChange = (field, checked) => {
    setDiagnosisData(prev => {
      let newInvestigations = { ...prev.investigations };

      if (field === 'na') {
        // ถ้าเลือก N/A ให้ยกเลิกการเลือกอื่นๆ
        if (checked) {
          newInvestigations = {
            na: true,
            imaging: false,
            lab: false
          };
        } else {
          newInvestigations.na = false;
        }
      } else {
        // ถ้าเลือก imaging หรือ lab ให้ยกเลิก N/A
        if (checked) {
          newInvestigations.na = false;
        }
        newInvestigations[field] = checked;
      }

      return {
        ...prev,
        investigations: newInvestigations
      };
    });
  };

  // บันทึกข้อมูลการวินิจฉัย
  // แก้ไขในฟังก์ชัน handleSave ของคอมโพเนนต์ ตรวจวินิจฉัย
  const handleSave = async () => {
    try {
      setSaving(true);

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!diagnosisData.CHIEF_COMPLAINT.trim()) {
        alert('กรุณากรอก Chief Complaint');
        return;
      }

      // เตรียมข้อมูลสำหรับบันทึก
      const diagnosisPayload = {
        VNO: currentPatient.VNO || TreatmentService.generateVNO(),
        CHIEF_COMPLAINT: diagnosisData.CHIEF_COMPLAINT.trim(),
        PRESENT_ILL: diagnosisData.PRESENT_ILL.trim(),
        PHYSICAL_EXAM: diagnosisData.PHYSICAL_EXAM.trim(),
        PLAN1: diagnosisData.PLAN1.trim()
      };

      // การตรวจที่เลือก
      const selectedInvestigations = [];
      if (diagnosisData.investigations.imaging) {
        selectedInvestigations.push('IX003'); // รหัสสำหรับ Imaging
      }
      if (diagnosisData.investigations.lab) {
        selectedInvestigations.push('IX001'); // รหัสสำหรับ Lab
      }

      // บันทึกข้อมูลการวินิจฉัย
      const treatmentData = {
        VNO: diagnosisPayload.VNO,
        HNNO: currentPatient.HNCODE,
        RDATE: new Date().toISOString().split('T')[0],
        SYMPTOM: diagnosisData.CHIEF_COMPLAINT,
        QUEUE_ID: currentPatient.queueId,
        STATUS1: 'กำลังตรวจ',

        diagnosis: diagnosisPayload,
        investigations: selectedInvestigations
      };

      let response;
      if (currentTreatment) {
        // อัพเดทข้อมูลเดิม
        response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);
      } else {
        // สร้างใหม่
        response = await TreatmentService.createTreatmentWithQueue(treatmentData, currentPatient.queueId);
      }

      if (response.success) {
        alert('บันทึกข้อมูลการตรวจวินิจฉัยสำเร็จ!');

        // รีเฟรชข้อมูล
        loadDiagnosisData();

        if (onSaveSuccess) {
          // ✅ ถ้าเลือก N/A ให้ไปหน้า DX โดยตรง (index 4)
          if (diagnosisData.investigations.na) {
            onSaveSuccess(4); // ส่ง 4 เพื่อไปแท็บ DX เลย
          } else {
            // ถ้าไม่เลือก N/A ให้ไปหน้าถัดไปปกติ
            onSaveSuccess();
          }
        }
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
      }

    } catch (error) {
      console.error('Error saving diagnosis:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ข้อมูล Vital Signs สำหรับแสดงผล
  const vitalsData = [
    {
      label: "Blood Pressure",
      value: currentPatient.BP1 && currentPatient.BP2
        ? Math.round(((currentPatient.BP1 + currentPatient.BP2) / 220) * 100)
        : 0,
      display: currentPatient.BP1 && currentPatient.BP2
        ? `${currentPatient.BP1}/${currentPatient.BP2} mmHg`
        : 'ไม่มีข้อมูล'
    },
    {
      label: "Heart Rate",
      value: currentPatient.PR1
        ? Math.round((currentPatient.PR1 / 120) * 100)
        : 0,
      display: currentPatient.PR1
        ? `${currentPatient.PR1} bpm`
        : 'ไม่มีข้อมูล'
    },
    {
      label: "Temperature",
      value: currentPatient.BT1
        ? Math.round(((currentPatient.BT1 - 35) / 7) * 100)
        : 0,
      display: currentPatient.BT1
        ? `${currentPatient.BT1}°C`
        : 'ไม่มีข้อมูล'
    },
    {
      label: "SpO2",
      value: currentPatient.SPO2 || 0,
      display: currentPatient.SPO2
        ? `${currentPatient.SPO2}%`
        : 'ไม่มีข้อมูล'
    }
  ];

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูลการวินิจฉัย...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={5}>
          <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Avatar
                  src={currentPatient.avatar}
                  sx={{ width: 120, height: 120, mx: "auto" }}
                >
                  {!currentPatient.avatar && (
                    <Typography variant="h4">
                      {currentPatient.NAME1?.charAt(0) || '?'}
                    </Typography>
                  )}
                </Avatar>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                    {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    อายุ {currentPatient.AGE} ปี • {currentPatient.SEX}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    คิว {currentPatient.queueNumber}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    {currentPatient.VNO || 'ยังไม่สร้าง VN'}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    {currentPatient.HNCODE}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          <Divider sx={{ pt: 2 }} />

          {/* Vitals Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {vitalsData.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                  <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {item.value}%
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#1976d2",
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {item.display}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Previous Diagnosis History */}
          {patientHistory && patientHistory.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                ประวัติการวินิจฉัยล่าสุด
              </Typography>
              {patientHistory.slice(0, 3).map((history, index) => (
                <Box key={history.VNO} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(history.RDATE).toLocaleDateString('th-TH')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {history.DXNAME_THAI || history.SYMPTOM || 'ไม่ระบุ'}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Grid>

        {/* Diagnosis Form Section */}
        <Grid item xs={12} sm={7}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1976d2' }}>
              การตรวจวินิจฉัย (Diagnosis)
            </Typography>

            <Grid container spacing={2}>
              {/* Chief Complaint */}
              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                  Chief Complaint *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="กรอกอาการหลักที่ผู้ป่วยมาด้วย"
                  value={diagnosisData.CHIEF_COMPLAINT}
                  onChange={(e) => handleDataChange('CHIEF_COMPLAINT', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              </Grid>

              {/* Present Illness */}
              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', mt: 2 }}>
                  Present Illness
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="อธิบายประวัติความเจ็บป่วยปัจจุบัน, การเริ่มต้นของอาการ, ลักษณะอาการ, ปัจจัยที่ทำให้ดีขึ้นหรือแย่ลง"
                  value={diagnosisData.PRESENT_ILL}
                  onChange={(e) => handleDataChange('PRESENT_ILL', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              </Grid>

              {/* Physical Examination */}
              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', mt: 2 }}>
                  Physical Examination
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="ผลการตรวจร่างกาย, การตรวจระบบต่างๆ, การประเมินสัญญาณชีพ"
                  value={diagnosisData.PHYSICAL_EXAM}
                  onChange={(e) => handleDataChange('PHYSICAL_EXAM', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              </Grid>

              {/* Investigation */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Investigation (การตรวจเพิ่มเติม):
                  </Typography>
                  <FormGroup sx={{ ml: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={diagnosisData.investigations.na}
                          onChange={(e) => handleInvestigationChange('na', e.target.checked)}
                        />
                      }
                      label="N/A (ไม่ต้องตรวจเพิ่มเติม)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={diagnosisData.investigations.imaging}
                          onChange={(e) => handleInvestigationChange('imaging', e.target.checked)}
                          disabled={diagnosisData.investigations.na}
                        />
                      }
                      label="Imaging (X-ray, CT, MRI, Ultrasound)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={diagnosisData.investigations.lab}
                          onChange={(e) => handleInvestigationChange('lab', e.target.checked)}
                          disabled={diagnosisData.investigations.na}
                        />
                      }
                      label="Laboratory (เจาะเลือด, ตรวจปัสสาวะ)"
                    />
                  </FormGroup>
                </Box>
              </Grid>

              {/* Plan */}
              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 'bold', mt: 2 }}>
                  Plan (แผนการรักษา)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="แผนการรักษา, การให้ยา, การนัดติดตาม, คำแนะนำสำหรับผู้ป่วย"
                  value={diagnosisData.PLAN1}
                  onChange={(e) => handleDataChange('PLAN1', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              </Grid>

              {/* Save Button */}
              <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    backgroundColor: "#5698E0",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    width: '200px',
                    height: '50px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: "#4285d1"
                    },
                    '&:disabled': {
                      backgroundColor: "#e0e0e0"
                    }
                  }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Current Diagnosis Status */}
          {currentTreatment && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                สถานะการรักษาปัจจุบัน
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>VN:</strong> {currentTreatment.treatment?.VNO}
                  </Typography>
                  <Typography variant="body2">
                    <strong>สถานะ:</strong> {currentTreatment.treatment?.STATUS1}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>แพทย์ผู้รักษา:</strong> {currentTreatment.treatment?.EMP_NAME || 'ไม่ระบุ'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>วันที่รักษา:</strong> {new Date(currentTreatment.treatment?.RDATE).toLocaleDateString('th-TH')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

ตรวจวินิจฉัย.propTypes = {
  currentPatient: PropTypes.object
};

export default ตรวจวินิจฉัย;