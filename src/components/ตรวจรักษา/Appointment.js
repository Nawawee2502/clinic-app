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
  InputAdornment,
  MenuItem,
  Divider,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import Services
import PatientService from "../../services/patientService";
import TreatmentService from "../../services/treatmentService";

const Appointment = ({ currentPatient }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Load existing appointments for current patient
  useEffect(() => {
    if (currentPatient) {
      loadPatientAppointments();
    }
  }, [currentPatient]);

  const loadPatientAppointments = async () => {
    if (!currentPatient?.HNCODE) return;

    try {
      const response = await PatientService.getPatientAppointments(currentPatient.HNCODE);
      if (response.success) {
        setExistingAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDateSelect = (fullDate) => {
    setSelectedDate(fullDate);
  };

  const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    const buddhistYear = date.getFullYear() + 543;
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${buddhistYear}`;
  };

  const handleSaveAppointment = async () => {
    if (!currentPatient) {
      showSnackbar('ไม่พบข้อมูลผู้ป่วย', 'error');
      return;
    }

    if (!selectedDate || !appointmentTime || !reason) {
      showSnackbar('กรุณากรอกข้อมูลให้ครบถ้วน (วันที่, เวลา, เหตุผล)', 'error');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        APPOINTMENT_DATE: selectedDate,
        APPOINTMENT_TIME: appointmentTime,
        HNCODE: currentPatient.HNCODE,
        PRENAME: currentPatient.PRENAME,
        NAME1: currentPatient.NAME1,
        SURNAME: currentPatient.SURNAME,
        PHONE: currentPatient.TEL1,
        REASON: reason,
        DOCTOR_NAME: doctorName,
        NOTES: notes,
        status: 'ยืนยันแล้ว'
      };

      const response = await PatientService.createAppointment(appointmentData);

      if (response.success) {
        showSnackbar(`สร้างนัดหมายสำเร็จ! VN Number: ${response.data.VN_NUMBER}`, 'success');

        // Reset form
        setSelectedDate('');
        setAppointmentTime('');
        setReason('');
        setNotes('');
        setDoctorName('');

        // Reload appointments
        loadPatientAppointments();
      } else {
        showSnackbar('ไม่สามารถสร้างนัดหมายได้: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      showSnackbar('เกิดข้อผิดพลาดในการบันทึกนัดหมาย', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('คุณต้องการลบนัดหมายนี้หรือไม่?')) {
      try {
        const response = await PatientService.deleteAppointment(appointmentId);

        if (response.success) {
          showSnackbar('ลบนัดหมายสำเร็จ', 'success');
          loadPatientAppointments();
        } else {
          showSnackbar('ไม่สามารถลบนัดหมายได้: ' + response.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        showSnackbar('เกิดข้อผิดพลาดในการลบนัดหมาย', 'error');
      }
    }
  };

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning">
          กรุณาเลือกผู้ป่วยจากคิวก่อนทำการนัดหมาย
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={5}>
          <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" color="primary">
                ข้อมูลผู้ป่วย
              </Typography>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Avatar
                  sx={{ width: 120, height: 120, mx: "auto", bgcolor: '#1976d2', fontSize: '2rem' }}
                >
                  {currentPatient.NAME1?.charAt(0)}
                </Avatar>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 2
                }}>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                    {currentPatient.PRENAME}{currentPatient.NAME1} {currentPatient.SURNAME}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    อายุ {currentPatient.AGE} ปี
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
                    VN: {currentPatient.vnNumber || currentPatient.VNO || 'N/A'}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    HN: {currentPatient.HNCODE}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    📱 {currentPatient.TEL1}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Existing Appointments */}
          {existingAppointments.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EventIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    นัดหมายที่มีอยู่
                  </Typography>
                  <IconButton size="small" onClick={loadPatientAppointments}>
                    <RefreshIcon />
                  </IconButton>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>วันที่</TableCell>
                        <TableCell>เวลา</TableCell>
                        <TableCell>เหตุผล</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>จัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {existingAppointments.map((appointment, index) => (
                        <TableRow key={appointment.APPOINTMENT_ID || index}>
                          <TableCell>
                            <Typography variant="body2">
                              {formatThaiDate(appointment.APPOINTMENT_DATE)}
                            </Typography>
                          </TableCell>
                          <TableCell>{appointment.APPOINTMENT_TIME}</TableCell>
                          <TableCell>{appointment.REASON}</TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status || 'รอนัด'}
                              color={appointment.status === 'ยืนยันแล้ว' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteAppointment(appointment.APPOINTMENT_ID)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Appointment Form Section */}
        <Grid item xs={12} sm={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="h6" color="primary">
                  สร้างนัดหมายใหม่
                </Typography>
              </Box>

              {/* Date Selection */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    เลือกวันที่นัด
                  </Typography>
                  <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                    helperText={selectedDate ? `วันที่เลือก: ${formatThaiDate(selectedDate)}` : ''}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    เวลานัด
                  </Typography>
                  <TextField
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    แพทย์ผู้รักษา
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      displayEmpty
                      sx={{ borderRadius: "10px" }}
                    >
                      <MenuItem value="">เลือกแพทย์</MenuItem>
                      <MenuItem value="นพ.สุดา รักษาดี">👩‍⚕️ นพ.สุดา รักษาดี</MenuItem>
                      <MenuItem value="นพ.สมชาย ใจดี">👨‍⚕️ นพ.สมชาย ใจดี</MenuItem>
                      <MenuItem value="นพ.สมหญิง รักษาดี">👩‍⚕️ นพ.สมหญิง รักษาดี</MenuItem>
                      <MenuItem value="นพ.ประเสริฐ เก่งมาก">👨‍⚕️ นพ.ประเสริฐ เก่งมาก</MenuItem>
                      <MenuItem value="นพ.วิชัย ช่วยคน">👨‍⚕️ นพ.วิชัย ช่วยคน</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>



          {/* Reason and Notes */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>เหตุผลการนัด *</Typography>
              <TextField
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="กรอกเหตุผลการนัด เช่น ตรวจสุขภาพทั่วไป, ตรวจติดตาม, รับผลแลป, รับยา"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>หมายเหตุ</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการนัด..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              sx={{ minWidth: 100 }}
              onClick={() => {
                setSelectedDate('');
                setAppointmentTime('');
                setReason('');
                setNotes('');
                setDoctorName('');
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveAppointment}
              disabled={loading || !selectedDate || !appointmentTime || !reason}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
            </Button>
          </Box>
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
    </Box>
  );
};

export default Appointment;