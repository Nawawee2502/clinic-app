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
    TableRow
} from '@mui/material';
import ClinicOrgService from '../services/clinicOrgService';
import AuthService from '../services/authService';
import BankService from '../services/bankService';
import BookBankService from '../services/bookBankService';
import RoleService from '../services/roleService';
import BalCashService from '../services/balCashService';
import BalBankService from '../services/balBankService';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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

    // Role Data
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({ roleName: '' });
    const [roleActionLoading, setRoleActionLoading] = useState(false);

    // BAL_CASH Data
    const [balCashRecords, setBalCashRecords] = useState([]);
    const [balCashLoading, setBalCashLoading] = useState(false);
    const [balCashForm, setBalCashForm] = useState({
        RDATE: new Date().toISOString().split('T')[0],
        AMT: ''
    });

    // BAL_BANK Data
    const [balBankRecords, setBalBankRecords] = useState([]);
    const [balBankLoading, setBalBankLoading] = useState(false);
    const [balBankForm, setBalBankForm] = useState({
        RDATE: new Date().toISOString().split('T')[0],
        AMT: '',
        BANK_NO: ''
    });

    // โหลด provinces และ orgData เมื่อ component mount (ครั้งเดียว)
    useEffect(() => {
        const initializeData = async () => {
            try {
                // โหลดจังหวัดก่อน
                const provincesData = await loadProvinces();

                // เมื่อโหลดจังหวัดเสร็จแล้ว ค่อยโหลดข้อมูลองค์กร
                // รอสักครู่เพื่อให้ provinces state อัปเดต
                if (provincesData && provincesData.length > 0) {
                    // รอให้ state อัปเดตก่อน
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await loadOrganizationData(provincesData);
                } else {
                    // ถ้าโหลดจังหวัดไม่สำเร็จ ก็ลองโหลดข้อมูลองค์กรดู
                    await loadOrganizationData();
                }
            } catch (error) {
                console.error('Error initializing data:', error);
                setError('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
            }
        };

        initializeData();
    }, []); // เรียกครั้งเดียวเมื่อ component mount

    // โหลดข้อมูลตาม tab ที่เลือก
    useEffect(() => {
        if (tabValue === 1) {
            loadRoles();
        }
        if (tabValue === 2) {
            loadUsers();
        }
        if (tabValue === 3) {
            loadBalCash();
        }
        if (tabValue === 4) {
            loadBanks();
            loadBookBanks();
        }
        if (tabValue === 5) {
            loadBalBank();
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
                return result.data; // return data ที่โหลดมา
            }
            return null;
        } catch (error) {
            console.error('Error loading provinces:', error);
            return null;
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

    const loadOrganizationData = async (provincesData = null) => {
        try {
            setLoading(true);
            setError('');

            const response = await ClinicOrgService.getClinicOrg();
            if (response.success) {
                const data = response.data;

                // ตั้งค่า orgData
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

                // ✅ โหลดข้อมูลที่อยู่และตั้งค่า dropdown ตามลำดับ
                if (data.PROVINCE_CODE) {
                    // ใช้ provincesData ที่ส่งมา หรือใช้ state (ต้องรอให้ state อัปเดต)
                    let provincesList = provincesData;
                    if (!provincesList || provincesList.length === 0) {
                        // ถ้าไม่มี provincesData ลองใช้ state
                        provincesList = provinces;
                    }

                    // ถ้ายังไม่มี ให้โหลดใหม่
                    if (!provincesList || provincesList.length === 0) {
                        const provincesResult = await loadProvinces();
                        provincesList = provincesResult || [];
                    }

                    // หาจังหวัดที่ตรงกับ code (เพื่อตั้งค่า selectedProvince สำหรับ state)
                    if (provincesList && provincesList.length > 0) {
                        const province = provincesList.find(p => p.PROVINCE_CODE === data.PROVINCE_CODE);
                        if (province) {
                            setSelectedProvince(province);

                            // โหลดอำเภอตามจังหวัด (โหลดเสมอถ้ามีจังหวัด)
                            try {
                                const amphersResponse = await fetch(`${API_BASE_URL}/amphers/province/${data.PROVINCE_CODE}`);
                                const amphersResult = await amphersResponse.json();

                                if (amphersResult.success && amphersResult.data) {
                                    setAmphers(amphersResult.data);

                                    // ถ้ามีอำเภอในข้อมูล ให้หาอำเภอที่ตรงกับ code
                                    if (data.AMPHER_CODE) {
                                        const ampher = amphersResult.data.find(a => a.AMPHER_CODE === data.AMPHER_CODE);
                                        if (ampher) {
                                            setSelectedAmpher(ampher);

                                            // โหลดตำบลตามอำเภอ (โหลดเสมอถ้ามีอำเภอ)
                                            try {
                                                const tumbolsResponse = await fetch(`${API_BASE_URL}/tumbols/ampher/${data.AMPHER_CODE}`);
                                                const tumbolsResult = await tumbolsResponse.json();

                                                if (tumbolsResult.success && tumbolsResult.data) {
                                                    setTumbols(tumbolsResult.data);

                                                    // ถ้ามีตำบลในข้อมูล ให้หาตำบลที่ตรงกับ code
                                                    if (data.TUMBOL_CODE) {
                                                        const tumbol = tumbolsResult.data.find(t => t.TUMBOL_CODE === data.TUMBOL_CODE);
                                                        if (tumbol) {
                                                            setSelectedTumbol(tumbol);
                                                        }
                                                    }
                                                }
                                            } catch (tumbolsError) {
                                                console.error('Error loading tumbols:', tumbolsError);
                                            }
                                        }
                                    }
                                }
                            } catch (amphersError) {
                                console.error('Error loading amphers:', amphersError);
                            }
                        } else {
                            console.warn('Province not found:', data.PROVINCE_CODE);
                        }
                    }
                }
            } else {
                setError('ไม่สามารถโหลดข้อมูลองค์กรได้');
            }
        } catch (error) {
            console.error('Error loading org data:', error);
            setError('ไม่สามารถโหลดข้อมูลองค์กรได้: ' + (error.message || 'เกิดข้อผิดพลาด'));
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

    const loadRoles = async () => {
        try {
            setRolesLoading(true);
            const response = await RoleService.getAllRoles();
            if (response.success) {
                setRoles(Array.isArray(response.data) ? response.data : []);
            } else {
                setError(response.message || 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            setError(error.message || 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
        } finally {
            setRolesLoading(false);
        }
    };

    const handleOrgChange = (e) => {
        setOrgData({
            ...orgData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Handle การเปลี่ยนจังหวัด (เปลี่ยนเป็น dropdown)
    const handleProvinceChange = (event) => {
        const provinceCode = event.target.value;
        const province = provinces.find(p => p.PROVINCE_CODE === provinceCode);

        setSelectedProvince(province || null);
        setSelectedAmpher(null);
        setSelectedTumbol(null);
        setAmphers([]);
        setTumbols([]);

        setOrgData({
            ...orgData,
            provinceCode: provinceCode || '',
            ampherCode: '',
            tumbolCode: '',
            zipcode: ''
        });

        if (provinceCode) {
            loadAmphersByProvince(provinceCode);
        }
    };

    // ✅ Handle การเปลี่ยนอำเภอ (เปลี่ยนเป็น dropdown)
    const handleAmpherChange = (event) => {
        const ampherCode = event.target.value;
        const ampher = amphers.find(a => a.AMPHER_CODE === ampherCode);

        setSelectedAmpher(ampher || null);
        setSelectedTumbol(null);
        setTumbols([]);

        setOrgData({
            ...orgData,
            ampherCode: ampherCode || '',
            tumbolCode: '',
            zipcode: ''
        });

        if (ampherCode) {
            loadTumbolsByAmpher(ampherCode);
        }
    };

    // ✅ Handle การเปลี่ยนตำบล (เปลี่ยนเป็น dropdown)
    const handleTumbolChange = (event) => {
        const tumbolCode = event.target.value;
        const tumbol = tumbols.find(t => t.TUMBOL_CODE === tumbolCode);

        setSelectedTumbol(tumbol || null);

        // ดึง zipcode จาก tumbol (รองรับทั้ง lowercase และ uppercase)
        const zipcodeValue = tumbol
            ? (tumbol.zipcode || tumbol.ZIPCODE || '')
            : '';

        setOrgData({
            ...orgData,
            tumbolCode: tumbolCode || '',
            zipcode: zipcodeValue || orgData.zipcode
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

    // Role dialog functions
    const handleOpenRoleDialog = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({ roleName: role.roleName || '' });
        } else {
            setEditingRole(null);
            setRoleForm({ roleName: '' });
        }
        setOpenRoleDialog(true);
    };

    const handleCloseRoleDialog = () => {
        setOpenRoleDialog(false);
        setEditingRole(null);
        setRoleForm({ roleName: '' });
        setRoleActionLoading(false);
    };

    const handleRoleFormChange = (event) => {
        setRoleForm({
            ...roleForm,
            [event.target.name]: event.target.value
        });
    };

    const handleSaveRole = async () => {
        const name = roleForm.roleName?.trim();

        if (!name) {
            setError('กรุณาระบุชื่อสิทธิ์');
            return;
        }

        try {
            setRoleActionLoading(true);
            setError('');
            setSuccess('');

            if (editingRole) {
                await RoleService.updateRole(editingRole.roleCode, { roleName: name });
                setSuccess('แก้ไขสิทธิ์สำเร็จ');
            } else {
                await RoleService.createRole({ roleName: name });
                setSuccess('สร้างสิทธิ์สำเร็จ');
            }

            await loadRoles();
            handleCloseRoleDialog();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์');
        } finally {
            setRoleActionLoading(false);
        }
    };

    const handleDeleteRole = async (roleCode) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสิทธิ์นี้?')) {
            return;
        }

        try {
            setRoleActionLoading(true);
            setError('');
            setSuccess('');

            await RoleService.deleteRole(roleCode);
            setSuccess('ลบสิทธิ์สำเร็จ');
            await loadRoles();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการลบสิทธิ์');
        } finally {
            setRoleActionLoading(false);
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
        const matchedRole = roles.find((item) => item.roleCode === role);
        if (matchedRole) {
            return matchedRole.roleName;
        }
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

    // BAL_CASH Functions
    const loadBalCash = async () => {
        try {
            setBalCashLoading(true);
            const currentYear = new Date().getFullYear();
            const response = await BalCashService.getAllBalCash({ year: currentYear });
            if (response.success) {
                setBalCashRecords(response.data);
            }
        } catch (error) {
            console.error('Error loading BAL_CASH:', error);
            setError('ไม่สามารถโหลดข้อมูลยอดยกมาเงินสดได้');
        } finally {
            setBalCashLoading(false);
        }
    };

    const handleSaveBalCash = async () => {
        if (!balCashForm.RDATE || !balCashForm.AMT) {
            setError('กรุณากรอกวันที่และจำนวนเงิน');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await BalCashService.createOrUpdateBalCash({
                RDATE: balCashForm.RDATE,
                AMT: parseFloat(balCashForm.AMT)
            });

            setSuccess('บันทึกยอดยกมาเงินสดและยอดยกไปสำเร็จ');
            setBalCashForm({
                RDATE: new Date().toISOString().split('T')[0],
                AMT: ''
            });
            await loadBalCash();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกยอดยกมาเงินสด');
        } finally {
            setLoading(false);
        }
    };

    // BAL_BANK Functions
    const loadBalBank = async () => {
        try {
            setBalBankLoading(true);
            const currentYear = new Date().getFullYear();
            const response = await BalBankService.getAllBalBank({ year: currentYear });
            if (response.success) {
                setBalBankRecords(response.data);
            }
        } catch (error) {
            console.error('Error loading BAL_BANK:', error);
            setError('ไม่สามารถโหลดข้อมูลยอดยกมาเงินฝากธนาคารได้');
        } finally {
            setBalBankLoading(false);
        }
    };

    const handleSaveBalBank = async () => {
        if (!balBankForm.RDATE || !balBankForm.AMT || !balBankForm.BANK_NO) {
            setError('กรุณากรอกวันที่ จำนวนเงิน และเลขบัญชี');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await BalBankService.createOrUpdateBalBank({
                RDATE: balBankForm.RDATE,
                AMT: parseFloat(balBankForm.AMT),
                BANK_NO: balBankForm.BANK_NO
            });

            setSuccess('บันทึกยอดยกมาเงินฝากธนาคารและยอดยกไปสำเร็จ');
            setBalBankForm({
                RDATE: new Date().toISOString().split('T')[0],
                AMT: '',
                BANK_NO: ''
            });
            await loadBalBank();
        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกยอดยกมาเงินฝากธนาคาร');
        } finally {
            setLoading(false);
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
                            icon={<AdminPanelSettingsIcon />}
                            label="การจัดการสิทธิ์"
                            iconPosition="start"
                            disabled={!isAdmin}
                        />
                        <Tab
                            icon={<PeopleIcon />}
                            label="กำหนดผู้ใช้งาน"
                            iconPosition="start"
                            disabled={!isAdmin}
                        />
                        <Tab
                            icon={<AccountBalanceIcon />}
                            label="กำหนดเงินสดประจำวัน"
                            iconPosition="start"
                            disabled={!isAdmin}
                        />
                        <Tab
                            icon={<AccountBalanceIcon />}
                            label="บัญชีธนาคาร"
                            iconPosition="start"
                            disabled={!isAdmin}
                        />
                        <Tab
                            icon={<AccountBalanceIcon />}
                            label="กำหนดเงินฝากธนาคารประจำวัน"
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

                                    {/* ✅ Dropdown สำหรับเลือกจังหวัด อำเภอ ตำบล */}
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="จังหวัด *"
                                            name="provinceCode"
                                            value={orgData.provinceCode || ''}
                                            onChange={handleProvinceChange}
                                            disabled={!isAdmin || loading || provinces.length === 0}
                                            required
                                        >
                                            <MenuItem value="">
                                                <em>-- เลือกจังหวัด --</em>
                                            </MenuItem>
                                            {provinces.map((province) => (
                                                <MenuItem key={province.PROVINCE_CODE} value={province.PROVINCE_CODE}>
                                                    {province.PROVINCE_NAME}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="อำเภอ/เขต *"
                                            name="ampherCode"
                                            value={orgData.ampherCode || ''}
                                            onChange={handleAmpherChange}
                                            disabled={!isAdmin || !selectedProvince || loading || amphers.length === 0}
                                            required
                                        >
                                            <MenuItem value="">
                                                <em>-- เลือกอำเภอ/เขต --</em>
                                            </MenuItem>
                                            {amphers.map((ampher) => (
                                                <MenuItem key={ampher.AMPHER_CODE} value={ampher.AMPHER_CODE}>
                                                    {ampher.AMPHER_NAME}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="ตำบล/แขวง *"
                                            name="tumbolCode"
                                            value={orgData.tumbolCode || ''}
                                            onChange={handleTumbolChange}
                                            disabled={!isAdmin || !selectedAmpher || loading || tumbols.length === 0}
                                            required
                                        >
                                            <MenuItem value="">
                                                <em>-- เลือกตำบล/แขวง --</em>
                                            </MenuItem>
                                            {tumbols.map((tumbol) => (
                                                <MenuItem key={tumbol.TUMBOL_CODE} value={tumbol.TUMBOL_CODE}>
                                                    {tumbol.TUMBOL_NAME}
                                                </MenuItem>
                                            ))}
                                        </TextField>
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
                    <TabPanel value={tabValue} index={2}>
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

                    {/* Tab 3: กำหนดเงินสดประจำวัน */}
                    <TabPanel value={tabValue} index={3}>
                        <Typography variant="h6" gutterBottom>
                            กำหนดยอดยกมาเงินสดประจำวัน
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="วันที่ *"
                                    type="date"
                                    value={balCashForm.RDATE}
                                    onChange={(e) => setBalCashForm({ ...balCashForm, RDATE: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="จำนวนเงิน (บาท) *"
                                    type="number"
                                    value={balCashForm.AMT}
                                    onChange={(e) => setBalCashForm({ ...balCashForm, AMT: e.target.value })}
                                    disabled={loading}
                                    inputProps={{ step: '0.01', min: '0' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveBalCash}
                                    disabled={loading || !balCashForm.RDATE || !balCashForm.AMT}
                                    sx={{ height: '56px' }}
                                >
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกยอดยกมา'}
                                </Button>
                            </Grid>
                        </Grid>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            * เมื่อบันทึกยอดยกมา ระบบจะทำยอดยกไปให้อัตโนมัติจนถึงวันที่ 31 ธันวาคม
                        </Typography>

                        {balCashLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>วันที่</TableCell>
                                            <TableCell align="right">ยอดยกมา (บาท)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {balCashRecords.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    <Typography color="text.secondary">
                                                        ยังไม่มีข้อมูลยอดยกมาเงินสด
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            balCashRecords.slice(0, 30).map((record) => (
                                                <TableRow key={record.RDATE}>
                                                    <TableCell>
                                                        {new Date(record.RDATE).toLocaleDateString('th-TH')}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {new Intl.NumberFormat('th-TH', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format(record.AMT || 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </TabPanel>

                    {/* Tab 4: บัญชีธนาคาร */}
                    <TabPanel value={tabValue} index={4}>
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

                    {/* Tab 5: กำหนดเงินฝากธนาคารประจำวัน */}
                    <TabPanel value={tabValue} index={5}>
                        <Typography variant="h6" gutterBottom>
                            กำหนดยอดยกมาเงินฝากธนาคารประจำวัน
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="วันที่ *"
                                    type="date"
                                    value={balBankForm.RDATE}
                                    onChange={(e) => setBalBankForm({ ...balBankForm, RDATE: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="เลขบัญชี *"
                                    value={balBankForm.BANK_NO}
                                    onChange={(e) => setBalBankForm({ ...balBankForm, BANK_NO: e.target.value })}
                                    disabled={loading}
                                >
                                    <MenuItem value="">-- เลือกบัญชี --</MenuItem>
                                    {bookBanks.map((bank) => (
                                        <MenuItem key={`${bank.bank_code}-${bank.bank_no}`} value={bank.bank_no}>
                                            {bank.bank_no} - {bank.bank_name || getBankName(bank.bank_code)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="จำนวนเงิน (บาท) *"
                                    type="number"
                                    value={balBankForm.AMT}
                                    onChange={(e) => setBalBankForm({ ...balBankForm, AMT: e.target.value })}
                                    disabled={loading}
                                    inputProps={{ step: '0.01', min: '0' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveBalBank}
                                    disabled={loading || !balBankForm.RDATE || !balBankForm.AMT || !balBankForm.BANK_NO}
                                    sx={{ height: '56px' }}
                                >
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกยอดยกมา'}
                                </Button>
                            </Grid>
                        </Grid>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            * เมื่อบันทึกยอดยกมา ระบบจะทำยอดยกไปให้อัตโนมัติจนถึงวันที่ 31 ธันวาคม
                        </Typography>

                        {balBankLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>วันที่</TableCell>
                                            <TableCell>เลขบัญชี</TableCell>
                                            <TableCell align="right">ยอดยกมา (บาท)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {balBankRecords.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    <Typography color="text.secondary">
                                                        ยังไม่มีข้อมูลยอดยกมาเงินฝากธนาคาร
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            balBankRecords.slice(0, 30).map((record) => (
                                                <TableRow key={`${record.RDATE}-${record.BANK_NO}`}>
                                                    <TableCell>
                                                        {new Date(record.RDATE).toLocaleDateString('th-TH')}
                                                    </TableCell>
                                                    <TableCell>{record.BANK_NO}</TableCell>
                                                    <TableCell align="right">
                                                        {new Intl.NumberFormat('th-TH', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format(record.AMT || 0)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </TabPanel>

                    {/* Tab 1: การจัดการสิทธิ์ */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                จัดการสิทธิ์การใช้งาน
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenRoleDialog()}
                                disabled={roleActionLoading}
                            >
                                เพิ่มสิทธิ์ใหม่
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {rolesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>รหัสสิทธิ์</TableCell>
                                            <TableCell>ชื่อสิทธิ์</TableCell>
                                            <TableCell>ปรับปรุงล่าสุด</TableCell>
                                            <TableCell align="right">จัดการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {roles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    <Typography color="text.secondary">
                                                        ยังไม่มีการกำหนดสิทธิ์ในระบบ
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            roles.map((role) => (
                                                <TableRow key={role.roleCode}>
                                                    <TableCell>
                                                        <Typography fontWeight="600">{role.roleCode}</Typography>
                                                    </TableCell>
                                                    <TableCell>{role.roleName}</TableCell>
                                                    <TableCell>
                                                        {role.updatedAt
                                                            ? new Date(role.updatedAt).toLocaleString('th-TH')
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenRoleDialog(role)}
                                                            sx={{ mr: 1 }}
                                                            disabled={roleActionLoading}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteRole(role.roleCode)}
                                                            disabled={roleActionLoading}
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

            {/* Dialog สำหรับเพิ่ม/แก้ไขสิทธิ์ */}
            <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {editingRole ? 'แก้ไขสิทธิ์' : 'เพิ่มสิทธิ์ใหม่'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {editingRole && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="รหัสสิทธิ์"
                                    value={editingRole.roleCode}
                                    disabled
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="ชื่อสิทธิ์ *"
                                name="roleName"
                                value={roleForm.roleName}
                                onChange={handleRoleFormChange}
                                autoFocus={!editingRole}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRoleDialog} disabled={roleActionLoading}>
                        ยกเลิก
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveRole}
                        disabled={roleActionLoading || !roleForm.roleName?.trim()}
                    >
                        {roleActionLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;