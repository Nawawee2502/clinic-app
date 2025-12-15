import React, { useState, useEffect } from 'react';
import EmployeeService from '../services/employeeService';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
    MenuItem, FormControl, InputLabel, IconButton, Chip, Alert, Typography,
    Grid, Tooltip
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Search as SearchIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const [formData, setFormData] = useState({
        EMP_CODE: '',
        EMP_NAME: '',
        EMP_TYPE: '',
        LICENSE_NO: ''
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [employees, searchTerm, filterType]);

    const loadEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await EmployeeService.getAllEmployees();
            if (response.success) {
                setEmployees(response.data || []);
            } else {
                setError('ไม่สามารถโหลดข้อมูลพนักงานได้');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน');
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(emp => emp.EMP_TYPE === filterType);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.EMP_CODE?.toLowerCase().includes(term) ||
                emp.EMP_NAME?.toLowerCase().includes(term) ||
                emp.LICENSE_NO?.toLowerCase().includes(term)
            );
        }

        setFilteredEmployees(filtered);
    };

    const handleOpenDialog = (mode, employee = null) => {
        setDialogMode(mode);
        setSelectedEmployee(employee);
        if (mode === 'edit' && employee) {
            setFormData({
                EMP_CODE: employee.EMP_CODE || '',
                EMP_NAME: employee.EMP_NAME || '',
                EMP_TYPE: employee.EMP_TYPE || '',
                LICENSE_NO: employee.LICENSE_NO || ''
            });
        } else {
            setFormData({
                EMP_CODE: '',
                EMP_NAME: '',
                EMP_TYPE: '',
                LICENSE_NO: ''
            });
        }
        setOpenDialog(true);
        setError(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEmployee(null);
        setError(null);
        setFormData({
            EMP_CODE: '',
            EMP_NAME: '',
            EMP_TYPE: '',
            LICENSE_NO: ''
        });
    };

    const handleSubmit = async () => {
        setError(null);
        
        // Validation
        if (!formData.EMP_CODE?.trim()) {
            setError('กรุณากรอกรหัสพนักงาน');
            return;
        }
        if (!formData.EMP_NAME?.trim()) {
            setError('กรุณากรอกชื่อพนักงาน');
            return;
        }

        try {
            if (dialogMode === 'create') {
                await EmployeeService.createEmployee(formData);
                setSuccess('เพิ่มข้อมูลพนักงานสำเร็จ');
            } else {
                await EmployeeService.updateEmployee(selectedEmployee.EMP_CODE, formData);
                setSuccess('แก้ไขข้อมูลพนักงานสำเร็จ');
            }
            handleCloseDialog();
            loadEmployees();
            
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: dialogMode === 'create' ? 'เพิ่มข้อมูลพนักงานสำเร็จ' : 'แก้ไขข้อมูลพนักงานสำเร็จ',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error saving employee:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (employee) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: `ต้องการลบพนักงาน "${employee.EMP_NAME}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d32f2f'
        });

        if (!result.isConfirmed) return;

        try {
            await EmployeeService.deleteEmployee(employee.EMP_CODE);
            setSuccess('ลบข้อมูลพนักงานสำเร็จ');
            loadEmployees();
            
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'ลบข้อมูลพนักงานสำเร็จ',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error deleting employee:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถลบข้อมูลพนักงานได้'
            });
        }
    };

    const getTypeChipColor = (type) => {
        const colors = {
            'หมอ': 'primary',
            'พยาบาล': 'info',
            'เจ้าหน้าที่': 'default',
            'แคชเชียร์': 'warning'
        };
        return colors[type] || 'default';
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                จัดการพนักงาน
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Search and Filter */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="ค้นหา"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="รหัส, ชื่อ, หรือใบอนุญาต"
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>ประเภทพนักงาน</InputLabel>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                label="ประเภทพนักงาน"
                            >
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="หมอ">หมอ</MenuItem>
                                <MenuItem value="พยาบาล">พยาบาล</MenuItem>
                                <MenuItem value="เจ้าหน้าที่">เจ้าหน้าที่</MenuItem>
                                <MenuItem value="แคชเชียร์">แคชเชียร์</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog('create')}
                            fullWidth
                            sx={{ height: '40px' }}
                        >
                            เพิ่ม
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Employee Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>รหัสพนักงาน</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>ชื่อ-นามสกุล</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>ประเภท</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography>กำลังโหลดข้อมูล...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">ไม่พบข้อมูลพนักงาน</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TableRow key={employee.EMP_CODE} hover>
                                        <TableCell>{employee.EMP_CODE}</TableCell>
                                        <TableCell>{employee.EMP_NAME}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={employee.EMP_TYPE || '-'}
                                                size="small"
                                                color={getTypeChipColor(employee.EMP_TYPE)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {employee.LICENSE_NO || (
                                                <Typography variant="body2" color="text.secondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="แก้ไข">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog('edit', employee)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="ลบ">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(employee)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogMode === 'create' ? 'เพิ่มพนักงานใหม่' : 'แก้ไขข้อมูลพนักงาน'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="รหัสพนักงาน"
                                value={formData.EMP_CODE}
                                onChange={(e) => setFormData({ ...formData, EMP_CODE: e.target.value.toUpperCase() })}
                                fullWidth
                                size="small"
                                required
                                disabled={dialogMode === 'edit'}
                                helperText={dialogMode === 'edit' ? 'ไม่สามารถแก้ไขรหัสพนักงานได้' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="ชื่อ-นามสกุล"
                                value={formData.EMP_NAME}
                                onChange={(e) => setFormData({ ...formData, EMP_NAME: e.target.value })}
                                fullWidth
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>ประเภทพนักงาน</InputLabel>
                                <Select
                                    value={formData.EMP_TYPE}
                                    onChange={(e) => setFormData({ ...formData, EMP_TYPE: e.target.value })}
                                    label="ประเภทพนักงาน"
                                >
                                    <MenuItem value="หมอ">หมอ</MenuItem>
                                    <MenuItem value="พยาบาล">พยาบาล</MenuItem>
                                    <MenuItem value="เจ้าหน้าที่">เจ้าหน้าที่</MenuItem>
                                    <MenuItem value="แคชเชียร์">แคชเชียร์</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่"
                                value={formData.LICENSE_NO}
                                onChange={(e) => setFormData({ ...formData, LICENSE_NO: e.target.value })}
                                fullWidth
                                size="small"
                                placeholder="เช่น ว.78503"
                                helperText={formData.EMP_TYPE === 'หมอ' ? 'กรอกเฉพาะสำหรับแพทย์' : 'ไม่จำเป็นสำหรับประเภทอื่น'}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {dialogMode === 'create' ? 'เพิ่ม' : 'บันทึก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeManagement;

