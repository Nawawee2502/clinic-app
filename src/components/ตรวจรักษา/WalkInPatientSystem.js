import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Avatar,
    CircularProgress,
    Alert,
    Divider,
    Card,
    CardContent,
    Grid,
    Fab,
    Badge,
    Autocomplete,
    Chip,
    Stack,
    Paper
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Close as CloseIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';

// Import Services จริง
// import PatientService from '../services/patientService';
// import QueueService from '../services/queueService';
import PatientService from '../../services/patientService';
import QueueService from '../../services/queueService';
import TreatmentService from '../../services/treatmentService';

const WalkInPatientSystem = ({
    open,
    onClose,
    onPatientAdded,
    onNewPatientNeeded
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [symptom, setSymptom] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('search'); // 'search', 'confirm', 'symptom'

    // ฟังก์ชันค้นหาผู้ป่วย
    const handleSearch = async (searchValue) => {
        if (!searchValue || searchValue.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        setError('');

        try {
            const response = await PatientService.searchPatients(searchValue);

            if (response.success) {
                setSearchResults(response.data);

                // ถ้าไม่พบผู้ป่วยเลย
                if (response.data.length === 0) {
                    setError('ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบการพิมพ์หรือลงทะเบียนผู้ป่วยใหม่');
                }
            } else {
                setError('เกิดข้อผิดพลาดในการค้นหา: ' + response.message);
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // เมื่อเปลี่ยน searchTerm
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    // เลือกผู้ป่วย
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setStep('symptom');
    };

    // เพิ่มเข้าคิว
    const handleAddToQueue = async () => {
        if (!selectedPatient) {
            setError('กรุณาเลือกผู้ป่วย');
            return;
        }

        if (!symptom.trim()) {
            setError('กรุณาระบุอาการหรือเหตุผลการมาพบแพทย์');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // ✅ ไม่ส่ง VNO ไป ให้ Backend สร้างเอง
            const queueData = {
                HNCODE: selectedPatient.HNCODE,
                CHIEF_COMPLAINT: symptom.trim(),
                CREATED_BY: 'WALK_IN_SYSTEM'
                // ✅ ลบ VNO ออก ให้ Backend สร้างเอง
            };

            const response = await QueueService.createWalkInQueue(queueData);

            if (response.success) {
                if (onPatientAdded) {
                    const patientData = {
                        queueId: response.data.QUEUE_ID,
                        queueNumber: response.data.QUEUE_NUMBER,
                        queueTime: response.data.QUEUE_TIME || new Date().toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' }),
                        queueStatus: 'รอตรวจ',
                        HNCODE: selectedPatient.HNCODE,
                        PRENAME: selectedPatient.PRENAME,
                        NAME1: selectedPatient.NAME1,
                        SURNAME: selectedPatient.SURNAME,
                        AGE: selectedPatient.AGE,
                        SEX: selectedPatient.SEX,
                        TEL1: selectedPatient.TEL1,
                        SYMPTOM: symptom.trim(),
                        VNO: response.data.VNO, // ✅ ใช้ VNO ที่ Backend ส่งกลับมา
                        TYPE: 'walk-in'
                    };

                    onPatientAdded(patientData);
                }

                // ✅ แสดง VN Number ที่ถูกต้อง
                alert(`เพิ่มเข้าคิวสำเร็จ!\nหมายเลขคิว: ${response.data.QUEUE_NUMBER}\nVN Number: ${response.data.VNO}`);

                // Dispatch event เพื่อแจ้งหน้าอื่นๆ ว่ามีการเพิ่มคิว
                window.dispatchEvent(new CustomEvent('queueAdded', {
                    detail: { 
                        queueId: response.data.QUEUE_ID,
                        queueNumber: response.data.QUEUE_NUMBER,
                        hncode: selectedPatient.HNCODE
                    }
                }));

                handleReset();
                onClose();
            } else {
                setError('ไม่สามารถเพิ่มเข้าคิวได้: ' + response.message);
            }
        } catch (err) {
            console.error('Add to queue error:', err);
            setError('เกิดข้อผิดพลาดในการเพิ่มเข้าคิว: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // รีเซ็ตฟอร์ม
    const handleReset = () => {
        setSearchTerm('');
        setSearchResults([]);
        setSelectedPatient(null);
        setSymptom('');
        setError('');
        setStep('search');
    };

    // ปิด Dialog
    const handleClose = () => {
        handleReset();
        onClose();
    };

    // ไปหน้าลงทะเบียนผู้ป่วยใหม่
    const handleNewPatientRegistration = () => {
        handleClose();
        if (onNewPatientNeeded) {
            onNewPatientNeeded();
        }
    };

    // แปลงวันที่ให้เป็นภาษาไทย
    const formatThaiDate = (dateString) => {
        if (!dateString) return 'ไม่มีข้อมูล';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minHeight: '70vh'
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAddIcon />
                    <Typography variant="h6">
                        ผู้ป่วย Walk-in (ไม่ได้นัดหมาย)
                    </Typography>
                </Box>
                <Button
                    onClick={handleClose}
                    sx={{ color: 'white', minWidth: 'auto', p: 1 }}
                >
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {step === 'search' && (
                    <Box>
                        {/* คำแนะนำ */}
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                🔍 <strong>ค้นหาผู้ป่วยในระบบ</strong>
                            </Typography>
                            <Typography variant="body2">
                                ค้นหาด้วย: HN, ชื่อ, นามสกุล, เลขบัตรประชาชน, หรือหมายเลขโทรศัพท์
                            </Typography>
                        </Alert>

                        {/* ช่องค้นหา */}
                        <TextField
                            fullWidth
                            label="ค้นหาผู้ป่วย"
                            placeholder="พิมพ์ HN, ชื่อ, นามสกุล, เลขบัตรประชาชน, หรือเบอร์โทร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                                endAdornment: searching && <CircularProgress size={20} />
                            }}
                            sx={{ mb: 2 }}
                            autoFocus
                        />

                        {/* แสดงข้อผิดพลาด */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* ผลการค้นหา */}
                        {searchResults.length > 0 && (
                            <Card sx={{ maxHeight: '400px', overflow: 'auto', borderRadius: 2 }}>
                                <CardContent sx={{ p: 0 }}>
                                    <List>
                                        {searchResults.map((patient, index) => (
                                            <React.Fragment key={patient.HNCODE}>
                                                <ListItemButton
                                                    onClick={() => handleSelectPatient(patient)}
                                                    sx={{
                                                        py: 2,
                                                        '&:hover': {
                                                            bgcolor: 'primary.light',
                                                            color: 'primary.contrastText'
                                                        }
                                                    }}
                                                >
                                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                        {patient.NAME1?.charAt(0)}
                                                    </Avatar>

                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight="bold">
                                                                    {patient.PRENAME}{patient.NAME1} {patient.SURNAME}
                                                                </Typography>
                                                                <Chip
                                                                    label={`อายุ ${patient.AGE} ปี`}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                                <Chip
                                                                    label={patient.SEX}
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    📋 HN: {patient.HNCODE} • 🆔 {patient.IDNO}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    📞 {patient.TEL1} • 📅 มาครั้งล่าสุด: {formatThaiDate(patient.lastVisit)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItemButton>
                                                {index < searchResults.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* ไม่พบผู้ป่วย */}
                        {searchTerm.length >= 2 && searchResults.length === 0 && !searching && !error && (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                                <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    ไม่พบข้อมูลผู้ป่วย
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    ไม่พบผู้ป่วยที่ตรงกับ "{searchTerm}"
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<PersonAddIcon />}
                                    onClick={handleNewPatientRegistration}
                                    size="large"
                                    sx={{ px: 4 }}
                                >
                                    ลงทะเบียนผู้ป่วยใหม่
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}

                {step === 'symptom' && selectedPatient && (
                    <Box>
                        {/* ข้อมูลผู้ป่วยที่เลือก */}
                        <Card sx={{ mb: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                                        {selectedPatient.NAME1?.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {selectedPatient.PRENAME}{selectedPatient.NAME1} {selectedPatient.SURNAME}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            HN: {selectedPatient.HNCODE} • อายุ {selectedPatient.AGE} ปี • {selectedPatient.SEX}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            📞 {selectedPatient.TEL1}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setStep('search')}
                                        size="small"
                                    >
                                        เปลี่ยนผู้ป่วย
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* ระบุอาการ */}
                        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body1">
                                🏥 <strong>ระบุอาการหรือเหตุผลการมาพบแพทย์</strong>
                            </Typography>
                        </Alert>

                        <TextField
                            fullWidth
                            label="อาการหรือเหตุผลการมาพบแพทย์ *"
                            placeholder="เช่น ปวดหัด, ไข้, ตรวจสุขภาพ, รับยา..."
                            value={symptom}
                            onChange={(e) => setSymptom(e.target.value)}
                            multiline
                            rows={4}
                            required
                            InputProps={{
                                startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                            }}
                            sx={{ mb: 2 }}
                            autoFocus
                        />

                        {/* ตัวอย่างอาการ */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                ตัวอย่างอาการที่พบบ่อย:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {['ปวดหัว', 'ไข้', 'ปวดท้อง', 'ไอ', 'เจ็บคอ', 'ตรวจสุขภาพ', 'รับยา', 'ฉีดวัคซีน'].map(symptomExample => (
                                    <Chip
                                        key={symptomExample}
                                        label={symptomExample}
                                        variant="outlined"
                                        onClick={() => setSymptom(symptomExample)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                {step === 'search' && (
                    <>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{ px: 3 }}
                        >
                            ปิด
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PersonAddIcon />}
                            onClick={handleNewPatientRegistration}
                            sx={{ px: 3 }}
                        >
                            ลงทะเบียนผู้ป่วยใหม่
                        </Button>
                    </>
                )}

                {step === 'symptom' && (
                    <>
                        <Button
                            onClick={() => setStep('search')}
                            variant="outlined"
                            sx={{ px: 3 }}
                        >
                            กลับไปค้นหา
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{ px: 3 }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleAddToQueue}
                            variant="contained"
                            disabled={loading || !symptom.trim()}
                            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                            sx={{ px: 3 }}
                        >
                            {loading ? 'กำลังเพิ่มเข้าคิว...' : 'เพิ่มเข้าคิว'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

// Component สำหรับปุ่ม Walk-in ที่จะวางในหน้าตรวจรักษา
export const WalkInButton = ({ onPatientAdded, onNewPatientNeeded }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Fab
                color="secondary"
                aria-label="add walk-in patient"
                onClick={() => setOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000
                }}
            >
                <Badge badgeContent="Walk-in" color="error">
                    <PersonAddIcon />
                </Badge>
            </Fab>

            <WalkInPatientSystem
                open={open}
                onClose={() => setOpen(false)}
                onPatientAdded={onPatientAdded}
                onNewPatientNeeded={onNewPatientNeeded}
            />
        </>
    );
};

export default WalkInPatientSystem;