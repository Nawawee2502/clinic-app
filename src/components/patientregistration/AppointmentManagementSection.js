import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Autocomplete,
    CircularProgress,
    Avatar
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    AccessTime as TimeIcon
} from "@mui/icons-material";

// Import Services
import PatientService from "../../services/patientService";
import AppointmentService from "../../services/appointmentService";
import TreatmentService from "../../services/treatmentService";
import EmployeeService from "../../services/employeeService";
import AppointmentPrint from "./AppointmentPrint";

const AppointmentManagementSection = ({ appointments, setAppointments, onRefresh, showSnackbar }) => {
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
    const [doctorList, setDoctorList] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    // ฟังก์ชันสร้าง VN Number
    const generateVNNumber = (date = new Date()) => {
        return TreatmentService.generateVNO(date);
    };

    // แปลงวันที่เป็น พ.ศ.
    const formatThaiDate = (dateString) => {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            
            // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString);
                return '-';
            }
            
            const buddhistYear = date.getFullYear() + 543;
            const monthNames = [
                'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
            ];

            const day = date.getDate();
            const month = monthNames[date.getMonth()];
            
            if (!day || !month || !buddhistYear) {
                return '-';
            }

            return `${day} ${month} ${buddhistYear}`;
        } catch (error) {
            console.error('Error formatting Thai date:', error, dateString);
            return '-';
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // ✅ โหลดรายการแพทย์จาก database
    useEffect(() => {
        loadDoctors();
    }, []);

    // ✅ เมื่อ doctorList โหลดเสร็จ และกำลังแก้ไขนัดหมาย ให้หาแพทย์
    useEffect(() => {
        if (doctorList.length > 0 && editingAppointment && editingAppointment.DOCTOR_CODE) {
            const doctor = doctorList.find(d => d.EMP_CODE === editingAppointment.DOCTOR_CODE);
            if (doctor) {
                setSelectedDoctor(doctor);
            }
        }
    }, [doctorList, editingAppointment]);

    const loadDoctors = async () => {
        try {
            setLoadingDoctors(true);
            const response = await EmployeeService.getAllEmployees('หมอ'); // ดึงเฉพาะหมอ
            if (response.success && response.data) {
                setDoctorList(response.data);
                
                // ถ้ากำลังแก้ไขนัดหมาย ให้หาแพทย์จาก doctorList
                if (editingAppointment && editingAppointment.DOCTOR_CODE) {
                    const doctor = response.data.find(d => d.EMP_CODE === editingAppointment.DOCTOR_CODE);
                    if (doctor) {
                        setSelectedDoctor(doctor);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoadingDoctors(false);
        }
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
            
            // Reset selectedDoctor (จะถูก set อีกครั้งเมื่อ doctorList โหลดเสร็จผ่าน useEffect)
            setSelectedDoctor(null);
        } else {
            setEditingAppointment(null);
            setSelectedPatient(null);
            setPatientOptions([]);
            setSelectedDoctor(null);
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
            showSnackbar('กรุณาเลือกผู้ป่วย วันที่ และเวลานัด', 'error');
            return;
        }

        try {
            const patientData = selectedPatient.patient;

            if (editingAppointment) {
                // แก้ไขนัดหมาย
                const response = await AppointmentService.updateAppointment(editingAppointment.APPOINTMENT_ID, {
                    APPOINTMENT_DATE: formData.appointmentDate,
                    APPOINTMENT_TIME: formData.appointmentTime,
                    REASON: formData.reason,
                    DOCTOR_CODE: selectedDoctor?.EMP_CODE || null,
                    DOCTOR_NAME: selectedDoctor?.EMP_NAME || null,
                    NOTES: formData.notes,
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
                    showSnackbar('แก้ไขนัดหมายสำเร็จ', 'success');
                } else {
                    showSnackbar('ไม่สามารถแก้ไขนัดหมายได้: ' + response.message, 'error');
                }
            } else {
                // เพิ่มนัดหมายใหม่
                const appointmentData = {
                    APPOINTMENT_DATE: formData.appointmentDate,
                    APPOINTMENT_TIME: formData.appointmentTime,
                    HNCODE: patientData.HNCODE,
                    PRENAME: patientData.PRENAME,
                    NAME1: patientData.NAME1,
                    SURNAME: patientData.SURNAME,
                    PHONE: patientData.TEL1,
                    REASON: formData.reason,
                    DOCTOR_CODE: selectedDoctor?.EMP_CODE || null,
                    DOCTOR_NAME: selectedDoctor?.EMP_NAME || null,
                    NOTES: formData.notes,
                    status: 'รอนัด'
                };

                const response = await AppointmentService.createAppointment(appointmentData);

                if (response.success) {
                    const newAppointment = {
                        APPOINTMENT_ID: response.data.appointmentId || Date.now(),
                        ...appointmentData,
                        vnNumber: response.data.VN_NUMBER
                    };

                    setAppointments(prev => [...prev, newAppointment]);
                    showSnackbar(`นัดหมายสำเร็จ! VN Number: ${response.data.VN_NUMBER}`, 'success');
                    onRefresh();
                } else {
                    showSnackbar('ไม่สามารถสร้างนัดหมายได้: ' + response.message, 'error');
                }
            }

            handleCloseDialog();
        } catch (err) {
            console.error('Error saving appointment:', err);
            showSnackbar('เกิดข้อผิดพลาดในการบันทึกนัดหมาย', 'error');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('คุณต้องการลบนัดหมายนี้หรือไม่?')) {
            try {
                const response = await AppointmentService.deleteAppointment(appointmentId);

                if (response.success) {
                    setAppointments(prev => prev.filter(apt => apt.APPOINTMENT_ID !== appointmentId));
                    showSnackbar('ลบนัดหมายสำเร็จ', 'success');
                    onRefresh();
                } else {
                    showSnackbar('ไม่สามารถลบนัดหมายได้: ' + response.message, 'error');
                }
            } catch (err) {
                console.error('Error deleting appointment:', err);
                showSnackbar('เกิดข้อผิดพลาดในการลบนัดหมาย', 'error');
            }
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await AppointmentService.updateAppointmentStatus(appointmentId, newStatus);

            if (response.success) {
                setAppointments(prev => prev.map(apt =>
                    apt.APPOINTMENT_ID === appointmentId ? { ...apt, status: newStatus } : apt
                ));
                showSnackbar('อัพเดตสถานะสำเร็จ', 'success');
            } else {
                showSnackbar('ไม่สามารถอัพเดตสถานะได้: ' + response.message, 'error');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            showSnackbar('เกิดข้อผิดพลาดในการอัพเดตสถานะ', 'error');
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
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>พิมพ์</TableCell>
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
                                        <AppointmentPrint 
                                            appointment={appointment} 
                                            patient={{
                                                HNCODE: appointment.HNCODE,
                                                PRENAME: appointment.PRENAME,
                                                NAME1: appointment.NAME1,
                                                SURNAME: appointment.SURNAME,
                                                AGE: appointment.AGE,
                                                TEL1: appointment.PHONE
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                                                size="small"
                                                title="เข้าคิว"
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteAppointment(appointment.APPOINTMENT_ID)}
                                                size="small"
                                                title="ลบ"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {appointments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
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
                            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>
                                แพทย์ผู้รักษา
                            </Typography>
                            <Autocomplete
                                fullWidth
                                options={doctorList}
                                getOptionLabel={(option) => option.EMP_NAME || ''}
                                isOptionEqualToValue={(option, value) => option.EMP_CODE === value?.EMP_CODE}
                                value={selectedDoctor}
                                onChange={(event, newValue) => {
                                    setSelectedDoctor(newValue);
                                }}
                                loading={loadingDoctors}
                                size="small"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="เลือกแพทย์"
                                        variant="outlined"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.EMP_CODE}>
                                        👨‍⚕️ {option.EMP_NAME} ({option.EMP_CODE})
                                    </li>
                                )}
                            />
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

export default AppointmentManagementSection;