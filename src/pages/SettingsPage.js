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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete
} from '@mui/material';
import ClinicOrgService from '../services/clinicOrgService';
import AuthService from '../services/authService';
import BankService from '../services/bankService';
import BookBankService from '../services/bookBankService';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
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

    // API Base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
        logo1: '',
        bankCode: '',
        bankNo: '',
        bankBranch: '',
        bankType: ''
    });

    // Address Selection States
    const [provinces, setProvinces] = useState([]);
    const [amphers, setAmphers] = useState([]);
    const [tumbols, setTumbols] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedAmpher, setSelectedAmpher] = useState(null);
    const [selectedTumbol, setSelectedTumbol] = useState(null);

    // Users List
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Bank Data
    const [banks, setBanks] = useState([]);
    const [bookBanks, setBookBanks] = useState([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const [openBankDialog, setOpenBankDialog] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [bankForm, setBankForm] = useState({
        bankCode: '',
        bankNo: '',
        bankBranch: '',
        bankType: 'ออมทรัพย์'
    });

    useEffect(() => {
        loadOrganizationData();
        loadProvinces();
        if (tabValue === 1) {
            loadUsers();
        }
        if (tabValue === 2) {
            loadBanks();
            loadBookBanks();
        }
    }, [tabValue]);

    // ✅ โหลดจังหวัด
    const loadProvinces = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/provinces`);
            const result = await response.json();
            if (result.success) {
                setProvinces(result.data);
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    // ✅ โหลดอำเภอตามจังหวัด
    const loadAmphersByProvince = async (provinceCode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/amphers/province/${provinceCode}`);
            const result = await response.json();
            if (result.success) {
                setAmphers(result.data);
            }
        } catch (error) {
            console.error('Error loading amphers:', error);
        }
    };

    // ✅ โหลดตำบลตามอำเภอ
    const loadTumbolsByAmpher = async (ampherCode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tumbols/ampher/${ampherCode}`);
            const result = await response.json();
            if (result.success) {
                setTumbols(result.data);
            }
        } catch (error) {
            console.error('Error loading tumbols:', error);
        }
    };

    const loadOrganizationData = async () => {
        try {
            setLoading(true);
            const response = await ClinicOrgService.getClinicOrg();
            if (response.success) {
                const data = response.data;
                setOrgData({
                    clinicCode: data.CLINIC_CODE || '',
                    clinicName: data.CLINIC_NAME || '',
                    addr1: data.ADDR1 || '',
                    tumbolCode: data.TUMBOL_CODE || '',
                    ampherCode: data.AMPHER_CODE || '',
                    provinceCode: data.PROVINCE_CODE || '',
                    zipcode: data.ZIPCODE || '',
                    tel1: data.TEL1 || '',
                    logo1: data.logo1 || '',
                    bankCode: data.bank_code || '',
                    bankNo: data.bank_no || '',
                    bankBranch: data.bank_branch || '',
                    bankType: data.bank_type || ''
                });

                // ✅ โหลดข้อมูลที่อยู่และตั้งค่า Autocomplete
                if (data.PROVINCE_CODE) {
                    // หาจังหวัดที่ตรงกับ code
                    const province = provinces.find(p => p.PROVINCE_CODE === data.PROVINCE_CODE);
                    if (province) {
                        setSelectedProvince(province);
                    }
                    await loadAmphersByProvince(data.PROVINCE_CODE);
                }

                if (data.AMPHER_CODE) {
                    // รอให้โหลดอำเภอเสร็จก่อน
                    setTimeout(() => {
                        const ampher = amphers.find(a => a.AMPHER_CODE === data.AMPHER_CODE);
                        if (ampher) {
                            setSelectedAmpher(ampher);
                        }
                    }, 500);
                    await loadTumbolsByAmpher(data.AMPHER_CODE);
                }

                if (data.TUMBOL_CODE) {
                    // รอให้โหลดตำบลเสร็จก่อน
                    setTimeout(() => {
                        const tumbol = tumbols.find(t => t.TUMBOL_CODE === data.TUMBOL_CODE);
                        if (tumbol) {
                            setSelectedTumbol(tumbol);
                        }
                    }, 1000);
                }
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

    const loadBanks = async () => {
        try {
            setBanksLoading(true);
            const response = await BankService.getAllBanks();
            if (response.success) {
                setBanks(response.data);
            }
        } catch (error) {
            console.error('Error loading banks:', error);
            setError('ไม่สามารถโหลดข้อมูลธนาคารได้');
        } finally {
            setBanksLoading(false);
        }
    };

    const loadBookBanks = async () => {
        try {
            setBanksLoading(true);
            const response = await BookBankService.getAllBookBanks();
            if (response.success) {
                setBookBanks(response.data);
            }
        } catch (error) {
            console.error('Error loading book banks:', error);
            setError('ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้');
        } finally {
            setBanksLoading(false);
        }
    };

    const handleOrgChange = (e) => {
        setOrgData({
            ...orgData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Handle การเปลี่ยนจังหวัด
    const handleProvinceChange = (event, newValue) => {
        setSelectedProvince(newValue);
        setSelectedAmpher(null);
        setSelectedTumbol(null);
        setAmphers([]);
        setTumbols([]);

        setOrgData({
            ...orgData,
            provinceCode: newValue ? newValue.PROVINCE_CODE : '',
            ampherCode: '',
            tumbolCode: '',
            zipcode: ''
        });

        if (newValue) {
            loadAmphersByProvince(newValue.PROVINCE_CODE);
        }
    };

    // ✅ Handle การเปลี่ยนอำเภอ
    const handleAmpherChange = (event, newValue) => {
        setSelectedAmpher(newValue);
        setSelectedTumbol(null);
        setTumbols([]);

        setOrgData({
            ...orgData,
            ampherCode: newValue ? newValue.AMPHER_CODE : '',
            tumbolCode: '',
            zipcode: ''
        });

        if (newValue) {
            loadTumbolsByAmpher(newValue.AMPHER_CODE);
        }
    };

    // ✅ Handle การเปลี่ยนตำบล
    const handleTumbolChange = (event, newValue) => {
        setSelectedTumbol(newValue);

        setOrgData({
            ...orgData,
            tumbolCode: newValue ? newValue.TUMBOL_CODE : '',
            zipcode: newValue && newValue.zipcode ? newValue.zipcode : orgData.zipcode
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

    // Bank Dialog Functions
    const handleOpenBankDialog = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setBankForm({
                bankCode: bank.bank_code,
                bankNo: bank.bank_no,
                bankBranch: bank.bank_branch || '',
                bankType: bank.bank_type || 'ออมทรัพย์'
            });
        } else {
            setEditingBank(null);
            setBankForm({
                bankCode: '',
                bankNo: '',
                bankBranch: '',
                bankType: 'ออมทรัพย์'
            });
        }
        setOpenBankDialog(true);
    };

    const handleCloseBankDialog = () => {
        setOpenBankDialog(false);
        setEditingBank(null);
        setBankForm({
            bankCode: '',
            bankNo: '',
            bankBranch: '',
            bankType: 'ออมทรัพย์'
        });
    };

    const handleBankFormChange = (e) => {
        setBankForm({
            ...bankForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveBank = async () => {
        if (!bankForm.bankCode || !bankForm.bankNo) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            if (editingBank) {
                // Update
                await BookBankService.updateBookBank(
                    editingBank.bank_code,
                    editingBank.bank_no,
                    {
                        bankBranch: bankForm.bankBranch,
                        bankType: bankForm.bankType
                    }
                );
                setSuccess('แก้ไขข้อมูลบัญชีธนาคารสำเร็จ');
            } else {
                // Create
                await BookBankService.createBookBank(bankForm);
                setSuccess('เพิ่มบัญชีธนาคารสำเร็จ');
            }

            handleCloseBankDialog();
            loadBookBanks();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBank = async (bankCode, bankNo) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชีธนาคารนี้?')) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await BookBankService.deleteBookBank(bankCode, bankNo);
            setSuccess('ลบบัญชีธนาคารสำเร็จ');
            loadBookBanks();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการลบบัญชีธนาคาร');
        } finally {
            setLoading(false);
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

    const getBankName = (bankCode) => {
        const bank = banks.find(b => b.bank_code === bankCode);
        return bank ? bank.bank_name : bankCode;
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
                        <Tab
                            icon={<AccountBalanceIcon />}
                            label="บัญชีธนาคาร"
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

                                    {/* ✅ เปลี่ยนจาก TextField เป็น Autocomplete */}
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={provinces}
                                            getOptionLabel={(option) => option.PROVINCE_NAME || ''}
                                            value={selectedProvince}
                                            onChange={handleProvinceChange}
                                            disabled={!isAdmin}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="จังหวัด *"
                                                    required
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) =>
                                                option.PROVINCE_CODE === value?.PROVINCE_CODE
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={amphers}
                                            getOptionLabel={(option) => option.AMPHER_NAME || ''}
                                            value={selectedAmpher}
                                            onChange={handleAmpherChange}
                                            disabled={!isAdmin || !selectedProvince}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="อำเภอ/เขต *"
                                                    required
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) =>
                                                option.AMPHER_CODE === value?.AMPHER_CODE
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={tumbols}
                                            getOptionLabel={(option) => option.TUMBOL_NAME || ''}
                                            value={selectedTumbol}
                                            onChange={handleTumbolChange}
                                            disabled={!isAdmin || !selectedAmpher}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="ตำบล/แขวง *"
                                                    required
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) =>
                                                option.TUMBOL_CODE === value?.TUMBOL_CODE
                                            }
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
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </TabPanel>

                    {/* Tab 3: บัญชีธนาคาร */}
                    <TabPanel value={tabValue} index={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                จัดการบัญชีธนาคาร
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenBankDialog()}
                            >
                                เพิ่มบัญชีธนาคาร
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {banksLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ธนาคาร</TableCell>
                                            <TableCell>เลขที่บัญชี</TableCell>
                                            <TableCell>สาขา</TableCell>
                                            <TableCell>ประเภท</TableCell>
                                            <TableCell align="right">จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookBanks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <Typography color="text.secondary">
                                                        ยังไม่มีข้อมูลบัญชีธนาคาร
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            bookBanks.map((bank) => (
                                                <TableRow key={`${bank.bank_code}-${bank.bank_no}`}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <AccountBalanceIcon color="primary" fontSize="small" />
                                                            <Typography>
                                                                {bank.bank_name || getBankName(bank.bank_code)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{bank.bank_no}</TableCell>
                                                    <TableCell>{bank.bank_branch || '-'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={bank.bank_type || '-'}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenBankDialog(bank)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteBank(bank.bank_code, bank.bank_no)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </TabPanel>
                </CardContent>
            </Card>

            {/* Dialog สำหรับเพิ่ม/แก้ไขบัญชีธนาคาร */}
            <Dialog open={openBankDialog} onClose={handleCloseBankDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingBank ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="เลือกธนาคาร *"
                                name="bankCode"
                                value={bankForm.bankCode}
                                onChange={handleBankFormChange}
                                disabled={editingBank !== null}
                            >
                                <MenuItem value="">-- เลือกธนาคาร --</MenuItem>
                                {banks.map((bank) => (
                                    <MenuItem key={bank.bank_code} value={bank.bank_code}>
                                        {bank.bank_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="เลขที่บัญชี *"
                                name="bankNo"
                                value={bankForm.bankNo}
                                onChange={handleBankFormChange}
                                disabled={editingBank !== null}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="สาขา"
                                name="bankBranch"
                                value={bankForm.bankBranch}
                                onChange={handleBankFormChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="ประเภทบัญชี"
                                name="bankType"
                                value={bankForm.bankType}
                                onChange={handleBankFormChange}
                            >
                                <MenuItem value="ออมทรัพย์">ออมทรัพย์</MenuItem>
                                <MenuItem value="ประจำ">ประจำ</MenuItem>
                                <MenuItem value="กระแสรายวัน">กระแสรายวัน</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBankDialog}>
                        ยกเลิก
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveBank}
                        disabled={loading || !bankForm.bankCode || !bankForm.bankNo}
                    >
                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;