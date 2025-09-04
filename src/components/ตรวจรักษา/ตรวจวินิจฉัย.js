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
    },
    // เพิ่มข้อมูล Lab/X-ray
    radiological: {
      note: ''
    },
    laboratory: {
      note: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);

  // ใช้ข้อมูล vitals จาก currentPatient ทันที (copy จาก TodayPatientInformation)
  const [vitals, setVitals] = useState({
    WEIGHT1: '',
    HIGHT1: '',
    BT1: '',
    BP1: '',
    BP2: '',
    RR1: '',
    PR1: '',
    SPO2: ''
  });

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient) {
      loadPatientData();
    }
  }, [currentPatient]);

  // COPY เป๊ะๆ จากหน้า TodayPatientInformation - ฟังก์ชันโหลดข้อมูลเพิ่มเติม
  const loadPatientData = async () => {
    if (!currentPatient) return;

    try {
      setLoading(true);

      // ใช้ข้อมูลจาก currentPatient ก่อน (มาจากคิว)
      const initialVitals = {
        WEIGHT1: currentPatient.WEIGHT1 || '',
        HIGHT1: currentPatient.HIGHT1 || '',
        BT1: currentPatient.BT1 || '',
        BP1: currentPatient.BP1 || '',
        BP2: currentPatient.BP2 || '',
        RR1: currentPatient.RR1 || '',
        PR1: currentPatient.PR1 || '',
        SPO2: currentPatient.SPO2 || ''
      };

      console.log('🩺 Diagnosis - Initial vitals from currentPatient:', initialVitals);
      setVitals(initialVitals);

      // พยายามดึงข้อมูลล่าสุดจาก Treatment table
      if (currentPatient.VNO) {
        try {
          const treatmentResponse = await TreatmentService.getTreatmentByVN(currentPatient.VNO);
          if (treatmentResponse.success && treatmentResponse.data) {
            console.log('✅ Diagnosis - Found treatment data:', treatmentResponse.data);

            // ใช้ข้อมูลจาก Treatment ถ้ามี
            const treatmentVitals = {
              WEIGHT1: treatmentResponse.data.WEIGHT1 || initialVitals.WEIGHT1,
              HIGHT1: treatmentResponse.data.HIGHT1 || initialVitals.HIGHT1,
              BT1: treatmentResponse.data.BT1 || initialVitals.BT1,
              BP1: treatmentResponse.data.BP1 || initialVitals.BP1,
              BP2: treatmentResponse.data.BP2 || initialVitals.BP2,
              RR1: treatmentResponse.data.RR1 || initialVitals.RR1,
              PR1: treatmentResponse.data.PR1 || initialVitals.PR1,
              SPO2: treatmentResponse.data.SPO2 || initialVitals.SPO2
            };

            console.log('🔄 Diagnosis - Updated vitals from treatment:', treatmentVitals);
            setVitals(treatmentVitals);
          }
        } catch (error) {
          console.log('⚠️ Diagnosis - No treatment data found, using currentPatient data');
        }
      }

      // ลองดึงข้อมูลจาก Patient Service (สำรอง)
      try {
        const PatientService = await import('../../services/patientService');
        const patientWithVitals = await PatientService.default.getPatientWithVitals(currentPatient.HNCODE);
        if (patientWithVitals && Object.keys(patientWithVitals).length > 0) {
          console.log('📊 Diagnosis - Patient history loaded:', patientWithVitals);

          // อัพเดตเฉพาะข้อมูลที่ยังไม่มี
          setVitals(prev => ({
            WEIGHT1: prev.WEIGHT1 || patientWithVitals.WEIGHT1 || '',
            HIGHT1: prev.HIGHT1 || patientWithVitals.HIGHT1 || '',
            BT1: prev.BT1 || patientWithVitals.BT1 || '',
            BP1: prev.BP1 || patientWithVitals.BP1 || '',
            BP2: prev.BP2 || patientWithVitals.BP2 || '',
            RR1: prev.RR1 || patientWithVitals.RR1 || '',
            PR1: prev.PR1 || patientWithVitals.PR1 || '',
            SPO2: prev.SPO2 || patientWithVitals.SPO2 || ''
          }));
        }
      } catch (error) {
        console.log('⚠️ Diagnosis - Could not load patient history:', error.message);
      }

      loadDiagnosisData();

    } catch (error) {
      console.error('❌ Diagnosis - Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลการตรวจวินิจฉัย
  const loadDiagnosisData = async () => {
    try {
      // ใช้อาการเบื้องต้นจาก currentPatient ก่อน
      setDiagnosisData(prev => ({
        ...prev,
        CHIEF_COMPLAINT: currentPatient.SYMPTOM || ''
      }));

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
              CHIEF_COMPLAINT: treatment.diagnosis.CHIEF_COMPLAINT || prev.CHIEF_COMPLAINT,
              PRESENT_ILL: treatment.diagnosis.PRESENT_ILL || '',
              PHYSICAL_EXAM: treatment.diagnosis.PHYSICAL_EXAM || '',
              PLAN1: treatment.diagnosis.PLAN1 || ''
            }));
          }

          // โหลดข้อมูล Investigation Notes ที่บันทึกเป็น text
          if (treatment.treatment?.INVESTIGATION_NOTES) {
            const investigationNotes = treatment.treatment.INVESTIGATION_NOTES;
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

          // เก็บการโหลดจาก labTests และ radiologicalTests ไว้เป็น fallback สำหรับข้อมูลเก่า
          const { labTests, radiologicalTests } = treatment;

          if (!treatment.treatment?.INVESTIGATION_NOTES) {
            // ถ้าไม่มี INVESTIGATION_NOTES ให้ใช้วิธีเก่า
            if (radiologicalTests && radiologicalTests.length > 0) {
              setDiagnosisData(prev => ({
                ...prev,
                investigations: {
                  ...prev.investigations,
                  imaging: true
                },
                radiological: {
                  note: radiologicalTests[0]?.NOTE1 || ''
                }
              }));
            }

            if (labTests && labTests.length > 0) {
              setDiagnosisData(prev => ({
                ...prev,
                investigations: {
                  ...prev.investigations,
                  lab: true
                },
                laboratory: {
                  note: labTests[0]?.NOTE1 || ''
                }
              }));
            }
          }
        }
      }

      // โหลดประวัติผู้ป่วย
      try {
        const historyResponse = await TreatmentService.getTreatmentsByPatient(
          currentPatient.HNCODE,
          { limit: 5 }
        );

        if (historyResponse.success) {
          setPatientHistory(historyResponse.data);
        }
      } catch (historyError) {
        console.log('⚠️ Could not load patient history:', historyError);
      }

    } catch (error) {
      console.error('Error loading diagnosis data:', error);
      console.log('⚠️ Using currentPatient data due to API error');
    }
  };

  // จัดการการเปลี่ยนแปลงข้อมูล
  const handleDataChange = (field, value) => {
    setDiagnosisData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // จัดการการเปลี่ยนแปลงข้อมูล radiological/laboratory
  const handleLabDataChange = (section, field, value) => {
    setDiagnosisData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
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
  const handleSave = async () => {
    try {
      setSaving(true);

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!diagnosisData.CHIEF_COMPLAINT.trim()) {
        alert('กรุณากรอก Chief Complaint');
        return;
      }

      // เตรียมข้อมูลการวินิจฉัยแยกต่างหาก
      const diagnosisPayload = {
        CHIEF_COMPLAINT: diagnosisData.CHIEF_COMPLAINT.trim(),
        PRESENT_ILL: diagnosisData.PRESENT_ILL.trim(),
        PHYSICAL_EXAM: diagnosisData.PHYSICAL_EXAM.trim(),
        PLAN1: diagnosisData.PLAN1.trim()
      };

      // สร้าง treatmentData ที่เรียบง่าย
      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        SYMPTOM: diagnosisData.CHIEF_COMPLAINT.trim(),
        STATUS1: 'กำลังตรวจ'
      };

      // เพิ่มข้อมูลการวินิจฉัยถ้ามี
      if (Object.values(diagnosisPayload).some(val => val.trim())) {
        treatmentData.diagnosis = diagnosisPayload;
      }

      // เพิ่มข้อมูล Imaging และ Laboratory เป็น text notes แทนการใช้ foreign key
      const notes = [];
      
      if (diagnosisData.investigations.imaging && diagnosisData.radiological.note.trim()) {
        notes.push(`[Imaging] ${diagnosisData.radiological.note.trim()}`);
      }
      
      if (diagnosisData.investigations.lab && diagnosisData.laboratory.note.trim()) {
        notes.push(`[Laboratory] ${diagnosisData.laboratory.note.trim()}`);
      }

      // บันทึก notes เป็น text ใน TREATMENT1
      if (notes.length > 0) {
        treatmentData.INVESTIGATION_NOTES = notes.join('\n\n');
      }

      console.log('📋 Sending diagnosis data to backend:', treatmentData);

      let response;
      if (currentTreatment && currentPatient.VNO) {
        // อัพเดทข้อมูลเดิม
        response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);
      } else {
        // สร้างใหม่ - เพิ่ม QUEUE_ID และ RDATE
        const newTreatmentData = {
          ...treatmentData,
          QUEUE_ID: currentPatient.queueId,
          RDATE: new Date().toISOString().split('T')[0]
        };
        
        if (currentPatient.queueId) {
          response = await TreatmentService.createTreatmentWithQueue(newTreatmentData, currentPatient.queueId);
        } else {
          response = await TreatmentService.createTreatment(newTreatmentData);
        }
      }

      if (response && response.success) {
        alert('บันทึกข้อมูลการตรวจวินิจฉัยสำเร็จ!');

        // รีเฟรชข้อมูล
        await loadDiagnosisData();

        if (onSaveSuccess) {
          // ไปหน้า DX โดยตรง (index 4) เนื่องจากรวม Lab/X-ray แล้ว
          onSaveSuccess(4);
        }
      } else {
        const errorMsg = response?.message || 'ไม่สามารถบันทึกข้อมูลได้';
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + errorMsg);
      }

    } catch (error) {
      console.error('❌ Error saving diagnosis:', error);
      
      // ให้รายละเอียดข้อผิดพลาดมากขึ้น
      let errorMsg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      if (error.response?.data?.message) {
        errorMsg += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMsg += ': ' + error.message;
      }
      
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ข้อมูล Vital Signs ใช้จาก vitals state ที่โหลดจาก currentPatient แล้ว
  const vitalsData = [
    {
      label: "Blood Pressure",
      value: vitals.BP1 && vitals.BP2
        ? `${vitals.BP1}/${vitals.BP2}`
        : 'ไม่มีข้อมูล',
      display: vitals.BP1 && vitals.BP2
        ? `${vitals.BP1}/${vitals.BP2} mmHg`
        : 'ไม่มีข้อมูล',
      progressValue: vitals.BP1 && vitals.BP2
        ? Math.round(((parseFloat(vitals.BP1) + parseFloat(vitals.BP2)) / 220) * 100)
        : 0
    },
    {
      label: "Heart Rate",
      value: vitals.PR1
        ? `${vitals.PR1}`
        : 'ไม่มีข้อมูล',
      display: vitals.PR1
        ? `${vitals.PR1} bpm`
        : 'ไม่มีข้อมูล',
      progressValue: vitals.PR1
        ? Math.round((parseFloat(vitals.PR1) / 120) * 100)
        : 0
    },
    {
      label: "Temperature",
      value: vitals.BT1
        ? `${vitals.BT1}°C`
        : 'ไม่มีข้อมูล',
      display: vitals.BT1
        ? `${vitals.BT1}°C`
        : 'ไม่มีข้อมูล',
      progressValue: vitals.BT1
        ? Math.round(((parseFloat(vitals.BT1) - 35) / 7) * 100)
        : 0
    },
    {
      label: "SpO2",
      value: vitals.SPO2
        ? `${vitals.SPO2}%`
        : 'ไม่มีข้อมูล',
      display: vitals.SPO2
        ? `${vitals.SPO2}%`
        : 'ไม่มีข้อมูล',
      progressValue: vitals.SPO2 ? parseFloat(vitals.SPO2) : 0
    }
  ];

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
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
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1, color: '#1976d2' }}>
                    {item.value}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(Math.max(item.progressValue, 0), 100)}
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
                  <Typography variant="body2" color="textSecondary">
                    {item.display}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Diagnosis Form Section */}
        <Grid item xs={12} sm={7}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1976d2' }}>
              การตรวจวินิจฉัย (Diagnosis)
            </Typography>

            {loading && (
              <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  กำลังโหลดข้อมูลการวินิจฉัย...
                </Typography>
              </Box>
            )}

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
                      bgcolor: diagnosisData.CHIEF_COMPLAINT ? '#f0f8ff' : 'inherit'
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
                      bgcolor: diagnosisData.PRESENT_ILL ? '#f0f8ff' : 'inherit'
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
                      bgcolor: diagnosisData.PHYSICAL_EXAM ? '#f0f8ff' : 'inherit'
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
                      label="Imaging"
                    />
                    
                    {/* Imaging TextBox */}
                    {diagnosisData.investigations.imaging && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="รายละเอียดการตรวจ Imaging (X-ray, CT, MRI, Ultrasound)"
                        value={diagnosisData.radiological.note}
                        onChange={(e) => handleLabDataChange('radiological', 'note', e.target.value)}
                        sx={{
                          ml: 4, mt: 1, width: 'calc(100% - 32px)',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: '#f0f8ff'
                          },
                        }}
                      />
                    )}

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={diagnosisData.investigations.lab}
                          onChange={(e) => handleInvestigationChange('lab', e.target.checked)}
                          disabled={diagnosisData.investigations.na}
                        />
                      }
                      label="Laboratory"
                    />

                    {/* Laboratory TextBox */}
                    {diagnosisData.investigations.lab && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="รายละเอียดการตรวจ Laboratory (เจาะเลือด, ตรวจปัสสาวะ, CBC, BUN, Lipid, FBS, DTX)"
                        value={diagnosisData.laboratory.note}
                        onChange={(e) => handleLabDataChange('laboratory', 'note', e.target.value)}
                        sx={{
                          ml: 4, mt: 1, width: 'calc(100% - 32px)',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: '#f0f8ff'
                          },
                        }}
                      />
                    )}
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
                      bgcolor: diagnosisData.PLAN1 ? '#f0f8ff' : 'inherit'
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
        </Grid>
      </Grid>
    </Box>
  );
};

ตรวจวินิจฉัย.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default ตรวจวินิจฉัย;