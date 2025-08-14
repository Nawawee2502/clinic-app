import React, { useState, useEffect } from "react";
import {
    Grid, TextField, Button, Card, CardContent, Typography, Avatar,
    InputAdornment, Box, IconButton, Checkbox, Autocomplete, Divider,
    CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

const Ordermedicine = ({ currentPatient, onSaveSuccess }) => {
    const [medicineData, setMedicineData] = useState({
        drugName: '',
        drugCode: '',
        usage: '',
        beforeAfter: '',
        quantity: '',
        unit: '', // เพิ่มหน่วยนับ
        time: ''
    });

    const [medicineList, setMedicineList] = useState([]);
    const [savedMedicines, setSavedMedicines] = useState([]);
    const [drugOptions, setDrugOptions] = useState([]);

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

    // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
    useEffect(() => {
        if (currentPatient?.VNO) {
            loadMedicineData();
        }
        loadDrugOptions();
    }, [currentPatient]);

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
                    unit: drug.UNIT_CODE || 'TAB', // เพิ่มหน่วยนับ
                    usage: drug.NOTE1 || '',
                    beforeAfter: '',
                    time: drug.TIME1 || ''
                }));
                setSavedMedicines(medicines);
            }
        } catch (error) {
            console.error('Error loading medicine data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDrugOptions = async () => {
        try {
            // โหลดรายการยาจาก API
            const response = await fetch('/api/drugs'); // สมมุติ API endpoint
            if (response.ok) {
                const data = await response.json();
                setDrugOptions(data);
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.error('Error loading drug options:', error);
            // ข้อมูลจำลอง - ตอนนี้ยังไม่ได้เชื่อม DB จริง
            setDrugOptions([
                { DRUG_CODE: 'MED001', GENERIC_NAME: 'Paracetamol 500mg', TRADE_NAME: 'Tylenol', DEFAULT_UNIT: 'TAB' },
                { DRUG_CODE: 'MED002', GENERIC_NAME: 'Amoxicillin 250mg', TRADE_NAME: 'Amoxil', DEFAULT_UNIT: 'CAP' },
                { DRUG_CODE: 'MED003', GENERIC_NAME: 'Omeprazole 20mg', TRADE_NAME: 'Losec', DEFAULT_UNIT: 'CAP' },
                { DRUG_CODE: 'MED004', GENERIC_NAME: 'Salbutamol 100mcg', TRADE_NAME: 'Ventolin', DEFAULT_UNIT: 'SPRAY' },
                { DRUG_CODE: 'MED005', GENERIC_NAME: 'Metformin 500mg', TRADE_NAME: 'Glucophage', DEFAULT_UNIT: 'TAB' },
                { DRUG_CODE: 'MED006', GENERIC_NAME: 'Eye Drop Chloramphenicol', TRADE_NAME: 'Chlorsig', DEFAULT_UNIT: 'BOT' },
                { DRUG_CODE: 'MED007', GENERIC_NAME: 'Betamethasone Cream', TRADE_NAME: 'Betnovate', DEFAULT_UNIT: 'TUBE' }
            ]);
        }
    };

    const handleMedicineChange = (field, value) => {
        setMedicineData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDrugSelect = (newValue) => {
        handleMedicineChange('drugCode', newValue?.DRUG_CODE || '');
        handleMedicineChange('drugName', newValue?.GENERIC_NAME || '');
        // ตั้งหน่วยเริ่มต้นตามยาที่เลือก
        handleMedicineChange('unit', newValue?.DEFAULT_UNIT || 'TAB');
    };

    const handleAddMedicine = () => {
        if (!medicineData.drugName || !medicineData.quantity || !medicineData.unit) {
            alert('กรุณากรอกชื่อยา จำนวน และหน่วยนับ');
            return;
        }

        const newMedicine = {
            id: savedMedicines.length + 1,
            ...medicineData
        };

        if (editingIndex >= 0) {
            // แก้ไขยาที่มีอยู่
            const updatedMedicines = [...savedMedicines];
            updatedMedicines[editingIndex] = { ...newMedicine, id: savedMedicines[editingIndex].id };
            setSavedMedicines(updatedMedicines);
            setEditingIndex(-1);
        } else {
            // เพิ่มยาใหม่
            setSavedMedicines([...savedMedicines, newMedicine]);
        }

        // รีเซ็ตฟอร์ม
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
            quantity: medicine.quantity,
            unit: medicine.unit,
            time: medicine.time
        });
        setEditingIndex(index);
    };

    const handleDeleteMedicine = (index) => {
        if (confirm('ต้องการลบยานี้หรือไม่?')) {
            const updatedMedicines = savedMedicines.filter((_, i) => i !== index);
            setSavedMedicines(updatedMedicines);
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
                alert('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ');
                return;
            }

            // เตรียมข้อมูลยาสำหรับบันทึก
            const drugs = savedMedicines.map(medicine => ({
                DRUG_CODE: medicine.drugCode,
                QTY: parseFloat(medicine.quantity),
                UNIT_CODE: medicine.unit, // ใช้หน่วยที่เลือก
                UNIT_PRICE: 0, // ราคาต่อหน่วย
                AMT: 0, // จำนวนเงิน
                NOTE1: medicine.usage,
                TIME1: medicine.time
            }));

            const treatmentData = {
                VNO: currentPatient.VNO,
                HNNO: currentPatient.HNCODE,
                drugs: drugs
            };

            const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

            if (response.success) {
                alert('บันทึกข้อมูลยาสำเร็จ!');
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } else {
                alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
            }
        } catch (error) {
            console.error('Error saving medicine data:', error);
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
                                    sx={{
                                        borderRadius: '10px',
                                    }}
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
                                    sx={{
                                        borderRadius: '10px',
                                    }}
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
                                    sx={{
                                        borderRadius: '10px',
                                    }}
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
                            <Button
                                variant="contained"
                                onClick={handleAddMedicine}
                                startIcon={<AddIcon />}
                                sx={{
                                    bgcolor: '#5698E0',
                                    color: '#FFFFFF',
                                    width: 130,
                                    '&:hover': {
                                        bgcolor: '#4285d1'
                                    }
                                }}
                            >
                                {editingIndex >= 0 ? 'แก้ไข' : 'เพิ่ม'}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Medicine List Table */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                    <Divider sx={{ borderColor: '#5698E0', borderWidth: 2, mb: 2 }} />
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                                รายการยาที่สั่ง
                            </Typography>

                            <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F0F5FF' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                <Checkbox disabled />
                                                ลำดับ
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>วิธีใช้</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>ก่อน/หลัง</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>เวลา</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>แก้ไข</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>ลบ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {savedMedicines.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                                                    <Typography color="text.secondary">
                                                        ยังไม่มีรายการยา
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            savedMedicines.map((medicine, index) => (
                                                <TableRow key={medicine.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                                    <TableCell>
                                                        <Checkbox />
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>{medicine.drugName}</TableCell>
                                                    <TableCell>{medicine.quantity}</TableCell>
                                                    <TableCell>{getUnitName(medicine.unit)}</TableCell>
                                                    <TableCell>{medicine.usage}</TableCell>
                                                    <TableCell>{medicine.beforeAfter}</TableCell>
                                                    <TableCell>{medicine.time}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <IconButton
                                                            onClick={() => handleEditMedicine(index)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                        >
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <IconButton
                                                            onClick={() => handleDeleteMedicine(index)}
                                                            sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                        >
                                                            <DeleteIcon sx={{ color: '#F62626' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
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
                </Grid>
            </Grid>
        </Box>
    );
};

Ordermedicine.propTypes = {
    currentPatient: PropTypes.object,
    onSaveSuccess: PropTypes.func
};

export default Ordermedicine;