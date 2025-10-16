import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    InputAdornment, IconButton, Stack, Pagination, Dialog,
    DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Box
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SupplierService from '../../services/supplierService';

const SupplierManagement = () => {
    const [currentView, setCurrentView] = useState("list");
    const [supplierList, setSupplierList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, code: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const [formData, setFormData] = useState({
        SUPPLIER_CODE: '',
        SUPPLIER_NAME: '',
        ADDR1: '',
        ADDR2: '',
        CONTACT1: '',
        TEL1: '',
        DAY1: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [supplierList, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredList.length / itemsPerPage));
    }, [filteredList]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await SupplierService.getAllSuppliers();

            if (response.success && response.data) {
                console.log(`✅ โหลดข้อมูลผู้จัดจำหน่าย ${response.data.length} รายการ`);
                setSupplierList(response.data);
                setFilteredList(response.data);
                showAlert(`โหลดข้อมูลสำเร็จ ${response.data.length} รายการ`, 'success');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
            setSupplierList([]);
            setFilteredList([]);
        }
        setLoading(false);
    };

    const filterData = () => {
        if (!searchTerm) {
            setFilteredList(supplierList);
        } else {
            const filtered = supplierList.filter(item =>
                item.SUPPLIER_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.CONTACT1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.TEL1?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredList(filtered);
        }
        setPage(1);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredList.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            SUPPLIER_CODE: '',
            SUPPLIER_NAME: '',
            ADDR1: '',
            ADDR2: '',
            CONTACT1: '',
            TEL1: '',
            DAY1: ''
        });
        setEditingItem(null);
    };

    const generateNextCode = () => {
        if (supplierList.length === 0) {
            return 'SUP001';
        }

        const codes = supplierList.map(item => item.SUPPLIER_CODE);
        return SupplierService.generateCode(codes);
    };

    const handleSave = async () => {
        console.log('🔵 handleSave called');
        console.log('📦 Current formData:', formData);
        console.log('✏️ Editing mode:', editingItem ? 'UPDATE' : 'CREATE');

        // Validate
        const errors = SupplierService.validateSupplierData(formData, !!editingItem);
        console.log('🔍 Validation errors:', errors);

        if (errors.length > 0) {
            console.log('❌ Validation failed:', errors[0]);
            showAlert(errors[0], 'error');
            return;
        }

        setLoading(true);
        console.log('⏳ Loading started...');

        try {
            let dataToSave = SupplierService.formatSupplierData(formData);
            console.log('📝 Formatted data:', dataToSave);

            if (!editingItem) {
                // สร้างใหม่
                const newCode = generateNextCode();
                dataToSave.SUPPLIER_CODE = newCode;

                console.log('➕ CREATE mode - Generated code:', newCode);
                console.log('📤 Sending to API:', dataToSave);

                const result = await SupplierService.createSupplier(dataToSave);
                console.log('✅ CREATE response:', result);

                showAlert('เพิ่มข้อมูลสำเร็จ', 'success');
            } else {
                // แก้ไข
                console.log('✏️ UPDATE mode - Code:', editingItem.SUPPLIER_CODE);
                console.log('📤 Sending to API:', dataToSave);

                const result = await SupplierService.updateSupplier(
                    editingItem.SUPPLIER_CODE,
                    dataToSave
                );
                console.log('✅ UPDATE response:', result);

                showAlert('แก้ไขข้อมูลสำเร็จ', 'success');
            }

            console.log('🔄 Reloading data...');
            await loadData();

            console.log('🧹 Resetting form...');
            resetForm();
            setCurrentView("list");

            console.log('✅ Save completed successfully');
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            console.error('❌ Error message:', error.message);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        } finally {
            setLoading(false);
            console.log('⏹️ Loading ended');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            SUPPLIER_CODE: item.SUPPLIER_CODE,
            SUPPLIER_NAME: item.SUPPLIER_NAME,
            ADDR1: item.ADDR1 || '',
            ADDR2: item.ADDR2 || '',
            CONTACT1: item.CONTACT1 || '',
            TEL1: item.TEL1 || '',
            DAY1: item.DAY1 || ''
        });
        setEditingItem(item);
        setCurrentView("edit");
    };

    const handleDeleteClick = (code) => {
        setDeleteDialog({ open: true, code });
    };

    const handleDeleteConfirm = async () => {
        const { code } = deleteDialog;

        try {
            await SupplierService.deleteSupplier(code);
            showAlert('ลบข้อมูลสำเร็จ', 'success');
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
        }

        setDeleteDialog({ open: false, code: null });
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    // Form View
    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "เพิ่มผู้จัดจำหน่าย" : "แก้ไขผู้จัดจำหน่าย"}
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
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    รหัสผู้จัดจำหน่าย {!editingItem && "(จะสร้างอัตโนมัติ)"}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder={!editingItem ? generateNextCode() : "รหัสผู้จัดจำหน่าย"}
                                    value={editingItem ? formData.SUPPLIER_CODE : ""}
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

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อผู้จัดจำหน่าย *
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ชื่อผู้จัดจำหน่าย"
                                    value={formData.SUPPLIER_NAME}
                                    onChange={(e) => handleFormChange('SUPPLIER_NAME', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ที่อยู่ 1
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ที่อยู่ 1"
                                    value={formData.ADDR1}
                                    onChange={(e) => handleFormChange('ADDR1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ที่อยู่ 2
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ที่อยู่ 2"
                                    value={formData.ADDR2}
                                    onChange={(e) => handleFormChange('ADDR2', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ผู้ติดต่อ
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="ผู้ติดต่อ"
                                    value={formData.CONTACT1}
                                    onChange={(e) => handleFormChange('CONTACT1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    เบอร์โทร
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เบอร์โทร"
                                    value={formData.TEL1}
                                    onChange={(e) => handleFormChange('TEL1', e.target.value)}
                                    fullWidth
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    จำนวนวันเครดิต
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder="0"
                                    value={formData.DAY1}
                                    onChange={(e) => handleFormChange('DAY1', e.target.value)}
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
                                onClick={() => {
                                    console.log('🖱️ Save button clicked!');
                                    handleSave();
                                }}
                                disabled={loading}
                                sx={{ backgroundColor: "#5698E0", minWidth: 150 }}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    // List View
    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    ผู้จัดจำหน่าย ({filteredList.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มผู้จัดจำหน่าย
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <TextField
                        size="small"
                        placeholder="ค้นหา (รหัส, ชื่อ, ผู้ติดต่อ, เบอร์โทร)"
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
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredList.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: "#F0F5FF" }}>
                                        <tr>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัส</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อผู้จัดจำหน่าย</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ผู้ติดต่อ</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>เบอร์โทร</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>วันเครดิต</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#696969' }}>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData().map((item, index) => (
                                            <tr key={item.SUPPLIER_CODE} style={{ borderTop: '1px solid #e0e0e0' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {(page - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                                                    {item.SUPPLIER_CODE}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.SUPPLIER_NAME}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.CONTACT1 || '-'}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {item.TEL1 || '-'}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    {item.DAY1 || 0} วัน
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(item)}
                                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                        >
                                                            <EditIcon sx={{ color: '#5698E0' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item.SUPPLIER_CODE)}
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
                            </Box>

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
                onClose={() => setDeleteDialog({ open: false, code: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบผู้จัดจำหน่าย "{deleteDialog.code}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, code: null })}>
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

export default SupplierManagement;