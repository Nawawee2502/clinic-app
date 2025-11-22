import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, Checkbox, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
    FormControl, InputLabel, Select, MenuItem, Box, Divider
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import UnitService from '../../services/unitService';
import TypeDrugService from '../../services/typeDrugService';

const EnhancedDrugInformation = () => {
    // States
    const [currentView, setCurrentView] = useState("list");
    const [drugs, setDrugs] = useState([]);
    const [filteredDrugs, setFilteredDrugs] = useState([]);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, drugCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
    const [unitOptions, setUnitOptions] = useState([]);
    const [typeDrugOptions, setTypeDrugOptions] = useState([]);

    // Form states - ครบทุก fields ตาม TABLE_DRUG
    const [formData, setFormData] = useState({
        DRUG_CODE: '',
        GENERIC_NAME: '',
        TRADE_NAME: '',
        UNIT_CODE: '',
        UNIT_CODE1: '',
        UNIT_PRICE: '',
        Type1: '',
        Dose1: '',
        Indication1: '',
        Effect1: 'None',
        Contraindications1: 'None',
        Comment1: 'None',
        Drug_formulations: '',
        SOCIAL_CARD: 'N',
        UCS_CARD: 'N',
        eat1: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadDrugs();
        loadUnits();
        loadTypeDrugs();
    }, []);

    useEffect(() => {
        filterDrugs();
    }, [drugs, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredDrugs.length / itemsPerPage));
    }, [filteredDrugs]);

    const loadDrugs = async () => {
        setLoading(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            // เพิ่ม limit=10000 เพื่อดึงข้อมูลยาทั้งหมด
            const response = await fetch(`${API_BASE_URL}/drugs?limit=10000`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลยา ${result.data.length} รายการ`);
                setDrugs(result.data);
                setFilteredDrugs(result.data);
                showAlert(`โหลดข้อมูลยาสำเร็จ ${result.data.length} รายการ`, 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลยาได้');
            }
        } catch (error) {
            console.error('❌ Error loading drugs:', error);
            showAlert('ไม่สามารถโหลดข้อมูลยาได้ กรุณาตรวจสอบการเชื่อมต่อ API', 'error');
            setDrugs([]);
            setFilteredDrugs([]);
        }
        setLoading(false);
    };

    const loadUnits = async () => {
        try {
            const result = await UnitService.getAllUnits();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลหน่วยนับ ${result.data.length} รายการ`);
                setUnitOptions(result.data);
            } else {
                console.warn('ไม่สามารถดึงข้อมูลหน่วยนับได้ ใช้ข้อมูลเริ่มต้น');
                setUnitOptions([]);
            }
        } catch (error) {
            console.error('❌ Error loading units:', error);
            setUnitOptions([]);
        }
    };

    const loadTypeDrugs = async () => {
        try {
            const result = await TypeDrugService.getAllTypeDrugs();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลประเภทยา ${result.data.length} รายการ`);
                setTypeDrugOptions(result.data);
            } else {
                console.warn('ไม่สามารถดึงข้อมูลประเภทยาได้ ใช้ข้อมูลเริ่มต้น');
                setTypeDrugOptions([]);
            }
        } catch (error) {
            console.error('❌ Error loading type drugs:', error);
            setTypeDrugOptions([]);
        }
    };

    const filterDrugs = () => {
        if (!searchTerm) {
            setFilteredDrugs(drugs);
        } else {
            const filtered = drugs.filter(drug =>
                drug.DRUG_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                drug.GENERIC_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                drug.TRADE_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDrugs(filtered);
        }
        setPage(1);
    };

    const getPaginatedDrugs = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredDrugs.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            DRUG_CODE: '',
            GENERIC_NAME: '',
            TRADE_NAME: '',
            UNIT_CODE: '',
            UNIT_CODE1: '',
            UNIT_PRICE: '',
            Type1: '',
            Dose1: '',
            Indication1: '',
            Effect1: 'None',
            Contraindications1: 'None',
            Comment1: 'None',
            Drug_formulations: '',
            SOCIAL_CARD: 'N',
            UCS_CARD: 'N',
            eat1: ''
        });
        setEditingDrug(null);
    };

    // สร้าง DRUG_CODE แบบ D0001, D0002, ...
    const generateNextDrugCode = () => {
        if (drugs.length === 0) {
            return 'D0001';
        }

        const maxNumber = Math.max(
            ...drugs
                .filter(drug => /^D\d{4}$/.test(drug.DRUG_CODE))
                .map(drug => parseInt(drug.DRUG_CODE.substring(1)))
        );

        const nextNumber = maxNumber + 1;
        return `D${String(nextNumber).padStart(4, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.GENERIC_NAME) {
            showAlert('กรุณากรอกชื่อยา', 'error');
            return;
        }

        setLoading(true);
        
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            let dataToSave = { ...formData };

            if (!editingDrug) {
                // สร้างรหัสใหม่
                dataToSave.DRUG_CODE = generateNextDrugCode();
                
                // เรียก API เพื่อสร้างยาใหม่
                const response = await fetch(`${API_BASE_URL}/drugs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSave)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'เพิ่มข้อมูลยาไม่สำเร็จ');
                }

                showAlert('เพิ่มข้อมูลยาสำเร็จ', 'success');
            } else {
                // เรียก API เพื่ออัปเดตยา
                const response = await fetch(`${API_BASE_URL}/drugs/${editingDrug.DRUG_CODE}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSave)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'แก้ไขข้อมูลยาไม่สำเร็จ');
                }

                showAlert('แก้ไขข้อมูลยาสำเร็จ', 'success');
            }

            // โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
            await loadDrugs();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('Error saving drug:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }
        
        setLoading(false);
    };

    const handleEdit = (drug) => {
        setFormData(drug);
        setEditingDrug(drug);
        setCurrentView("edit");
    };

    const handleDeleteClick = (drugCode) => {
        setDeleteDialog({ open: true, drugCode });
    };

    const handleDeleteConfirm = async () => {
        const { drugCode } = deleteDialog;

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_BASE_URL}/drugs/${drugCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ลบข้อมูลยาไม่สำเร็จ');
            }

            showAlert('ลบข้อมูลยาสำเร็จ', 'success');
            
            // โหลดข้อมูลใหม่หลังลบสำเร็จ
            await loadDrugs();
        } catch (error) {
            console.error('Error deleting drug:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }

        setDeleteDialog({ open: false, drugCode: null });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedDrugs(getPaginatedDrugs().map(drug => drug.DRUG_CODE));
        } else {
            setSelectedDrugs([]);
        }
    };

    const handleSelectDrug = (drugCode) => {
        setSelectedDrugs(prev =>
            prev.includes(drugCode)
                ? prev.filter(code => code !== drugCode)
                : [...prev, drugCode]
        );
    };

    const handleBulkDelete = () => {
        if (selectedDrugs.length === 0) {
            showAlert('กรุณาเลือกยาที่ต้องการลบ', 'warning');
            return;
        }

        const updatedDrugs = drugs.filter(drug => !selectedDrugs.includes(drug.DRUG_CODE));
        setDrugs(updatedDrugs);
        setSelectedDrugs([]);
        showAlert(`ลบข้อมูลยา ${selectedDrugs.length} รายการสำเร็จ`, 'success');
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const getUnitOptions = () => {
        // ถ้ามีข้อมูลจาก API ให้ใช้ข้อมูลจาก API
        if (unitOptions.length > 0) {
            return unitOptions.map(unit => ({
                value: unit.UNIT_CODE,
                label: unit.UNIT_NAME || unit.UNIT_CODE
            }));
        }
        // ถ้ายังไม่มีข้อมูล ให้ใช้ข้อมูลเริ่มต้น
        return [
            { value: 'TAB', label: 'เม็ด' },
            { value: 'CAP', label: 'แคปซูล' },
            { value: 'BOT', label: 'ขวด' },
            { value: 'TUB', label: 'หลอด' },
            { value: 'BOX', label: 'กล่อง' },
            { value: 'STRIP', label: 'แผง' },
            { value: 'AMP', label: 'แอมปูล' },
            { value: 'VIAL', label: 'Vial' }
        ];
    };

    const getTypeOptions = () => {
        // ดึงข้อมูลจาก TYPE_DRUG table
        if (typeDrugOptions.length > 0) {
            return typeDrugOptions.map(typeDrug => ({
                value: typeDrug.TYPE_DRUG_CODE,
                label: `${typeDrug.TYPE_DRUG_CODE} - ${typeDrug.TYPE_DRUG_NAME}`
            }));
        }
        // Fallback ถ้ายังไม่มีข้อมูล
        return [
            { value: 'ยาอันตราย', label: 'ยาอันตราย' },
            { value: 'ยาสามัญประจำบ้าน', label: 'ยาสามัญประจำบ้าน' },
            { value: 'ยาใช้ภายนอก', label: 'ยาใช้ภายนอก' },
            { value: 'วัถุอออกฤทธิ์', label: 'วัถุอออกฤทธิ์' }
        ];
    };

    // Helper function: แปลง TYPE_DRUG_CODE เป็นชื่อประเภทยา
    const getTypeDrugName = (typeCode) => {
        if (!typeCode) return '-';
        
        // หาจาก TYPE_DRUG table
        const typeDrug = typeDrugOptions.find(td => td.TYPE_DRUG_CODE === typeCode);
        if (typeDrug) {
            return typeDrug.TYPE_DRUG_NAME;
        }
        
        // ถ้าไม่เจอ (อาจเป็นข้อมูลเก่าที่เก็บเป็นชื่อ) ให้แสดงตามเดิม
        return typeCode;
    };

    const getFormulationOptions = () => [
        'Tablets', 'Capsules', 'Topical', 'Injections', 'ยาน้ำ', 'Drops'
    ];

    // Form View
    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "เพิ่มข้อมูลยาใหม่" : "แก้ไขข้อมูลยา"}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                            resetForm();
                            setCurrentView("list");
                        }}
                    >
                        ปิด
                    </Button>
                </Box>

                <Card>
                    <CardContent>
                        <Grid container spacing={2}>
                            {/* รหัสยา - แสดงว่าจะสร้างอัตโนมัติ */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    รหัสยา {!editingDrug && "(จะสร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder={!editingDrug ? generateNextDrugCode() : "รหัสยา"}
                                    value={editingDrug ? formData.DRUG_CODE : ""}
                                    disabled={true}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "#f5f5f5"
                                        }
                                    }}
                                />
                            </Grid>

                            {/* ชื่อยา */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อยา / เวชภัณฑ์ *
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ชื่อยา"
                                    value={formData.GENERIC_NAME}
                                    onChange={(e) => handleFormChange('GENERIC_NAME', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ชื่อทางการค้า */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อทางการค้า
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ชื่อทางการค้า"
                                    value={formData.TRADE_NAME}
                                    onChange={(e) => handleFormChange('TRADE_NAME', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* หน่วยนับ */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    หน่วยนับ
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.UNIT_CODE}
                                        onChange={(e) => handleFormChange('UNIT_CODE', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>เลือกหน่วยนับ</em>
                                        </MenuItem>
                                        {getUnitOptions().map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* หน่วยนับกลาง */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    หน่วยนับกลาง
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.UNIT_CODE1}
                                        onChange={(e) => handleFormChange('UNIT_CODE1', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>เลือกหน่วยนับกลาง</em>
                                        </MenuItem>
                                        {getUnitOptions().map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* ราคา */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ราคา (บาท)
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder="ราคา"
                                    value={formData.UNIT_PRICE}
                                    onChange={(e) => handleFormChange('UNIT_PRICE', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ประเภท */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ประเภท
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.Type1}
                                        onChange={(e) => handleFormChange('Type1', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>เลือกประเภทยา</em>
                                        </MenuItem>
                                        {getTypeOptions().map((option) => (
                                            <MenuItem key={option.value || option} value={option.value || option}>
                                                {option.label || option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* ขนาดยา */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ขนาดยา
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น 500 mg"
                                    value={formData.Dose1}
                                    onChange={(e) => handleFormChange('Dose1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* รูปแบบยา */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    รูปแบบยา
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.Drug_formulations}
                                        onChange={(e) => handleFormChange('Drug_formulations', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        {getFormulationOptions().map((option) => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* ข้อบ่งใช้ */}
                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ข้อบ่งใช้ / สรรพคุณ
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น แก้ปวด ลดไข้"
                                    value={formData.Indication1}
                                    onChange={(e) => handleFormChange('Indication1', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ผลข้างเคียง */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ผลข้างเคียง
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ผลข้างเคียง"
                                    value={formData.Effect1}
                                    onChange={(e) => handleFormChange('Effect1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ข้อควรระวัง */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ข้อควรระวัง / ข้อห้ามใช้
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ข้อควรระวัง"
                                    value={formData.Contraindications1}
                                    onChange={(e) => handleFormChange('Contraindications1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* หมายเหตุ */}
                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    หมายเหตุ
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="หมายเหตุเพิ่มเติม"
                                    value={formData.Comment1}
                                    onChange={(e) => handleFormChange('Comment1', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ประกันสังคม */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ประกันสังคม
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.SOCIAL_CARD}
                                        onChange={(e) => handleFormChange('SOCIAL_CARD', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        <MenuItem value="Y">ใช่</MenuItem>
                                        <MenuItem value="N">ไม่ใช่</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* บัตรทอง */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    บัตรทอง (UCS)
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.UCS_CARD}
                                        onChange={(e) => handleFormChange('UCS_CARD', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        <MenuItem value="Y">ใช่</MenuItem>
                                        <MenuItem value="N">ไม่ใช่</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* วิธีรับประทาน */}
                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    วิธีรับประทาน
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น รับประทานหลังอาหาร วันละ 3 ครั้ง"
                                    value={formData.eat1}
                                    onChange={(e) => handleFormChange('eat1', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    resetForm();
                                    setCurrentView("list");
                                }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{ backgroundColor: "#5698E0", minWidth: 150 }}
                            >
                                บันทึกข้อมูล
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    // List View
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    ระบบข้อมูลยา ({filteredDrugs.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มยา
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                placeholder="ค้นหายา (รหัสยา, ชื่อยา, ชื่อทางการค้า)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleBulkDelete}
                                disabled={selectedDrugs.length === 0}
                            >
                                ลบที่เลือก ({selectedDrugs.length})
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredDrugs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลยา'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>
                                            <Checkbox
                                                checked={selectedDrugs.length === getPaginatedDrugs().length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                            ลำดับ
                                        </th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อทางการค้า</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ประเภท</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ราคา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedDrugs().map((drug, index) => (
                                        <tr key={drug.DRUG_CODE} style={{ borderTop: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                <Checkbox
                                                    checked={selectedDrugs.includes(drug.DRUG_CODE)}
                                                    onChange={() => handleSelectDrug(drug.DRUG_CODE)}
                                                />
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{drug.DRUG_CODE}</td>
                                            <td style={{ padding: '12px 8px' }}>{drug.GENERIC_NAME}</td>
                                            <td style={{ padding: '12px 8px' }}>{drug.TRADE_NAME || '-'}</td>
                                            <td style={{ padding: '12px 8px' }}>{getTypeDrugName(drug.Type1)}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {drug.UNIT_PRICE ? `฿${drug.UNIT_PRICE}` : '-'}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(drug)}
                                                        sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                    >
                                                        <EditIcon sx={{ color: '#5698E0' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(drug.DRUG_CODE)}
                                                        sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                                    >
                                                        <DeleteIcon sx={{ color: '#F62626' }} />
                                                    </IconButton>
                                                </Box>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(event, value) => setPage(value)}
                                    shape="rounded"
                                    color="primary"
                                />
                            </Stack>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, drugCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบยา "{deleteDialog.drugCode}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, drugCode: null })}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EnhancedDrugInformation;