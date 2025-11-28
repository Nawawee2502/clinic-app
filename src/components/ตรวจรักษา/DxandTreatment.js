import React, { useState, useEffect } from "react";
import {
  Grid, TextField, Button, Card, Typography, Avatar,
  Box, CircularProgress
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

const DxandTreatment = ({ currentPatient, onSaveSuccess }) => {
  const [dxData, setDxData] = useState({
    dx: '',
    treatment: ''
  });

  const [diagnosisData, setDiagnosisData] = useState({
    CHIEF_COMPLAINT: '',
    PRESENT_ILL: '',
    PHYSICAL_EXAM: '',
    PLAN1: '',
    investigations: {
      na: false,
      imaging: false,
      lab: false
    },
    radiological: {
      note: ''
    },
    laboratory: {
      note: ''
    }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient?.VNO) {
      loadDxData();
    }
  }, [currentPatient]);

  const loadDxData = async () => {
    try {
      setLoading(true);
      const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

      if (response.success && response.data) {
        const treatment = response.data.treatment;
        const diagnosis = response.data.diagnosis;

        // โหลดข้อมูล Dx - ใช้ DXCODE เป็น text
        setDxData({
          dx: treatment?.DXCODE || '',
          treatment: treatment?.TREATMENT1 || ''
        });

        // โหลดข้อมูลการวินิจฉัย
        if (diagnosis) {
          setDiagnosisData(prev => ({
            ...prev,
            CHIEF_COMPLAINT: diagnosis.CHIEF_COMPLAINT || '',
            PRESENT_ILL: diagnosis.PRESENT_ILL || '',
            PHYSICAL_EXAM: diagnosis.PHYSICAL_EXAM || '',
            PLAN1: diagnosis.PLAN1 || ''
          }));
        }

        // โหลดข้อมูล Investigation Notes ที่บันทึกเป็น text
        if (treatment?.INVESTIGATION_NOTES) {
          const investigationNotes = treatment.INVESTIGATION_NOTES;
          console.log('📝 Loading investigation notes:', investigationNotes);

          let imagingNote = '';
          let laboratoryNote = '';

          // แยกข้อมูล [Imaging] และ [Laboratory] จาก INVESTIGATION_NOTES
          const lines = investigationNotes.split('\n\n');

          lines.forEach(line => {
            if (line.startsWith('[Imaging]')) {
              imagingNote = line.replace('[Imaging]', '').trim();
            } else if (line.startsWith('[Laboratory]')) {
              laboratoryNote = line.replace('[Laboratory]', '').trim();
            }
          });

          setDiagnosisData(prev => ({
            ...prev,
            investigations: {
              ...prev.investigations,
              imaging: imagingNote.length > 0,
              lab: laboratoryNote.length > 0
            },
            radiological: {
              note: imagingNote
            },
            laboratory: {
              note: laboratoryNote
            }
          }));
        }

        // สร้าง Treatment Summary จากข้อมูลการวินิจฉัย
        generateTreatmentSummary(diagnosis, treatment?.INVESTIGATION_NOTES);
      }
    } catch (error) {
      console.error('Error loading dx data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสร้าง Treatment Summary
  const generateTreatmentSummary = (diagnosis, investigationNotes) => {
    let summary = '';

    // Chief Complaint
    if (diagnosis?.CHIEF_COMPLAINT) {
      summary += `Chief Complaint: ${diagnosis.CHIEF_COMPLAINT}\n\n`;
    }

    // Present Illness
    if (diagnosis?.PRESENT_ILL) {
      summary += `Present Illness: ${diagnosis.PRESENT_ILL}\n\n`;
    }

    // Physical Examination
    if (diagnosis?.PHYSICAL_EXAM) {
      summary += `Physical Examination: ${diagnosis.PHYSICAL_EXAM}\n\n`;
    }

    // Investigation
    if (investigationNotes) {
      summary += `Investigation:\n`;

      const lines = investigationNotes.split('\n\n');
      lines.forEach(line => {
        if (line.startsWith('[Imaging]')) {
          const imagingNote = line.replace('[Imaging]', '').trim();
          if (imagingNote) {
            summary += `- Imaging: ${imagingNote}\n`;
          }
        } else if (line.startsWith('[Laboratory]')) {
          const laboratoryNote = line.replace('[Laboratory]', '').trim();
          if (laboratoryNote) {
            summary += `- Laboratory: ${laboratoryNote}\n`;
          }
        }
      });
      summary += `\n`;
    }

    // Plan
    if (diagnosis?.PLAN1) {
      summary += `Plan: ${diagnosis.PLAN1}`;
    }

    // อัพเดท treatment field ถ้ายังไม่มีข้อมูล
    if (summary.trim()) {
      setDxData(prev => ({
        ...prev,
        treatment: prev.treatment || summary.trim()
      }));
    }
  };

  const handleDxChange = (field, value) => {
    setDxData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ฟังก์ชันสร้าง Summary จากข้อมูลปัจจุบัน
  const handleAutoFillSummary = () => {
    generateTreatmentSummary(diagnosisData,
      diagnosisData.investigations.imaging || diagnosisData.investigations.lab ?
        `${diagnosisData.investigations.imaging ? `[Imaging] ${diagnosisData.radiological.note}` : ''}${diagnosisData.investigations.imaging && diagnosisData.investigations.lab ? '\n\n' : ''}${diagnosisData.investigations.lab ? `[Laboratory] ${diagnosisData.laboratory.note}` : ''}`
        : null
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!dxData.dx.trim() && !dxData.treatment.trim()) {
        alert('กรุณากรอกข้อมูล Dx หรือ Treatment อย่างน้อย 1 รายการ');
        return;
      }

      // สร้าง INVESTIGATION_NOTES จากข้อมูลการวินิจฉัย
      let investigationNotes = '';

      if (diagnosisData.investigations.imaging && diagnosisData.radiological.note) {
        investigationNotes += `[Imaging] ${diagnosisData.radiological.note}\n\n`;
      }

      if (diagnosisData.investigations.lab && diagnosisData.laboratory.note) {
        investigationNotes += `[Laboratory] ${diagnosisData.laboratory.note}`;
      }

      const lockedStatuses = ['รอชำระเงิน', 'ชำระเงินแล้ว', 'ปิดการรักษา'];
      const currentStatus =
        (currentPatient?.queueStatus || currentPatient?.STATUS1 || '').trim();
      const isLockedStatus = lockedStatuses.includes(currentStatus);

      // ส่งข้อมูล Dx เป็น text ลงใน DXCODE โดยตรง
      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        DXCODE: dxData.dx.trim() || null,
        ICD10CODE: null,
        TREATMENT1: dxData.treatment || null,
        ...(isLockedStatus ? {} : { STATUS1: 'กำลังตรวจ' }),
        INVESTIGATION_NOTES: investigationNotes.trim() || null // เพิ่มบรรทัดนี้
      };

      console.log('Sending treatment data with INVESTIGATION_NOTES:', treatmentData);

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

      if (response.success) {
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        alert('บันทึกข้อมูล Dx และ Treatment สำเร็จ!');
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving dx data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
          กำลังโหลดข้อมูล Dx และ Treatment...
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
                <Box sx={{
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
                  <Box sx={{
                    bgcolor: TreatmentService.getPatientRight(currentPatient).bgColor,
                    color: TreatmentService.getPatientRight(currentPatient).color,
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${TreatmentService.getPatientRight(currentPatient).color}`,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}>
                    {TreatmentService.getPatientRight(currentPatient).name}
                  </Box>
                </Box>

              </Grid>

            </Grid>
          </Card>
        </Grid>

        {/* Dx and Treatment Form Section */}
        <Grid item xs={12} sm={7}>
          <Grid container spacing={2}>
            {/* Dx Field - TextField สำหรับใส่ข้อความอิสระ */}
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                Diagnosis (Dx) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="กรอกการวินิจฉัยโรค เช่น Upper respiratory tract infection, Hypertension, Diabetes mellitus type 2"
                value={dxData.dx}
                onChange={(e) => handleDxChange('dx', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Treatment Summary */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, mt: 2 }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
                  สรุป Treatment *
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={12}
                placeholder="กรอกสรุปการรักษา, แผนการรักษา, คำแนะนำสำหรับผู้ป่วย

รูปแบบที่แนะนำ:
Chief Complaint: [อาการหลัก]
Present Illness: [ประวัติความเจ็บป่วย]
Physical Examination: [ผลการตรวจร่างกาย]
Investigation: [การตรวจเพิ่มเติม]
Plan: [แผนการรักษา]"
                value={dxData.treatment}
                onChange={(e) => handleDxChange('treatment', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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

                <Button
                  variant="outlined"
                  onClick={onSaveSuccess}
                  disabled={!onSaveSuccess}
                  sx={{
                    color: "#5698E0",
                    borderColor: "#5698E0",
                    fontSize: "1rem",
                    fontWeight: 600,
                    width: '120px',
                    height: '50px',
                    '&:hover': {
                      backgroundColor: "#f0f8ff"
                    }
                  }}
                >
                  ถัดไป →
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

DxandTreatment.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default DxandTreatment;