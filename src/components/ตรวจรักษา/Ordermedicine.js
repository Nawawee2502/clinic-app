import React, { useState, useEffect } from "react";
import {
    Grid, TextField, Button, Card, CardContent, Typography, Avatar,
    InputAdornment, Box, IconButton, Checkbox, Autocomplete, Divider,
    CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel,
    Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle
} from "@mui/material";
import { createFilterOptions } from '@mui/material/Autocomplete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import DrugService from "../../services/drugService";
import QueueService from "../../services/queueService";

const Ordermedicine = ({ currentPatient, onSaveSuccess, onCompletePatient }) => {
    const [medicineData, setMedicineData] = useState({
        drugName: '',
        drugCode: '',
        quantity: '',
        unit: '', // ✅ เก็บ UNIT_CODE สำหรับบันทึก
        unitName: '', // ✅ เก็บ UNIT_NAME สำหรับแสดงผล
        time: '',
        unitPrice: 0
    });

    const [savedMedicines, setSavedMedicines] = useState([]);
    const [drugOptions, setDrugOptions] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });



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


    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [apiStatus, setApiStatus] = useState('checking');

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
                    unit: drug.UNIT_CODE || 'TAB', // ✅ เก็บ UNIT_CODE สำหรับบันทึก
                    unitName: drug.UNIT_NAME || getUnitName(drug.UNIT_CODE || 'TAB'), // ✅ เก็บ UNIT_NAME สำหรับแสดงผล
                    time: drug.TIME1 || '',
                    unitPrice: drug.UNIT_PRICE || 0
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

    const loadDrugOptions = async () => {
        try {
            console.log('Loading drug options...');
            setApiStatus('checking');

            // เพิ่ม limit เป็น 10000 เพื่อดึงยาทั้งหมด (เกือบ 200 ตัว)
            const response = await DrugService.getAllDrugs({ limit: 10000 });

            if (response.success && response.data) {
                console.log('Drug API available, loaded', response.data.length, 'drugs');
                const formattedDrugs = response.data.map(drug => ({
                    DRUG_CODE: drug.DRUG_CODE,
                    GENERIC_NAME: drug.GENERIC_NAME,
                    TRADE_NAME: drug.TRADE_NAME || '',
                    UNIT_CODE: drug.UNIT_CODE || 'TAB',
                    UNIT_NAME: drug.UNIT_NAME || drug.UNIT_NAME1 || '', // ✅ เพิ่ม UNIT_NAME สำหรับแสดงผล
                    UNIT_PRICE: drug.UNIT_PRICE || 0,
                    // ✅ เพิ่ม default regimen จาก drug data
                    Dose1: drug.Dose1 || '',
                    Indication1: drug.Indication1 || '',
                    Comment1: drug.Comment1 || '',
                    eat1: drug.eat1 || '' // ✅ เพิ่ม eat1 สำหรับวิธีรับประทาน
                }));
                setDrugOptions(formattedDrugs);
                setApiStatus('connected');
                console.log('Formatted drugs:', formattedDrugs.slice(0, 3));
                return;
            } else {
                throw new Error('Drug API not available');
            }
        } catch (error) {
            console.error('Drug API not available:', error.message);
            setApiStatus('offline');
            setDrugOptions([]);
            showSnackbar('ไม่สามารถเชื่อมต่อกับฐานข้อมูลยาได้ กรุณาติดต่อผู้ดูแลระบบ', 'error');
        }
    };

    const getAvailableDrugs = () => {
        // ✅ กรองยาที่ไม่มีชื่อ (GENERIC_NAME หรือ TRADE_NAME) ออก
        const drugsWithName = drugOptions.filter(drug => 
            (drug.GENERIC_NAME && drug.GENERIC_NAME.trim() !== '') || 
            (drug.TRADE_NAME && drug.TRADE_NAME.trim() !== '')
        );
        
        if (editingIndex >= 0) {
            const currentEditingDrugCode = savedMedicines[editingIndex]?.drugCode;
            return drugsWithName.filter(drug =>
                !savedMedicines.some((med, index) =>
                    med.drugCode === drug.DRUG_CODE && index !== editingIndex
                ) || drug.DRUG_CODE === currentEditingDrugCode
            );
        }
        return drugsWithName.filter(drug =>
            !savedMedicines.some(med => med.drugCode === drug.DRUG_CODE)
        );
    };

    const isDuplicateMedicine = (drugCode) => {
        return savedMedicines.some((med, index) => {
            if (editingIndex >= 0 && index === editingIndex) {
                return false;
            }
            return med.drugCode === drugCode;
        });
    };

    const handleMedicineChange = (field, value) => {
        setMedicineData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDrugSelect = (newValue) => {
        if (newValue) {
            if (isDuplicateMedicine(newValue.DRUG_CODE)) {
                showSnackbar('ยาตัวนี้ถูกเพิ่มไปแล้ว กรุณาเลือกยาตัวอื่น', 'warning');
                return;
            }

            // ✅ สร้าง default regimen จาก drug data หรือ default values
            const defaultQuantity = newValue.Dose1 || '1';
            const defaultTime = newValue.eat1 || newValue.Comment1 || 'วันละ 3 ครั้งหลังอาหาร'; // ✅ ใช้ eat1 ก่อน ถ้าไม่มีใช้ Comment1

            setMedicineData(prev => ({
                ...prev,
                drugCode: newValue.DRUG_CODE,
                drugName: newValue.GENERIC_NAME,
                unit: newValue.UNIT_CODE || 'TAB', // ✅ เก็บ UNIT_CODE สำหรับบันทึก
                unitName: newValue.UNIT_NAME || getUnitName(newValue.UNIT_CODE || 'TAB'), // ✅ เก็บ UNIT_NAME สำหรับแสดงผล
                unitPrice: newValue.UNIT_PRICE || 0,
                // ✅ เซ็ต default regimen - ถ้าเปลี่ยนยาใหม่ ให้อัพเดท quantity และ time เสมอ
                quantity: defaultQuantity, // ✅ อัพเดทเป็นของยาตัวใหม่เสมอ
                time: defaultTime // ✅ อัพเดทเป็น eat1 ของยาตัวใหม่เสมอ
            }));
        } else {
            setMedicineData(prev => ({
                ...prev,
                drugCode: '',
                drugName: '',
                unit: '',
                unitName: '',
                unitPrice: 0,
                quantity: '',
                time: ''
            }));
        }
    };

    const handleAddMedicine = () => {
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

        if (editingIndex < 0 && isDuplicateMedicine(medicineData.drugCode)) {
            showSnackbar('ไม่สามารถเพิ่มยาตัวเดิมซ้ำได้', 'error');
            return;
        }

        const newMedicine = {
            id: editingIndex >= 0 ? savedMedicines[editingIndex].id : Date.now(),
            drugName: medicineData.drugName.trim(),
            drugCode: medicineData.drugCode,
            quantity: parseFloat(medicineData.quantity),
            unit: medicineData.unit, // ✅ บันทึก UNIT_CODE
            unitName: medicineData.unitName || getUnitName(medicineData.unit), // ✅ เก็บ UNIT_NAME สำหรับแสดงผล
            time: medicineData.time.trim() || 'วันละ 1 ครั้ง',
            unitPrice: parseFloat(medicineData.unitPrice) || 0
        };

        if (editingIndex >= 0) {
            const updatedMedicines = [...savedMedicines];
            updatedMedicines[editingIndex] = newMedicine;
            setSavedMedicines(updatedMedicines);
            setEditingIndex(-1);
            showSnackbar('แก้ไขรายการยาสำเร็จ', 'success');
        } else {
            setSavedMedicines(prev => [...prev, newMedicine]);
            showSnackbar('เพิ่มรายการยาสำเร็จ', 'success');
        }

        resetForm();
    };

    const resetForm = () => {
        setMedicineData({
            drugName: '',
            drugCode: '',
            quantity: '',
            unit: '',
            unitName: '',
            time: '',
            unitPrice: 0
        });
    };

    const handleEditMedicine = (index) => {
        const medicine = savedMedicines[index];
        setMedicineData({
            drugName: medicine.drugName,
            drugCode: medicine.drugCode,
            quantity: medicine.quantity.toString(),
            unit: medicine.unit, // ✅ เก็บ UNIT_CODE สำหรับบันทึก
            unitName: medicine.unitName || getUnitName(medicine.unit), // ✅ เก็บ UNIT_NAME สำหรับแสดงผล
            time: medicine.time,
            unitPrice: medicine.unitPrice || 0
        });
        setEditingIndex(index);
        showSnackbar('เข้าสู่โหมดแก้ไข', 'info');
    };

    const handleDeleteMedicine = (index) => {
        if (window.confirm('ต้องการลบยานี้หรือไม่?')) {
            const updatedMedicines = savedMedicines.filter((_, i) => i !== index);
            setSavedMedicines(updatedMedicines);

            if (editingIndex === index) {
                resetForm();
                setEditingIndex(-1);
            } else if (editingIndex > index) {
                setEditingIndex(editingIndex - 1);
            }

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

            const drugs = savedMedicines.map(medicine => ({
                DRUG_CODE: medicine.drugCode,
                QTY: parseFloat(medicine.quantity) || 1,
                UNIT_CODE: medicine.unit || 'TAB',
                UNIT_PRICE: parseFloat(medicine.unitPrice) || 0,
                AMT: (parseFloat(medicine.quantity) || 1) * (parseFloat(medicine.unitPrice) || 0),
                NOTE1: '',
                TIME1: medicine.time || 'วันละ 1 ครั้ง'
            }));

            const treatmentData = {
                VNO: currentPatient.VNO,
                HNNO: currentPatient.HNCODE,
                STATUS1: 'กำลังตรวจ',
                drugs: drugs
            };

            const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

            if (response.success) {
                showSnackbar('บันทึกข้อมูลยาสำเร็จ!', 'success');

                try {
                    await QueueService.updateQueueStatus(currentPatient.queueId, 'กำลังตรวจ');
                } catch (error) {
                    console.warn('Could not update queue status:', error);
                }

                if (onSaveSuccess) {
                    setTimeout(() => onSaveSuccess(), 1500);
                }
            } else {
                const errorMessage = response.message || 'ไม่สามารถบันทึกข้อมูลได้';
                showSnackbar('ไม่สามารถบันทึกข้อมูลได้: ' + errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error saving medicine data:', error);

            let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';

            if (error.response?.status === 500) {
                errorMessage = 'เซิร์ฟเวอร์เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
            } else if (error.response?.status === 400) {
                errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            showSnackbar(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    // เปิด Completion Confirmation Dialog - เรียกไปยัง parent component
    const handleCompleteRequest = () => {
        if (onCompletePatient) {
            onCompletePatient('รอชำระเงิน');
        }
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

    const availableDrugs = getAvailableDrugs();
    const totalDrugs = drugOptions.length;

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

                {/* Medicine Form Section */}
                <Grid item xs={12} sm={7}>
                    <Card sx={{ p: 2, mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#1976d2' }}>
                                    {editingIndex >= 0 ? '🔄 แก้ไขรายการยา' : '➕ เพิ่มรายการยา'}
                                </Typography>
                            </Box>

                            {availableDrugs.length === 0 && editingIndex < 0 && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    ✅ คุณได้เพิ่มยาครบทุกตัวในระบบแล้ว! หากต้องการเพิ่มยา กรุณาลบยาบางตัวออกก่อน หรือแก้ไขรายการที่มีอยู่
                                </Alert>
                            )}

                            <Grid container spacing={2}>
                                {/* Drug Name */}
                                <Grid item xs={6}>
                                    <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                                        ชื่อยา *
                                    </Typography>
                                    <Autocomplete
                                        options={availableDrugs}
                                        getOptionLabel={(option) => {
                                            const genericName = option.GENERIC_NAME || '';
                                            const tradeName = option.TRADE_NAME ? ` (${option.TRADE_NAME})` : '';
                                            return `${genericName}${tradeName}`;
                                        }}
                                        isOptionEqualToValue={(option, value) => {
                                            return option.DRUG_CODE === value.DRUG_CODE;
                                        }}
                                        filterOptions={(options, { inputValue }) => {
                                            // ✅ กรองยาที่ไม่มีชื่อออกก่อน (ทำครั้งเดียว)
                                            const drugsWithName = options.filter(option => 
                                                (option.GENERIC_NAME && option.GENERIC_NAME.trim() !== '') || 
                                                (option.TRADE_NAME && option.TRADE_NAME.trim() !== '')
                                            );
                                            
                                            // ถ้าไม่มีการค้นหา ให้แสดงยาทั้งหมด
                                            if (!inputValue || inputValue.trim() === '') {
                                                return drugsWithName;
                                            }
                                            
                                            const searchTerm = inputValue.toLowerCase().trim();
                                            
                                            // ✅ ค้นหาเป็น "คำ" (word) - ค้นหาเฉพาะคำที่ขึ้นต้นด้วย search term เท่านั้น
                                            // ไม่แสดงคำที่มี search term อยู่ตรงกลาง
                                            
                                            // ฟังก์ชันแยกคำ - แยกด้วย space, slash, hyphen, parentheses, brackets, dots, commas, และตัวเลข
                                            const splitIntoWords = (text) => {
                                                if (!text) return [];
                                                // แยกด้วย space, slash, hyphen, parentheses, brackets, dots, commas, และตัวเลข
                                                // เช่น "Amiloride 5 mg/Hydrochlorothiazide 50 mg" → ["amiloride", "mg", "hydrochlorothiazide", "mg"]
                                                return text.toLowerCase()
                                                    .split(/[\s\/\-\(\)\[\]\.\,\d]+/)
                                                    .filter(word => word.length > 0);
                                            };
                                            
                                            // ฟังก์ชันเช็คว่ามีคำไหนขึ้นต้นด้วย searchTerm หรือไม่
                                            const hasWordStartingWith = (text, term) => {
                                                if (!text || !term) return false;
                                                const words = splitIntoWords(text);
                                                // เช็คว่ามีคำไหนขึ้นต้นด้วย searchTerm หรือไม่
                                                // เช่น search "ayew" จะหา "ayew" แต่ไม่หา "brompheniramine"
                                                return words.some(word => word.startsWith(term));
                                            };
                                            
                                            // ✅ Filter ยาที่ตรงกับ searchTerm เท่านั้น - ต้องมีคำไหนสักคำขึ้นต้นด้วย searchTerm
                                            const filtered = drugsWithName.filter(option => {
                                                const genericName = (option.GENERIC_NAME || '').trim();
                                                const tradeName = (option.TRADE_NAME || '').trim();
                                                const drugCode = (option.DRUG_CODE || '').trim();
                                                
                                                // ✅ ค้นหาเฉพาะคำที่ขึ้นต้นด้วย searchTerm ใน GENERIC_NAME, TRADE_NAME, และ DRUG_CODE
                                                // จะหาเฉพาะคำที่ขึ้นต้นด้วย searchTerm เท่านั้น ไม่หาคำที่มี searchTerm อยู่ตรงกลาง
                                                // เช่น search "ayew" จะหาเฉพาะ "Ayew" (TRADE_NAME) เท่านั้น
                                                // ไม่หา "Brompheniramine" (ไม่มีคำไหนขึ้นต้นด้วย "ayew")
                                                const matchesGeneric = hasWordStartingWith(genericName, searchTerm);
                                                const matchesTrade = hasWordStartingWith(tradeName, searchTerm);
                                                const matchesCode = hasWordStartingWith(drugCode, searchTerm);
                                                
                                                // ต้องมีอย่างน้อย 1 field ที่ตรงกับ searchTerm
                                                const matches = matchesGeneric || matchesTrade || matchesCode;
                                                
                                                return matches;
                                            });
                                            
                                            // ✅ ลบ duplicate ออก (กรณีมี duplicate ในฐานข้อมูล)
                                            const uniqueFiltered = filtered.filter((option, index, self) => 
                                                index === self.findIndex(t => t.DRUG_CODE === option.DRUG_CODE)
                                            );
                                            
                                            return uniqueFiltered;
                                        }}
                                        disableListWrap
                                        openOnFocus={false}
                                        ListboxProps={{
                                            style: {
                                                maxHeight: '400px', // จำกัดความสูงของ dropdown
                                                overflow: 'auto'
                                            }
                                        }}
                                        value={availableDrugs.find(opt => opt.DRUG_CODE === medicineData.drugCode) || null}
                                        onChange={(event, newValue) => {
                                            handleDrugSelect(newValue);
                                        }}
                                        disabled={availableDrugs.length === 0 && editingIndex < 0}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder={availableDrugs.length === 0 && editingIndex < 0 ?
                                                    "ยาทั้งหมดถูกเพิ่มแล้ว" : "ชื่อยา"}
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
                                        renderOption={(props, option) => {
                                            const { key, ...otherProps } = props;
                                            return (
                                                <Box 
                                                    component="li" 
                                                    key={option.DRUG_CODE || key}
                                                    {...otherProps} 
                                                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                                                >
                                                    <Box component="span" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                        {option.GENERIC_NAME}
                                                    </Box>
                                                    {option.TRADE_NAME && (
                                                        <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                            {option.TRADE_NAME} | {option.DRUG_CODE} | หน่วย: {option.UNIT_CODE}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        }}
                                        getOptionKey={(option) => option.DRUG_CODE || option.GENERIC_NAME}
                                        noOptionsText={
                                            editingIndex >= 0 ? "ไม่พบยาที่ต้องการ" : "ยาทั้งหมดถูกเพิ่มแล้ว"
                                        }
                                    />
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
                                    <TextField
                                        size="small"
                                        value={medicineData.unitName || (medicineData.unit ? getUnitName(medicineData.unit) : '')}
                                        placeholder="หน่วยนับ"
                                        disabled
                                        sx={{
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                backgroundColor: '#f5f5f5'
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Time */}
                                <Grid item xs={12}>
                                    <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                                        วิธีรับประทาน
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="ดึงค่า default มาจาก eat1 ของยา (สามารถแก้ไขได้)"
                                        value={medicineData.time}
                                        onChange={(e) => handleMedicineChange('time', e.target.value)}
                                        sx={{
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                backgroundColor: medicineData.time ? '#f0f8ff' : 'inherit'
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
                                            disabled={availableDrugs.length === 0 && editingIndex < 0}
                                            sx={{
                                                bgcolor: '#5698E0',
                                                color: '#FFFFFF',
                                                minWidth: 130,
                                                '&:hover': {
                                                    bgcolor: '#4285d1'
                                                },
                                                '&:disabled': {
                                                    bgcolor: '#e0e0e0',
                                                    color: '#9e9e9e'
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
                        {savedMedicines.length > 0 && (
                            <Typography component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary', ml: 1 }}>
                                - เพิ่มแล้ว {savedMedicines.length} จาก {totalDrugs} ยา
                            </Typography>
                        )}
                    </Typography>

                    <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', maxHeight: 400 }}>
                        <Table stickyHeader>
                            <TableHead sx={{ bgcolor: '#F0F5FF' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>รหัสยา</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>วิธีรับประทาน</TableCell>
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
                                            <TableCell>
                                                {index + 1}
                                                {editingIndex === index && (
                                                    <Typography component="span" sx={{
                                                        ml: 1,
                                                        fontSize: '0.75rem',
                                                        color: '#ff9800',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        (แก้ไข)
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="500">
                                                    {medicine.drugName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {medicine.drugCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{medicine.quantity}</TableCell>
                                            <TableCell>{medicine.unitName || getUnitName(medicine.unit)}</TableCell>
                                            <TableCell>{medicine.time}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleEditMedicine(index)}
                                                        size="small"
                                                        sx={{
                                                            border: '1px solid #5698E0',
                                                            borderRadius: '7px',
                                                            color: '#5698E0',
                                                            bgcolor: editingIndex === index ? '#e3f2fd' : 'transparent'
                                                        }}
                                                        disabled={editingIndex >= 0 && editingIndex !== index}
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
                                                        disabled={editingIndex >= 0}
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

            {/* Action Buttons */}
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

                {/* <Button
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
                </Button> */}

                {/* Complete Treatment Button */}
                <Button
                    variant="contained"
                    onClick={handleCompleteRequest}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                        minWidth: 200,
                        height: 50,
                        fontSize: '16px',
                        fontWeight: 700,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)',
                            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    เสร็จสิ้นการรักษา
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
    onSaveSuccess: PropTypes.func,
    onCompletePatient: PropTypes.func
};

export default Ordermedicine;