import * as React from 'react';
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab, Divider,Box,LinearProgress,FormGroup, } from "@mui/material";
import { DatePicker } from "@mui/lab";
import PropTypes from 'prop-types';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);


  const dates = [
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "17/12/2567", date: "2024-12-17" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
  ];

  const vitalsData = [
    { label: "Blood Pressure", value: 30, display: "141/90 mmHg" },
    { label: "Heart Rate", value: 30, display: "75 bpm" },
    { label: "Body Height", value: 30, display: "170 cm" },
    { label: "Body Weight", value: 30, display: "65 kg" },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex',  }} //height: 700
    >
      {/* <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <Tab label="Item One" {...a11yProps(0)} />
        <Tab label="Item Two" {...a11yProps(1)} />
        <Tab label="Item Three" {...a11yProps(2)} />
        <Tab label="Item Four" {...a11yProps(3)} />
        <Tab label="Item Five" {...a11yProps(4)} />
        <Tab label="Item Six" {...a11yProps(5)} />
        <Tab label="Item Seven" {...a11yProps(6)} />
      </Tabs> */}
      
      <Box sx={{ textAlign: "center", fontSize: "12px", mt: 2, pb: 1,width:150 }}>
  <Typography variant="h6" sx={{fontSize: "16px", fontWeight: "200", color: "black" }}>
    วันที่เข้ารับการรักษา
  </Typography>
  <Divider sx={{ mt: 1, mb: 2 }} />
</Box>

<Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider",pt:10, '& .Mui-selected': {
          background: 'linear-gradient(60deg, #FFFFFF, #FFFFFF)', // สีเมื่อเลือก
            color: 'primary', // สีตัวหนังสือเมื่อเลือก
          } }}
      >

        {dates.map((item, index) => (
          <Tab key={index} label={item.title} />
        ))}
      </Tabs>

      <TabPanel value={value} index={0}>
      <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Grid container spacing={2}>

        {/* Patient Profile Section (Left) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ textAlign: "center", p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              
              {/* Profile Picture */}
              <Grid item xs={12} sm={4} textAlign="center">
                <Avatar
                  src="/path/to/image.jpg"
                  sx={{ width: 130, height: 130, mx: "auto" }}
                />
              </Grid>

              {/* Patient Information */}
              <Grid item xs={12} sm={10} sx={{ textAlign: "left", pl: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  ชื่อ: นามสกุล:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  อายุ:
                </Typography>
              </Grid>

            </Grid>
          </Card>

          {/* Divider */}
          <Divider sx={{ pt: 2 }} />

<Grid container spacing={2} sx={{ mt: 1 }}>
  {vitalsData.map((item, index) => (
    <Grid item xs={12} sm={6} key={index}>
      <Card
        sx={{
          textAlign: "left",
          height: 150,
          bgcolor: "#F0F5FF",
          pt: "10px",
          pl: 2,
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          {item.label}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
          {item.value}%
        </Typography>
        <Box sx={{ mt: 2, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={item.value}
            sx={{ width: 230, height: 8, borderRadius: 4 ,bgcolor:'#E0E0E0',"& .MuiLinearProgress-bar": {backgroundColor: "#5698E0", },}}
          />
        </Box>
        <Typography variant="body1" fontWeight="bold">
          {item.display}
        </Typography>
      </Card>
    </Grid>
  ))}
</Grid>
        </Grid>

        {/* Vitals Form Section (Right) */}
        <Grid item xs={12} md={4} >
          <Card sx={{ textAlign: "center", p: 2 ,width:'550px',height:'350px'}}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Vitals Form
              </Typography>
              {/* เพิ่มฟอร์ม หรือปุ่ม */}
            </CardContent>
          </Card>
         <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
  <Grid item xs={6} md={4}>
    <Card sx={{ textAlign: "center", p: 1, width: "180px", height: "190px" }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold"  sx={{fontWeight:600,fontSize:'16px',textAlign:'left'}}>ECG Report</Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={6} md={4}>
    <Card sx={{ textAlign: "center", p: 1, width: "180px", height: "190px",ml:8 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold"  sx={{fontWeight:600,fontSize:'16px',textAlign:'left'}}>Blood Report</Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={6} md={4}>
    <Card sx={{ textAlign: "center", p: 1, width: "180px", height: "190px" ,ml:16}}>
      <CardContent>
        <Typography  sx={{fontWeight:600,fontSize:'16px',textAlign:'left'}}>X-Ray Report</Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>

        </Grid>

      </Grid>
    </Container>
      </TabPanel>
      {/* <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
      <TabPanel value={value} index={4}>
        Item Five
      </TabPanel>
      <TabPanel value={value} index={5}>
        Item Six
      </TabPanel>
      <TabPanel value={value} index={6}>
        Item Seven
      </TabPanel> */}
    </Box>
  );
}
