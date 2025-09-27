import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, Checkbox, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
    FormControl, InputLabel, Select, MenuItem, Box
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DrugService from '../../services/drugService';

const EnhancedDrugInformation = () => {
    // States
    const [currentView, setCurrentView] = useState("list"); // list, add, edit
    const [drugs, setDrugs] = useState([]);
    const [filteredDrugs, setFilteredDrugs] = useState([]);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState({ open: false, drugCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Form states - เหลือเฉพาะ field ที่มีจริง
    const [formData, setFormData] = useState({
        DRUG_CODE: '',
        GENERIC_NAME: '',
        TRADE_NAME: '',
        UNIT_CODE: '',
        UNIT_PRICE: ''
    });

    const itemsPerPage = 10;

    // Load drugs on component mount
    useEffect(() => {
        loadDrugs();
    }, []);

    // Filter drugs when search term changes
    useEffect(() => {
        filterDrugs();
    }, [drugs, searchTerm]);

    // Calculate pagination
    useEffect(() => {
        setTotalPages(Math.ceil(filteredDrugs.length / itemsPerPage));
    }, [filteredDrugs]);

    const loadDrugs = async () => {
        setLoading(true);
        try {
            const response = await DrugService.getAllDrugs({
                page: 1,
                limit: 1000
            });

            if (response.success && response.data) {
                setDrugs(response.data);
                setFilteredDrugs(response.data);
                showAlert('โหลดข้อมูลยาสำเร็จ', 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลยาได้');
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
            showAlert('ไม่สามารถโหลดข้อมูลยาได้ กรุณาลองอีกครั้ง', 'error');
            setDrugs([]);
            setFilteredDrugs([]);
        }
        setLoading(false);
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
            UNIT_PRICE: ''
        });
        setEditingDrug(null);
    };

    // ฟังก์ชันสร้าง DRUG_CODE อัตโนมัติ
    const generateNextDrugCode = () => {
        if (drugs.length === 0) {
            return 'D001';
        }

        // หา DRUG_CODE ที่มีหมายเลขสูงสุด
        const maxNumber = Math.max(
            ...drugs
                .filter(drug => drug.DRUG_CODE.startsWith('D'))
                .map(drug => {
                    const num = drug.DRUG_CODE.substring(1);
                    return isNaN(num) ? 0 : parseInt(num);
                })
        );

        const nextNumber = maxNumber + 1;
        return `D${String(nextNumber).padStart(3, '0')}`;
    };

    const handleSave = async () => {
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!formData.GENERIC_NAME) {
            showAlert('กรุณากรอกชื่อยา', 'error');
            return;
        }

        setLoading(true);
        try {
            let dataToSave = { ...formData };

            if (!editingDrug) {
                // สร้าง DRUG_CODE อัตโนมัติสำหรับยาใหม่
                dataToSave.DRUG_CODE = generateNextDrugCode();
            }

            if (editingDrug) {
                const response = await DrugService.updateDrug(editingDrug.DRUG_CODE, dataToSave);

                if (response.success) {
                    const updatedDrugs = drugs.map(drug =>
                        drug.DRUG_CODE === editingDrug.DRUG_CODE ? { ...drug, ...dataToSave } : drug
                    );
                    setDrugs(updatedDrugs);
                    showAlert('แก้ไขข้อมูลยาสำเร็จ', 'success');
                } else {
                    throw new Error(response.message || 'แก้ไขข้อมูลยาไม่สำเร็จ');
                }
            } else {
                const response = await DrugService.createDrug(dataToSave);

                if (response.success) {
                    setDrugs(prev => [...prev, dataToSave]);
                    showAlert('เพิ่มข้อมูลยาสำเร็จ', 'success');
                } else {
                    throw new Error(response.message || 'เพิ่มข้อมูลยาไม่สำเร็จ');
                }
            }

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
            const response = await DrugService.deleteDrug(drugCode);

            if (response.success) {
                const updatedDrugs = drugs.filter(drug => drug.DRUG_CODE !== drugCode);
                setDrugs(updatedDrugs);
                showAlert('ลบข้อมูลยาสำเร็จ', 'success');
            } else {
                throw new Error(response.message || 'ลบข้อมูลยาไม่สำเร็จ');
            }
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

    const generateDrugReport = () => {
        const reportData = drugs.map(drug => ({
            'รหัสยา': drug.DRUG_CODE,
            'ชื่อยา': drug.GENERIC_NAME,
            'ชื่อทางการค้า': drug.TRADE_NAME,
            'หน่วย': drug.UNIT_CODE,
            'ราคา': drug.UNIT_PRICE
        }));

        // สร้าง CSV content
        const headers = Object.keys(reportData[0]).join(',');
        const csvContent = [
            headers,
            ...reportData.map(row => Object.values(row).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `drug_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showAlert('ส่งออกรายงานสำเร็จ', 'success');
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const getUnitOptions = () => [
        { value: 'TAB', label: 'TAB (เม็ด)' },
        { value: 'CAP', label: 'CAP (แคปซูล)' },
        { value: 'BOT', label: 'BOT (ขวด)' },
        { value: 'TUB', label: 'TUB (หลอด)' },
        { value: 'AMP', label: 'AMP (หลอดฉีด)' },
        { value: 'VIAL', label: 'VIAL (ไวอัล)' }
    ];

    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg">
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
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    รหัสยา {!editingDrug && "(สร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder={!editingDrug ? "จะสร้างอัตโนมัติเมื่อบันทึก" : "รหัสยา"}
                                    value={editingDrug ? formData.DRUG_CODE : ""}
                                    onChange={(e) => handleFormChange('DRUG_CODE', e.target.value)}
                                    fullWidth
                                    disabled={true} // ปิดการแก้ไขทั้งหมด เพราะจะ gen เอง
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: !editingDrug ? "#f5f5f5" : "white"
                                        }
                                    }}
                                />
                            </Grid>

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

                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    หน่วย
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.UNIT_CODE}
                                        onChange={(e) => handleFormChange('UNIT_CODE', e.target.value)}
                                        sx={{ borderRadius: "10px" }}
                                    >
                                        {getUnitOptions().map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ราคา (บาท)
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    step="0.01"
                                    placeholder="ราคา"
                                    value={formData.UNIT_PRICE}
                                    onChange={(e) => handleFormChange('UNIT_PRICE', e.target.value)}
                                    fullWidth
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

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    ระบบข้อมูลยา ({filteredDrugs.length} รายการ)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={generateDrugReport}
                        disabled={drugs.length === 0}
                    >
                        ส่งออกรายงาน
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCurrentView("add")}
                        sx={{ backgroundColor: '#5698E0' }}
                    >
                        เพิ่มยา
                    </Button>
                </Box>
            </Box>

            {/* Search and Actions */}
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

            {/* Data Table */}
            <Card>
                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <Typography>กำลังโหลดข้อมูล...</Typography>
                        </Box>
                    ) : filteredDrugs.length === 0 ? (
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
                                                checked={selectedDrugs.length === getPaginatedDrugs().length && getPaginatedDrugs().length > 0}
                                                indeterminate={selectedDrugs.length > 0 && selectedDrugs.length < getPaginatedDrugs().length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                            ลำดับ
                                        </th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อยา/เวชภัณฑ์</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อทางการค้า</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>หน่วย</th>
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
                                            <td style={{ padding: '12px 8px' }}>{drug.UNIT_CODE}</td>
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

                            {/* Pagination */}
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, drugCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบยา "{deleteDialog.drugCode}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        การดำเนินการนี้ไม่สามารถยกเลิกได้
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, drugCode: null })}
                    >
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

            {/* Alert Snackbar */}
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