import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import {
  Print as PrintIcon,
  Preview as PreviewIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from '../../services/treatmentService';
import EmployeeService from '../../services/employeeService';
import ClinicOrgService from '../../services/clinicOrgService';
import { formatThaiDate, formatThaiDateShort } from '../../utils/dateTimeUtils';

// Import PDF Components
import DrivingLicensePDF from './certificates/DrivingLicensePDF';
import FiveDiseasesPDF from './certificates/FiveDiseasesPDF';
import GeneralMedicalPDF from './certificates/GeneralMedicalPDF';
import SickLeavePDF from './certificates/SickLeavePDF';

const Medicalcertificate = ({ currentPatient }) => {
  const [certificateType, setCertificateType] = useState('drivingLicense');
  const [doctors, setDoctors] = useState([]);
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewDialog, setPreviewDialog] = useState({ open: false, type: null });
  
  // Form Data States
  const [formData, setFormData] = useState({
    // Doctor Info
    doctorName: '',
    doctorLicense: '',
    doctorCode: '',
    
    // Patient Info
    patientName: '',
    patientID: '',
    patientAddress: '',
    
    // Vital Signs
    weight: '',
    height: '',
    bp1: '',
    bp2: '',
    pulse: '',
    temperature: '',
    spo2: '',
    rr: '',
    
    // Examination
    examinationDate: new Date().toISOString().split('T')[0],
    generalCondition: 'normal', // normal, abnormal
    generalConditionNote: '',
    
    // Health History
    congenitalDisease: { has: false, detail: '' },
    accidentSurgery: { has: false, detail: '' },
    hospitalization: { has: false, detail: '' },
    epilepsy: { has: false, detail: '' },
    otherHistory: { has: false, detail: '' },
    
    // Diseases (for 5 diseases form)
    leprosy: false,
    tuberculosis: false,
    filariasis: false,
    chronicAlcoholism: false,
    otherDisease: '',
    
    // Diagnosis & Treatment (for general & sick leave)
    diagnosis: '',
    symptoms: '',
    conclusion: '',
    recommendation: '',
    
    // Sick Leave
    sickLeaveDays: '',
    sickLeaveFrom: '',
    sickLeaveTo: '',
    
    // Certificate Info
    certificateNumber: '',
    certificateDate: new Date().toISOString().split('T')[0],
    bookNumber: ''
  });

  useEffect(() => {
    if (currentPatient) {
      loadInitialData();
    }
  }, [currentPatient]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load doctors
      const doctorsRes = await EmployeeService.getAllEmployees('หมอ');
      if (doctorsRes.success) {
        setDoctors(doctorsRes.data || []);
      }
      
      // Load clinic info
      try {
        const clinicRes = await ClinicOrgService.getClinicOrg();
        if (clinicRes.success) {
          setClinicInfo(clinicRes.data);
        }
      } catch (err) {
        console.warn('Could not load clinic info, using defaults');
        setClinicInfo({
          CLINIC_NAME: 'สัมพันธ์คลินิก คลินิกเวชกรรม',
          ADDR1: '280/4 ต.บ้านหลวง อ.จอมทอง จ.เชียงใหม่ 50160',
          TEL1: '053-341-723'
        });
      }
      
      // Load patient data and treatment
      if (currentPatient?.VNO) {
        const treatmentRes = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);
        if (treatmentRes.success && treatmentRes.data?.treatment) {
          const treatment = treatmentRes.data.treatment;
          
          setFormData(prev => ({
            ...prev,
            patientName: `${currentPatient.PRENAME || ''}${currentPatient.NAME1 || ''} ${currentPatient.SURNAME || ''}`.trim(),
            patientID: currentPatient.IDNO || '',
            patientAddress: currentPatient.ADDR1 || '',
            weight: treatment.WEIGHT1 || '',
            height: treatment.HIGHT1 || '',
            bp1: treatment.BP1 || '',
            bp2: treatment.BP2 || '',
            pulse: treatment.PR1 || '',
            temperature: treatment.BT1 || '',
            spo2: treatment.SPO2 || '',
            rr: treatment.RR1 || '',
            diagnosis: treatment.DXCODE || '',
            symptoms: treatment.SYMPTOM || ''
          }));
        }
      } else {
        // Use currentPatient data directly
        setFormData(prev => ({
          ...prev,
          patientName: `${currentPatient.PRENAME || ''}${currentPatient.NAME1 || ''} ${currentPatient.SURNAME || ''}`.trim(),
          patientID: currentPatient.IDNO || '',
          patientAddress: currentPatient.ADDR1 || '',
          weight: currentPatient.WEIGHT1 || '',
          height: currentPatient.HIGHT1 || '',
          bp1: currentPatient.BP1 || '',
          bp2: currentPatient.BP2 || '',
          pulse: currentPatient.PR1 || '',
          temperature: currentPatient.BT1 || '',
          spo2: currentPatient.SPO2 || '',
          rr: currentPatient.RR1 || ''
        }));
      }
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorName: doctor.EMP_NAME || '',
        doctorCode: doctor.EMP_CODE || '',
        doctorLicense: doctor.LICENSE_NO || 'ว.78503' // Default fallback
      }));
    }
  };

  const handlePreview = () => {
    setPreviewDialog({ open: true, type: certificateType });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    let pdfHTML = '';
    switch (certificateType) {
      case 'drivingLicense':
        pdfHTML = DrivingLicensePDF.generateHTML(formData, clinicInfo, currentPatient);
        break;
      case 'fiveDiseases':
        pdfHTML = FiveDiseasesPDF.generateHTML(formData, clinicInfo, currentPatient);
        break;
      case 'general':
        pdfHTML = GeneralMedicalPDF.generateHTML(formData, clinicInfo, currentPatient);
        break;
      case 'sickLeave':
        pdfHTML = SickLeavePDF.generateHTML(formData, clinicInfo, currentPatient);
        break;
      default:
        return;
    }
    
    printWindow.document.write(pdfHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const renderFormFields = () => {
    const commonFields = (
      <>
        {/* Doctor Selection */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
            ข้อมูลแพทย์
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.EMP_NAME || ''}
            value={doctors.find(d => d.EMP_CODE === formData.doctorCode) || null}
            onChange={(e, newValue) => handleDoctorSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="เลือกแพทย์"
                size="small"
                sx={{ borderRadius: '10px' }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่"
            value={formData.doctorLicense}
            onChange={(e) => setFormData(prev => ({ ...prev, doctorLicense: e.target.value }))}
            fullWidth
            size="small"
            sx={{ borderRadius: '10px' }}
          />
        </Grid>
        
        {/* Vital Signs */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
            สัญญาณชีพ
          </Typography>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="น้ำหนัก (กก.)"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="ส่วนสูง (ซม.)"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="ความดันโลหิต (Systolic)"
            type="number"
            value={formData.bp1}
            onChange={(e) => setFormData(prev => ({ ...prev, bp1: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="ความดันโลหิต (Diastolic)"
            type="number"
            value={formData.bp2}
            onChange={(e) => setFormData(prev => ({ ...prev, bp2: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="ชีพจร (ครั้ง/นาที)"
            type="number"
            value={formData.pulse}
            onChange={(e) => setFormData(prev => ({ ...prev, pulse: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="อุณหภูมิ (°C)"
            type="number"
            value={formData.temperature}
            onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="ออกซิเจน (SpO2 %)"
            type="number"
            value={formData.spo2}
            onChange={(e) => setFormData(prev => ({ ...prev, spo2: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField
            label="อัตราการหายใจ (ครั้ง/นาที)"
            type="number"
            value={formData.rr}
            onChange={(e) => setFormData(prev => ({ ...prev, rr: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="วันที่ตรวจ"
            type="date"
            value={formData.examinationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, examinationDate: e.target.value }))}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel>สภาพร่างกายทั่วไป</InputLabel>
            <Select
              value={formData.generalCondition}
              onChange={(e) => setFormData(prev => ({ ...prev, generalCondition: e.target.value }))}
              label="สภาพร่างกายทั่วไป"
            >
              <MenuItem value="normal">ปกติ</MenuItem>
              <MenuItem value="abnormal">ผิดปกติ</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {formData.generalCondition === 'abnormal' && (
          <Grid item xs={12}>
            <TextField
              label="ระบุความผิดปกติ"
              value={formData.generalConditionNote}
              onChange={(e) => setFormData(prev => ({ ...prev, generalConditionNote: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        )}
      </>
    );

    switch (certificateType) {
      case 'drivingLicense':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
                ประวัติสุขภาพ (สำหรับใบอนุญาตขับรถ)
              </Typography>
            </Grid>
            
            {/* Health History Fields */}
            {['congenitalDisease', 'accidentSurgery', 'hospitalization', 'epilepsy', 'otherHistory'].map((field, index) => {
              const labels = [
                'โรคประจำตัว',
                'อุบัติเหตุและผ่าตัด',
                'เคยเข้ารับการรักษาในโรงพยาบาล',
                'โรคลมชัก *',
                'ประวัติอื่นที่สำคัญ'
              ];
              
              return (
                <Grid item xs={12} key={field}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 200, fontWeight: 600 }}>
                      {index + 1}. {labels[index]}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData[field].has}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [field]: { ...prev[field], has: e.target.checked }
                          }))}
                        />
                      }
                      label="มี"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!formData[field].has}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [field]: { ...prev[field], has: !e.target.checked }
                          }))}
                        />
                      }
                      label="ไม่มี"
                    />
                    {formData[field].has && (
                      <TextField
                        placeholder={`ระบุ${labels[index]}`}
                        value={formData[field].detail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [field]: { ...prev[field], detail: e.target.value }
                        }))}
                        size="small"
                        sx={{ flex: 1, minWidth: 300 }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
            
            {/* Certificate Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="เลขที่"
                value={formData.certificateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="เล่มที่"
                value={formData.bookNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, bookNumber: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        );
        
      case 'fiveDiseases':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
                โรคที่ต้องตรวจ (5 โรค)
              </Typography>
            </Grid>
            
            {[
              { key: 'leprosy', label: 'โรคเรื้อนในระยะติดต่อ หรือในระยะที่ปรากฏอาการเป็นที่รังเกียจแก่สังคม' },
              { key: 'tuberculosis', label: 'วัณโรคในระยะอันตราย' },
              { key: 'filariasis', label: 'โรคเท้าช้างในระยะที่ปรากฏอาการเป็นที่รังเกียจแก่สังคม' },
              { key: 'chronicAlcoholism', label: 'โรคพิษสุราเรื้อรัง' }
            ].map((disease) => (
              <Grid item xs={12} key={disease.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData[disease.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [disease.key]: e.target.checked }))}
                    />
                  }
                  label={disease.label}
                />
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <TextField
                label="อื่น ๆ (ถ้ามี)"
                value={formData.otherDisease}
                onChange={(e) => setFormData(prev => ({ ...prev, otherDisease: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="สรุปความเห็นและข้อแนะนำของแพทย์"
                value={formData.recommendation}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                fullWidth
                size="small"
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="เลขที่"
                value={formData.certificateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        );
        
      case 'general':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
                การวินิจฉัยและการรักษา
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="เป็นโรค"
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="มีอาการ"
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="สรุปความเห็น"
                value={formData.conclusion}
                onChange={(e) => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="เลขที่"
                value={formData.certificateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="วันที่"
                type="date"
                value={formData.certificateDate}
                onChange={(e) => setFormData(prev => ({ ...prev, certificateDate: e.target.value }))}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );
        
      case 'sickLeave':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#5698E0', fontWeight: 700 }}>
                สำหรับลางาน
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="ผลการวินิจฉัย"
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="เห็นควรอนุญาตให้"
                value={formData.recommendation}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="มีกำหนดวัน"
                type="number"
                value={formData.sickLeaveDays}
                onChange={(e) => setFormData(prev => ({ ...prev, sickLeaveDays: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="ตั้งแต่วันที่"
                type="date"
                value={formData.sickLeaveFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, sickLeaveFrom: e.target.value }))}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="ถึงวันที่"
                type="date"
                value={formData.sickLeaveTo}
                onChange={(e) => setFormData(prev => ({ ...prev, sickLeaveTo: e.target.value }))}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );
        
      default:
        return commonFields;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          {/* Certificate Type Selection */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                เลือกประเภทใบรับรองแพทย์
              </Typography>
              <FormControl fullWidth>
                <InputLabel>ประเภทใบรับรอง</InputLabel>
                <Select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  label="ประเภทใบรับรอง"
                >
                  <MenuItem value="drivingLicense">ใบรับรองแพทย์ (สำหรับใบอนุญาตขับรถ)</MenuItem>
                  <MenuItem value="fiveDiseases">ใบรับรองแพทย์ (5 โรค)</MenuItem>
                  <MenuItem value="general">ใบรับรองแพทย์ (ทั่วไป)</MenuItem>
                  <MenuItem value="sickLeave">ใบรับรองแพทย์ (สำหรับลางาน)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Form Fields */}
          <Grid container spacing={2}>
            {renderFormFields()}
          </Grid>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                borderColor: '#5698E0',
                color: '#5698E0',
                '&:hover': {
                  borderColor: '#2B69AC',
                  backgroundColor: '#E3F2FD'
                }
              }}
            >
              ดู Preview PDF
            </Button>
            
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                backgroundColor: '#5698E0',
                '&:hover': {
                  backgroundColor: '#2B69AC'
                }
              }}
            >
              พิมพ์ PDF
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, type: null })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Preview ใบรับรองแพทย์</Typography>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => {
                setPreviewDialog({ open: false, type: null });
                setTimeout(handlePrint, 300);
              }}
              sx={{ backgroundColor: '#5698E0' }}
            >
              พิมพ์
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              height: '100%',
              overflow: 'auto',
              '& iframe': {
                width: '100%',
                height: '100%',
                border: 'none'
              }
            }}
          >
            {previewDialog.type && (
              <iframe
                title="PDF Preview"
                srcDoc={
                  previewDialog.type === 'drivingLicense' ? DrivingLicensePDF.generateHTML(formData, clinicInfo, currentPatient) :
                  previewDialog.type === 'fiveDiseases' ? FiveDiseasesPDF.generateHTML(formData, clinicInfo, currentPatient) :
                  previewDialog.type === 'general' ? GeneralMedicalPDF.generateHTML(formData, clinicInfo, currentPatient) :
                  previewDialog.type === 'sickLeave' ? SickLeavePDF.generateHTML(formData, clinicInfo, currentPatient) :
                  ''
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, type: null })}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

Medicalcertificate.propTypes = {
  currentPatient: PropTypes.object
};

export default Medicalcertificate;
