import React, { useState, useEffect } from "react";
import {
    Grid, TextField, Button, Card, CardContent, Typography, Avatar,
    InputAdornment, Box, IconButton, Checkbox, Autocomplete, Divider,
    CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel,
    Alert, Snackbar
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import DrugService from "../../services/drugService"; // ✅ เพิ่ม import DrugService

const Ordermedicine = ({ currentPatient, onSaveSuccess }) => {
    const [medicineData, setMedicineData] = useState({
        drugName: '',
        drugCode: '',
        usage: '',
        beforeAfter: '',
        quantity: '',
        unit: '',
        time: ''
    });

    const [savedMedicines, setSavedMedicines] = useState([]);
    const [drugOptions, setDrugOptions] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // เพิ่ม options สำหรับหน่วยนับยา
    const [unitOptions] = useState([
        { code: 'TAB', name: 'เม็ด' },
        { code: 'CAP', name: 'แคปซูล' },
        { code: 'BOT', name: 'ขวด' },
        { code: 'AMP', name: 'แอมปูล' },
        { code: 'VIAL', name: 'ไวออล' },
        { code: 'TUBE', name: 'หลอด' },
        { code: 'SACHET', name: 'ซอง' },
        { code: 'BOX', name: 'กล่อง' },
        { code: 'SPRAY', name: 'สเปรย์' },
        { code: 'DROP', name: 'หยด' },
        { code: 'ML', name: 'มิลลิลิตร' },
        { code: 'G', name: 'กรัม' },
        { code: 'PACK', name: 'แพ็ค' }
    ]);

    const [usageOptions] = useState([
        'รับประทาน',
        'ฉีด',
        'ทา',
        'หยอด',
        'พ่น'
    ]);

    const [beforeAfterOptions] = useState([
        'ก่อนอาหาร',
        'หลังอาหาร',
        'ระหว่างอาหาร',
        'เมื่อมีอาการ'
    ]);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [apiStatus, setApiStatus] = useState('checking'); // ✅ เพิ่มสถานะ API

    // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
    useEffect(() => {
        if (currentPatient?.VNO) {
            loadMedicineData();
        }
        loadDrugOptions();
    }, [currentPatient]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const loadMedicineData = async () => {
        try {
            setLoading(true);
            const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

            if (response.success && response.data?.drugs) {
                const medicines = response.data.drugs.map((drug, index) => ({
                    id: index + 1,
                    drugName: drug.GENERIC_NAME,
                    drugCode: drug.DRUG_CODE,
                    quantity: drug.QTY,
                    unit: drug.UNIT_CODE || 'TAB',
                    usage: drug.NOTE1 || '',
                    beforeAfter: '',
                    time: drug.TIME1 || ''
                }));
                setSavedMedicines(medicines);
            }
        } catch (error) {
            console.error('Error loading medicine data:', error);
            showSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลยา', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ✅ ปรับปรุง loadDrugOptions ให้มี error handling ที่ดีขึ้น
    const loadDrugOptions = async () => {
        try {
            console.log('🔍 Loading drug options...');
            setApiStatus('checking');

            // ลองใช้ DrugService ก่อน
            const response = await DrugService.getAllDrugs({ limit: 100 });

            if (response.success && response.data) {
                console.log('✅ Drug API available, loaded', response.data.length, 'drugs');
                const formattedDrugs = response.data.map(drug => ({
                    DRUG_CODE: drug.DRUG_CODE,
                    GENERIC_NAME: drug.GENERIC_NAME,
                    TRADE_NAME: drug.TRADE_NAME || '',
                    DEFAULT_UNIT: drug.UNIT_CODE || 'TAB'
                }));
                setDrugOptions(formattedDrugs);
                setApiStatus('connected');
                return;
            }
        } catch (error) {
            console.warn('⚠️ Drug API not available:', error.message);
            setApiStatus('offline');
        }

        // ใช้ข้อมูลจำลองเมื่อ API ไม่พร้อม
        console.log('📦 Using mock drug data');
        const mockDrugs = DrugService.getMockDrugs();
        setDrugOptions(mockDrugs);
        setApiStatus('mock');

        // แสดงข้อความแจ้งเตือน
        showSnackbar('กำลังใช้ข้อมูลยาจำลอง (API ไม่พร้อม)', 'warning');
    };

    const handleMedicineChange = (field, value) => {
        setMedicineData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDrugSelect = (newValue) => {
        if (newValue) {
            handleMedicineChange('drugCode', newValue.DRUG_CODE);
            handleMedicineChange('drugName', newValue.GENERIC_NAME);
            // ตั้งหน่วยเริ่มต้นตามยาที่เลือก
            handleMedicineChange('unit', newValue.DEFAULT_UNIT || 'TAB');
        } else {
            handleMedicineChange('drugCode', '');
            handleMedicineChange('drugName', '');
            handleMedicineChange('unit', '');
        }
    };

    const handleAddMedicine = () => {
        // ✅ เพิ่มการตรวจสอบข้อมูลที่ชัดเจน
        const errors = [];

        if (!medicineData.drugName.trim()) {
            errors.push('ชื่อยา');
        }
        if (!medicineData.quantity || parseFloat(medicineData.quantity) <= 0) {
            errors.push('จำนวน (ต้องมากกว่า 0)');
        }
        if (!medicineData.unit.trim()) {
            errors.push('หน่วยนับ');
        }

        if (errors.length > 0) {
            showSnackbar(`กรุณากรอกข้อมูลให้ครบถ้วน: ${errors.join(', ')}`, 'error');
            return;
        }

        const newMedicine = {
            id: editingIndex >= 0 ? savedMedicines[editingIndex].id : Date.now(),
            drugName: medicineData.drugName.trim(),
            drugCode: medicineData.drugCode,
            quantity: parseFloat(medicineData.quantity),
            unit: medicineData.unit,
            usage: medicineData.usage || 'รับประทาน',
            beforeAfter: medicineData.beforeAfter || 'หลังอาหาร',
            time: medicineData.time.trim() || 'วันละ 1 ครั้ง'
        };

        if (editingIndex >= 0) {
            // แก้ไขยาที่มีอยู่
            const updatedMedicines = [...savedMedicines];
            updatedMedicines[editingIndex] = newMedicine;
            setSavedMedicines(updatedMedicines);
            setEditingIndex(-1);
            showSnackbar('แก้ไขรายการยาสำเร็จ', 'success');
        } else {
            // เพิ่มยาใหม่
            setSavedMedicines(prev => [...prev, newMedicine]);
            showSnackbar('เพิ่มรายการยาสำเร็จ', 'success');
        }

        // รีเซ็ตฟอร์ม
        resetForm();
    };

    const resetForm = () => {
        setMedicineData({
            drugName: '',
            drugCode: '',
            usage: '',
            beforeAfter: '',
            quantity: '',
            unit: '',
            time: ''
        });
    };

    const handleEditMedicine = (index) => {
        const medicine = savedMedicines[index];
        setMedicineData({
            drugName: medicine.drugName,
            drugCode: medicine.drugCode,
            usage: medicine.usage,
            beforeAfter: medicine.beforeAfter,
            quantity: medicine.quantity.toString(),
            unit: medicine.unit,
            time: medicine.time
        });
        setEditingIndex(index);
        showSnackbar('เข้าสู่โหมดแก้ไข', 'info');
    };

    const handleDeleteMedicine = (index) => {
        if (window.confirm('ต้องการลบยานี้หรือไม่?')) {
            const updatedMedicines = savedMedicines.filter((_, i) => i !== index);
            setSavedMedicines(updatedMedicines);
            showSnackbar('ลบรายการยาสำเร็จ', 'success');
        }
    };

    const getUnitName = (unitCode) => {
        const unit = unitOptions.find(u => u.code === unitCode);
        return unit ? unit.name : unitCode;
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            if (savedMedicines.length === 0) {
                showSnackbar('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ', 'error');
                return;
            }

            // Helper function to convert undefined to null
            const toNull = (value) => value === undefined ? null : value;

            // ✅ เตรียมข้อมูลยาสำหรับบันทึก - Handle undefined values
            const drugs = savedMedicines.map(medicine => ({
                DRUG_CODE: toNull(medicine.drugCode),
                QTY: toNull(medicine.quantity) || 1,
                UNIT_CODE: toNull(medicine.unit) || 'TAB',
                UNIT_PRICE: 0,
                AMT: 0,
                NOTE1: toNull(`${medicine.usage || 'รับประทาน'} ${medicine.beforeAfter || 'หลังอาหาร'}`.trim()),
                TIME1: toNull(medicine.time) || 'วันละ 1 ครั้ง'
            }));

            // ✅ สร้างข้อมูล treatment ที่สมบูรณ์ - Convert all undefined to null
            const treatmentData = {
                VNO: toNull(currentPatient.VNO),
                HNNO: toNull(currentPatient.HNCODE),

                // ✅ ข้อมูลพื้นฐานที่จำเป็น
                EMP_CODE: 'DOC001',
                STATUS1: 'ทำงานอยู่',

                // ✅ Vital Signs พื้นฐาน (ถ้าไม่มี) - Handle undefined
                WEIGHT1: toNull(currentPatient.WEIGHT1) || 60,
                HIGHT1: toNull(currentPatient.HIGHT1) || 160,
                BT1: toNull(currentPatient.BT1) || 36.5,
                BP1: toNull(currentPatient.BP1) || 120,
                BP2: toNull(currentPatient.BP2) || 80,
                RR1: toNull(currentPatient.RR1) || 20,
                PR1: toNull(currentPatient.PR1) || 80,
                SPO2: toNull(currentPatient.SPO2) || 98,

                SYMPTOM: toNull(currentPatient.SYMPTOM) || 'รับยา',

                // ✅ รายการยา - Already handled above
                drugs: drugs,

                // ✅ Handle other arrays that might be undefined
                procedures: [],
                labTests: [],
                radioTests: [],

                // ✅ Handle diagnosis object
                diagnosis: null,

                // ✅ Handle other fields that might be undefined
                DXCODE: null,
                ICD10CODE: null,
                TREATMENT1: null
            };

            console.log('💾 Saving treatment data:', treatmentData);

            // ✅ เรียก updateTreatment
            const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

            if (response.success) {
                showSnackbar('บันทึกข้อมูลยาสำเร็จ!', 'success');

                // ✅ อัพเดทสถานะคิวเป็น "กำลังตรวจ"
                try {
                    const QueueService = await import('../../services/queueService');
                    await QueueService.default.updateQueueStatus(currentPatient.queueId, 'กำลังตรวจ');
                    console.log('✅ Queue status updated');
                } catch (error) {
                    console.warn('Could not update queue status:', error);
                }

                if (onSaveSuccess) {
                    setTimeout(() => onSaveSuccess(), 1500);
                }
            } else {
                showSnackbar('ไม่สามารถบันทึกข้อมูลได้: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('Error saving medicine data:', error);
            showSnackbar('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ✅ ฟังก์ชันแสดงสถานะ API
    const getApiStatusChip = () => {
        const statusConfig = {
            checking: { color: 'info', label: 'กำลังตรวจสอบ...' },
            connected: { color: 'success', label: 'เชื่อมต่อ API' },
            mock: { color: 'warning', label: 'ใช้ข้อมูลจำลอง' },
            offline: { color: 'error', label: 'API ไม่พร้อม' }
        };

        return statusConfig[apiStatus] || statusConfig.checking;
    };

    if (!currentPatient) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="warning">ไม่พบข้อมูลผู้ป่วย</Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    กำลังโหลดข้อมูลยา...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                {/* Patient Profile Section */}
                <Grid item xs={12} sm={5}>
                    <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1, mt: 8 }}>
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
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Medicine Form Section */}
                <Grid item xs={12} sm={7}>
                    <Card sx={{ p: 2, mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#1976d2' }}>
                                    {editingIndex >= 0 ? '🔄 แก้ไขรายการยา' : '➕ เพิ่มรายการยา'}
                                </Typography>
                                {/* ✅ แสดงสถานะ API */}
                                <Box sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: getApiStatusChip().color === 'success' ? '#e8f5e8' :
                                        getApiStatusChip().color === 'warning' ? '#fff3e0' : '#ffebee',
                                    color: getApiStatusChip().color === 'success' ? '#2e7d32' :
                                        getApiStatusChip().color === 'warning' ? '#f57c00' : '#d32f2f',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {getApiStatusChip().label} ({drugOptions.length} ยา)
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                {/* Drug Name */}
                                <Grid item xs={6}>
                                    <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                                        ชื่อยา *
                                    </Typography>
                                    <Autocomplete
                                        options={drugOptions}
                                        getOptionLabel={(option) => option.GENERIC_NAME || ''}
                                        value={drugOptions.find(opt => opt.DRUG_CODE === medicineData.drugCode) || null}
                                        onChange={(event, newValue) => handleDrugSelect(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder="ชื่อยา"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                    },
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {params.InputProps.endAdornment}
                                                            <SearchIcon color="action" />
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box component="span" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                    {option.GENERIC_NAME}
                                                </Box>
                                                {option.TRADE_NAME && (
                                                    <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                        {option.TRADE_NAME} | {option.DRUG_CODE}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    />
                                </Grid>

                                {/* Usage */}
                                <Grid item xs={6}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        วิธีใช้ *
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={medicineData.usage}
                                            onChange={(e) => handleMedicineChange('usage', e.target.value)}
                                            displayEmpty
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            <MenuItem value="">เลือกวิธีใช้</MenuItem>
                                            {usageOptions.map((option) => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Quantity */}
                                <Grid item xs={4}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        จำนวน *
                                    </Typography>
                                    <TextField
                                        size="small"
                                        type="number"
                                        placeholder="จำนวน"
                                        value={medicineData.quantity}
                                        onChange={(e) => handleMedicineChange('quantity', e.target.value)}
                                        inputProps={{ min: 0.1, step: 0.1 }}
                                        sx={{
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Unit */}
                                <Grid item xs={4}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        หน่วยนับ *
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={medicineData.unit}
                                            onChange={(e) => handleMedicineChange('unit', e.target.value)}
                                            displayEmpty
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            <MenuItem value="">เลือกหน่วย</MenuItem>
                                            {unitOptions.map((option) => (
                                                <MenuItem key={option.code} value={option.code}>
                                                    {option.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Before/After */}
                                <Grid item xs={4}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        ก่อน/หลังอาหาร
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={medicineData.beforeAfter}
                                            onChange={(e) => handleMedicineChange('beforeAfter', e.target.value)}
                                            displayEmpty
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            <MenuItem value="">เลือก</MenuItem>
                                            {beforeAfterOptions.map((option) => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Time */}
                                <Grid item xs={12}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        เวลา/คำแนะนำ
                                    </Typography>
                                    <TextField
                                        size="small"
                                        placeholder="เช่น วันละ 3 ครั้งหลังอาหาร"
                                        value={medicineData.time}
                                        onChange={(e) => handleMedicineChange('time', e.target.value)}
                                        sx={{
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Add Medicine Button */}
                                <Grid item xs={12} sx={{ textAlign: "right", mb: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {editingIndex >= 0 && (
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    resetForm();
                                                    setEditingIndex(-1);
                                                    showSnackbar('ยกเลิกการแก้ไข', 'info');
                                                }}
                                                size="small"
                                            >
                                                ยกเลิก
                                            </Button>
                                        )}
                                        <Button
                                            variant="contained"
                                            onClick={handleAddMedicine}
                                            startIcon={<AddIcon />}
                                            sx={{
                                                bgcolor: '#5698E0',
                                                color: '#FFFFFF',
                                                minWidth: 130,
                                                '&:hover': {
                                                    bgcolor: '#4285d1'
                                                }
                                            }}
                                        >
                                            {editingIndex >= 0 ? 'บันทึกการแก้ไข' : 'เพิ่มยา'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                </Grid>


            </Grid>


            {/* Medicine List Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        📋 รายการยาที่สั่ง ({savedMedicines.length} รายการ)
                    </Typography>

                    <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', maxHeight: 400 }}>
                        <Table stickyHeader>
                            <TableHead sx={{ bgcolor: '#F0F5FF' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        ลำดับ
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>วิธีใช้</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>เวลา</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {savedMedicines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography color="text.secondary">
                                                ยังไม่มีรายการยา กรุณาเพิ่มรายการยาด้านบน
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    savedMedicines.map((medicine, index) => (
                                        <TableRow
                                            key={medicine.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#f5f5f5' },
                                                bgcolor: editingIndex === index ? '#fff3e0' : 'inherit'
                                            }}
                                        >
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{medicine.drugName}</TableCell>
                                            <TableCell>{medicine.quantity}</TableCell>
                                            <TableCell>{getUnitName(medicine.unit)}</TableCell>
                                            <TableCell>{medicine.usage}</TableCell>
                                            <TableCell>{medicine.time}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleEditMedicine(index)}
                                                        size="small"
                                                        sx={{
                                                            border: '1px solid #5698E0',
                                                            borderRadius: '7px',
                                                            color: '#5698E0'
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDeleteMedicine(index)}
                                                        size="small"
                                                        sx={{
                                                            border: '1px solid #F62626',
                                                            borderRadius: '7px',
                                                            color: '#F62626'
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || savedMedicines.length === 0}
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
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
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

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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

Ordermedicine.propTypes = {
    currentPatient: PropTypes.object,
    onSaveSuccess: PropTypes.func
};

export default Ordermedicine;