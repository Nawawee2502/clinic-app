// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
    MenuItem, FormControl, InputLabel, IconButton, Chip, Alert, Typography,
    Pagination, InputAdornment
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Search as SearchIcon, Visibility, VisibilityOff
} from '@mui/icons-material';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', role: '', status: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', role: 'staff',
        empCode: '', email: '', tel: '', status: 'active'
    });

    useEffect(() => {
        loadUsers();
    }, [page, filters.role, filters.status]);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthService.getAllUsers({ page, limit: 10, ...filters });
            if (response.success) {
                setUsers(response.data);
                setTotalPages(response.pagination.totalPages);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadUsers();
    };

    const handleOpenDialog = (mode, user = null) => {
        setDialogMode(mode);
        setSelectedUser(user);
        if (mode === 'edit' && user) {
            setFormData({
                username: user.USERNAME,
                password: '',
                fullName: user.FULL_NAME,
                role: user.ROLE,
                empCode: user.EMP_CODE || '',
                email: user.EMAIL || '',
                tel: user.TEL || '',
                status: user.STATUS
            });
        } else {
            setFormData({
                username: '', password: '', fullName: '', role: 'staff',
                empCode: '', email: '', tel: '', status: 'active'
            });
        }
        setOpenDialog(true);
        setShowPassword(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setError(null);
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);
        try {
            if (dialogMode === 'create') {
                await AuthService.createUser(formData);
                setSuccess('สร้าง User สำเร็จ');
            } else {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await AuthService.updateUser(selectedUser.USER_ID, updateData);
                setSuccess('อัปเดต User สำเร็จ');
            }
            handleCloseDialog();
            loadUsers();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`ต้องการลบ User "${username}" ใช่หรือไม่?`)) return;
        setError(null);
        setSuccess(null);
        try {
            await AuthService.deleteUser(userId);
            setSuccess('ลบ User สำเร็จ');
            loadUsers();
        } catch (error) {
            setError(error.message);
        }
    };

    const getRoleChipColor = (role) => {
        const colors = { admin: 'error', doctor: 'primary', nurse: 'info', staff: 'default', cashier: 'warning' };
        return colors[role] || 'default';
    };

    const getRoleLabel = (role) => {
        const labels = { admin: 'ผู้ดูแลระบบ', doctor: 'แพทย์', nurse: 'พยาบาล', staff: 'เจ้าหน้าที่', cashier: 'แคชเชียร์' };
        return labels[role] || role;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                จัดการผู้ใช้งาน
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="ค้นหา" value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Username, ชื่อ, Email" size="small"
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearch} size="small">
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Role</InputLabel>
                        <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} label="Role">
                            <MenuItem value="">ทั้งหมด</MenuItem>
                            <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                            <MenuItem value="doctor">แพทย์</MenuItem>
                            <MenuItem value="nurse">พยาบาล</MenuItem>
                            <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                            <MenuItem value="cashier">แคชเชียร์</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>สถานะ</InputLabel>
                        <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="สถานะ">
                            <MenuItem value="">ทั้งหมด</MenuItem>
                            <MenuItem value="active">ใช้งาน</MenuItem>
                            <MenuItem value="inactive">ระงับ</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create')}>
                        เพิ่ม User
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>ชื่อ-นามสกุล</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>เบอร์โทร</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>Login ล่าสุด</TableCell>
                            <TableCell align="center">จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} align="center">กำลังโหลด...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">ไม่พบข้อมูล</TableCell></TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.USER_ID}>
                                    <TableCell>{user.USERNAME}</TableCell>
                                    <TableCell>{user.FULL_NAME}</TableCell>
                                    <TableCell>
                                        <Chip label={getRoleLabel(user.ROLE)} color={getRoleChipColor(user.ROLE)} size="small" />
                                    </TableCell>
                                    <TableCell>{user.EMAIL || '-'}</TableCell>
                                    <TableCell>{user.TEL || '-'}</TableCell>
                                    <TableCell>
                                        <Chip label={user.STATUS === 'active' ? 'ใช้งาน' : 'ระงับ'}
                                            color={user.STATUS === 'active' ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {user.LAST_LOGIN ? new Date(user.LAST_LOGIN).toLocaleString('th-TH') : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog('edit', user)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(user.USER_ID, user.USERNAME)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
                </Box>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{dialogMode === 'create' ? 'เพิ่ม User ใหม่' : 'แก้ไข User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Username" value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            disabled={dialogMode === 'edit'} required fullWidth />

                        <TextField label="Password" type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={dialogMode === 'create'} fullWidth
                            placeholder={dialogMode === 'edit' ? 'ไม่ต้องกรอกถ้าไม่เปลี่ยน' : ''}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField label="ชื่อ-นามสกุล" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required fullWidth />

                        <FormControl fullWidth required>
                            <InputLabel>Role</InputLabel>
                            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} label="Role">
                                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                                <MenuItem value="doctor">แพทย์</MenuItem>
                                <MenuItem value="nurse">พยาบาล</MenuItem>
                                <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                                <MenuItem value="cashier">แคชเชียร์</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField label="รหัสพนักงาน" value={formData.empCode}
                            onChange={(e) => setFormData({ ...formData, empCode: e.target.value })} fullWidth />

                        <TextField label="Email" type="email" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />

                        <TextField label="เบอร์โทร" value={formData.tel}
                            onChange={(e) => setFormData({ ...formData, tel: e.target.value })} fullWidth />

                        <FormControl fullWidth>
                            <InputLabel>สถานะ</InputLabel>
                            <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="สถานะ">
                                <MenuItem value="active">ใช้งาน</MenuItem>
                                <MenuItem value="inactive">ระงับ</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>ยกเลิก</Button>
                    <Button onClick={handleSubmit} variant="contained"
                        disabled={!formData.username || !formData.fullName || (dialogMode === 'create' && !formData.password)}>
                        {dialogMode === 'create' ? 'สร้าง' : 'บันทึก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;