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
import TypeProcedureService from '../../services/typeProcedureService';
import Swal from "sweetalert2";

const TypeProcedureManagement = () => {
    // States
    const [currentView, setCurrentView] = useState("list");
    const [typeProcedures, setTypeProcedures] = useState([]);
    const [filteredTypeProcedures, setFilteredTypeProcedures] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingTypeProcedure, setEditingTypeProcedure] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, typeProcedureCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Form states
    const [formData, setFormData] = useState({
        TYPE_PROCEDURE_CODE: '',
        TYPE_PROCEDURE_NAME: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadTypeProcedures();
    }, []);

    useEffect(() => {
        filterTypeProcedures();
    }, [typeProcedures, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredTypeProcedures.length / itemsPerPage));
    }, [filteredTypeProcedures]);

    const loadTypeProcedures = async () => {
        setLoading(true);
        try {
            const result = await TypeProcedureService.getAllTypeProcedures();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลประเภทหัตถการ ${result.data.length} รายการ`);
                setTypeProcedures(result.data);
                setFilteredTypeProcedures(result.data);
                showAlert(`โหลดข้อมูลประเภทหัตถการสำเร็จ ${result.data.length} รายการ`, 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลประเภทหัตถการได้');
            }
        } catch (error) {
            console.error('❌ Error loading type procedures:', error);
            showAlert('ไม่สามารถโหลดข้อมูลประเภทหัตถการได้ กรุณาตรวจสอบการเชื่อมต่อ API', 'error');
            setTypeProcedures([]);
            setFilteredTypeProcedures([]);
        }
        setLoading(false);
    };

    const filterTypeProcedures = () => {
        if (!searchTerm) {
            setFilteredTypeProcedures(typeProcedures);
        } else {
            const filtered = typeProcedures.filter(typeProcedure =>
                typeProcedure.TYPE_PROCEDURE_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                typeProcedure.TYPE_PROCEDURE_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTypeProcedures(filtered);
        }
        setPage(1);
    };

    const getPaginatedTypeProcedures = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTypeProcedures.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            TYPE_PROCEDURE_CODE: '',
            TYPE_PROCEDURE_NAME: ''
        });
        setEditingTypeProcedure(null);
    };

    // สร้าง TYPE_PROCEDURE_CODE อัตโนมัติเป็น TP001, TP002, ...
    const generateTypeProcedureCode = () => {
        if (typeProcedures.length === 0) {
            return 'TP001';
        }

        // หา TYPE_PROCEDURE_CODE ที่เป็นรูปแบบ TPxxx
        const typeProcedureCodes = typeProcedures
            .filter(typeProcedure => /^TP\d{3}$/.test(typeProcedure.TYPE_PROCEDURE_CODE))
            .map(typeProcedure => {
                const match = typeProcedure.TYPE_PROCEDURE_CODE.match(/^TP(\d{3})$/);
                return match ? parseInt(match[1]) : 0;
            });

        if (typeProcedureCodes.length === 0) {
            return 'TP001';
        }

        // หาเลขสูงสุดและเพิ่ม 1
        const maxNumber = Math.max(...typeProcedureCodes);
        const nextNumber = maxNumber + 1;
        return `TP${String(nextNumber).padStart(3, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.TYPE_PROCEDURE_NAME) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: 'กรุณากรอกชื่อประเภทหัตถการ',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setLoading(true);
        
        try {
            if (!editingTypeProcedure) {
                // สร้างประเภทหัตถการใหม่ - gen TYPE_PROCEDURE_CODE อัตโนมัติเป็น TP001, TP002, ...
                const dataToSave = {
                    TYPE_PROCEDURE_CODE: generateTypeProcedureCode(),
                    TYPE_PROCEDURE_NAME: formData.TYPE_PROCEDURE_NAME
                };
                
                await TypeProcedureService.createTypeProcedure(dataToSave);
                showAlert('เพิ่มข้อมูลประเภทหัตถการสำเร็จ', 'success');
            } else {
                // อัปเดตประเภทหัตถการ - แก้ไขได้แค่ชื่อ
                await TypeProcedureService.updateTypeProcedure(editingTypeProcedure.TYPE_PROCEDURE_CODE, {
                    TYPE_PROCEDURE_NAME: formData.TYPE_PROCEDURE_NAME
                });
                showAlert('แก้ไขข้อมูลประเภทหัตถการสำเร็จ', 'success');
            }

            // โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
            await loadTypeProcedures();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('Error saving type procedure:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }
        
        setLoading(false);
    };

    const handleEdit = (typeProcedure) => {
        setFormData({
            TYPE_PROCEDURE_CODE: typeProcedure.TYPE_PROCEDURE_CODE,
            TYPE_PROCEDURE_NAME: typeProcedure.TYPE_PROCEDURE_NAME
        });
        setEditingTypeProcedure(typeProcedure);
        setCurrentView("edit");
    };

    const handleDeleteClick = (typeProcedureCode) => {
        setDeleteDialog({ open: true, typeProcedureCode });
    };

    const handleDeleteConfirm = async () => {
        const { typeProcedureCode } = deleteDialog;

        try {
            await TypeProcedureService.deleteTypeProcedure(typeProcedureCode);
            showAlert('ลบข้อมูลประเภทหัตถการสำเร็จ', 'success');
            
            // โหลดข้อมูลใหม่หลังลบสำเร็จ
            await loadTypeProcedures();
        } catch (error) {
            console.error('Error deleting type procedure:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }

        setDeleteDialog({ open: false, typeProcedureCode: null });
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
                        {currentView === "add" ? "เพิ่มประเภทหัตถการใหม่" : "แก้ไขประเภทหัตถการ"}
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
                            {/* รหัสประเภทหัตถการ - แสดงเฉพาะตอนแก้ไข */}
                            {editingTypeProcedure && (
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                        รหัสประเภทหัตถการ (ไม่สามารถแก้ไขได้)
                                    </Typography>
                                    <TextField
                                        size="small"
                                        value={formData.TYPE_PROCEDURE_CODE}
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

                            {/* ชื่อประเภทหัตถการ */}
                            <Grid item xs={12} sm={editingTypeProcedure ? 6 : 12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อประเภทหัตถการ *
                                    {!editingTypeProcedure && <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(รหัสจะสร้างอัตโนมัติเป็น TP001, TP002, ...)</span>}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น ตรวจร่างกาย, รักษาทั่วไป, ผ่าตัดเล็ก"
                                    value={formData.TYPE_PROCEDURE_NAME}
                                    onChange={(e) => handleFormChange('TYPE_PROCEDURE_NAME', e.target.value)}
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
                    ระบบจัดการประเภทหัตถการ ({filteredTypeProcedures.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มประเภทหัตถการ
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                placeholder="ค้นหาประเภทหัตถการ (รหัส, ชื่อ)"
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
                    {filteredTypeProcedures.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลประเภทหัตถการ'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>รหัสประเภทหัตถการ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อประเภทหัตถการ</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'right', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedTypeProcedures().map((typeProcedure, index) => (
                                        <tr key={typeProcedure.TYPE_PROCEDURE_CODE} style={{ borderTop: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>{typeProcedure.TYPE_PROCEDURE_CODE}</td>
                                            <td style={{ padding: '12px 8px' }}>{typeProcedure.TYPE_PROCEDURE_NAME}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'right' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(typeProcedure)}
                                                        sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                    >
                                                        <EditIcon sx={{ color: '#5698E0' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(typeProcedure.TYPE_PROCEDURE_CODE)}
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
                onClose={() => setDeleteDialog({ open: false, typeProcedureCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบประเภทหัตถการ "{deleteDialog.typeProcedureCode}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, typeProcedureCode: null })}>
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

export default TypeProcedureManagement;

