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
import TypeProcedureService from '../../services/typeProcedureService';
import Swal from "sweetalert2";

const EnhancedMedicalProcedures = () => {
    // States
    const [currentView, setCurrentView] = useState("list");
    const [procedures, setProcedures] = useState([]);
    const [filteredProcedures, setFilteredProcedures] = useState([]);
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, procedureCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
    const [typeProcedures, setTypeProcedures] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        MEDICAL_PROCEDURE_CODE: '',
        MED_PRO_NAME_THAI: '',
        MED_PRO_NAME_ENG: '',
        MED_PRO_TYPE: '',
        UNIT_PRICE: '',
        SOCIAL_CARD: 'N',
        UCS_CARD: 'N'
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadProcedures();
        loadTypeProcedures();
    }, []);

    useEffect(() => {
        filterProcedures();
    }, [procedures, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredProcedures.length / itemsPerPage));
    }, [filteredProcedures]);

    const loadProcedures = async () => {
        setLoading(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_BASE_URL}/procedures?limit=10000`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลหัตถการ ${result.data.length} รายการ`);
                setProcedures(result.data);
                setFilteredProcedures(result.data);
                showAlert(`โหลดข้อมูลหัตถการสำเร็จ ${result.data.length} รายการ`, 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลหัตถการได้');
            }
        } catch (error) {
            console.error('❌ Error loading procedures:', error);
            showAlert('ไม่สามารถโหลดข้อมูลหัตถการได้ กรุณาตรวจสอบการเชื่อมต่อ API', 'error');
            setProcedures([]);
            setFilteredProcedures([]);
        }
        setLoading(false);
    };

    const filterProcedures = () => {
        if (!searchTerm) {
            setFilteredProcedures(procedures);
        } else {
            const filtered = procedures.filter(proc =>
                proc.MEDICAL_PROCEDURE_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                proc.MED_PRO_NAME_THAI?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                proc.MED_PRO_NAME_ENG?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProcedures(filtered);
        }
        setPage(1);
    };

    const getPaginatedProcedures = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProcedures.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            MEDICAL_PROCEDURE_CODE: '',
            MED_PRO_NAME_THAI: '',
            MED_PRO_NAME_ENG: '',
            MED_PRO_TYPE: '',
            UNIT_PRICE: '',
            SOCIAL_CARD: 'N',
            UCS_CARD: 'N'
        });
        setEditingProcedure(null);
    };

    const generateNextProcedureCode = () => {
        if (procedures.length === 0) {
            return 'P0001';
        }

        const maxNumber = Math.max(
            ...procedures
                .filter(proc => /^P\d{4}$/.test(proc.MEDICAL_PROCEDURE_CODE))
                .map(proc => parseInt(proc.MEDICAL_PROCEDURE_CODE.substring(1)))
        );

        const nextNumber = maxNumber + 1;
        return `P${String(nextNumber).padStart(4, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.MED_PRO_NAME_THAI) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: 'กรุณากรอกชื่อหัตถการภาษาไทย',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setLoading(true);

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

            if (!editingProcedure) {
                // สร้างข้อมูลที่จะส่งไป - ตรงกับ field ใน database
                const dataToSave = {
                    MEDICAL_PROCEDURE_CODE: generateNextProcedureCode(),
                    MED_PRO_NAME_THAI: formData.MED_PRO_NAME_THAI || null,
                    MED_PRO_NAME_ENG: formData.MED_PRO_NAME_ENG || null,
                    MED_PRO_TYPE: formData.MED_PRO_TYPE || null,
                    UNIT_PRICE: formData.UNIT_PRICE ? parseFloat(formData.UNIT_PRICE) : null,
                    SOCIAL_CARD: formData.SOCIAL_CARD || 'N',
                    UCS_CARD: formData.UCS_CARD || 'N'
                };

                console.log('📤 Sending data:', dataToSave);

                const response = await fetch(`${API_BASE_URL}/procedures`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSave)
                });

                const result = await response.json();
                console.log('📥 Backend response:', result);

                if (!response.ok) {
                    throw new Error(result.message || 'เพิ่มข้อมูลหัตถการไม่สำเร็จ');
                }

                showAlert('เพิ่มข้อมูลหัตถการสำเร็จ', 'success');
            } else {
                // อัปเดต
                const dataToSave = {
                    MED_PRO_NAME_THAI: formData.MED_PRO_NAME_THAI || null,
                    MED_PRO_NAME_ENG: formData.MED_PRO_NAME_ENG || null,
                    MED_PRO_TYPE: formData.MED_PRO_TYPE || null,
                    UNIT_PRICE: formData.UNIT_PRICE ? parseFloat(formData.UNIT_PRICE) : null,
                    SOCIAL_CARD: formData.SOCIAL_CARD || 'N',
                    UCS_CARD: formData.UCS_CARD || 'N'
                };

                console.log('📤 Updating data:', dataToSave);

                const response = await fetch(`${API_BASE_URL}/procedures/${editingProcedure.MEDICAL_PROCEDURE_CODE}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSave)
                });

                const result = await response.json();
                console.log('📥 Backend response:', result);

                if (!response.ok) {
                    throw new Error(result.message || 'แก้ไขข้อมูลหัตถการไม่สำเร็จ');
                }

                showAlert('แก้ไขข้อมูลหัตถการสำเร็จ', 'success');
            }

            await loadProcedures();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('❌ Error:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }

        setLoading(false);
    };

    const handleEdit = (procedure) => {
        setFormData(procedure);
        setEditingProcedure(procedure);
        setCurrentView("edit");
    };

    const handleDeleteClick = (procedureCode) => {
        setDeleteDialog({ open: true, procedureCode });
    };

    const handleDeleteConfirm = async () => {
        const { procedureCode } = deleteDialog;

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_BASE_URL}/procedures/${procedureCode}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ลบข้อมูลหัตถการไม่สำเร็จ');
            }

            showAlert('ลบข้อมูลหัตถการสำเร็จ', 'success');
            await loadProcedures();
        } catch (error) {
            console.error('Error deleting procedure:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }

        setDeleteDialog({ open: false, procedureCode: null });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedProcedures(getPaginatedProcedures().map(proc => proc.MEDICAL_PROCEDURE_CODE));
        } else {
            setSelectedProcedures([]);
        }
    };

    const handleSelectProcedure = (procedureCode) => {
        setSelectedProcedures(prev =>
            prev.includes(procedureCode)
                ? prev.filter(code => code !== procedureCode)
                : [...prev, procedureCode]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedProcedures.length === 0) {
            showAlert('กรุณาเลือกหัตถการที่ต้องการลบ', 'warning');
            return;
        }

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

            for (const code of selectedProcedures) {
                await fetch(`${API_BASE_URL}/procedures/${code}`, {
                    method: 'DELETE'
                });
            }

            showAlert(`ลบข้อมูลหัตถการ ${selectedProcedures.length} รายการสำเร็จ`, 'success');
            setSelectedProcedures([]);
            await loadProcedures();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const loadTypeProcedures = async () => {
        try {
            const result = await TypeProcedureService.getAllTypeProcedures();
            if (result.success && result.data) {
                setTypeProcedures(result.data);
            }
        } catch (error) {
            console.error('❌ Error loading type procedures:', error);
        }
    };

    const getProcedureTypeOptions = () => {
        return typeProcedures.map(tp => tp.TYPE_PROCEDURE_CODE);
    };

    // Form View
    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "เพิ่มข้อมูลหัตถการใหม่" : "แก้ไขข้อมูลหัตถการ"}
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
                            {/* รหัสหัตถการ */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    รหัสหัตถการ {!editingProcedure && "(จะสร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder={!editingProcedure ? generateNextProcedureCode() : "รหัสหัตถการ"}
                                    value={editingProcedure ? formData.MEDICAL_PROCEDURE_CODE : ""}
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

                            {/* ชื่อหัตถการ (ไทย) */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อหัตถการ (ภาษาไทย) *
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ชื่อหัตถการภาษาไทย"
                                    value={formData.MED_PRO_NAME_THAI}
                                    onChange={(e) => handleFormChange('MED_PRO_NAME_THAI', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ชื่อหัตถการ (อังกฤษ) */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อหัตถการ (ภาษาอังกฤษ)
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="Medical Procedure Name (English)"
                                    value={formData.MED_PRO_NAME_ENG}
                                    onChange={(e) => handleFormChange('MED_PRO_NAME_ENG', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            {/* ประเภทหัตถการ */}
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ประเภทหัตถการ
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.MED_PRO_TYPE}
                                        onChange={(e) => handleFormChange('MED_PRO_TYPE', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>เลือกประเภทหัตถการ</em>
                                        </MenuItem>
                                        {typeProcedures.map((typeProcedure) => (
                                            <MenuItem key={typeProcedure.TYPE_PROCEDURE_CODE} value={typeProcedure.TYPE_PROCEDURE_CODE}>
                                                {typeProcedure.TYPE_PROCEDURE_NAME}
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

                            {/* บัตรสวัสดิการ */}
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
                    ระบบข้อมูลหัตถการ ({filteredProcedures.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มหัตถการ
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <TextField
                                size="small"
                                placeholder="ค้นหาหัตถการ (รหัส, ชื่อภาษาไทย, ชื่อภาษาอังกฤษ)"
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
                                disabled={selectedProcedures.length === 0}
                            >
                                ลบที่เลือก ({selectedProcedures.length})
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredProcedures.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลหัตถการ'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>
                                            <Checkbox
                                                checked={selectedProcedures.length === getPaginatedProcedures().length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                            ลำดับ
                                        </th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสหัตถการ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อหัตถการ (ไทย)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อหัตถการ (อังกฤษ)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ประเภท</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ราคา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedProcedures().map((procedure, index) => (
                                        <tr key={procedure.MEDICAL_PROCEDURE_CODE} style={{ borderTop: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                <Checkbox
                                                    checked={selectedProcedures.includes(procedure.MEDICAL_PROCEDURE_CODE)}
                                                    onChange={() => handleSelectProcedure(procedure.MEDICAL_PROCEDURE_CODE)}
                                                />
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{procedure.MEDICAL_PROCEDURE_CODE}</td>
                                            <td style={{ padding: '12px 8px' }}>{procedure.MED_PRO_NAME_THAI}</td>
                                            <td style={{ padding: '12px 8px' }}>{procedure.MED_PRO_NAME_ENG || '-'}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {procedure.MED_PRO_TYPE 
                                                    ? (typeProcedures.find(tp => tp.TYPE_PROCEDURE_CODE === procedure.MED_PRO_TYPE)?.TYPE_PROCEDURE_NAME || procedure.MED_PRO_TYPE)
                                                    : '-'
                                                }
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {procedure.UNIT_PRICE ? `฿${procedure.UNIT_PRICE}` : '-'}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(procedure)}
                                                        sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                    >
                                                        <EditIcon sx={{ color: '#5698E0' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(procedure.MEDICAL_PROCEDURE_CODE)}
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
                onClose={() => setDeleteDialog({ open: false, procedureCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบหัตถการ "{deleteDialog.procedureCode}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, procedureCode: null })}>
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

export default EnhancedMedicalProcedures;