// Fix for Clinic.jsx with added submenus
import * as React from 'react';
import {
    Grid,
    TextField,
    Button,
    MenuItem,
    Avatar,
    Typography,
    Box,
    Card,
    CardContent,
    Container,
    Divider,
    IconButton,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    Collapse,
    List,
    ListItem
} from "@mui/material";
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import AddCardIcon from '@mui/icons-material/AddCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ScienceIcon from '@mui/icons-material/Science';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import TuneIcon from '@mui/icons-material/Tune';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircle from '@mui/icons-material/CheckCircle';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

// กำหนดธีมให้ตรงกับ Design
const demoTheme = createTheme({
    palette: {
        primary: {
            main: '#78B0F9',
        },
        secondary: {
            main: '#34A853',
        },
        background: {
            default: '#f9fafb',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'white',
                    color: 'black',
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#78B0F9',
                    borderRight: '1px solid #6ea1f7',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(26, 93, 180, 0.8)',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(26, 93, 180, 0.9)',
                        },
                        '& .MuiListItemIcon-root': {
                            color: 'white',
                        },
                    },
                },
            },
        },
    },
});

// คอมโพเนนต์ CustomAppBar 
const CustomAppBar = ({ userName = "Abu Fahim", userEmail = "hello@fahim.com", isSidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        navigate('/clinic/settings');
    };

    const handleLogout = () => {
        handleClose();
        dispatch(logout());
        navigate('/login');
    };

    const handleAdminUsers = () => {
        handleClose();
        navigate('/clinic/admin/users');
    };

    const displayName = user?.fullName || userName;
    const displayEmail = user?.email || userEmail;
    const isAdmin = user?.role === 'admin';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                px: 3,
                borderBottom: '1px solid #e0e0e0',
                bgcolor: 'white',
                position: 'fixed',
                left: isSidebarOpen ? '240px' : 0,
                right: 0,
                top: 0,
                zIndex: 1100,
                height: '64px',
                transition: 'left 0.3s'
            }}
        >
            {/* Left: Menu Button */}
            <IconButton
                onClick={toggleSidebar}
                sx={{ color: '#4285F4' }}
            >
                <MenuIcon />
            </IconButton>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Notifications */}
                <Tooltip title="Notifications">
                    <IconButton>
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon sx={{ color: '#4285F4' }} />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* User Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        alt={displayName}
                        sx={{ width: 36, height: 36, bgcolor: '#4285F4' }}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {displayEmail}
                        </Typography>
                    </Box>
                </Box>

                {/* More Options */}
                <Tooltip title="เมนู">
                    <IconButton
                        onClick={handleClick}
                        sx={{
                            bgcolor: '#4285F4',
                            color: 'white',
                            borderRadius: 2,
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: '#3b77db' }
                        }}
                    >
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            borderRadius: 2
                        }
                    }}
                >
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>โปรไฟล์</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => { handleClose(); navigate('/clinic/settings'); }}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>ตั้งค่า</ListItemText>
                    </MenuItem>

                    {isAdmin && (
                        <MenuItem onClick={handleAdminUsers}>
                            <ListItemIcon>
                                <ManageAccountsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>จัดการผู้ใช้</ListItemText>
                        </MenuItem>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>ออกจากระบบ</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

const CustomSidebar = ({ activeMenu, onMenuClick, isOpen, role }) => {
    const [openReport, setOpenReport] = React.useState(false);
    const [openMedicalStock, setOpenMedicalStock] = React.useState(false);
    const [openFinance, setOpenFinance] = React.useState(false);
    const [openUtilities, setOpenUtilities] = React.useState(false);

    const normalizedRole = (role || '').toString().trim().toLowerCase();
    const isStaffRole = role === 'เจ้าหน้าที่' || normalizedRole === 'staff' || normalizedRole === 'officer';

    const handleReportClick = () => {
        setOpenReport(!openReport);
    };

    const handleMedicalStockClick = () => {
        setOpenMedicalStock(!openMedicalStock);
    };

    const handleFinanceClick = () => {
        setOpenFinance(!openFinance);
    };

    const handleUtilitiesClick = () => {
        setOpenUtilities(!openUtilities);
    };

    // เมนูหลัก
    const menuItems = [
        {
            title: 'Dashboard',
            path: '/clinic/dashboard',
            icon: <DashboardIcon />
        },
        {
            title: 'ลงทะเบียนผู้ป่วย',
            path: '/clinic/patientregistration',
            icon: <AddCardIcon />
        },
        {
            title: 'ตรวจรักษา',
            path: '/clinic/treatment',
            icon: <MoveToInboxIcon />
        },
        {
            title: 'ชำระเงิน /จ่ายยา',
            path: '/clinic/payment',
            icon: <Inventory2OutlinedIcon />
        },
        {
            title: 'ข้อมูลผู้ป่วย',
            path: '/clinic/patients',
            icon: <PersonOutlineIcon />
        },
    ];

    const staffAllowedPaths = [
        '/clinic/patientregistration',
        '/clinic/patients'
    ];

    const visibleMenuItems = isStaffRole
        ? menuItems.filter((item) => staffAllowedPaths.includes(item.path))
        : menuItems;

    // เมนูย่อยสำหรับระบบคลังยา
    const medicalStockSubItems = [
        {
            title: 'กำหนดค่าเริ่มต้น',
            path: '/clinic/medicalstock/settings',
            icon: <TuneIcon />
        },
        {
            title: 'สต็อกยา',
            path: '/clinic/medicalstock/inventory',
            icon: <LocalPharmacyIcon />
        },
        {
            title: 'รายงาน',
            path: '/clinic/medicalstock/report',
            icon: <ReceiptLongIcon />
        },
    ];

    // เมนูย่อยสำหรับระบบการเงิน/บัญชี
    const financeSubItems = [
        {
            title: 'ประเภทรายรับรายจ่าย',
            path: '/clinic/finance/financetypes',
            icon: <AccountBalanceWalletIcon />
        },
        {
            title: 'รายจ่ายทั่วไป',
            path: '/clinic/finance/general-pay',
            icon: <ReceiptLongIcon />
        },
        {
            title: 'รายรับทั่วไป',
            path: '/clinic/finance/general-incomes',
            icon: <ReceiptLongIcon />
        },
        {
            title: 'ยืนยันผู้ป่วยบัตรทอง',
            path: '/clinic/finance/gold-confirmation',
            icon: <CheckCircle />
        }
    ];

    // เมนูย่อยสำหรับรายงาน
    const reportSubItems = [
        {
            title: 'รายงานประจำวัน',
            path: '/clinic/report/daily',
            icon: <TodayIcon />
        },
        {
            title: 'รายงานประจำเดือน',
            path: '/clinic/report/monthly',
            icon: <DateRangeIcon />
        },
        {
            title: 'รายงานประจำปี',
            path: '/clinic/report/yearly',
            icon: <EventIcon />
        },
    ];

    // เมนูย่อยสำหรับอรรถประโยชน์
    const utilitiesSubItems = [
        {
            title: 'ปิดประจำเดือน',
            path: '/clinic/utilities/monthly-closing',
            icon: <TodayIcon />
        },
        {
            title: 'Backup Data',
            path: '/clinic/utilities/backup',
            icon: <DateRangeIcon />
        },
    ];

    return (
        <Box
            sx={{
                width: isOpen ? 240 : 0,
                bgcolor: '#FFFFFF',
                height: '100vh',
                borderRight: '1px solid #E5E7FB',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                overflowY: 'auto',
                transition: 'width 0.3s',
                overflow: isOpen ? 'auto' : 'hidden',
                zIndex: 1200
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.2s',
                    borderBottom: '1px solid rgba(229, 231, 251, 0.5)'
                }}
            >
                <img
                    src='/logo5.png'
                    style={{
                        width: '174px',
                        height: '174px'
                    }}
                />
            </Box>

            {/* Menu Items */}
            <Box sx={{ flexGrow: 1, px: 1, opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
                {visibleMenuItems.map((item) => (
                    <Button
                        key={item.title}
                        startIcon={item.icon}
                        onClick={() => onMenuClick(item.path)}
                        sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            py: 1.5,
                            px: 2,
                            mb: 0.5,
                            borderRadius: 1,
                            width: '100%',
                            color: activeMenu === item.path ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                            bgcolor: activeMenu === item.path ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                            '&:hover': {
                                bgcolor: 'rgba(26, 93, 180, 0.5)',
                            },
                            '& .MuiButton-startIcon': {
                                color: activeMenu === item.path ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                marginRight: '12px'
                            },
                            fontWeight: activeMenu === item.path ? 'bold' : 'normal',
                        }}
                    >
                        {item.title}
                    </Button>
                ))}

                {!isStaffRole && (
                    <>
                        {/* เมนูระบบคลังยา/เวชภัณฑ์ พร้อมเมนูย่อย */}
                        <Box>
                            <Button
                                startIcon={<InsertDriveFileIcon />}
                                endIcon={openMedicalStock ? <ExpandLess /> : <ExpandMore />}
                                onClick={handleMedicalStockClick}
                                sx={{
                                    justifyContent: 'space-between',
                                    textAlign: 'left',
                                    py: 1.5,
                                    px: 2,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    width: '100%',
                                    color: activeMenu.startsWith('/clinic/medicalstock') ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                                    bgcolor: activeMenu.startsWith('/clinic/medicalstock') ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(26, 93, 180, 0.5)',
                                    },
                                    '& .MuiButton-startIcon': {
                                        color: activeMenu.startsWith('/clinic/medicalstock') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginRight: '12px'
                                    },
                                    '& .MuiButton-endIcon': {
                                        color: activeMenu.startsWith('/clinic/medicalstock') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginLeft: 'auto'
                                    },
                                    fontWeight: activeMenu.startsWith('/clinic/medicalstock') ? 'bold' : 'normal',
                                }}
                            >
                                <span>ระบบคลังยา/เวชภัณฑ์</span>
                            </Button>

                            <Collapse in={openMedicalStock} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {medicalStockSubItems.map((subItem) => (
                                        <Button
                                            key={subItem.title}
                                            startIcon={subItem.icon}
                                            onClick={() => onMenuClick(subItem.path)}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                py: 1,
                                                px: 2,
                                                pl: 4,
                                                mb: 0.5,
                                                borderRadius: 1,
                                                width: '100%',
                                                fontSize: '0.875rem',
                                                color: activeMenu === subItem.path ? '#fff' : 'rgba(53, 70, 105, 0.8)',
                                                bgcolor: activeMenu === subItem.path ? 'rgba(26, 93, 180, 0.7)' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'rgba(26, 93, 180, 0.4)',
                                                },
                                                '& .MuiButton-startIcon': {
                                                    color: activeMenu === subItem.path ? '#fff' : 'rgba(0, 48, 143, 0.7)',
                                                    marginRight: '8px'
                                                },
                                            }}
                                        >
                                            {subItem.title}
                                        </Button>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>

                        {/* เมนูระบบการเงิน/บัญชี พร้อมเมนูย่อย */}
                        <Box>
                            <Button
                                startIcon={<PaymentIcon />}
                                endIcon={openFinance ? <ExpandLess /> : <ExpandMore />}
                                onClick={handleFinanceClick}
                                sx={{
                                    justifyContent: 'space-between',
                                    textAlign: 'left',
                                    py: 1.5,
                                    px: 2,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    width: '100%',
                                    color: activeMenu.startsWith('/clinic/finance') ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                                    bgcolor: activeMenu.startsWith('/clinic/finance') ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(26, 93, 180, 0.5)',
                                    },
                                    '& .MuiButton-startIcon': {
                                        color: activeMenu.startsWith('/clinic/finance') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginRight: '12px'
                                    },
                                    '& .MuiButton-endIcon': {
                                        color: activeMenu.startsWith('/clinic/finance') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginLeft: 'auto'
                                    },
                                    fontWeight: activeMenu.startsWith('/clinic/finance') ? 'bold' : 'normal',
                                }}
                            >
                                <span>ระบบการเงิน/บัญชี</span>
                            </Button>

                            <Collapse in={openFinance} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {financeSubItems.map((subItem) => (
                                        <Button
                                            key={subItem.title}
                                            startIcon={subItem.icon}
                                            onClick={() => onMenuClick(subItem.path)}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                py: 1,
                                                px: 2,
                                                pl: 4,
                                                mb: 0.5,
                                                borderRadius: 1,
                                                width: '100%',
                                                fontSize: '0.875rem',
                                                color: activeMenu === subItem.path ? '#fff' : 'rgba(53, 70, 105, 0.8)',
                                                bgcolor: activeMenu === subItem.path ? 'rgba(26, 93, 180, 0.7)' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'rgba(26, 93, 180, 0.4)',
                                                },
                                                '& .MuiButton-startIcon': {
                                                    color: activeMenu === subItem.path ? '#fff' : 'rgba(0, 48, 143, 0.7)',
                                                    marginRight: '8px'
                                                },
                                            }}
                                        >
                                            {subItem.title}
                                        </Button>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>

                        {/* เมนูรายงาน พร้อมเมนูย่อย */}
                        <Box>
                            <Button
                                startIcon={<DescriptionIcon />}
                                endIcon={openReport ? <ExpandLess /> : <ExpandMore />}
                                onClick={handleReportClick}
                                sx={{
                                    justifyContent: 'space-between',
                                    textAlign: 'left',
                                    py: 1.5,
                                    px: 2,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    width: '100%',
                                    color: activeMenu.startsWith('/clinic/report') ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                                    bgcolor: activeMenu.startsWith('/clinic/report') ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(26, 93, 180, 0.5)',
                                    },
                                    '& .MuiButton-startIcon': {
                                        color: activeMenu.startsWith('/clinic/report') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginRight: '12px'
                                    },
                                    '& .MuiButton-endIcon': {
                                        color: activeMenu.startsWith('/clinic/report') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginLeft: 'auto'
                                    },
                                    fontWeight: activeMenu.startsWith('/clinic/report') ? 'bold' : 'normal',
                                }}
                            >
                                <span>รายงาน</span>
                            </Button>

                            <Collapse in={openReport} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {reportSubItems.map((subItem) => (
                                        <Button
                                            key={subItem.title}
                                            startIcon={subItem.icon}
                                            onClick={() => onMenuClick(subItem.path)}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                py: 1,
                                                px: 2,
                                                pl: 4,
                                                mb: 0.5,
                                                borderRadius: 1,
                                                width: '100%',
                                                fontSize: '0.875rem',
                                                color: activeMenu === subItem.path ? '#fff' : 'rgba(53, 70, 105, 0.8)',
                                                bgcolor: activeMenu === subItem.path ? 'rgba(26, 93, 180, 0.7)' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'rgba(26, 93, 180, 0.4)',
                                                },
                                                '& .MuiButton-startIcon': {
                                                    color: activeMenu === subItem.path ? '#fff' : 'rgba(0, 48, 143, 0.7)',
                                                    marginRight: '8px'
                                                },
                                            }}
                                        >
                                            {subItem.title}
                                        </Button>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>



                        {/* เมนูอรรถประโยชน์ พร้อมเมนูย่อย */}
                        <Box>
                            <Button
                                startIcon={<SettingsSuggestIcon />} // Changed icon to differentiate
                                endIcon={openUtilities ? <ExpandLess /> : <ExpandMore />}
                                onClick={handleUtilitiesClick}
                                sx={{
                                    justifyContent: 'space-between',
                                    textAlign: 'left',
                                    py: 1.5,
                                    px: 2,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    width: '100%',
                                    color: activeMenu.startsWith('/clinic/utilities') ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                                    bgcolor: activeMenu.startsWith('/clinic/utilities') ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(26, 93, 180, 0.5)',
                                    },
                                    '& .MuiButton-startIcon': {
                                        color: activeMenu.startsWith('/clinic/utilities') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginRight: '12px'
                                    },
                                    '& .MuiButton-endIcon': {
                                        color: activeMenu.startsWith('/clinic/utilities') ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                        marginLeft: 'auto'
                                    },
                                    fontWeight: activeMenu.startsWith('/clinic/utilities') ? 'bold' : 'normal',
                                }}
                            >
                                <span>อรรถประโยชน์</span>
                            </Button>

                            <Collapse in={openUtilities} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {utilitiesSubItems.map((subItem) => (
                                        <Button
                                            key={subItem.title}
                                            startIcon={subItem.icon}
                                            onClick={() => onMenuClick(subItem.path)}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                py: 1,
                                                px: 2,
                                                pl: 4,
                                                mb: 0.5,
                                                borderRadius: 1,
                                                width: '100%',
                                                fontSize: '0.875rem',
                                                color: activeMenu === subItem.path ? '#fff' : 'rgba(53, 70, 105, 0.8)',
                                                bgcolor: activeMenu === subItem.path ? 'rgba(26, 93, 180, 0.7)' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'rgba(26, 93, 180, 0.4)',
                                                },
                                                '& .MuiButton-startIcon': {
                                                    color: activeMenu === subItem.path ? '#fff' : 'rgba(0, 48, 143, 0.7)',
                                                    marginRight: '8px'
                                                },
                                            }}
                                        >
                                            {subItem.title}
                                        </Button>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>

                        {/* เมนูการตั้งค่า */}
                        <Button
                            startIcon={<SettingsIcon />}
                            onClick={() => onMenuClick('/clinic/settings')}
                            sx={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                py: 1.5,
                                px: 2,
                                mb: 0.5,
                                borderRadius: 1,
                                width: '100%',
                                color: activeMenu === '/clinic/settings' ? '#fff' : 'rgba(53, 70, 105, 0.9)',
                                bgcolor: activeMenu === '/clinic/settings' ? 'rgba(26, 93, 180, 0.8)' : 'transparent',
                                '&:hover': {
                                    bgcolor: 'rgba(26, 93, 180, 0.5)',
                                },
                                '& .MuiButton-startIcon': {
                                    color: activeMenu === '/clinic/settings' ? '#fff' : 'rgba(0, 48, 143, 0.9)',
                                    marginRight: '12px'
                                },
                                fontWeight: activeMenu === '/clinic/settings' ? 'bold' : 'normal',
                            }}
                        >
                            การตั้งค่า
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

// AppBarWithProps component accepts children
const AppBarWithProps = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const user = useSelector((state) => state.auth?.user);
    const userRole = user?.role || '';

    const pathname = location.pathname;

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <ThemeProvider theme={demoTheme}>
            <Box sx={{ display: 'flex' }}>
                {/* Custom Sidebar */}
                <CustomSidebar
                    activeMenu={pathname}
                    onMenuClick={handleMenuClick}
                    isOpen={sidebarOpen}
                    role={userRole}
                />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: '100%',
                        marginLeft: sidebarOpen ? '240px' : '0px',
                        paddingTop: '64px',
                        bgcolor: '#f9fafb',
                        minHeight: '100vh',
                        overflow: 'auto',
                        transition: 'margin-left 0.3s',
                    }}
                >
                    {/* Custom AppBar */}
                    <CustomAppBar
                        isSidebarOpen={sidebarOpen}
                        toggleSidebar={toggleSidebar}
                    />

                    {/* Page Content */}
                    <Box sx={{ p: 5 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

// Define PropTypes for AppBarWithProps
AppBarWithProps.propTypes = {
    children: PropTypes.node,
};

export { AppBarWithProps };
export default AppBarWithProps;