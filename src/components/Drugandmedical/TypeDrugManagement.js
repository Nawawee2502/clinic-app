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
import TypeDrugService from '../../services/typeDrugService';
import Swal from "sweetalert2";

const TypeDrugManagement = () => {
    // States
    const [currentView, setCurrentView] = useState("list");
    const [typeDrugs, setTypeDrugs] = useState([]);
    const [filteredTypeDrugs, setFilteredTypeDrugs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingTypeDrug, setEditingTypeDrug] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, typeDrugCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Form states
    const [formData, setFormData] = useState({
        TYPE_DRUG_CODE: '',
        TYPE_DRUG_NAME: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadTypeDrugs();
    }, []);

    useEffect(() => {
        filterTypeDrugs();
    }, [typeDrugs, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredTypeDrugs.length / itemsPerPage));
    }, [filteredTypeDrugs]);

    const loadTypeDrugs = async () => {
        setLoading(true);
        try {
            const result = await TypeDrugService.getAllTypeDrugs();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลประเภทยา ${result.data.length} รายการ`);
                setTypeDrugs(result.data);
                setFilteredTypeDrugs(result.data);
                showAlert(`โหลดข้อมูลประเภทยาสำเร็จ ${result.data.length} รายการ`, 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลประเภทยาได้');
            }
        } catch (error) {
            console.error('❌ Error loading type drugs:', error);
            showAlert('ไม่สามารถโหลดข้อมูลประเภทยาได้ กรุณาตรวจสอบการเชื่อมต่อ API', 'error');
            setTypeDrugs([]);
            setFilteredTypeDrugs([]);
        }
        setLoading(false);
    };

    const filterTypeDrugs = () => {
        if (!searchTerm) {
            setFilteredTypeDrugs(typeDrugs);
        } else {
            const filtered = typeDrugs.filter(typeDrug =>
                typeDrug.TYPE_DRUG_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                typeDrug.TYPE_DRUG_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTypeDrugs(filtered);
        }
        setPage(1);
    };

    const getPaginatedTypeDrugs = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTypeDrugs.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            TYPE_DRUG_CODE: '',
            TYPE_DRUG_NAME: ''
        });
        setEditingTypeDrug(null);
    };

    // สร้าง TYPE_DRUG_CODE อัตโนมัติเป็น TD001, TD002, ...
    const generateTypeDrugCode = () => {
        if (typeDrugs.length === 0) {
            return 'TD001';
        }

        // หา TYPE_DRUG_CODE ที่เป็นรูปแบบ TDxxx
        const typeDrugCodes = typeDrugs
            .filter(typeDrug => /^TD\d{3}$/.test(typeDrug.TYPE_DRUG_CODE))
            .map(typeDrug => {
                const match = typeDrug.TYPE_DRUG_CODE.match(/^TD(\d{3})$/);
                return match ? parseInt(match[1]) : 0;
            });

        if (typeDrugCodes.length === 0) {
            return 'TD001';
        }

        // หาเลขสูงสุดและเพิ่ม 1
        const maxNumber = Math.max(...typeDrugCodes);
        const nextNumber = maxNumber + 1;
        return `TD${String(nextNumber).padStart(3, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.TYPE_DRUG_NAME) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: 'กรุณากรอกชื่อประเภทยา',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setLoading(true);
        
        try {
            if (!editingTypeDrug) {
                // สร้างประเภทยาใหม่ - gen TYPE_DRUG_CODE อัตโนมัติเป็น TD001, TD002, ...
                const dataToSave = {
                    TYPE_DRUG_CODE: generateTypeDrugCode(),
                    TYPE_DRUG_NAME: formData.TYPE_DRUG_NAME
                };
                
                await TypeDrugService.createTypeDrug(dataToSave);
                showAlert('เพิ่มข้อมูลประเภทยาสำเร็จ', 'success');
            } else {
                // อัปเดตประเภทยา - แก้ไขได้แค่ชื่อ
                await TypeDrugService.updateTypeDrug(editingTypeDrug.TYPE_DRUG_CODE, {
                    TYPE_DRUG_NAME: formData.TYPE_DRUG_NAME
                });
                showAlert('แก้ไขข้อมูลประเภทยาสำเร็จ', 'success');
            }

            // โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
            await loadTypeDrugs();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('Error saving type drug:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }
        
        setLoading(false);
    };

    const handleEdit = (typeDrug) => {
        setFormData({
            TYPE_DRUG_CODE: typeDrug.TYPE_DRUG_CODE,
            TYPE_DRUG_NAME: typeDrug.TYPE_DRUG_NAME
        });
        setEditingTypeDrug(typeDrug);
        setCurrentView("edit");
    };

    const handleDeleteClick = (typeDrugCode) => {
        setDeleteDialog({ open: true, typeDrugCode });
    };

    const handleDeleteConfirm = async () => {
        const { typeDrugCode } = deleteDialog;

        try {
            await TypeDrugService.deleteTypeDrug(typeDrugCode);
            showAlert('ลบข้อมูลประเภทยาสำเร็จ', 'success');
            
            // โหลดข้อมูลใหม่หลังลบสำเร็จ
            await loadTypeDrugs();
        } catch (error) {
            console.error('Error deleting type drug:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }

        setDeleteDialog({ open: false, typeDrugCode: null });
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    // Form View
    if (currentView === "add" || currentView === "edit") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {currentView === "add" ? "เพิ่มประเภทยาใหม่" : "แก้ไขประเภทยา"}
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
                            {/* รหัสประเภทยา - แสดงเฉพาะตอนแก้ไข */}
                            {editingTypeDrug && (
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                        รหัสประเภทยา (ไม่สามารถแก้ไขได้)
                                    </Typography>
                                    <TextField
                                        size="small"
                                        value={formData.TYPE_DRUG_CODE}
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
                            )}

                            {/* ชื่อประเภทยา */}
                            <Grid item xs={12} sm={editingTypeDrug ? 6 : 12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อประเภทยา *
                                    {!editingTypeDrug && <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(รหัสจะสร้างอัตโนมัติเป็น TD001, TD002, ...)</span>}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น ยาแก้ปวด, ยาแก้อักเสบ"
                                    value={formData.TYPE_DRUG_NAME}
                                    onChange={(e) => handleFormChange('TYPE_DRUG_NAME', e.target.value)}
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

    // List View
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    ระบบจัดการประเภทยา ({filteredTypeDrugs.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มประเภทยา
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                placeholder="ค้นหาประเภทยา (รหัส, ชื่อ)"
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
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {filteredTypeDrugs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลประเภทยา'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสประเภทยา</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อประเภทยา</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'right', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedTypeDrugs().map((typeDrug, index) => (
                                        <tr key={typeDrug.TYPE_DRUG_CODE} style={{ borderTop: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>{typeDrug.TYPE_DRUG_CODE}</td>
                                            <td style={{ padding: '12px 8px' }}>{typeDrug.TYPE_DRUG_NAME}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'right' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(typeDrug)}
                                                        sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                    >
                                                        <EditIcon sx={{ color: '#5698E0' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(typeDrug.TYPE_DRUG_CODE)}
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
                onClose={() => setDeleteDialog({ open: false, typeDrugCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบประเภทยา "{deleteDialog.typeDrugCode}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, typeDrugCode: null })}>
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

export default TypeDrugManagement;

