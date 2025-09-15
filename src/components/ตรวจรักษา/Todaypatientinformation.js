import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Card,
  Typography,
  Avatar,
  Box,
  Divider,
  Chip,
  Alert,
  Paper,
  CircularProgress
} from "@mui/material";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import PatientService from "../../services/patientService";

const TodayPatientInformation = ({ currentPatient, onSaveSuccess }) => {
  // ฟังก์ชันแปลงวันที่เป็น พ.ศ.
  const getBuddhistDate = (date = new Date()) => {
    const buddhist = new Date(date);
    const buddhistYear = buddhist.getFullYear() + 543;
    const month = String(buddhist.getMonth() + 1).padStart(2, '0');
    const day = String(buddhist.getDate()).padStart(2, '0');
    return `${buddhistYear}-${month}-${day}`;
  };

  // ฟังก์ชันแปลงวันที่จาก พ.ศ. กลับเป็น ค.ศ. สำหรับ input
  const getChristianDate = (buddhistDateString) => {
    if (!buddhistDateString) return '';
    const [year, month, day] = buddhistDateString.split('-');
    const christianYear = parseInt(year) - 543;
    return `${christianYear}-${month}-${day}`;
  };

  // State สำหรับข้อมูล Vital Signs
  const [vitals, setVitals] = useState({
    VNO: '',
    RDATE: getBuddhistDate(), // ใช้วันที่ พ.ศ.
    WEIGHT1: '',
    HIGHT1: '',
    BT1: '',
    BP1: '',
    BP2: '',
    RR1: '',
    PR1: '',
    SPO2: '',
    SYMPTOM: ''
  });

  const [warnings, setWarnings] = useState([]);
  const [bmiInfo, setBmiInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);

  // ✅ ฟังก์ชันตรวจสอบว่า vital sign แต่ละตัวผิดปกติหรือไม่
  const isVitalAbnormal = (vitalName) => {
    if (!warnings || warnings.length === 0) return false;
    
    // แมป warning messages กับ field names
    const warningMap = {
      'WEIGHT1': ['น้ำหนัก', 'BMI'],
      'HIGHT1': ['ส่วนสูง', 'BMI'],
      'BT1': ['อุณหภูมิ', 'ไข้'],
      'BP1': ['ความดัน', 'BP', 'Systolic'],
      'BP2': ['ความดัน', 'BP', 'Diastolic'],
      'RR1': ['หายใจ', 'RR'],
      'PR1': ['ชีพจร', 'PR', 'Pulse'],
      'SPO2': ['ออกซิเจน', 'SpO2', 'O2']
    };

    const keywords = warningMap[vitalName] || [];
    return warnings.some(warning => 
      keywords.some(keyword => 
        warning.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // ✅ ฟังก์ชันสร้าง style สำหรับ TextField ที่ผิดปกติ
  const getAbnormalStyle = (vitalName) => {
    if (!isVitalAbnormal(vitalName)) {
      return {
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          bgcolor: vitals[vitalName] ? '#f0f8ff' : 'inherit'
        }
      };
    }

    return {
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: '#ffebee', // พื้นหลังสีแดงอ่อน
        borderColor: '#f44336', // กรอบสีแดง
        '& fieldset': {
          borderColor: '#f44336 !important',
          borderWidth: '2px !important'
        },
        '&:hover fieldset': {
          borderColor: '#d32f2f !important'
        },
        '&.Mui-focused fieldset': {
          borderColor: '#d32f2f !important'
        }
      },
      '& .MuiInputLabel-root': {
        color: '#f44336'
      },
      '& .MuiOutlinedInput-input': {
        color: '#d32f2f',
        fontWeight: 'bold'
      }
    };
  };

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient) {
      loadPatientData();
    }
  }, [currentPatient]);

  // ✅ แก้ไข: โหลดข้อมูลผู้ป่วยพร้อม Vital Signs ล่าสุด
  const loadPatientData = async () => {
    if (!currentPatient) return;

    try {
      setLoading(true);

      // ✅ ใช้ข้อมูลจาก currentPatient ก่อน (มาจากคิว)
      const initialVitals = {
        VNO: currentPatient.VNO || TreatmentService.generateVNO(),
        RDATE: getBuddhistDate(),
        WEIGHT1: currentPatient.WEIGHT1 || '',
        HIGHT1: currentPatient.HIGHT1 || '',
        BT1: currentPatient.BT1 || '',
        BP1: currentPatient.BP1 || '',
        BP2: currentPatient.BP2 || '',
        RR1: currentPatient.RR1 || '',
        PR1: currentPatient.PR1 || '',
        SPO2: currentPatient.SPO2 || '',
        SYMPTOM: currentPatient.SYMPTOM || ''
      };

      console.log('🩺 Initial vitals from currentPatient:', initialVitals);
      setVitals(initialVitals);

      // ✅ พยายามดึงข้อมูลล่าสุดจาก Treatment table
      if (currentPatient.VNO) {
        try {
          const treatmentResponse = await TreatmentService.getTreatmentByVN(currentPatient.VNO);
          if (treatmentResponse.success && treatmentResponse.data) {
            console.log('✅ Found treatment data:', treatmentResponse.data);

            // ใช้ข้อมูลจาก Treatment ถ้ามี
            const treatmentVitals = {
              VNO: treatmentResponse.data.VNO || initialVitals.VNO,
              RDATE: getBuddhistDate(new Date(treatmentResponse.data.RDATE || Date.now())),
              WEIGHT1: treatmentResponse.data.WEIGHT1 || initialVitals.WEIGHT1,
              HIGHT1: treatmentResponse.data.HIGHT1 || initialVitals.HIGHT1,
              BT1: treatmentResponse.data.BT1 || initialVitals.BT1,
              BP1: treatmentResponse.data.BP1 || initialVitals.BP1,
              BP2: treatmentResponse.data.BP2 || initialVitals.BP2,
              RR1: treatmentResponse.data.RR1 || initialVitals.RR1,
              PR1: treatmentResponse.data.PR1 || initialVitals.PR1,
              SPO2: treatmentResponse.data.SPO2 || initialVitals.SPO2,
              SYMPTOM: treatmentResponse.data.SYMPTOM || initialVitals.SYMPTOM
            };

            console.log('🔄 Updated vitals from treatment:', treatmentVitals);
            setVitals(treatmentVitals);
          }
        } catch (error) {
          console.log('⚠️ No treatment data found, using currentPatient data');
        }
      }

      // ✅ ลองดึงข้อมูลจาก Patient Service (สำรอง)
      try {
        const patientWithVitals = await PatientService.getPatientWithVitals(currentPatient.HNCODE);
        if (patientWithVitals && Object.keys(patientWithVitals).length > 0) {
          setPatientHistory(patientWithVitals);
          console.log('📊 Patient history loaded:', patientWithVitals);

          // อัพเดตเฉพาะข้อมูลที่ยังไม่มี
          setVitals(prev => ({
            ...prev,
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
        console.log('⚠️ Could not load patient history:', error.message);
      }

    } catch (error) {
      console.error('❌ Error loading patient data:', error);

      // ใช้ข้อมูลจาก currentPatient เป็นหลัก
      setVitals({
        VNO: currentPatient.VNO || TreatmentService.generateVNO(),
        RDATE: getBuddhistDate(),
        WEIGHT1: currentPatient.WEIGHT1 || '',
        HIGHT1: currentPatient.HIGHT1 || '',
        BT1: currentPatient.BT1 || '',
        BP1: currentPatient.BP1 || '',
        BP2: currentPatient.BP2 || '',
        RR1: currentPatient.RR1 || '',
        PR1: currentPatient.PR1 || '',
        SPO2: currentPatient.SPO2 || '',
        SYMPTOM: currentPatient.SYMPTOM || ''
      });
    } finally {
      setLoading(false);
    }
  };

  // คำนวณ BMI และตรวจสอบ Vitals เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (vitals.WEIGHT1 && vitals.HIGHT1) {
      const bmi = TreatmentService.calculateBMI(
        parseFloat(vitals.WEIGHT1),
        parseFloat(vitals.HIGHT1)
      );
      setBmiInfo(bmi);
    } else {
      setBmiInfo(null);
    }

    // ตรวจสอบ Vital Signs ผิดปกติ
    try {
      const vitalWarnings = TreatmentService.checkAbnormalVitals(vitals);
      setWarnings(vitalWarnings || []);
    } catch (error) {
      console.log('Could not check vital warnings:', error);
      setWarnings([]);
    }
  }, [vitals]);

  const handleVitalsChange = (field, value) => {
    setVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // จัดการเปลี่ยนวันที่ (แปลงจาก ค.ศ. input เป็น พ.ศ.)
  const handleDateChange = (christianDateValue) => {
    if (christianDateValue) {
      const buddhistDate = getBuddhistDate(new Date(christianDateValue));
      handleVitalsChange('RDATE', buddhistDate);
    } else {
      handleVitalsChange('RDATE', '');
    }
  };

  // ✅ แก้ไข: การบันทึกข้อมูล
  const handleSave = async () => {
    const requiredFields = ['WEIGHT1', 'HIGHT1', 'BT1', 'BP1', 'BP2', 'RR1', 'PR1', 'SPO2'];
    const missingFields = requiredFields.filter(field => !vitals[field]);

    if (missingFields.length > 0) {
      alert('กรุณากรอกข้อมูล Vital Signs ให้ครบถ้วน');
      return;
    }

    try {
      setSaving(true);

      // แปลงวันที่จาก พ.ศ. เป็น ค.ศ. สำหรับการส่ง API
      const christianDate = getChristianDate(vitals.RDATE);

      // จัดรูปแบบข้อมูลสำหรับส่ง API
      const treatmentData = {
        VNO: vitals.VNO,
        QUEUE_ID: currentPatient.queueId,
        HNNO: currentPatient.HNCODE,
        RDATE: christianDate, // ส่งเป็น ค.ศ.

        // Vital Signs
        WEIGHT1: parseFloat(vitals.WEIGHT1),
        HIGHT1: parseFloat(vitals.HIGHT1),
        BT1: parseFloat(vitals.BT1),
        BP1: parseInt(vitals.BP1),
        BP2: parseInt(vitals.BP2),
        RR1: parseInt(vitals.RR1),
        PR1: parseInt(vitals.PR1),
        SPO2: parseInt(vitals.SPO2),
        SYMPTOM: vitals.SYMPTOM,

        // ข้อมูลพื้นฐาน
        EMP_CODE: 'DOC001',
        STATUS1: 'ทำงานอยู่'
      };

      console.log('💾 Saving treatment data:', treatmentData);

      // บันทึกข้อมูล
      let response;

      // ✅ ตรวจสอบว่ามี VNO อยู่แล้วหรือไม่
      if (currentPatient.VNO && currentPatient.VNO === vitals.VNO) {
        console.log('🔄 Updating existing treatment...');
        response = await TreatmentService.updateTreatment(vitals.VNO, treatmentData);
      } else {
        console.log('➕ Creating new treatment...');
        response = await TreatmentService.createTreatmentWithQueue(treatmentData, currentPatient.queueId);
      }

      if (response.success) {
        alert('บันทึกข้อมูล Vital Signs สำเร็จ!');

        // ✅ อัพเดตสถานะคิวเป็น "กำลังตรวจ"
        if (currentPatient.queueStatus === 'รอตรวจ') {
          try {
            const QueueService = await import('../../services/queueService');
            await QueueService.default.updateQueueStatus(currentPatient.queueId, 'กำลังตรวจ');
            console.log('✅ Queue status updated to กำลังตรวจ');
          } catch (error) {
            console.error('Error updating queue status:', error);
          }
        }

        // ✅ เรียก callback เพื่อไปแท็บถัดไป
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving treatment data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ฟังก์ชันแสดงวันที่ในรูปแบบไทย
  const formatThaiDate = (buddhistDateString) => {
    if (!buddhistDateString) return '';
    try {
      const [year, month, day] = buddhistDateString.split('-');
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
    } catch (error) {
      return buddhistDateString;
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
          กำลังโหลดข้อมูลผู้ป่วย...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, height: 'fit-content' }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Avatar
                src={currentPatient.avatar}
                sx={{
                  width: 160,
                  height: 160,
                  margin: "auto",
                  mb: 2
                }}
              >
                {!currentPatient.avatar && (
                  <Typography variant="h4">
                    {currentPatient.NAME1?.charAt(0) || '?'}
                  </Typography>
                )}
              </Avatar>
              <Typography variant="h6" fontWeight="600">
                {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                อายุ {currentPatient.AGE} ปี • {currentPatient.SEX}
              </Typography>

              {/* Queue Info */}
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`คิว ${currentPatient.queueNumber}`}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={currentPatient.queueStatus}
                  color={
                    currentPatient.queueStatus === 'รอตรวจ' ? 'warning' :
                      currentPatient.queueStatus === 'กำลังตรวจ' ? 'info' : 'success'
                  }
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">HN</Typography>
                <Typography variant="body2">{currentPatient.HNCODE}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">VN</Typography>
                <Typography variant="body2" sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  bgcolor: '#e3f2fd',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  {vitals.VNO}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="bold">เลขบัตรประชาชน</Typography>
                <Typography variant="body2">{currentPatient.IDNO}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">โทรศัพท์</Typography>
                <Typography variant="body2">{currentPatient.TEL1}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">เวลาคิว</Typography>
                <Typography variant="body2">{currentPatient.queueTime}</Typography>
              </Grid>
            </Grid>

            {/* BMI Display */}
            {bmiInfo && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>BMI</Typography>
                  <Chip
                    label={`${bmiInfo.value} (${bmiInfo.category})`}
                    color={bmiInfo.category === 'ปกติ' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    ⚠️ คำเตือน Vital Signs ผิดปกติ:
                  </Typography>
                  {warnings.map((warning, index) => (
                    <Typography key={index} variant="body2" sx={{ color: '#d32f2f' }}>
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              </>
            )}
          </Card>
        </Grid>

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={8}>
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: warnings.length > 0 ? '#f44336' : '#5698E0', // ✅ เปลี่ยนสีหัวเรื่องเป็นแดงถ้ามี warning
                color: 'white',
                py: 2,
                px: 3,
                fontWeight: 600
              }}
            >
              <LocalHospitalIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Vital Signs & Diagnosis</Typography>
              {/* ✅ แสดงสถานะข้อมูล */}
              <Chip
                label={warnings.length > 0 ? "ผิดปกติ" : vitals.WEIGHT1 ? "ปกติ" : "ยังไม่มีข้อมูล"}
                color={warnings.length > 0 ? "error" : vitals.WEIGHT1 ? "success" : "warning"}
                size="small"
                sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('VNO') ? '#d32f2f' : 'inherit'
                  }}>
                    VN *
                  </Typography>
                  <TextField
                    value={vitals.VNO}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        bgcolor: '#e3f2fd',
                        fontWeight: 'bold',
                        color: '#1976d2'
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: 400, fontSize: '16px', mb: 1 }}>
                    วันที่รับบริการ *
                  </Typography>
                  <TextField
                    type="date"
                    value={getChristianDate(vitals.RDATE)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('WEIGHT1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('WEIGHT1') ? 'bold' : 400
                  }}>
                    น้ำหนัก (kg) * {isVitalAbnormal('WEIGHT1') && '⚠️'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="น้ำหนัก"
                    value={vitals.WEIGHT1}
                    onChange={(e) => handleVitalsChange('WEIGHT1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 1000, step: 0.1 }}
                    sx={getAbnormalStyle('WEIGHT1')}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('HIGHT1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('HIGHT1') ? 'bold' : 400
                  }}>
                    ส่วนสูง (cm) * {isVitalAbnormal('HIGHT1') && '⚠️'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="ส่วนสูง"
                    value={vitals.HIGHT1}
                    onChange={(e) => handleVitalsChange('HIGHT1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 300, step: 0.1 }}
                    sx={getAbnormalStyle('HIGHT1')}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('BT1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('BT1') ? 'bold' : 400
                  }}>
                    อุณหภูมิ (°C) * {isVitalAbnormal('BT1') && '🌡️'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="อุณหภูมิ"
                    value={vitals.BT1}
                    onChange={(e) => handleVitalsChange('BT1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 30, max: 45, step: 0.1 }}
                    sx={getAbnormalStyle('BT1')}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('SPO2') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('SPO2') ? 'bold' : 400
                  }}>
                    SpO2 (%) * {isVitalAbnormal('SPO2') && '🫁'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="ค่าออกซิเจน"
                    value={vitals.SPO2}
                    onChange={(e) => handleVitalsChange('SPO2', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                    sx={getAbnormalStyle('SPO2')}
                  />
                </Grid>

                <Grid item xs={4}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('BP1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('BP1') ? 'bold' : 400
                  }}>
                    ความดันตัวบน * {isVitalAbnormal('BP1') && '💓'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="Systolic"
                    value={vitals.BP1}
                    onChange={(e) => handleVitalsChange('BP1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 50, max: 300 }}
                    sx={getAbnormalStyle('BP1')}
                  />
                </Grid>

                <Grid item xs={4}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('BP2') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('BP2') ? 'bold' : 400
                  }}>
                    ความดันตัวล่าง * {isVitalAbnormal('BP2') && '💓'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="Diastolic"
                    value={vitals.BP2}
                    onChange={(e) => handleVitalsChange('BP2', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 30, max: 200 }}
                    sx={getAbnormalStyle('BP2')}
                  />
                </Grid>

                <Grid item xs={4}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('RR1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('RR1') ? 'bold' : 400
                  }}>
                    อัตราการหายใจ * {isVitalAbnormal('RR1') && '🫁'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="RR (bpm)"
                    value={vitals.RR1}
                    onChange={(e) => handleVitalsChange('RR1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 5, max: 60 }}
                    sx={getAbnormalStyle('RR1')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ 
                    fontWeight: 400, 
                    fontSize: '16px', 
                    mb: 1,
                    color: isVitalAbnormal('PR1') ? '#d32f2f' : 'inherit',
                    fontWeight: isVitalAbnormal('PR1') ? 'bold' : 400
                  }}>
                    ชีพจร (bpm) * {isVitalAbnormal('PR1') && '❤️'}
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="Pulse Rate"
                    value={vitals.PR1}
                    onChange={(e) => handleVitalsChange('PR1', e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 30, max: 200 }}
                    sx={getAbnormalStyle('PR1')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: 400, fontSize: '16px', mb: 1 }}>
                    อาการเบื้องต้น / Chief Complaint
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="กรอกอาการเบื้องต้นของผู้ป่วย"
                    value={vitals.SYMPTOM}
                    onChange={(e) => handleVitalsChange('SYMPTOM', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        bgcolor: vitals.SYMPTOM ? '#f0f8ff' : 'inherit'
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      backgroundColor: warnings.length > 0 ? "#f44336" : "#BCD8FF", // ✅ เปลี่ยนสีปุ่มเป็นแดงถ้ามี warning
                      color: warnings.length > 0 ? "white" : "#2B69AC",
                      fontSize: "1rem",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        backgroundColor: warnings.length > 0 ? "#d32f2f" : "#A5CDFF"
                      },
                      '&:disabled': {
                        backgroundColor: "#e0e0e0"
                      }
                    }}
                  >
                    {saving ? <CircularProgress size={20} /> : 'บันทึกข้อมูล'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

TodayPatientInformation.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default TodayPatientInformation;