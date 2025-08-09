import React, { useState, useEffect } from "react";
import {
  Grid, TextField, Button, Card, Typography, Avatar, InputAdornment,
  Box, CircularProgress, Autocomplete
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

const DxandTreatment = ({ currentPatient, onSaveSuccess }) => {
  const [dxData, setDxData] = useState({
    dx: '',
    dxCode: '',
    icd10: '',
    icd10Code: '',
    treatment: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dxOptions, setDxOptions] = useState([]);
  const [icd10Options, setIcd10Options] = useState([]);

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient?.VNO) {
      loadDxData();
    }
    loadDxOptions();
    loadIcd10Options();
  }, [currentPatient]);

  const loadDxData = async () => {
    try {
      setLoading(true);
      const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

      if (response.success && response.data?.treatment) {
        const treatment = response.data.treatment;
        setDxData({
          dx: treatment.DXNAME_THAI || '',
          dxCode: treatment.DXCODE || '',
          icd10: treatment.ICD10NAME_THAI || '',
          icd10Code: treatment.ICD10CODE || '',
          treatment: treatment.TREATMENT1 || ''
        });
      }
    } catch (error) {
      console.error('Error loading dx data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDxOptions = async () => {
    try {
      // โหลดรายการ Dx จาก API
      const response = await fetch('/api/dx'); // สมมุติ API endpoint
      if (response.ok) {
        const data = await response.json();
        setDxOptions(data);
      }
    } catch (error) {
      console.error('Error loading dx options:', error);
    }
  };

  const loadIcd10Options = async () => {
    try {
      // โหลดรายการ ICD10 จาก API
      const response = await fetch('/api/icd10'); // สมมุติ API endpoint
      if (response.ok) {
        const data = await response.json();
        setIcd10Options(data);
      }
    } catch (error) {
      console.error('Error loading icd10 options:', error);
    }
  };

  const handleDxChange = (field, value) => {
    setDxData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!dxData.dx.trim() && !dxData.treatment.trim()) {
        alert('กรุณากรอกข้อมูล Dx หรือ Treatment อย่างน้อย 1 รายการ');
        return;
      }

      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        DXCODE: dxData.dxCode,
        ICD10CODE: dxData.icd10Code,
        TREATMENT1: dxData.treatment,
        STATUS1: 'กำลังตรวจ'
      };

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

      if (response.success) {
        alert('บันทึกข้อมูล Dx และ Treatment สำเร็จ!');
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving dx data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setSaving(false);
    }
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
          กำลังโหลดข้อมูล Dx และ Treatment...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={5}>
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
                    {currentPatient.VNO || 'ยังไม่สร้าง VN'}
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
        </Grid>

        {/* Dx and Treatment Form Section */}
        <Grid item xs={12} sm={7}>
          <Grid container spacing={2}>
            {/* Dx Field */}
            <Grid item xs={7}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                Dx *
              </Typography>
              <Autocomplete
                options={dxOptions}
                getOptionLabel={(option) => option.DXNAME_THAI || ''}
                value={dxOptions.find(opt => opt.DXCODE === dxData.dxCode) || null}
                onChange={(event, newValue) => {
                  handleDxChange('dxCode', newValue?.DXCODE || '');
                  handleDxChange('dx', newValue?.DXNAME_THAI || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="ค้นหา Dx"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <SearchIcon color="action" />
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* ICD10 Field */}
            <Grid item xs={5}>
              <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                ICD10
              </Typography>
              <Autocomplete
                options={icd10Options}
                getOptionLabel={(option) => option.ICD10CODE || ''}
                value={icd10Options.find(opt => opt.ICD10CODE === dxData.icd10Code) || null}
                onChange={(event, newValue) => {
                  handleDxChange('icd10Code', newValue?.ICD10CODE || '');
                  handleDxChange('icd10', newValue?.ICD10NAME_THAI || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="ICD10"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Treatment Summary */}
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "bold", fontSize: "16px", mb: 1, mt: 2 }}>
                สรุป Treatment *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="กรอกสรุปการรักษา, แผนการรักษา, คำแนะนำสำหรับผู้ป่วย"
                value={dxData.treatment}
                onChange={(e) => handleDxChange('treatment', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    backgroundColor: "#5698E0",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    width: '200px',
                    height: '50px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: "#4285d1"
                    },
                    '&:disabled': {
                      backgroundColor: "#e0e0e0"
                    }
                  }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกและไปหน้าถัดไป'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={onSaveSuccess}
                  disabled={!onSaveSuccess}
                  sx={{
                    color: "#5698E0",
                    borderColor: "#5698E0",
                    fontSize: "1rem",
                    fontWeight: 600,
                    width: '120px',
                    height: '50px',
                    '&:hover': {
                      backgroundColor: "#f0f8ff"
                    }
                  }}
                >
                  ถัดไป →
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

DxandTreatment.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default DxandTreatment;