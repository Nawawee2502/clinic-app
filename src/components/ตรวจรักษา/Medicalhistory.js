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
  Divider,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

export default function MedicalHistory({ currentPatient, onSaveSuccess }) {
  const [loading, setLoading] = React.useState(false);
  const [todayTreatment, setTodayTreatment] = React.useState(null);
  const [treatmentHistory, setTreatmentHistory] = React.useState([]);
  const [selectedHistoryVNO, setSelectedHistoryVNO] = React.useState('today');
  const [selectedTreatmentData, setSelectedTreatmentData] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Vitals state - เก็บไว้เพื่อแสดงในส่วนข้อมูลการตรวจ
  const [vitals, setVitals] = React.useState({
    WEIGHT1: '',
    HIGHT1: '',
    BT1: '',
    BP1: '',
    BP2: '',
    RR1: '',
    PR1: '',
    SPO2: ''
  });

  React.useEffect(() => {
    if (currentPatient) {
      loadPatientData();
      loadTreatmentHistory();
    }
  }, [currentPatient]);

  // โหลดข้อมูลผู้ป่วย
  const loadPatientData = async () => {
    if (!currentPatient) return;

    try {
      setLoading(true);

      const initialVitals = {
        WEIGHT1: currentPatient.WEIGHT1 || '',
        HIGHT1: currentPatient.HIGHT1 || '',
        BT1: currentPatient.BT1 || '',
        BP1: currentPatient.BP1 || '',
        BP2: currentPatient.BP2 || '',
        RR1: currentPatient.RR1 || '',
        PR1: currentPatient.PR1 || '',
        SPO2: currentPatient.SPO2 || ''
      };

      console.log('Medical History - Initial vitals from currentPatient:', initialVitals);
      setVitals(initialVitals);

      if (currentPatient.VNO) {
        try {
          const treatmentResponse = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);
          if (treatmentResponse.success && treatmentResponse.data) {
            console.log('Found treatment data:', treatmentResponse.data);
            setTodayTreatment(treatmentResponse.data);
            setSelectedTreatmentData(treatmentResponse.data); // ตั้งเป็นข้อมูลเริ่มต้น

            const treatmentVitals = {
              WEIGHT1: treatmentResponse.data.treatment?.WEIGHT1 || initialVitals.WEIGHT1,
              HIGHT1: treatmentResponse.data.treatment?.HIGHT1 || initialVitals.HIGHT1,
              BT1: treatmentResponse.data.treatment?.BT1 || initialVitals.BT1,
              BP1: treatmentResponse.data.treatment?.BP1 || initialVitals.BP1,
              BP2: treatmentResponse.data.treatment?.BP2 || initialVitals.BP2,
              RR1: treatmentResponse.data.treatment?.RR1 || initialVitals.RR1,
              PR1: treatmentResponse.data.treatment?.PR1 || initialVitals.PR1,
              SPO2: treatmentResponse.data.treatment?.SPO2 || initialVitals.SPO2
            };

            console.log('Updated vitals from treatment:', treatmentVitals);
            setVitals(treatmentVitals);
          }
        } catch (error) {
          console.log('No treatment data found, using currentPatient data');
        }
      }

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  // โหลดประวัติการรักษา - วิธีใหม่ที่โหลดรายละเอียดทุก treatment เลย
  const loadTreatmentHistory = async () => {
    if (!currentPatient?.HNCODE) return;

    try {
      console.log('Loading treatment history for HN:', currentPatient.HNCODE);

      const response = await TreatmentService.getTreatmentsByPatient(currentPatient.HNCODE, {
        page: 1,
        limit: 20
      });

      if (response.success) {
        console.log('==== FULL API RESPONSE ====');
        console.log('Treatment history response:', response);
        console.log('Treatment history data:', response.data);
        
        // โหลดรายละเอียดของแต่ละ treatment เพื่อให้ได้ DXCODE
        const treatmentsWithDetails = await Promise.all(
          response.data.map(async (treatment) => {
            try {
              const detailResponse = await TreatmentService.getTreatmentByVNO(treatment.VNO);
              if (detailResponse.success && detailResponse.data?.treatment) {
                console.log(`Got DXCODE for ${treatment.VNO}:`, detailResponse.data.treatment.DXCODE);
                return {
                  ...treatment,
                  DXCODE: detailResponse.data.treatment.DXCODE,
                  DXNAME_THAI: detailResponse.data.treatment.DXNAME_THAI || treatment.DXNAME_THAI
                };
              }
              return treatment;
            } catch (error) {
              console.error(`Error loading details for ${treatment.VNO}:`, error);
              return treatment;
            }
          })
        );

        console.log('Treatments with DXCODE details:', treatmentsWithDetails);
        setTreatmentHistory(treatmentsWithDetails);
      } else {
        console.log('No treatment history found');
        setTreatmentHistory([]);
      }
    } catch (error) {
      console.error('Error loading treatment history:', error);
      setTreatmentHistory([]);
    }
  };

  // เมื่อคลิกเลือกประวัติการรักษา
  const handleHistoryClick = async (treatment) => {
    try {
      setLoading(true);
      setSelectedHistoryVNO(treatment.VNO);

      // โหลดข้อมูลรายละเอียดของการรักษาที่เลือก
      const response = await TreatmentService.getTreatmentByVNO(treatment.VNO);
      if (response.success) {
        setSelectedTreatmentData(response.data);
        console.log('Selected treatment data:', response.data);

        // อัปเดต vitals จากข้อมูลการรักษาที่เลือก
        if (response.data.treatment) {
          const historyVitals = {
            WEIGHT1: response.data.treatment.WEIGHT1 || '',
            HIGHT1: response.data.treatment.HIGHT1 || '',
            BT1: response.data.treatment.BT1 || '',
            BP1: response.data.treatment.BP1 || '',
            BP2: response.data.treatment.BP2 || '',
            RR1: response.data.treatment.RR1 || '',
            PR1: response.data.treatment.PR1 || '',
            SPO2: response.data.treatment.SPO2 || ''
          };
          setVitals(historyVitals);
        }
      }
    } catch (error) {
      console.error('Error loading selected treatment:', error);
    } finally {
      setLoading(false);
    }
  };

  // คลิกกลับไปดูข้อมูลวันนี้
  const handleTodayClick = () => {
    setSelectedHistoryVNO('today');
    setSelectedTreatmentData(todayTreatment);

    // กลับไปใช้ vitals ปัจจุบัน
    const initialVitals = {
      WEIGHT1: currentPatient.WEIGHT1 || '',
      HIGHT1: currentPatient.HIGHT1 || '',
      BT1: currentPatient.BT1 || '',
      BP1: currentPatient.BP1 || '',
      BP2: currentPatient.BP2 || '',
      RR1: currentPatient.RR1 || '',
      PR1: currentPatient.PR1 || '',
      SPO2: currentPatient.SPO2 || ''
    };
    setVitals(initialVitals);
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // ฟังก์ชันเช็คว่ามี DXCODE ที่ใช้งานได้หรือไม่
  const hasValidDxCode = (dxcode) => {
    return dxcode && dxcode !== 'NULL' && dxcode !== '*NULL*' && dxcode.trim() !== '';
  };

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
      </Box>
    );
  }

  // เลือกข้อมูลที่จะแสดง
  const displayTreatmentData = selectedTreatmentData || todayTreatment;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column - Patient Info & History */}
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
                <Box sx={{
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
                    {currentPatient.HNCODE}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* ประวัติการรักษาทั้งหมด */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2' }}>
              ประวัติการรักษา
            </Typography>
            <Box sx={{
              maxHeight: 400,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'rgba(0,0,0,0.1)'
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: '10px'
              }
            }}>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {/* วันนี้ */}
                  <ListItem
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: selectedHistoryVNO === 'today' ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                    onClick={handleTodayClick}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="600">
                            {formatThaiDate(new Date())}
                          </Typography>
                          <Chip label="วันนี้" size="small" color="primary" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                          {todayTreatment?.treatment?.DXCODE || 'ยังไม่ได้วินิจฉัย'}
                        </Typography>
                      }
                    />
                  </ListItem>

                  {/* ประวัติการรักษาเก่า */}
                  {treatmentHistory.map((treatment, index) => {
                    // Debug log แต่ละรายการ
                    console.log('Rendering treatment:', {
                      VNO: treatment.VNO,
                      DXCODE: treatment.DXCODE,
                      date: treatment.RDATE || treatment.TRDATE
                    });
                    
                    return (
                      <ListItem
                        key={treatment.VNO}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: selectedHistoryVNO === treatment.VNO ? '#e3f2fd' : '#fff',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          }
                        }}
                        onClick={() => handleHistoryClick(treatment)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="600">
                                {formatThaiDate(treatment.RDATE || treatment.TRDATE)}
                              </Typography>
                              {/* แสดง DXCODE จากข้อมูล treatmentHistory โดยตรง */}
                              {hasValidDxCode(treatment.DXCODE) && (
                                <Chip
                                  label={treatment.DXCODE}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{ fontSize: '0.75rem', maxWidth: 120 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                              {/* แสดง DXCODE จากข้อมูล treatmentHistory โดยตรง */}
                              {hasValidDxCode(treatment.DXCODE) 
                                ? treatment.DXCODE 
                                : 'ไม่ระบุการวินิจฉัย'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}

                  {treatmentHistory.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      ไม่พบประวัติการรักษาเก่า
                    </Typography>
                  )}
                </List>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Treatment Summary */}
        <Grid item xs={12} md={7}>
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1976d2' }}>
              สรุปการรักษา
              {selectedHistoryVNO === 'today'
                ? ' - วันนี้'
                : ` - วันที่ ${formatThaiDate(displayTreatmentData?.treatment?.RDATE)}`
              }
            </Typography>

            {loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  กำลังโหลดข้อมูลการรักษา...
                </Typography>
              </Box>
            )}

            {!loading && (
              <Box>
                {/* การวินิจฉัย */}
                <Card sx={{ p: 2, mb: 2, bgcolor: '#f0f8ff', border: '1px solid #e3f2fd' }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#1976d2' }}>
                    การวินิจฉัย (Diagnosis)
                  </Typography>
                  <Box sx={{
                    minHeight: 40,
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    {displayTreatmentData?.treatment?.DXCODE ? (
                      <Typography variant="body1" sx={{ lineHeight: 1.4, fontWeight: 500 }}>
                        {displayTreatmentData.treatment.DXCODE}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        ยังไม่มีการวินิจฉัย
                      </Typography>
                    )}
                  </Box>
                </Card>

                {/* การส่งตรวจ และ ยาที่สั่ง */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, height: 280, bgcolor: '#fff3e0', border: '1px solid #ffe0b2' }}>
                      <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5, color: '#ef6c00' }}>
                        การส่งตรวจ
                      </Typography>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5, color: '#e65100' }}>
                          Lab Tests:
                        </Typography>
                        <Box sx={{ pl: 1, maxHeight: 80, overflowY: 'auto' }}>
                          {(() => {
                            const investigationNotes = displayTreatmentData?.treatment?.INVESTIGATION_NOTES || '';
                            const labMatch = investigationNotes.match(/\[Laboratory\]\s*(.+?)(?=\n\n|$)/s);
                            const labNote = labMatch ? labMatch[1].trim() : '';

                            if (labNote) {
                              return (
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  • {labNote}
                                </Typography>
                              );
                            } else if (displayTreatmentData?.labTests?.length > 0) {
                              return displayTreatmentData.labTests.map((lab, idx) => (
                                <Typography key={idx} variant="body2" sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                                  • {lab.LABNAME}
                                </Typography>
                              ));
                            } else {
                              return (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.875rem' }}>
                                  ไม่มีการส่งตรวจ Lab
                                </Typography>
                              );
                            }
                          })()}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5, color: '#e65100' }}>
                          X-ray/Imaging:
                        </Typography>
                        <Box sx={{ pl: 1, maxHeight: 80, overflowY: 'auto' }}>
                          {(() => {
                            const investigationNotes = displayTreatmentData?.treatment?.INVESTIGATION_NOTES || '';
                            const imagingMatch = investigationNotes.match(/\[Imaging\]\s*(.+?)(?=\n\n|$)/s);
                            const imagingNote = imagingMatch ? imagingMatch[1].trim() : '';

                            if (imagingNote) {
                              return (
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  • {imagingNote}
                                </Typography>
                              );
                            } else if (displayTreatmentData?.radiologicalTests?.length > 0) {
                              return displayTreatmentData.radiologicalTests.map((radio, idx) => (
                                <Typography key={idx} variant="body2" sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                                  • {radio.RLNAME}
                                </Typography>
                              ));
                            } else {
                              return (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.875rem' }}>
                                  ไม่มีการส่งตรวจ X-ray/Imaging
                                </Typography>
                              );
                            }
                          })()}
                        </Box>
                      </Box>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, height: 280, bgcolor: '#e8f5e8', border: '1px solid #c8e6c8' }}>
                      <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5, color: '#2e7d32' }}>
                        ยาที่สั่ง
                      </Typography>
                      <Box sx={{ maxHeight: 230, overflowY: 'auto' }}>
                        {displayTreatmentData?.drugs?.length > 0 ? (
                          displayTreatmentData.drugs.map((drug, idx) => (
                            <Box key={idx} sx={{
                              mb: 1.5,
                              p: 1.5,
                              bgcolor: 'white',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0'
                            }}>
                              <Typography variant="body2" fontWeight="600" sx={{ color: '#1b5e20', fontSize: '0.875rem' }}>
                                {drug.GENERIC_NAME || drug.TRADE_NAME}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                จำนวน: {drug.QTY} {drug.UNIT_NAME}
                              </Typography>
                              {drug.TIME1 && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  วิธีใช้: {drug.TIME1}
                                </Typography>
                              )}
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            ยังไม่ได้สั่งยา
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* หัตถการ (ถ้ามี) */}
                {displayTreatmentData?.procedures?.length > 0 && (
                  <Card sx={{ p: 2, mb: 2, bgcolor: '#f3e5f5', border: '1px solid #e1bee7' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#7b1fa2' }}>
                      หัตถการที่ทำ
                    </Typography>
                    <Box sx={{ pl: 1 }}>
                      {displayTreatmentData.procedures.map((procedure, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                          • {procedure.MED_PRO_NAME_THAI || procedure.MED_PRO_NAME_ENG}
                          {procedure.QTY && procedure.UNIT_NAME && (
                            <Typography variant="caption" color="text.secondary">
                              {' '}({procedure.QTY} {procedure.UNIT_NAME})
                            </Typography>
                          )}
                        </Typography>
                      ))}
                    </Box>
                  </Card>
                )}

                {/* สรุปการรักษา */}
                <Card sx={{ p: 2, bgcolor: '#fff8e1', border: '1px solid #ffecb3' }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#f57c00' }}>
                    สรุปการรักษา (Treatment Summary)
                  </Typography>
                  <Box sx={{
                    minHeight: 80,
                    maxHeight: 180,
                    overflowY: 'auto',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    {displayTreatmentData?.treatment?.TREATMENT1 ? (
                      <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                        {displayTreatmentData.treatment.TREATMENT1}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        ยังไม่มีสรุปการรักษา
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Next Button */}
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
  );
}

MedicalHistory.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};