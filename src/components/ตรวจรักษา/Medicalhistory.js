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
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import PatientService from "../../services/patientService";

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

export default function MedicalHistory({ currentPatient, onSaveSuccess }) {
  const [value, setValue] = React.useState(0);
  const [treatmentHistory, setTreatmentHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTreatment, setSelectedTreatment] = React.useState(null);
  const [error, setError] = React.useState(null);

  // โหลดประวัติการรักษาเมื่อ currentPatient เปลี่ยน
  React.useEffect(() => {
    if (currentPatient?.HNCODE) {
      loadTreatmentHistory();
    }
  }, [currentPatient]);

  // โหลดประวัติการรักษา
  const loadTreatmentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TreatmentService.getTreatmentsByPatient(
        currentPatient.HNCODE,
        { limit: 20 }
      );

      if (response.success) {
        setTreatmentHistory(response.data);

        // เลือกการรักษาล่าสุดเป็นค่าเริ่มต้น
        if (response.data.length > 0) {
          loadTreatmentDetail(response.data[0].VNO);
        }
      } else {
        setError('ไม่สามารถโหลดประวัติการรักษาได้');
      }
    } catch (err) {
      console.error('Error loading treatment history:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // โหลดรายละเอียดการรักษา
  const loadTreatmentDetail = async (vno) => {
    try {
      const response = await TreatmentService.getTreatmentByVNO(vno);

      if (response.success) {
        setSelectedTreatment(response.data);
      } else {
        console.error('Failed to load treatment detail:', response.message);
      }
    } catch (err) {
      console.error('Error loading treatment detail:', err);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);

    // โหลดรายละเอียดการรักษาที่เลือก
    if (treatmentHistory[newValue]) {
      loadTreatmentDetail(treatmentHistory[newValue].VNO);
    }
  };

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // คำนวณค่าเปอร์เซ็นต์สำหรับ progress bar
  const getVitalPercentage = (value, min, max) => {
    if (!value) return 0;
    return ((value - min) / (max - min)) * 100;
  };

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดประวัติการรักษา...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (treatmentHistory.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          ไม่พบประวัติการรักษา
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ผู้ป่วยรายนี้ยังไม่มีประวัติการรักษาในระบบ
        </Typography>
      </Box>
    );
  }

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
          {treatmentHistory.map((treatment, index) => (
            <Tab
              key={treatment.VNO}
              label={formatThaiDate(treatment.RDATE)}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {treatmentHistory.map((treatment, index) => (
          <TabPanel key={treatment.VNO} value={value} index={index}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Left Column - Patient Info */}
                <Grid item xs={12} md={5}>
                  {/* Patient Profile Card */}
                  <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Avatar
                          src={currentPatient.avatar}
                          sx={{ width: 120, height: 120, mx: "auto" }}
                        >
                          {!currentPatient.avatar && (
                            <Typography variant="h4">
                              {currentPatient.NAME1?.charAt(0) || '?'}
                            </Typography>
                          )}
                        </Avatar>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                            {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            อายุ {currentPatient.AGE} ปี • {currentPatient.SEX}
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
                            วันที่: {formatThaiDate(treatment.RDATE)}
                          </Typography>
                          <Typography variant="body1" fontWeight="600" sx={{
                            bgcolor: '#E9F2FF',
                            color: 'black',
                            p: 1,
                            borderRadius: 1,
                            textAlign: 'center'
                          }}>
                            {treatment.VNO}
                          </Typography>
                          <Typography variant="body1" fontWeight="600" sx={{
                            bgcolor: '#E9F2FF',
                            color: 'black',
                            p: 1,
                            borderRadius: 1,
                            textAlign: 'center'
                          }}>
                            {currentPatient.HNCODE}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Vitals Section */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Blood Pressure */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                          Blood Pressure
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {treatment.BP1 && treatment.BP2
                            ? `${Math.round(((treatment.BP1 + treatment.BP2) / 220) * 100)}%`
                            : 'ไม่มีข้อมูล'
                          }
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={treatment.BP1 && treatment.BP2
                              ? Math.round(((treatment.BP1 + treatment.BP2) / 220) * 100)
                              : 0
                            }
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
                          {treatment.BP1 && treatment.BP2
                            ? `${treatment.BP1}/${treatment.BP2} mmHg`
                            : 'ไม่มีข้อมูล'
                          }
                        </Typography>
                      </Card>
                    </Grid>

                    {/* Temperature */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                          Temperature
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {treatment.BT1
                            ? `${Math.round(((treatment.BT1 - 35) / 7) * 100)}%`
                            : 'ไม่มีข้อมูล'
                          }
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={treatment.BT1
                              ? Math.round(((treatment.BT1 - 35) / 7) * 100)
                              : 0
                            }
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
                          {treatment.BT1 ? `${treatment.BT1}°C` : 'ไม่มีข้อมูล'}
                        </Typography>
                      </Card>
                    </Grid>

                    {/* Weight */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                          Body Weight
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {treatment.WEIGHT1
                            ? `${Math.round((treatment.WEIGHT1 / 100) * 100)}%`
                            : 'ไม่มีข้อมูล'
                          }
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={treatment.WEIGHT1
                              ? Math.round((treatment.WEIGHT1 / 100) * 100)
                              : 0
                            }
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
                          {treatment.WEIGHT1 ? `${treatment.WEIGHT1} kg` : 'ไม่มีข้อมูล'}
                        </Typography>
                      </Card>
                    </Grid>

                    {/* Height */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                          Height
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {treatment.HIGHT1
                            ? `${Math.round((treatment.HIGHT1 / 200) * 100)}%`
                            : 'ไม่มีข้อมูล'
                          }
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={treatment.HIGHT1
                              ? Math.round((treatment.HIGHT1 / 200) * 100)
                              : 0
                            }
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
                          {treatment.HIGHT1 ? `${treatment.HIGHT1} cm` : 'ไม่มีข้อมูล'}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Right Column - Medical Details */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ p: 2 }}>
                    {/* Vitals Information */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                          Vital Signs:
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          BP: {treatment.BP1 && treatment.BP2 ? `${treatment.BP1}/${treatment.BP2}` : '-'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          Pulse: {treatment.PR1 ? `${treatment.PR1} bpm` : '-'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          Weight: {treatment.WEIGHT1 ? `${treatment.WEIGHT1} kg` : '-'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          Height: {treatment.HIGHT1 ? `${treatment.HIGHT1} cm` : '-'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          Temp: {treatment.BT1 ? `${treatment.BT1}°C` : '-'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          SpO2: {treatment.SPO2 ? `${treatment.SPO2}%` : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                          การรักษา:
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          แพทย์ผู้รักษา: {treatment.EMP_NAME || 'ไม่ระบุ'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          การวินิจฉัย: {treatment.DXNAME_THAI || 'ไม่ระบุ'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          อาการ: {treatment.SYMPTOM || 'ไม่ระบุ'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          การรักษา: {treatment.TREATMENT1 || 'ไม่ระบุ'}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          สถานะ: {treatment.STATUS1 || 'ไม่ระบุ'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Treatment Details */}
                    {selectedTreatment && (
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                            การตรวจ (Lab/X-ray):
                          </Typography>
                          {selectedTreatment.labTests?.length > 0 ? (
                            selectedTreatment.labTests.map((lab, idx) => (
                              <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                                • {lab.LABNAME}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              ไม่มีการส่งตรวจ
                            </Typography>
                          )}

                          {selectedTreatment.radiologicalTests?.length > 0 && (
                            <>
                              <Typography variant="body1" fontWeight="600" sx={{ mb: 1, mt: 2 }}>
                                การตรวจทางรังสี:
                              </Typography>
                              {selectedTreatment.radiologicalTests.map((radio, idx) => (
                                <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                                  • {radio.RLNAME}
                                </Typography>
                              ))}
                            </>
                          )}
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                            ยาที่สั่ง:
                          </Typography>
                          {selectedTreatment.drugs?.length > 0 ? (
                            selectedTreatment.drugs.map((drug, idx) => (
                              <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                                • {drug.GENERIC_NAME} {drug.QTY} {drug.UNIT_NAME}
                                <br />
                                <span style={{ fontSize: '0.8em', color: '#666' }}>
                                  {drug.TIME1}
                                </span>
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              ไม่มีการสั่งยา
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    )}
                  </Box>

                  {/* Summary Cards */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {/* Vital Signs Summary */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: 250 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                          Vital Signs Summary
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                                  BP
                                </TableCell>
                                <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {treatment.BP1 && treatment.BP2 ? `${treatment.BP1}/${treatment.BP2}` : '-'}
                                </TableCell>
                                <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                                  mmHg
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                                  HR
                                </TableCell>
                                <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {treatment.PR1 || '-'}
                                </TableCell>
                                <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                                  bpm
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                                  Temp
                                </TableCell>
                                <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {treatment.BT1 || '-'}
                                </TableCell>
                                <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                                  °C
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '14px', border: 'none', py: 0.5 }}>
                                  SpO2
                                </TableCell>
                                <TableCell sx={{ fontSize: '14px', border: 'none', py: 0.5 }}>
                                  {treatment.SPO2 || '-'}
                                </TableCell>
                                <TableCell sx={{ fontSize: '12px', color: 'text.secondary', border: 'none', py: 0.5 }}>
                                  %
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Card>
                    </Grid>

                    {/* Treatment Summary */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: 250 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                          Treatment Summary
                        </Typography>
                        <Box sx={{ overflow: 'auto', height: 180 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Diagnosis:</strong> {treatment.DXNAME_THAI || 'ไม่ระบุ'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Treatment:</strong> {treatment.TREATMENT1 || 'ไม่ระบุ'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Status:</strong> {treatment.STATUS1 || 'ไม่ระบุ'}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Additional Info */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: 250 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                          Additional Information
                        </Typography>
                        <Box sx={{ overflow: 'auto', height: 180 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Visit Date:</strong> {formatThaiDate(treatment.RDATE)}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Doctor:</strong> {treatment.EMP_NAME || 'ไม่ระบุ'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>VN:</strong> {treatment.VNO}
                          </Typography>
                          {treatment.APPOINTMENT_DATE && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Next Appointment:</strong> {formatThaiDate(treatment.APPOINTMENT_DATE)}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Box sx={{
                position: 'fixed',
                bottom: 20,
                right: 30,
                zIndex: 1000
              }}>
                <Button
                  variant="contained"
                  onClick={onSaveSuccess}
                  disabled={!onSaveSuccess}
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: 4,
                    '&:hover': {
                      backgroundColor: "#1565c0",
                      boxShadow: 6
                    },
                    '&:disabled': {
                      backgroundColor: "#cccccc"
                    }
                  }}
                >
                  ถัดไป →
                </Button>
              </Box>
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}

MedicalHistory.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};