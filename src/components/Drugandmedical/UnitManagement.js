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
import UnitService from '../../services/unitService';
import Swal from "sweetalert2";

const UnitManagement = () => {
    // States
    const [currentView, setCurrentView] = useState("list");
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, unitCode: null });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Form states
    const [formData, setFormData] = useState({
        UNIT_CODE: '',
        UNIT_NAME: ''
    });

    const itemsPerPage = 10;

    useEffect(() => {
        loadUnits();
    }, []);

    useEffect(() => {
        filterUnits();
    }, [units, searchTerm]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredUnits.length / itemsPerPage));
    }, [filteredUnits]);

    const loadUnits = async () => {
        setLoading(true);
        try {
            const result = await UnitService.getAllUnits();
            
            if (result.success && result.data) {
                console.log(`✅ โหลดข้อมูลหน่วยนับ ${result.data.length} รายการ`);
                setUnits(result.data);
                setFilteredUnits(result.data);
                showAlert(`โหลดข้อมูลหน่วยนับสำเร็จ ${result.data.length} รายการ`, 'success');
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลหน่วยนับได้');
            }
        } catch (error) {
            console.error('❌ Error loading units:', error);
            showAlert('ไม่สามารถโหลดข้อมูลหน่วยนับได้ กรุณาตรวจสอบการเชื่อมต่อ API', 'error');
            setUnits([]);
            setFilteredUnits([]);
        }
        setLoading(false);
    };

    const filterUnits = () => {
        if (!searchTerm) {
            setFilteredUnits(units);
        } else {
            const filtered = units.filter(unit =>
                unit.UNIT_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unit.UNIT_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUnits(filtered);
        }
        setPage(1);
    };

    const getPaginatedUnits = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUnits.slice(startIndex, endIndex);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            UNIT_CODE: '',
            UNIT_NAME: ''
        });
        setEditingUnit(null);
    };

    // สร้าง UNIT_CODE อัตโนมัติเป็น UNIT001, UNIT002, ...
    const generateUnitCode = () => {
        if (units.length === 0) {
            return 'UNIT001';
        }

        // หา UNIT_CODE ที่เป็นรูปแบบ UNITxxx
        const unitCodes = units
            .filter(unit => /^UNIT\d{3}$/.test(unit.UNIT_CODE))
            .map(unit => {
                const match = unit.UNIT_CODE.match(/^UNIT(\d{3})$/);
                return match ? parseInt(match[1]) : 0;
            });

        if (unitCodes.length === 0) {
            return 'UNIT001';
        }

        // หาเลขสูงสุดและเพิ่ม 1
        const maxNumber = Math.max(...unitCodes);
        const nextNumber = maxNumber + 1;
        return `UNIT${String(nextNumber).padStart(3, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.UNIT_NAME) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                text: 'กรุณากรอกชื่อหน่วยนับ',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setLoading(true);
        
        try {
            if (!editingUnit) {
                // สร้างหน่วยนับใหม่ - gen UNIT_CODE อัตโนมัติเป็น UNIT001, UNIT002, ...
                const dataToSave = {
                    UNIT_CODE: generateUnitCode(),
                    UNIT_NAME: formData.UNIT_NAME
                };
                
                await UnitService.createUnit(dataToSave);
                showAlert('เพิ่มข้อมูลหน่วยนับสำเร็จ', 'success');
            } else {
                // อัปเดตหน่วยนับ - แก้ไขได้แค่ชื่อ
                await UnitService.updateUnit(editingUnit.UNIT_CODE, { UNIT_NAME: formData.UNIT_NAME });
                showAlert('แก้ไขข้อมูลหน่วยนับสำเร็จ', 'success');
            }

            // โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
            await loadUnits();
            resetForm();
            setCurrentView("list");
        } catch (error) {
            console.error('Error saving unit:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        }
        
        setLoading(false);
    };

    const handleEdit = (unit) => {
        setFormData({
            UNIT_CODE: unit.UNIT_CODE,
            UNIT_NAME: unit.UNIT_NAME
        });
        setEditingUnit(unit);
        setCurrentView("edit");
    };

    const handleDeleteClick = (unitCode) => {
        setDeleteDialog({ open: true, unitCode });
    };

    const handleDeleteConfirm = async () => {
        const { unitCode } = deleteDialog;

        try {
            await UnitService.deleteUnit(unitCode);
            showAlert('ลบข้อมูลหน่วยนับสำเร็จ', 'success');
            
            // โหลดข้อมูลใหม่หลังลบสำเร็จ
            await loadUnits();
        } catch (error) {
            console.error('Error deleting unit:', error);
            showAlert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
        }

        setDeleteDialog({ open: false, unitCode: null });
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
                        {currentView === "add" ? "เพิ่มหน่วยนับใหม่" : "แก้ไขหน่วยนับ"}
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
                            {/* รหัสหน่วยนับ - แสดงเฉพาะตอนแก้ไข */}
                            {editingUnit && (
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                        รหัสหน่วยนับ (ไม่สามารถแก้ไขได้)
                                    </Typography>
                                    <TextField
                                        size="small"
                                        value={formData.UNIT_CODE}
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

                            {/* ชื่อหน่วยนับ */}
                            <Grid item xs={12} sm={editingUnit ? 6 : 12}>
                                <Typography sx={{ fontWeight: 400, fontSize: 16, mb: 1 }}>
                                    ชื่อหน่วยนับ *
                                    {!editingUnit && <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(รหัสจะสร้างอัตโนมัติจากชื่อ)</span>}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="เช่น แอมปูล, ขวด, กล่อง, เม็ด"
                                    value={formData.UNIT_NAME}
                                    onChange={(e) => handleFormChange('UNIT_NAME', e.target.value)}
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
                    ระบบจัดการหน่วยนับ ({filteredUnits.length} รายการ)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCurrentView("add")}
                    sx={{ backgroundColor: '#5698E0' }}
                >
                    เพิ่มหน่วยนับ
                </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <TextField
                                size="small"
                                placeholder="ค้นหาหน่วยนับ (รหัส, ชื่อ)"
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
                    {filteredUnits.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลหน่วยนับ'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: "#F0F5FF" }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ลำดับ</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#696969' }}>ชื่อหน่วยนับ</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'right', color: '#696969' }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedUnits().map((unit, index) => (
                                        <tr key={unit.UNIT_CODE} style={{ borderTop: '1px solidrgb(14, 12, 12)' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>{unit.UNIT_NAME}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'right' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(unit)}
                                                        sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                                    >
                                                        <EditIcon sx={{ color: '#5698E0' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(unit.UNIT_CODE)}
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
                onClose={() => setDeleteDialog({ open: false, unitCode: null })}
            >
                <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                <DialogContent>
                    <Typography>
                        คุณแน่ใจหรือไม่ที่ต้องการลบหน่วยนับ "{deleteDialog.unitCode}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, unitCode: null })}>
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

export default UnitManagement;

