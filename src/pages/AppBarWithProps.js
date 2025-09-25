// Fix for Clinic.jsx to address rendering issues
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
    Tooltip
} from "@mui/material";
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Remove unnecessary imports that might be causing errors
// import { AppProvider } from '@toolpad/core/AppProvider';
// import { DashboardLayout } from '@toolpad/core/DashboardLayout';
// import { Padding } from '@mui/icons-material';

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
                        alt={userName}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {userEmail}
                        </Typography>
                    </Box>
                </Box>

                {/* More Options */}
                <IconButton
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
            </Box>
        </Box>
    );
};

const CustomSidebar = ({ activeMenu, onMenuClick, isOpen }) => {
    // สำคัญ: แก้ไขเส้นทางให้ตรงกับ Router.js
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
        // {
        //     title: 'ระบบห้องตรวจปฏิบัติการ',
        //     path: '/clinic/laboratory',
        //     icon: <ScienceIcon />
        // },
        {
            title: 'ชำระเงิน /จ่ายยา',
            path: '/clinic/payment',
            icon: <Inventory2OutlinedIcon />
        },
        // {
        //     title: 'ระบบบุคลากร',
        //     path: '/clinic/personnel',
        //     icon: <PeopleAltIcon />
        // },
        // {
        //     title: 'ระบบคลังยา/เวชภัณฑ์',
        //     path: '/clinic/medicalstock',
        //     icon: <InsertDriveFileIcon />
        // },
        // {
        //     title: 'ระบบการเงิน/บัญชี',
        //     path: '/clinic/finance',
        //     icon: <PaymentIcon />
        // },
        {
            title: 'รายงาน',
            path: '/clinic/report',
            icon: <DescriptionIcon />
        },
        // {
        //     title: 'ระบบการจัดการสิทธิ',
        //     path: '/clinic/rights',
        //     icon: <SettingsIcon />
        // },
        {
            title: 'ข้อมูลผู้ป่วย',
            path: '/clinic/patients',
            icon: <PersonOutlineIcon />
        },
        {
            title: 'การตั้งค่า',
            path: '/clinic/settings',
            icon: <SettingsIcon />
        },
        {
            title: 'ออกจากระบบ',
            path: '/logout',
            icon: <LogoutIcon />
        }
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
                {menuItems.map((item, index) => (
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
                            position: 'relative',
                            // '&::after': (index >= 3 && index <= 9) ? {
                            //     content: '""',
                            //     position: 'absolute',
                            //     right: '16px',
                            //     width: '0',
                            //     height: '0',
                            //     borderLeft: '5px solid transparent',
                            //     borderRight: '5px solid transparent',
                            //     borderTop: activeMenu === item.path
                            //         ? '5px solid white'
                            //         : '5px solid rgba(0, 48, 143, 0.9)',
                            // } : {}
                        }}
                    >
                        {item.title}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

// AppBarWithProps component accepts children
const AppBarWithProps = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    // ใช้ pathname จาก location ของ react-router
    const pathname = location.pathname;

    // Toggle sidebar function
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMenuClick = (path) => {
        navigate(path); // ใช้ navigate ของ react-router-dom
    };

    return (
        <ThemeProvider theme={demoTheme}>
            <Box sx={{ display: 'flex' }}>
                {/* Custom Sidebar */}
                <CustomSidebar
                    activeMenu={pathname}
                    onMenuClick={handleMenuClick}
                    isOpen={sidebarOpen}
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