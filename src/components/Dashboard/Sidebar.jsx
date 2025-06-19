// src/components/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
    const [openMenus, setOpenMenus] = React.useState({
        'ลงทะเบียนผู้ป่วย': false,
        'ตรวจรักษา': false,
        'ระบบห้องตรวจคลินิกการ': false,
        'ย้ายเตียง /ย้ายยา': false,
        'ระบบบุคลากร': false,
        'ระบบส่งต่อก/เวชภัณฑ์': false,
        'ระบบการเงิน/บัญชี': false,
        'รายงานสำหรับผู้บริหาร': false,
        'ระบบการจัดการสิทธิ': false,
    });

    const handleMenuClick = (menuName) => {
        setActiveMenu(menuName);
    };

    const handleSubMenuToggle = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    // เมนูและไอคอน
    const menuItems = [
        { name: 'Dashboard', icon: <DashboardIcon />, hasSubmenu: false },
        { name: 'ลงทะเบียนผู้ป่วย', icon: <AssignmentIcon />, hasSubmenu: true },
        { name: 'ตรวจรักษา', icon: <MedicalServicesIcon />, hasSubmenu: true },
        { name: 'ระบบห้องตรวจคลินิกการ', icon: <MedicalServicesIcon />, hasSubmenu: true },
        { name: 'ย้ายเตียง /ย้ายยา', icon: <HomeIcon />, hasSubmenu: true },
        { name: 'ระบบบุคลากร', icon: <PeopleIcon />, hasSubmenu: true },
        { name: 'ระบบส่งต่อก/เวชภัณฑ์', icon: <MedicalServicesIcon />, hasSubmenu: true },
        { name: 'ระบบการเงิน/บัญชี', icon: <ReceiptIcon />, hasSubmenu: true },
        { name: 'รายงานสำหรับผู้บริหาร', icon: <DescriptionIcon />, hasSubmenu: true },
        { name: 'ระบบการจัดการสิทธิ', icon: <AdminPanelSettingsIcon />, hasSubmenu: true },
        { name: 'การตั้งค่า', icon: <SettingsIcon />, hasSubmenu: false },
        { name: 'ออกจากระบบ', icon: <LogoutIcon />, hasSubmenu: false },
    ];

    return (
        <Box
            sx={{
                width: 240,
                bgcolor: '#f8f9fa',
                height: '100vh',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    mb: 2
                }}
            >
                <img
                    src="/path-to-your-logo.png"
                    alt="Health Clinic"
                    style={{ width: 60, height: 60 }}
                />
                <Typography
                    sx={{
                        fontWeight: 'bold',
                        color: '#4285F4',
                        mt: 1,
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}
                >
                    หมอดีคลินิก
                </Typography>
                <Typography
                    sx={{
                        color: '#4285F4',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                    }}
                >
                    HEALTH CLINIC
                </Typography>
            </Box>

            {/* Menu Items */}
            <List sx={{ width: '100%', px: 1 }}>
                {menuItems.map((item) => (
                    <React.Fragment key={item.name}>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => item.hasSubmenu
                                    ? handleSubMenuToggle(item.name)
                                    : handleMenuClick(item.name)
                                }
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    bgcolor: activeMenu === item.name ? '#4285F4' : 'transparent',
                                    color: activeMenu === item.name ? 'white' : 'inherit',
                                    '&:hover': {
                                        bgcolor: activeMenu === item.name ? '#4285F4' : 'rgba(66, 133, 244, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 40,
                                    color: activeMenu === item.name ? 'white' : '#4285F4'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        fontSize: '0.85rem',
                                        fontWeight: activeMenu === item.name ? 'bold' : 'normal'
                                    }}
                                />
                                {item.hasSubmenu && (
                                    openMenus[item.name] ?
                                        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> :
                                        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                                )}
                            </ListItemButton>
                        </ListItem>

                        {/* Submenu Collapse (เพิ่มเติมตามต้องการ) */}
                        {item.hasSubmenu && (
                            <Collapse in={openMenus[item.name]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding sx={{ pl: 2 }}>
                                    {/* ตัวอย่างเมนูย่อย - สามารถปรับแต่งตามต้องการ */}
                                    <ListItemButton
                                        sx={{
                                            pl: 4,
                                            borderRadius: 1,
                                            mb: 0.5,
                                            '&:hover': {
                                                bgcolor: 'rgba(66, 133, 244, 0.08)',
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary="ตัวเลือกย่อย 1"
                                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                                        />
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{
                                            pl: 4,
                                            borderRadius: 1,
                                            mb: 0.5,
                                            '&:hover': {
                                                bgcolor: 'rgba(66, 133, 244, 0.08)',
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary="ตัวเลือกย่อย 2"
                                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                                        />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;