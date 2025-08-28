import * as React from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from "@mui/material";
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

export default function MedicalHistory({ currentPatient, onSaveSuccess }) {
  const [loading, setLoading] = React.useState(false);
  const [todayTreatment, setTodayTreatment] = React.useState(null);
  const [treatmentHistory, setTreatmentHistory] = React.useState([]);
  const [selectedHistoryVNO, setSelectedHistoryVNO] = React.useState('today');
  const [selectedTreatmentData, setSelectedTreatmentData] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Vitals state - เหมือนเดิม
  const [vitals, setVitals] = React.useState({
    WEIGHT1: '',
    HIGHT1: '',
    BT1: '',
    BP1: '',
    BP2: '',
    RR1: '',
    PR1: '',
    SPO2: ''
  });

  React.useEffect(() => {
    if (currentPatient) {
      loadPatientData();
      loadTreatmentHistory();
    }
  }, [currentPatient]);

  // โหลดข้อมูลผู้ป่วย - เหมือนเดิม
  const loadPatientData = async () => {
    if (!currentPatient) return;

    try {
      setLoading(true);

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

      console.log('Medical History - Initial vitals from currentPatient:', initialVitals);
      setVitals(initialVitals);

      if (currentPatient.VNO) {
        try {
          const treatmentResponse = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);
          if (treatmentResponse.success && treatmentResponse.data) {
            console.log('Found treatment data:', treatmentResponse.data);

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

            console.log('Updated vitals from treatment:', treatmentVitals);
            setVitals(treatmentVitals);
          }
        } catch (error) {
          console.log('No treatment data found, using currentPatient data');
        }
      }

      try {
        const PatientService = await import('../../services/patientService');
        const patientWithVitals = await PatientService.default.getPatientWithVitals(currentPatient.HNCODE);
        if (patientWithVitals && Object.keys(patientWithVitals).length > 0) {
          console.log('Patient history loaded:', patientWithVitals);

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
        console.log('Could not load patient history:', error.message);
      }

      if (currentPatient.VNO) {
        loadTodayTreatment();
      }

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  // โหลดประวัติการรักษา
  const loadTreatmentHistory = async () => {
    if (!currentPatient?.HNCODE) return;

    try {
      console.log('Loading treatment history for HN:', currentPatient.HNCODE);

      const response = await TreatmentService.getTreatmentsByPatient(currentPatient.HNCODE, {
        page: 1,
        limit: 20
      });

      if (response.success) {
        console.log('Treatment history loaded:', response.data);
        setTreatmentHistory(response.data);
      } else {
        console.log('No treatment history found');
        setTreatmentHistory([]);
      }
    } catch (error) {
      console.error('Error loading treatment history:', error);
      setTreatmentHistory([]);
    }
  };

  // โหลดข้อมูลการรักษาวันนี้
  const loadTodayTreatment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

      if (response.success) {
        setTodayTreatment(response.data);

        if (response.data.treatment) {
          const treatmentData = response.data.treatment;
          setVitals(prev => ({
            WEIGHT1: treatmentData.WEIGHT1 || prev.WEIGHT1,
            HIGHT1: treatmentData.HIGHT1 || prev.HIGHT1,
            BT1: treatmentData.BT1 || prev.BT1,
            BP1: treatmentData.BP1 || prev.BP1,
            BP2: treatmentData.BP2 || prev.BP2,
            RR1: treatmentData.RR1 || prev.RR1,
            PR1: treatmentData.PR1 || prev.PR1,
            SPO2: treatmentData.SPO2 || prev.SPO2
          }));
          console.log('Updated vitals from treatment data');
        }
      } else {
        console.log('No treatment data found, using currentPatient vitals');
      }
    } catch (err) {
      console.error('Error loading today treatment:', err);
      console.log('Using currentPatient vitals due to API error');
    } finally {
      setLoading(false);
    }
  };

  // เมื่อเลือกประวัติการรักษา
  const handleHistoryChange = async (event) => {
    const selectedVNO = event.target.value;
    setSelectedHistoryVNO(selectedVNO);

    if (selectedVNO === 'today') {
      setSelectedTreatmentData(todayTreatment);
      // กลับไปใช้ vitals ปัจจุบัน
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
      setVitals(initialVitals);
    } else {
      try {
        setLoading(true);
        const response = await TreatmentService.getTreatmentByVNO(selectedVNO);
        if (response.success) {
          setSelectedTreatmentData(response.data);

          // อัพเดต vitals จากข้อมูลการรักษาที่เลือก
          if (response.data.treatment) {
            const historyVitals = {
              WEIGHT1: response.data.treatment.WEIGHT1 || '',
              HIGHT1: response.data.treatment.HIGHT1 || '',
              BT1: response.data.treatment.BT1 || '',
              BP1: response.data.treatment.BP1 || '',
              BP2: response.data.treatment.BP2 || '',
              RR1: response.data.treatment.RR1 || '',
              PR1: response.data.treatment.PR1 || '',
              SPO2: response.data.treatment.SPO2 || ''
            };
            console.log('Updated vitals from history:', historyVitals);
            setVitals(historyVitals);
          }
        }
      } catch (error) {
        console.error('Error loading selected treatment:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // ข้อมูล Vital Signs - เหมือนเดิม
  const vitalsData = [
    {
      label: "Blood Pressure",
      value: vitals.BP1 && vitals.BP2 ? `${vitals.BP1}/${vitals.BP2}` : 'ไม่มีข้อมูล',
      display: vitals.BP1 && vitals.BP2 ? `${vitals.BP1}/${vitals.BP2} mmHg` : 'ไม่มีข้อมูล',
      progressValue: vitals.BP1 && vitals.BP2 ? Math.round(((parseFloat(vitals.BP1) + parseFloat(vitals.BP2)) / 220) * 100) : 0
    },
    {
      label: "Temperature",
      value: vitals.BT1 ? `${vitals.BT1}°C` : 'ไม่มีข้อมูล',
      display: vitals.BT1 ? `${vitals.BT1}°C` : 'ไม่มีข้อมูล',
      progressValue: vitals.BT1 ? Math.round(((parseFloat(vitals.BT1) - 35) / 7) * 100) : 0
    },
    {
      label: "Body Weight",
      value: vitals.WEIGHT1 ? `${vitals.WEIGHT1} kg` : 'ไม่มีข้อมูล',
      display: vitals.WEIGHT1 ? `${vitals.WEIGHT1} kg` : 'ไม่มีข้อมูล',
      progressValue: vitals.WEIGHT1 ? Math.round((parseFloat(vitals.WEIGHT1) / 100) * 100) : 0
    },
    {
      label: "Height",
      value: vitals.HIGHT1 ? `${vitals.HIGHT1} cm` : 'ไม่มีข้อมูล',
      display: vitals.HIGHT1 ? `${vitals.HIGHT1} cm` : 'ไม่มีข้อมูล',
      progressValue: vitals.HIGHT1 ? Math.round((parseFloat(vitals.HIGHT1) / 200) * 100) : 0
    }
  ];

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
      </Box>
    );
  }

  // เลือกข้อมูลที่จะแสดง
  const displayTreatmentData = selectedTreatmentData || todayTreatment;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column - Patient Info */}
        <Grid item xs={12} md={5}>
          {/* Patient Profile Card */}
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
                    วันที่: {formatThaiDate(new Date())}
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

          {/* เพิ่มส่วนเลือกประวัติการรักษา */}
          <Card sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2' }}>
              เลือกดูประวัติการรักษา
            </Typography>
            <FormControl fullWidth>
              <InputLabel>เลือกวันที่รักษา</InputLabel>
              <Select
                value={selectedHistoryVNO}
                label="เลือกวันที่รักษา"
                onChange={handleHistoryChange}
              >
                <MenuItem value="today">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>วันนี้ ({formatThaiDate(new Date())})</span>
                    <Chip label="ปัจจุบัน" size="small" color="primary" />
                  </Box>
                </MenuItem>
                {treatmentHistory.map((treatment) => (
                  <MenuItem key={treatment.VNO} value={treatment.VNO}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{formatThaiDate(treatment.RDATE)}</span>
                      <Box>
                        <Chip
                          label={treatment.STATUS1}
                          size="small"
                          color={treatment.STATUS1 === 'ปิดแล้ว' ? 'success' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          VN: {treatment.VNO}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>

          {/* Vitals Section - เหมือนเดิม */}
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

        {/* Right Column - Medical Details */}
        <Grid item xs={12} md={7}>
          <Box sx={{ p: 2 }}>
            {/* Today's Visit Information */}
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1976d2' }}>
              ข้อมูลการตรวจรักษา
              {selectedHistoryVNO === 'today' ? 'วันนี้' : `วันที่ ${formatThaiDate(selectedTreatmentData?.treatment?.RDATE)}`}
            </Typography>

            {/* Vitals Information */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                  Vital Signs:
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  BP: {vitals.BP1 && vitals.BP2 ? `${vitals.BP1}/${vitals.BP2}` : '-'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Pulse: {vitals.PR1 ? `${vitals.PR1} bpm` : '-'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Weight: {vitals.WEIGHT1 ? `${vitals.WEIGHT1} kg` : '-'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Height: {vitals.HIGHT1 ? `${vitals.HIGHT1} cm` : '-'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Temp: {vitals.BT1 ? `${vitals.BT1}°C` : '-'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  SpO2: {vitals.SPO2 ? `${vitals.SPO2}%` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                  ข้อมูลคิว:
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  หมายเลขคิว: {currentPatient.queueNumber || 'ไม่ระบุ'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  เวลาคิว: {currentPatient.queueTime || 'ไม่ระบุ'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  สถานะ: {currentPatient.queueStatus || 'ไม่ระบุ'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  อาการเบื้องต้น: {currentPatient.SYMPTOM || 'ไม่ระบุ'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  HN: {currentPatient.HNCODE}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  VN: {selectedHistoryVNO === 'today' ? (currentPatient.VNO || 'ยังไม่สร้าง') : selectedHistoryVNO}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Treatment Details */}
            {loading && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  กำลังโหลดข้อมูลการรักษา...
                </Typography>
              </Box>
            )}

            {displayTreatmentData && (
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                    การตรวจเพิ่มเติม:
                  </Typography>
                  {displayTreatmentData.labTests?.length > 0 ? (
                    displayTreatmentData.labTests.map((lab, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                        • {lab.LABNAME}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ยังไม่ได้ส่งตรวจ
                    </Typography>
                  )}

                  {displayTreatmentData.radiologicalTests?.length > 0 && (
                    <>
                      <Typography variant="body1" fontWeight="600" sx={{ mb: 1, mt: 2 }}>
                        การตรวจทางรังสี:
                      </Typography>
                      {displayTreatmentData.radiologicalTests.map((radio, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                          • {radio.RLNAME}
                        </Typography>
                      ))}
                    </>
                  )}
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                    การรักษา/ยาที่สั่ง:
                  </Typography>
                  {displayTreatmentData.drugs?.length > 0 ? (
                    displayTreatmentData.drugs.map((drug, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                        • {drug.GENERIC_NAME} {drug.QTY} {drug.UNIT_NAME}
                        <br />
                        <span style={{ fontSize: '0.8em', color: '#666' }}>
                          {drug.TIME1}
                        </span>
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ยังไม่ได้สั่งยา
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Summary Cards - เหมือนเดิม */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Vital Signs Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: 250 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Vital Signs Summary
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                          BP
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                          {vitals.BP1 && vitals.BP2 ? `${vitals.BP1}/${vitals.BP2}` : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                          mmHg
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                          HR
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                          {vitals.PR1 || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                          bpm
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                          Temp
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                          {vitals.BT1 || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                          °C
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                          SpO2
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                          {vitals.SPO2 || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                          %
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Patient Info Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: 250 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Patient Information
                </Typography>
                <Box sx={{ overflow: 'auto', height: 180 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>ชื่อ-สกุล:</strong> {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>อายุ:</strong> {currentPatient.AGE} ปี
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>เพศ:</strong> {currentPatient.SEX}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>HN:</strong> {currentPatient.HNCODE}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>เลขบัตรประชาชน:</strong> {currentPatient.IDNO}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>โทรศัพท์:</strong> {currentPatient.TEL1}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Today's Status */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: 250 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  สถานะวันนี้
                </Typography>
                <Box sx={{ overflow: 'auto', height: 180 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>วันที่เข้ารับบริการ:</strong> {formatThaiDate(new Date())}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>หมายเลขคิว:</strong> {currentPatient.queueNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>เวลาคิว:</strong> {currentPatient.queueTime}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>สถานะ:</strong> {currentPatient.queueStatus}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>VN:</strong> {currentPatient.VNO || 'ยังไม่สร้าง VN'}
                  </Typography>
                  {currentPatient.SYMPTOM && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>อาการเบื้องต้น:</strong> {currentPatient.SYMPTOM}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Next Button */}
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        right: 30,
        zIndex: 1000
      }}>
        <Button
          variant="contained"
          onClick={onSaveSuccess}
          disabled={!onSaveSuccess}
          sx={{
            backgroundColor: "#1976d2",
            color: "#FFFFFF",
            fontSize: "1rem",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            boxShadow: 4,
            '&:hover': {
              backgroundColor: "#1565c0",
              boxShadow: 6
            },
            '&:disabled': {
              backgroundColor: "#cccccc"
            }
          }}
        >
          ถัดไป →
        </Button>
      </Box>
    </Box>
  );
}

MedicalHistory.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};