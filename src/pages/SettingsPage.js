// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Tabs,
    Tab,
    TextField,
    Button,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Divider,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Chip
} from '@mui/material';
import ClinicOrgService from '../services/clinicOrgService';
import AuthService from '../services/authService';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const SettingsPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.role === 'admin';

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Organization Data
    const [orgData, setOrgData] = useState({
        clinicCode: '',
        clinicName: '',
        addr1: '',
        tumbolCode: '',
        ampherCode: '',
        provinceCode: '',
        zipcode: '',
        tel1: '',
        logo1: ''
    });

    // Users List
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        loadOrganizationData();
        if (tabValue === 1) {
            loadUsers();
        }
    }, [tabValue]);

    const loadOrganizationData = async () => {
        try {
            setLoading(true);
            const response = await ClinicOrgService.getClinicOrg();
            if (response.success) {
                setOrgData({
                    clinicCode: response.data.CLINIC_CODE || '',
                    clinicName: response.data.CLINIC_NAME || '',
                    addr1: response.data.ADDR1 || '',
                    tumbolCode: response.data.TUMBOL_CODE || '',
                    ampherCode: response.data.AMPHER_CODE || '',
                    provinceCode: response.data.PROVINCE_CODE || '',
                    zipcode: response.data.ZIPCODE || '',
                    tel1: response.data.TEL1 || '',
                    logo1: response.data.logo1 || ''
                });
            }
        } catch (error) {
            console.error('Error loading org data:', error);
            setError('ไม่สามารถโหลดข้อมูลองค์กรได้');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await AuthService.getAllUsers({ limit: 100 });
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleOrgChange = (e) => {
        setOrgData({
            ...orgData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveOrganization = async () => {
        if (!isAdmin) {
            setError('คุณไม่มีสิทธิ์แก้ไขข้อมูล');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await ClinicOrgService.updateClinicOrg(orgData);
            setSuccess('บันทึกข้อมูลองค์กรสำเร็จ');
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (userId) => {
        navigate(`/clinic/admin/users?edit=${userId}`);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
            return;
        }

        try {
            await AuthService.deleteUser(userId);
            setSuccess('ลบผู้ใช้สำเร็จ');
            loadUsers();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'doctor': return 'primary';
            case 'nurse': return 'success';
            case 'pharmacist': return 'warning';
            default: return 'default';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'ผู้ดูแลระบบ';
            case 'doctor': return 'แพทย์';
            case 'nurse': return 'พยาบาล';
            case 'pharmacist': return 'เภสัชกร';
            case 'user': return 'ผู้ใช้ทั่วไป';
            default: return role;
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                การตั้งค่า
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab
                            icon={<BusinessIcon />}
                            label="ข้อมูลองค์กร"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<PeopleIcon />}
                            label="กำหนดผู้ใช้งาน"
                            iconPosition="start"
                            disabled={!isAdmin}
                        />
                    </Tabs>
                </Box>

                <CardContent>
                    {/* Tab 1: ข้อมูลองค์กร */}
                    <TabPanel value={tabValue} index={0}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    ข้อมูลคลินิก
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="รหัสคลินิก"
                                            name="clinicCode"
                                            value={orgData.clinicCode}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="ชื่อคลินิก *"
                                            name="clinicName"
                                            value={orgData.clinicName}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="ที่อยู่ *"
                                            name="addr1"
                                            value={orgData.addr1}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                            multiline
                                            rows={2}
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="รหัสตำบล"
                                            name="tumbolCode"
                                            value={orgData.tumbolCode}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="รหัสอำเภอ"
                                            name="ampherCode"
                                            value={orgData.ampherCode}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="รหัสจังหวัด"
                                            name="provinceCode"
                                            value={orgData.provinceCode}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="รหัสไปรษณีย์"
                                            name="zipcode"
                                            value={orgData.zipcode}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="เบอร์โทรศัพท์"
                                            name="tel1"
                                            value={orgData.tel1}
                                            onChange={handleOrgChange}
                                            disabled={!isAdmin}
                                        />
                                    </Grid>
                                </Grid>

                                {isAdmin && (
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleSaveOrganization}
                                            disabled={loading}
                                        >
                                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </TabPanel>

                    {/* Tab 2: กำหนดผู้ใช้งาน */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                จัดการผู้ใช้งาน
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                onClick={() => navigate('/clinic/admin/users')}
                            >
                                เพิ่มผู้ใช้
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {usersLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <List>
                                {users.map((u) => (
                                    <ListItem
                                        key={u.USER_ID}
                                        sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                        secondaryAction={
                                            <Box>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleEditUser(u.USER_ID)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                {u.USER_ID !== user?.userId && (
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleDeleteUser(u.USER_ID)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {u.FULL_NAME?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {u.FULL_NAME}
                                                    </Typography>
                                                    <Chip
                                                        label={getRoleLabel(u.ROLE)}
                                                        size="small"
                                                        color={getRoleColor(u.ROLE)}
                                                    />
                                                    {u.STATUS === 'inactive' && (
                                                        <Chip label="ระงับ" size="small" color="default" />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" component="span">
                                                        Username: {u.USERNAME}
                                                    </Typography>
                                                    {u.EMAIL && (
                                                        <>
                                                            {' | '}
                                                            <Typography variant="body2" component="span">
                                                                Email: {u.EMAIL}
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {u.EMP_CODE && (
                                                        <>
                                                            {' | '}
                                                            <Typography variant="body2" component="span">
                                                                รหัส: {u.EMP_CODE}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </TabPanel>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SettingsPage;