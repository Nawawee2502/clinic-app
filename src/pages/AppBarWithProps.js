import * as React from 'react';
import { Grid, TextField, Button, MenuItem, Avatar, Typography, Box,Card,CardContent,Container,Divider } from "@mui/material";
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useNavigate } from 'react-router-dom';
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
import LoginPage from "./Login";
import Dashboard from '../components/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PatientRegistration from './Patientregistration';
import ตรวจรักษา from './ตรวจรักษา';
import Drugandmedical from './Drugandmedical';
import Financialandaccounting from './Financialandaccounting';
import Personnel from './Personnel';
import Report from './Report';
import Rightsmanagementsystem from './Rightsmanagementsystem';
import History from './History';
import Paymentanddispensingmedicine from './Paymentanddispensingmedicine';
import { Padding } from '@mui/icons-material';

const demoTheme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    '& .MuiToolbar-root': {
                        justifyContent: 'space-between',
                        '& .MuiTypography-root': {
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontWeight: 'bold',
                            color: 'black',
                            
                        },
                    },
                },
            },
        },
    },
});

function Restaurant() {
    const [pathname, setPathname] = React.useState('/Dashboard');
    const [currentTitle, setCurrentTitle] = React.useState('');
    const navigate = useNavigate();

    // ตัวอย่างเมนู
    const NAVIGATION = [
        
        {
            segment: 'Dashboard',
            title: 'Dashboard',
            icon: <BarChartIcon sx={{ color: 'white' }}/>,
        },
        {
            segment: 'PatientRegistration',
            title: 'ลงทะเบียนผู้ป่วย',
            icon: <AddCardIcon />,
        },
        {
            segment: 'History',
            title: 'ซักประวิติ',
            icon: <AssignmentTurnedInIcon />,
        },
        {
            segment: 'checkandtreat',
            title: 'ตรวจรักษา',
            icon: <MoveToInboxIcon />,
        },
        {
            segment: 'Laboratoryexaminationsystem',
            title: 'ระบบห้องตรวจปฏิบัติการ',
            icon: <ScienceIcon/>, // ไอคอนใหม่
        },
        {
            kind: 'divider',
          },
        {
            segment: 'Paymentanddispensingmedicine',
            title: 'ชำาระเงิน/จ่ายยา',
            icon: <AccountBalanceIcon  sx={{ color: 'white' }}/>,
        },
        {
            segment: 'Personnel',
            title: 'ระบบบุคลากร',
            icon: <PeopleAltIcon/>,
        },
        {
            segment: 'Drugandmedical',
            title: 'ระบบคลังยา/เวชภัณฑ์',
            icon: <InsertDriveFileIcon />,
        },
        {
            segment: 'Financialandaccounting',
            title: 'ระบบการเงิน/บัญชี',
            icon: <PaymentIcon/>, // ไอคอนใหม่
        },
        {
            segment: 'Report',
            title: 'รายงานสำหรับผู้บริหาร',
            icon: <DescriptionIcon sx={{ color: 'white' }}/>,
        },
        {
            segment: 'Rightsmanagementsystem',
            title: 'ระบบจัดการสิทธิ',
            icon: <PersonOutlineIcon />,
        },
        {
            kind: 'divider',
            // icon: <Divider sx={{ bgcolor: '#BCD8FF', marginY: 1 }} /> 
          },
        {
            segment: 'Setting',
            title: 'การตั้งค่า',
            icon: <SettingsIcon />,
        },
        {
            segment: 'Logout',
            title: 'ออกจากระบบ',
            icon: <LogoutIcon/>, // ไอคอนใหม่
        },
       
    ];

    const handleDashboard = () => {
        navigate('/dashboard');
        setCurrentTitle('Dashboard');
    };

    const findMenuTitle = (path) => {
        const segment = path.substring(1);
        const mainMenu = NAVIGATION.find(item => item.segment === segment);
        return mainMenu ? mainMenu.title : 'Beginning Inventory'; // default
    };

    const renderContent = () => {
        switch (pathname) {
            case '/Dashboard':
                return <Dashboard />;
            case '/PatientRegistration':
                return <PatientRegistration />;
             case '/History':
                return <History />;
            case '/checkandtreat':
                return <ตรวจรักษา />;
            case '/Drugandmedical':
                return <Drugandmedical />;
            case '/Financialandaccounting':
                return <Financialandaccounting />;
            case '/Personnel':
                return <Personnel />;
            case '/Report':
                return <Report />;
            case '/Rightsmanagementsystem':
                return <Rightsmanagementsystem />;   
            case '/Paymentanddispensingmedicine':
                return <Paymentanddispensingmedicine />; 
            case "/Logout":
                navigate("/login"); 
                
            default:
                return null;
        }
    };

    const SidebarFooter = ({ mini }) => {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* <Button
                    variant="text"
                    startIcon={!mini && <ArrowBackIcon />}
                    onClick={() => {
                        navigate('/dashboard');
                        setCurrentTitle('Dashboard');
                    }}
                    sx={{
                        minWidth: 0,
                        p: mini ? 1 : 2,
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                    }}
                >
                    {mini ? <ArrowBackIcon /> : 'Back to Dashboard'}
                </Button> */}
            </Box>
        );
        
    };

    SidebarFooter.propTypes = {
        mini: PropTypes.bool.isRequired,
    };

    const router = React.useMemo(() => ({
        pathname,
        searchParams: new URLSearchParams(),
        navigate: (path) => {
            setPathname(String(path));
            setCurrentTitle(findMenuTitle(String(path)));
        },
    }), [pathname]);

    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={demoTheme}
            branding={{
                logo: (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <img
                            src="/logo1.png"
                            alt="Logo 1"
                            style={{ width: '52.78px', height: '36' }}
                        />
                        <img
                            src="/logo2.png"
                            alt="Logo 2"
                            style={{ width: '190.55 px', height: '20px' }}
                        /> */}
                       
                        <NotificationsIcon sx={{ color: '#5BA9FF', fontSize: 28, cursor: 'pointer', ml: 190, mr: 2 }} />
                        <Avatar
                            alt="User Avatar"
                            src="https://via.placeholder.com/150"
                            sx={{ width: 40, height: 40, margin: "0 auto",marginRight:'10px' }}
                            
                        />
                       <h sx={{ color: '#5BA9FF',fontFamily: 'Poppins, sans-serif', fontSize: 16, display: 'block' ,mr: 2  }}>
                        Abu Fahim
                        <br />
                        hello@fahim.com
                        </h>
                        <Button sx={{bgcolor:'#5BA9FF',marginLeft:'25px',width:'40px', height: '50px',borderRadius:'15px' }}>
                        <MoreHorizIcon sx={{color:'#FFFFFF', }}/>
                        </Button>
                    </Box>
                ),
                // title: currentTitle,
                title: '',
                
                
            }}
            
        >

            <DashboardLayout defaultSidebarCollapsed slots={{ sidebarFooter: SidebarFooter }}
             sx={{
                '& .Mui-selected': {
                background: 'linear-gradient(60deg, #5BA9FF, #BCD8FF)', // สีเมื่อเลือก
                  color: 'black', // สีตัวหนังสือเมื่อเลือก
                }
              }}
            >
                
                {renderContent()}
            </DashboardLayout>
        </AppProvider>
    );
}

export default Restaurant;
