import * as React from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Box,
  LinearProgress,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
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
        <Box sx={{ p: 0 }}>
          {children}
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

export default function MedicalHistory() {
  const [value, setValue] = React.useState(0);

  const dates = [
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "17/12/2567", date: "2024-12-17" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
    { title: "15/12/2567", date: "2024-12-15" },
  ];

  const vitalsData = [
    { label: "Blood Pressure", value: 30, display: "141/90 mmhg", temp: "29°C" },
    { label: "Body Height", value: 30, display: "78kg", height: "5.6' inc" },
  ];

  // ECG Report data
  const ecgData = [
    { label: "WBC", value: "5.5", unit: "[109/L]" },
    { label: "RBC", value: "12.5", unit: "[109/L]" },
    { label: "HGB", value: "136", unit: "[g/L]" },
    { label: "HCT", value: "12.5", unit: "[L/L]" },
    { label: "MCV", value: "12.5", unit: "[f/L]" },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
      {/* Left Sidebar */}
      <Box sx={{ width: 200, borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ textAlign: "center", fontSize: "12px", pt: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "400", color: "black" }}>
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
          sx={{
            '& .MuiTab-root': {
              fontSize: '14px',
              fontWeight: 400,
              color: '#666',
              alignItems: 'flex-start',
              textAlign: 'left',
              minHeight: 40,
              py: 1
            },
            '& .Mui-selected': {
              background: '#e3f2fd',
              color: '#1976d2',
              borderLeft: '3px solid #1976d2'
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          {dates.map((item, index) => (
            <Tab key={index} label={item.title} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <TabPanel value={value} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Left Column - Patient Info */}
              <Grid item xs={12} md={5}>
                {/* Patient Profile Card */}
                <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Avatar
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                        sx={{ width: 120, height: 120, mx: "auto" }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                        <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                          Demi Wilkinson
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          อายุ 22 ปี 9 เดือน
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        justifyContent: 'space-between',
                        gap: 2
                      }}>
                        <Typography variant="body1" fontWeight="600" sx={{
                          bgcolor: '#E9F2FF',
                          color: 'black',
                          p: 1,
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          วันที่ : 15 / 12 / 2567
                        </Typography>
                        <Typography variant="body1" fontWeight="600" sx={{
                          bgcolor: '#E9F2FF',
                          color: 'black',
                          p: 1,
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          VN021202
                        </Typography>
                        <Typography variant="body1" fontWeight="600" sx={{
                          bgcolor: '#E9F2FF',
                          color: 'black',
                          p: 1,
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          HN000001
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* Vitals Section */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {vitalsData.map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                          <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {item.value}%
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.value}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e0e0e0',
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#1976d2",
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body1" fontWeight="600">
                            {item.display}
                          </Typography>
                        </Card>
                      </Grid>
                      {index === 0 && (
                        <Grid item xs={12} sm={6}>
                          <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                            <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                              Temperature
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {item.value}%
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={item.value}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#1976d2",
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body1" fontWeight="600">
                              {item.temp}
                            </Typography>
                          </Card>
                        </Grid>
                      )}
                      {index === 1 && (
                        <Grid item xs={12} sm={6}>
                          <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                            <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                              Height
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {item.value}%
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={item.value}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#1976d2",
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body1" fontWeight="600">
                              {item.height}
                            </Typography>
                          </Card>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}
                </Grid>

                {/* Reports Section */}

              </Grid>

              {/* Right Column - Medical Details */}
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 2 }}>
                  {/* Vitals Information */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Typography sx={{ mb: 1 }}>
                        BP : 120/80
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        Pulse : 801m
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        Weight 62 Kg
                      </Typography>
                    </Grid>
                    <Divider sx={{ color: '#EAECF0' }} />
                    <Grid item xs={9}>
                      <Typography sx={{ mb: 1 }}>
                        Last Checked : Dr- Everly on 20 November 2022
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        Prescription - #20112022P02S
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        Observation: High Fever and cough at normal.
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Test Information and Prescription */}
                  <Grid container spacing={3}>
                    <Grid item xs={3}>
                      <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                        Test:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>X-Ray</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Blood Test</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Urine Test</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Endoscopy</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                        Prescription:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cap CALPOL 500mg 1 + 1+1 - X 5 Days
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cap DELCON 10mg 0 + 1+ 0 X 3 Days
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cap LEVOLIN 500mg 1 + 1+1 - X 5 Days
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cap ME-FTAL 10mg 0 + 1+ 0 X 3 Days
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Grid container spacing={2}>
                  {/* ECG Report */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, height: 250 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        ECG Report
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        height: 150,
                        bgcolor: '#ffebee',
                        border: '1px solid #ffcdd2',
                        borderRadius: 1,
                        position: 'relative',
                        backgroundImage: `
                          linear-gradient(to right, #ffcdd2 1px, transparent 1px),
                          linear-gradient(to bottom, #ffcdd2 1px, transparent 1px)
                        `,
                        backgroundSize: '10px 10px'
                      }}>
                        {/* ECG Wave */}
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                          <polyline
                            fill="none"
                            stroke="#d32f2f"
                            strokeWidth="2"
                            points="20,100 40,100 50,20 60,180 70,100 90,100 110,100 130,20 140,180 150,100 170,100 190,100 210,20 220,180 230,100"
                          />
                        </svg>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Blood Report */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, height: 250 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Blood Report
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {ecgData.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {row.label}
                                </TableCell>
                                <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {row.value}
                                </TableCell>
                                <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                                  {row.unit}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>

                  {/* X-Ray Report */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, height: 250 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        X-Ray Report
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        height: 180,
                        bgcolor: '#000',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <img
                          src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=180&fit=crop"
                          alt="X-Ray"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'invert(1) contrast(1.2)'
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Other TabPanels for different dates */}
        {dates.slice(1).map((_, index) => (
          <TabPanel key={index + 1} value={value} index={index + 1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">
                ข้อมูลสำหรับวันที่ {dates[index + 1].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลจะแสดงที่นี่เมื่อมีการพัฒนาเพิ่มเติม
              </Typography>
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}