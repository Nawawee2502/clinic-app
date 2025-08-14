import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  Avatar,
  Box,
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
  Divider,
  Select,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Autocomplete,
  Fab,
  Badge,
  Snackbar
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";

// Import Services
import PatientService from "../services/patientService";
import QueueService from "../services/queueService";
import TreatmentService from "../services/treatmentService";

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

// Import Walk-in System
import WalkInPatientSystem from "../components/ตรวจรักษา/WalkInPatientSystem";

// Component ระบบนัดหมายแบบเต็มรูปแบบ
const AppointmentManagementSystem = ({ appointments, setAppointments, onCheckIn, onRefresh }) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    doctorName: '',
    notes: ''
  });

  // สร้าง VN Number ตามรูปแบบ VN[ปี พศ 2 หลัก][เดือน][วัน][runno 3 หลัก] เช่น VN680809001
  const generateVNNumber = (date = new Date()) => {
    return TreatmentService.generateVNO(date);
  };

  // แปลงวันที่เป็น พ.ศ. สำหรับการแสดงผล
  const getBuddhistYear = (dateString) => {
    const date = new Date(dateString);
    const buddhistYear = date.getFullYear() + 543;
    return buddhistYear;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    const buddhistYear = date.getFullYear() + 543;
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return `${date.getDate()} ${monthNames[date.getMonth()]} ${buddhistYear}`;
  };

  // ค้นหาผู้ป่วยสำหรับ Autocomplete
  const handleSearchPatients = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setPatientOptions([]);
      return;
    }

    setPatientLoading(true);
    try {
      const response = await PatientService.searchPatients(searchTerm);
      if (response.success) {
        // แปลงข้อมูลให้เป็นรูปแบบที่ Autocomplete ใช้ได้
        const options = response.data.map(patient => ({
          id: patient.HNCODE,
          label: `${patient.HNCODE} - ${patient.PRENAME}${patient.NAME1} ${patient.SURNAME}`,
          patient: patient
        }));
        setPatientOptions(options);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatientOptions([]);
    } finally {
      setPatientLoading(false);
    }
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);

      // ตั้งค่าผู้ป่วยที่เลือกสำหรับการแก้ไข
      const patientData = {
        HNCODE: appointment.HNCODE,
        PRENAME: appointment.PRENAME,
        NAME1: appointment.NAME1,
        SURNAME: appointment.SURNAME
      };

      const patientOption = {
        id: appointment.HNCODE,
        label: `${appointment.HNCODE} - ${appointment.PRENAME}${appointment.NAME1} ${appointment.SURNAME}`,
        patient: patientData
      };

      setSelectedPatient(patientOption);
      setPatientOptions([patientOption]);

      setFormData({
        appointmentDate: appointment.APPOINTMENT_DATE || '',
        appointmentTime: appointment.APPOINTMENT_TIME || '',
        reason: appointment.REASON || '',
        doctorName: appointment.DOCTOR_NAME || '',
        notes: appointment.NOTES || ''
      });
    } else {
      setEditingAppointment(null);
      setSelectedPatient(null);
      setPatientOptions([]);
      setFormData({
        appointmentDate: getTodayDate(),
        appointmentTime: '',
        reason: '',
        doctorName: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAppointment = async () => {
    if (!selectedPatient || !formData.appointmentDate || !formData.appointmentTime) {
      alert('กรุณาเลือกผู้ป่วย วันที่ และเวลานัด');
      return;
    }

    try {
      const patientData = selectedPatient.patient;

      if (editingAppointment) {
        // แก้ไขนัดหมาย
        const response = await PatientService.updateAppointment(editingAppointment.APPOINTMENT_ID, {
          ...formData,
          HNCODE: patientData.HNCODE
        });

        if (response.success) {
          setAppointments(prev => prev.map(apt =>
            apt.APPOINTMENT_ID === editingAppointment.APPOINTMENT_ID
              ? {
                ...apt,
                APPOINTMENT_DATE: formData.appointmentDate,
                APPOINTMENT_TIME: formData.appointmentTime,
                REASON: formData.reason,
                DOCTOR_NAME: formData.doctorName,
                NOTES: formData.notes
              }
              : apt
          ));
          alert('แก้ไขนัดหมายสำเร็จ');
        } else {
          alert('ไม่สามารถแก้ไขนัดหมายได้: ' + response.message);
        }
      } else {
        // ✅ เพิ่มนัดหมายใหม่ - ใช้ TreatmentService
        const appointmentDate = new Date(formData.appointmentDate);
        const vnNumber = TreatmentService.generateVNO(appointmentDate);

        const appointmentData = {
          APPOINTMENT_DATE: formData.appointmentDate,
          APPOINTMENT_TIME: formData.appointmentTime,
          HNCODE: patientData.HNCODE,
          PRENAME: patientData.PRENAME,
          NAME1: patientData.NAME1,
          SURNAME: patientData.SURNAME,
          PHONE: patientData.TEL1,
          REASON: formData.reason,
          DOCTOR_NAME: formData.doctorName,
          NOTES: formData.notes,
          // ✅ ลบ vnNumber ออก ให้ Backend สร้างเอง
          status: 'รอนัด'
        };

        const response = await PatientService.createAppointment(appointmentData);

        if (response.success) {
          const newAppointment = {
            APPOINTMENT_ID: response.data.appointmentId || Date.now(),
            ...appointmentData,
            vnNumber: response.data.VN_NUMBER // ✅ ใช้ VN ที่ Backend ส่งกลับมา
          };

          setAppointments(prev => [...prev, newAppointment]);
          alert(`นัดหมายสำเร็จ! VN Number: ${response.data.VN_NUMBER}`); // ✅ แสดง VN ที่ถูกต้อง
          onRefresh();
        } else {
          alert('ไม่สามารถสร้างนัดหมายได้: ' + response.message);
        }
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving appointment:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกนัดหมาย');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('คุณต้องการลบนัดหมายนี้หรือไม่?')) {
      try {
        const response = await PatientService.deleteAppointment(appointmentId);

        if (response.success) {
          setAppointments(prev => prev.filter(apt => apt.APPOINTMENT_ID !== appointmentId));
          alert('ลบนัดหมายสำเร็จ');
          onRefresh();
        } else {
          alert('ไม่สามารถลบนัดหมายได้: ' + response.message);
        }
      } catch (err) {
        console.error('Error deleting appointment:', err);
        alert('เกิดข้อผิดพลาดในการลบนัดหมาย');
      }
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await PatientService.updateAppointmentStatus(appointmentId, newStatus);

      if (response.success) {
        setAppointments(prev => prev.map(apt =>
          apt.APPOINTMENT_ID === appointmentId ? { ...apt, status: newStatus } : apt
        ));
        alert('อัพเดตสถานะสำเร็จ');
      } else {
        alert('ไม่สามารถอัพเดตสถานะได้: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('เกิดข้อผิดพลาดในการอัพเดตสถานะ');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอนัด': return 'warning';
      case 'ยืนยันแล้ว': return 'success';
      case 'เข้าพบแล้ว': return 'info';
      case 'ยกเลิก': return 'error';
      default: return 'default';
    }
  };

  const previewVNNumber = generateVNNumber(formData.appointmentDate ? new Date(formData.appointmentDate) : new Date());

  // กรองข้อมูลตามวันที่
  const todayAppointments = appointments.filter(apt =>
    apt.APPOINTMENT_DATE === getTodayDate()
  );
  const upcomingAppointments = appointments.filter(apt =>
    apt.APPOINTMENT_DATE > getTodayDate()
  );

  return (
    <Card elevation={3}>
      <CardContent>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '2px solid #f0f0f0'
        }}>
          <Typography variant="h5" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 'bold'
          }}>
            <CalendarIcon color="primary" />
            ระบบจัดการนัดหมายคนไข้
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '16px'
            }}
          >
            เพิ่มนัดหมายใหม่
          </Button>
        </Box>

        {/* สถิติ */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 3,
              boxShadow: 3
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {todayAppointments.length}
              </Typography>
              <Typography variant="body1">นัดหมายวันนี้</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'secondary.light',
              color: 'secondary.contrastText',
              borderRadius: 3,
              boxShadow: 3
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {upcomingAppointments.length}
              </Typography>
              <Typography variant="body1">นัดหมายที่จะมาถึง</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText',
              borderRadius: 3,
              boxShadow: 3
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {appointments.filter(apt => apt.status === 'ยืนยันแล้ว').length}
              </Typography>
              <Typography variant="body1">ยืนยันแล้ว</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              borderRadius: 3,
              boxShadow: 3
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {appointments.filter(apt => apt.status === 'รอนัด').length}
              </Typography>
              <Typography variant="body1">รอยืนยัน</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ตารางนัดหมาย */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>VN Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>HN</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>ชื่อ-นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>วันที่นัด (พ.ศ.)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>เวลา</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>เหตุผล</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>แพทย์</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow
                  key={appointment.APPOINTMENT_ID}
                  hover
                  sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}
                >
                  <TableCell>
                    <Chip
                      label={appointment.vnNumber || 'VN-'}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{appointment.HNCODE}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {appointment.PRENAME}{appointment.NAME1} {appointment.SURNAME}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {formatThaiDate(appointment.APPOINTMENT_DATE)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{appointment.APPOINTMENT_TIME}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{appointment.REASON}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{appointment.DOCTOR_NAME}</Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={appointment.status || 'รอนัด'}
                        onChange={(e) => handleStatusChange(appointment.APPOINTMENT_ID, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="รอนัด">รอนัด</MenuItem>
                        <MenuItem value="ยืนยันแล้ว">ยืนยันแล้ว</MenuItem>
                        <MenuItem value="เข้าพบแล้ว">เข้าพบแล้ว</MenuItem>
                        <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(appointment)}
                        size="small"
                        title="แก้ไข"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => onCheckIn(appointment.APPOINTMENT_ID)}
                        size="small"
                        title="เข้าคิว"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteAppointment(appointment.APPOINTMENT_ID)}
                        size="small"
                        title="ลบ"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary" variant="h6">
                      ไม่มีข้อมูลนัดหมาย
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{ mt: 2 }}
                    >
                      เพิ่มนัดหมายแรก
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Dialog สำหรับเพิ่ม/แก้ไขนัดหมาย */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CalendarIcon />
          {editingAppointment ? 'แก้ไขนัดหมาย' : 'เพิ่มนัดหมายใหม่'}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              <strong>VN Number ที่จะได้รับ:</strong> {previewVNNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รูปแบบ: VN[ปีพ.ศ. 2 หลัก][เดือน][วัน][เลขรันนิ่ง 3 หลัก] (เช่น VN680809001)
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* เลือกผู้ป่วยด้วย Autocomplete */}
            <Grid item xs={12}>
              <Autocomplete
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  handleSearchPatients(newInputValue);
                }}
                options={patientOptions}
                loading={patientLoading}
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="เลือกผู้ป่วย *"
                    placeholder="ค้นหาด้วย HN, ชื่อ, หรือนามสกุล..."
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                      endAdornment: (
                        <>
                          {patientLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {option.patient.NAME1?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.patient.PRENAME}{option.patient.NAME1} {option.patient.SURNAME}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        HN: {option.patient.HNCODE} • อายุ {option.patient.AGE || 'N/A'} ปี • {option.patient.SEX || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText="ไม่พบผู้ป่วย กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร"
                loadingText="กำลังค้นหา..."
                clearOnBlur
                selectOnFocus
                handleHomeEndKeys
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* วันที่และเวลานัด */}
            <Grid item xs={12} md={6}>
              <TextField
                name="appointmentDate"
                label="วันที่นัด *"
                type="date"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                helperText={formData.appointmentDate ?
                  `วันที่ที่เลือก: ${formatThaiDate(formData.appointmentDate)}` :
                  'เลือกวันที่นัดหมาย'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="appointmentTime"
                label="เวลานัด *"
                type="time"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>

            {/* เหตุผลการนัด */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>เหตุผลการนัด</InputLabel>
                <Select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  label="เหตุผลการนัด"
                >
                  <MenuItem value="ตรวจสุขภาพทั่วไป">🩺 ตรวจสุขภาพทั่วไป</MenuItem>
                  <MenuItem value="ตรวจติดตาม">📋 ตรวจติดตาม</MenuItem>
                  <MenuItem value="รับผลแลป">🧪 รับผลแลป</MenuItem>
                  <MenuItem value="รับยา">💊 รับยา</MenuItem>
                  <MenuItem value="ฉีดวัคซีน">💉 ฉีดวัคซีน</MenuItem>
                  <MenuItem value="ตรวจฟัน">🦷 ตรวจฟัน</MenuItem>
                  <MenuItem value="ตรวจตา">👁️ ตรวจตา</MenuItem>
                  <MenuItem value="อื่นๆ">📝 อื่นๆ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* แพทย์ผู้รักษา */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>แพทย์ผู้รักษา</InputLabel>
                <Select
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  label="แพทย์ผู้รักษา"
                >
                  <MenuItem value="นพ.สุดา รักษาดี">👩‍⚕️ นพ.สุดา รักษาดี</MenuItem>
                  <MenuItem value="สมชาย ใจดี">👨‍⚕️ นพ.สมชาย ใจดี</MenuItem>
                  <MenuItem value="นพ.สมหญิง รักษาดี">👩‍⚕️ นพ.สมหญิง รักษาดี</MenuItem>
                  <MenuItem value="นพ.ประเสริฐ เก่งมาก">👨‍⚕️ นพ.ประเสริฐ เก่งมาก</MenuItem>
                  <MenuItem value="นพ.วิชัย ช่วยคน">👨‍⚕️ นพ.วิชัย ช่วยคน</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* หมายเหตุ */}
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="หมายเหตุเพิ่มเติม"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับการนัด..."
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ px: 3 }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveAppointment}
            variant="contained"
            sx={{ px: 3 }}
            disabled={!selectedPatient || !formData.appointmentDate || !formData.appointmentTime}
          >
            {editingAppointment ? 'บันทึกการแก้ไข' : 'สร้างนัดหมาย'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const ตรวจรักษา = () => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [queueView, setQueueView] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    waiting: 0,
    completed: 0
  });

  // สำหรับ Walk-in System
  const [openWalkIn, setOpenWalkIn] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadTodayPatients();
    loadTodayAppointments();
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

  // โหลดข้อมูลนัดหมายวันนี้
  const loadTodayAppointments = async () => {
    try {
      const response = await PatientService.getTodayAppointments();

      if (response.success) {
        setAppointments(response.data);
      } else {
        console.error('Failed to load appointments:', response.message);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
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
    loadTodayAppointments();
    loadQueueStats();
  };

  // เช็คอินจากนัดหมาย
  const handleCheckInAppointment = async (appointmentId) => {
    try {
      const response = await QueueService.checkInAppointment(appointmentId);

      if (response.success) {
        setSnackbar({
          open: true,
          message: `เช็คอินสำเร็จ! หมายเลขคิว: ${response.data.QUEUE_NUMBER}`,
          severity: 'success'
        });
        // รีเฟรชข้อมูล
        loadTodayPatients();
        loadTodayAppointments();
        loadQueueStats();
      } else {
        setSnackbar({
          open: true,
          message: 'ไม่สามารถเช็คอินได้: ' + response.message,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error checking in appointment:', err);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการเช็คอิน',
        severity: 'error'
      });
    }
  };

  // จัดการ Walk-in Patient
  const handleWalkInPatientAdded = (newPatient) => {
    // เพิ่มผู้ป่วย Walk-in เข้าในรายการ
    setPatients(prev => [...prev, newPatient]);

    // รีเฟรชข้อมูลทั้งหมด
    loadQueueStats();

    // แสดงข้อความสำเร็จ
    setSnackbar({
      open: true,
      message: `เพิ่มผู้ป่วย Walk-in สำเร็จ! คิว ${newPatient.queueNumber}`,
      severity: 'success'
    });

    // เลือกผู้ป่วยที่เพิ่งเพิ่มเข้ามา
    setSelectedPatientIndex(patients.length);
    setTabIndex(0);
  };

  // ไปหน้าลงทะเบียนผู้ป่วยใหม่
  const handleNewPatientRegistration = () => {
    navigate('/clinic/patientregistration');

    setSnackbar({
      open: true,
      message: 'กำลังเปิดหน้าลงทะเบียนผู้ป่วยใหม่...',
      severity: 'info'
    });
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
      // ถ้าส่ง skipToTab มา ให้ไปแท็บที่ระบุ
      setTabIndex(skipToTab);
    } else {
      // ถ้าไม่ส่งมา ให้ไปแท็บถัดไปปกติ
      goToNextTab();
    }
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
        {/* Left Sidebar - Compact Queue */}
        <Grid item xs={12} md={2.5}>
          <Card sx={{
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Compact Queue Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 1.5,
              textAlign: 'center',
              flexShrink: 0
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '14px' }}>
                🏥 ตรวจรักษา
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant={queueView === 'today' ? 'contained' : 'outlined'}
                  onClick={() => setQueueView('today')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: queueView === 'today' ? 'rgba(255,255,255,0.2)' : 'transparent',
                    fontSize: '11px',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  วันนี้
                </Button>
                <Button
                  size="small"
                  variant={queueView === 'appointments' ? 'contained' : 'outlined'}
                  onClick={() => setQueueView('appointments')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: queueView === 'appointments' ? 'rgba(255,255,255,0.2)' : 'transparent',
                    fontSize: '11px',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  นัดหมาย
                </Button>
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  sx={{ color: 'white', ml: 0.5 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Compact Queue Stats */}
            {queueView === 'today' && (
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
            )}

            {/* Current Patient Status Control */}
            {queueView === 'today' && currentPatient && (
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

            {/* Compact Queue List */}
            <List sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              minHeight: 0
            }}>
              {queueView === 'today' ? (
                patients.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          ไม่มีผู้ป่วยในคิววันนี้
                        </Typography>
                      }
                    />
                  </ListItem>
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
                        <Avatar src={patient.avatar} sx={{ width: 35, height: 35 }}>
                          {!patient.avatar && patient.queueNumber}
                        </Avatar>
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
                )
              ) : (
                // แสดงรายการนัดหมาย
                appointments.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          ไม่มีรายการนัดหมายวันนี้
                        </Typography>
                      }
                    />
                  </ListItem>

                ) : (
                  appointments.map((appointment, index) => (
                    <ListItem key={appointment.APPOINTMENT_ID || index} sx={{ py: 1, px: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 35, height: 35, fontSize: '14px' }}>
                          📅
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px' }}>
                            {appointment.PRENAME}{appointment.NAME1} {appointment.SURNAME}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block" color="primary" sx={{ fontSize: '11px' }}>
                              📅 {new Date(appointment.APPOINTMENT_DATE).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" sx={{ fontSize: '11px' }}>
                              🕐 {appointment.APPOINTMENT_TIME}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleCheckInAppointment(appointment.APPOINTMENT_ID)}
                              sx={{ mt: 0.5, fontSize: '10px', py: 0.3, px: 1 }}
                            >
                              ✅ เข้าคิว
                            </Button>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )
              )}
            </List>

            {/* Walk-in Button ล่างสุด */}
            <Box sx={{
              p: 1,
              borderTop: '1px solid #e0e0e0',
              bgcolor: '#f8f9fa',
              flexShrink: 0
            }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={() => setOpenWalkIn(true)}
                startIcon={<PersonAddIcon />}
                sx={{
                  py: 1,
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                เพิ่มผู้ป่วย Walk-in
              </Button>
            </Box>

          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9.5}>
          {queueView === 'today' ? (
            patients.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    ไม่มีผู้ป่วยในคิววันนี้
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleRefresh}
                    sx={{ mt: 2 }}
                  >
                    รีเฟรชข้อมูล
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
                  <Tab label=" " />
                  <Tab label=" " />
                </Tabs>

                <CardContent>
                  {tabIndex === 0 && <Todaypatientinformation currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
                  {tabIndex === 1 && <Medicalhistory currentPatient={currentPatient} onSaveSuccess={goToNextTab} />}
                  {tabIndex === 2 && (
                    <ตรวจวินิจฉัย
                      currentPatient={currentPatient}
                      onSaveSuccess={handleDiagnosisSaveSuccess}
                    />
                  )}                  {tabIndex === 3 && <LabandXray currentPatient={currentPatient} />}
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
            )
          ) : (
            // ระบบนัดหมายแบบเต็มรูปแบบ
            <AppointmentManagementSystem
              appointments={appointments}
              setAppointments={setAppointments}
              onCheckIn={handleCheckInAppointment}
              onRefresh={handleRefresh}
            />
          )}
        </Grid>
      </Grid>

      {/* Walk-in Patient System */}
      <WalkInPatientSystem
        open={openWalkIn}
        onClose={() => setOpenWalkIn(false)}
        onPatientAdded={handleWalkInPatientAdded}
        onNewPatientNeeded={handleNewPatientRegistration}
      />

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