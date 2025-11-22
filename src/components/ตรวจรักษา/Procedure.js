import React, { useState, useEffect } from "react";
import {
  Grid, TextField, Button, Card, CardContent, Typography, Avatar,
  InputAdornment, Box, Checkbox, Autocomplete, Divider,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert, Snackbar
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";
import DrugService from "../../services/drugService";

const Procedure = ({ currentPatient, onSaveSuccess }) => {
  const [procedureData, setProcedureData] = useState({
    procedureName: '',
    procedureCode: '',
    note: '',
    doctorName: ''
  });

  const [savedProcedures, setSavedProcedures] = useState([]);
  const [procedureOptions, setProcedureOptions] = useState([]);
  
  // Medicine states
  const [medicineData, setMedicineData] = useState({
    drugName: '',
    drugCode: '',
    quantity: '',
    unit: '',
    unitName: '',
    unitPrice: 0
  });
  const [savedMedicines, setSavedMedicines] = useState([]);
  const [drugOptions, setDrugOptions] = useState([]);
  const [editingMedicineIndex, setEditingMedicineIndex] = useState(-1);
  const [apiStatus, setApiStatus] = useState('checking');
  
  const [unitOptions] = useState([
    { code: 'TAB', name: 'เม็ด' },
    { code: 'CAP', name: 'แคปซูล' },
    { code: 'BOT', name: 'ขวด' },
    { code: 'AMP', name: 'แอมปูล' },
    { code: 'VIAL', name: 'ไวออล' },
    { code: 'TUBE', name: 'หลอด' },
    { code: 'SACHET', name: 'ซอง' },
    { code: 'BOX', name: 'กล่อง' },
    { code: 'SPRAY', name: 'สเปรย์' },
    { code: 'DROP', name: 'หยด' },
    { code: 'ML', name: 'มิลลิลิตร' },
    { code: 'G', name: 'กรัม' },
    { code: 'PACK', name: 'แพ็ค' }
  ]);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient?.VNO) {
      loadProcedureData();
    }
    loadProcedureOptions();
    loadDrugOptions();
  }, [currentPatient]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadProcedureData = async () => {
    try {
      setLoading(true);
      const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

      if (response.success && response.data) {
        // Load procedures
        if (response.data.procedures) {
          const procedures = response.data.procedures.map((procedure, index) => ({
            id: index + 1,
            procedureName: procedure.MED_PRO_NAME_THAI || procedure.PROCEDURE_NAME || 'ไม่ระบุชื่อ',
            procedureCode: procedure.MEDICAL_PROCEDURE_CODE || procedure.PROCEDURE_CODE,
            note: procedure.NOTE1 || '',
            doctorName: procedure.DOCTOR_NAME || 'นพ.ผู้รักษา'
          }));
          setSavedProcedures(procedures);
        }
        
        // Load medicines
        if (response.data.drugs) {
          const medicines = response.data.drugs.map((drug, index) => ({
            id: index + 1,
            drugName: drug.GENERIC_NAME,
            drugCode: drug.DRUG_CODE,
            quantity: drug.QTY,
            unit: drug.UNIT_CODE || 'TAB',
            unitName: drug.UNIT_NAME || getUnitName(drug.UNIT_CODE || 'TAB'),
            unitPrice: drug.UNIT_PRICE || 0
          }));
          setSavedMedicines(medicines);
        }
      }
    } catch (error) {
      console.error('Error loading procedure data:', error);
      showSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลหัตถการ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProcedureOptions = async () => {
    try {
      // โหลดรายการหัตถการจาก API
      const response = await fetch('/api/medical-procedures?limit=100');
      if (response.ok) {
        const data = await response.json();
        const formattedOptions = data.data.map(item => ({
          PROCEDURE_CODE: item.MEDICAL_PROCEDURE_CODE,
          PROCEDURE_NAME: item.MED_PRO_NAME_THAI,
          CATEGORY: item.MED_PRO_TYPE || 'ทั่วไป',
          UNIT_PRICE: item.UNIT_PRICE || 0
        }));
        setProcedureOptions(formattedOptions);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Error loading procedure options:', error);
      // ข้อมูลจำลองหัตถการ
      setProcedureOptions([
        { PROCEDURE_CODE: 'PROC001', PROCEDURE_NAME: 'การเย็บแผล', CATEGORY: 'Minor Surgery', UNIT_PRICE: 500 },
        { PROCEDURE_CODE: 'PROC002', PROCEDURE_NAME: 'การตัดแผล', CATEGORY: 'Minor Surgery', UNIT_PRICE: 300 },
        { PROCEDURE_CODE: 'PROC003', PROCEDURE_NAME: 'การล้างแผล', CATEGORY: 'Wound Care', UNIT_PRICE: 200 },
        { PROCEDURE_CODE: 'PROC004', PROCEDURE_NAME: 'การใส่เข็มหยด', CATEGORY: 'IV Therapy', UNIT_PRICE: 150 },
        { PROCEDURE_CODE: 'PROC005', PROCEDURE_NAME: 'การฉีดยาเข้ากล้ามเนื้อ', CATEGORY: 'Injection', UNIT_PRICE: 100 },
        { PROCEDURE_CODE: 'PROC006', PROCEDURE_NAME: 'การฉีดยาเข้าหลอดเลือด', CATEGORY: 'Injection', UNIT_PRICE: 150 },
        { PROCEDURE_CODE: 'PROC007', PROCEDURE_NAME: 'การดูดเสมหะ', CATEGORY: 'Respiratory', UNIT_PRICE: 250 },
        { PROCEDURE_CODE: 'PROC008', PROCEDURE_NAME: 'การใส่สายปัสสาวะ', CATEGORY: 'Urinary', UNIT_PRICE: 300 },
        { PROCEDURE_CODE: 'PROC009', PROCEDURE_NAME: 'การตรวจร่างกาย', CATEGORY: 'Examination', UNIT_PRICE: 200 },
        { PROCEDURE_CODE: 'PROC010', PROCEDURE_NAME: 'การวัดความดันโลหิต', CATEGORY: 'Vital Signs', UNIT_PRICE: 50 },
        { PROCEDURE_CODE: 'PROC011', PROCEDURE_NAME: 'การปฐมพยาบาล', CATEGORY: 'First Aid', UNIT_PRICE: 150 },
        { PROCEDURE_CODE: 'PROC012', PROCEDURE_NAME: 'การทำแผล', CATEGORY: 'Wound Care', UNIT_PRICE: 200 },
        { PROCEDURE_CODE: 'PROC013', PROCEDURE_NAME: 'การตรวจหู คอ จมูก', CATEGORY: 'ENT', UNIT_PRICE: 300 },
        { PROCEDURE_CODE: 'PROC014', PROCEDURE_NAME: 'การตรวจตา', CATEGORY: 'Ophthalmology', UNIT_PRICE: 250 },
        { PROCEDURE_CODE: 'PROC015', PROCEDURE_NAME: 'การนวดหัวใจ', CATEGORY: 'Emergency', UNIT_PRICE: 1000 }
      ]);
    }
  };

  const handleProcedureChange = (field, value) => {
    setProcedureData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // แก้ไข handleProcedureSelect เพื่อรองรับ freeSolo
  const handleProcedureSelect = (newValue) => {
    if (newValue) {
      if (typeof newValue === 'object') {
        // เลือกจากรายการที่มี
        handleProcedureChange('procedureCode', newValue.PROCEDURE_CODE);
        handleProcedureChange('procedureName', newValue.PROCEDURE_NAME);
      } else {
        // พิมพ์ใหม่ (string)
        handleProcedureChange('procedureName', newValue);
        handleProcedureChange('procedureCode', ''); // จะสร้างใหม่ตอนบันทึก
      }
    } else {
      handleProcedureChange('procedureCode', '');
      handleProcedureChange('procedureName', '');
    }
  };

  // ฟังก์ชันเพิ่มหัตถการใหม่เข้าฐานข้อมูล
  const addCustomProcedureToDatabase = async (code, name) => {
    try {
      const response = await fetch('/api/treatments/procedures/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MEDICAL_PROCEDURE_CODE: code,
          MED_PRO_NAME_THAI: name,
          MED_PRO_NAME_ENG: name
        })
      });

      if (response.ok) {
        console.log('Added custom procedure to database:', code);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding custom procedure:', error);
      return false;
    }
  };

  const handleAddProcedure = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    const errors = [];

    if (!procedureData.procedureName.trim()) {
      errors.push('ชื่อหัตถการ');
    }

    if (errors.length > 0) {
      showSnackbar(`กรุณากรอกข้อมูลให้ครบถ้วน: ${errors.join(', ')}`, 'error');
      return;
    }

    // ถ้าไม่มี procedureCode ให้สร้างรหัสชั่วคราว
    let finalProcedureCode = procedureData.procedureCode;

    if (!finalProcedureCode || finalProcedureCode.trim() === '') {
      const timestamp = Date.now().toString().slice(-6);
      finalProcedureCode = `CUSTOM_${timestamp}`;

      // เพิ่มรหัสนี้เข้าไปในตาราง TABLE_MEDICAL_PROCEDURES
      try {
        await addCustomProcedureToDatabase(finalProcedureCode, procedureData.procedureName.trim());
      } catch (error) {
        console.warn('Could not add custom procedure to database:', error);
      }
    }

    const newProcedure = {
      id: editingIndex >= 0 ? savedProcedures[editingIndex].id : Date.now(),
      procedureName: procedureData.procedureName.trim(),
      procedureCode: finalProcedureCode,
      note: procedureData.note.trim(),
      doctorName: procedureData.doctorName.trim() || 'นพ.ผู้รักษา'
    };

    if (editingIndex >= 0) {
      // แก้ไขหัตถการที่มีอยู่
      const updatedProcedures = [...savedProcedures];
      updatedProcedures[editingIndex] = newProcedure;
      setSavedProcedures(updatedProcedures);
      setEditingIndex(-1);
      showSnackbar('แก้ไขรายการหัตถการสำเร็จ', 'success');
    } else {
      // เพิ่มหัตถการใหม่
      setSavedProcedures(prev => [...prev, newProcedure]);
      showSnackbar('เพิ่มรายการหัตถการสำเร็จ', 'success');
    }

    // รีเซ็ตฟอร์ม
    resetForm();
  };

  const loadDrugOptions = async () => {
    try {
      console.log('Loading drug options...');
      setApiStatus('checking');
      const response = await DrugService.getAllDrugs({ limit: 10000 });

      if (response.success && response.data) {
        console.log('Drug API available, loaded', response.data.length, 'drugs');
        const formattedDrugs = response.data.map(drug => ({
          DRUG_CODE: drug.DRUG_CODE,
          GENERIC_NAME: drug.GENERIC_NAME,
          TRADE_NAME: drug.TRADE_NAME || '',
          UNIT_CODE: drug.UNIT_CODE || 'TAB',
          UNIT_NAME: drug.UNIT_NAME || drug.UNIT_NAME1 || '',
          UNIT_PRICE: drug.UNIT_PRICE || 0,
          Dose1: drug.Dose1 || '',
          Indication1: drug.Indication1 || '',
          Comment1: drug.Comment1 || '',
          eat1: drug.eat1 || ''
        }));
        setDrugOptions(formattedDrugs);
        setApiStatus('connected');
        console.log('Formatted drugs:', formattedDrugs.slice(0, 3));
        return;
      } else {
        throw new Error('Drug API not available');
      }
    } catch (error) {
      console.error('Drug API not available:', error.message);
      setApiStatus('offline');
      setDrugOptions([]);
      showSnackbar('ไม่สามารถเชื่อมต่อกับฐานข้อมูลยาได้ กรุณาติดต่อผู้ดูแลระบบ', 'error');
    }
  };

  const getAvailableDrugs = () => {
    const drugsWithName = drugOptions.filter(drug => 
      (drug.GENERIC_NAME && drug.GENERIC_NAME.trim() !== '') || 
      (drug.TRADE_NAME && drug.TRADE_NAME.trim() !== '')
    );
    
    if (editingMedicineIndex >= 0) {
      const currentEditingDrugCode = savedMedicines[editingMedicineIndex]?.drugCode;
      return drugsWithName.filter(drug =>
        !savedMedicines.some((med, index) =>
          med.drugCode === drug.DRUG_CODE && index !== editingMedicineIndex
        ) || drug.DRUG_CODE === currentEditingDrugCode
      );
    }
    return drugsWithName.filter(drug =>
      !savedMedicines.some(med => med.drugCode === drug.DRUG_CODE)
    );
  };

  const isDuplicateMedicine = (drugCode) => {
    return savedMedicines.some((med, index) => {
      if (editingMedicineIndex >= 0 && index === editingMedicineIndex) {
        return false;
      }
      return med.drugCode === drugCode;
    });
  };

  const handleMedicineChange = (field, value) => {
    setMedicineData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrugSelect = (newValue) => {
    if (newValue) {
      if (isDuplicateMedicine(newValue.DRUG_CODE)) {
        showSnackbar('ยาตัวนี้ถูกเพิ่มไปแล้ว กรุณาเลือกยาตัวอื่น', 'warning');
        return;
      }

      const defaultQuantity = newValue.Dose1 || '1';

      setMedicineData(prev => ({
        ...prev,
        drugCode: newValue.DRUG_CODE,
        drugName: newValue.GENERIC_NAME,
        unit: newValue.UNIT_CODE || 'TAB',
        unitName: newValue.UNIT_NAME || getUnitName(newValue.UNIT_CODE || 'TAB'),
        unitPrice: newValue.UNIT_PRICE || 0,
        quantity: defaultQuantity
      }));
    } else {
      setMedicineData(prev => ({
        ...prev,
        drugCode: '',
        drugName: '',
        unit: '',
        unitName: '',
        unitPrice: 0,
        quantity: ''
      }));
    }
  };

  const handleAddMedicine = () => {
    const errors = [];

    if (!medicineData.drugName.trim()) {
      errors.push('ชื่อยา');
    }
    if (!medicineData.quantity || parseFloat(medicineData.quantity) <= 0) {
      errors.push('จำนวน (ต้องมากกว่า 0)');
    }
    if (!medicineData.unit.trim()) {
      errors.push('หน่วยนับ');
    }

    if (errors.length > 0) {
      showSnackbar(`กรุณากรอกข้อมูลให้ครบถ้วน: ${errors.join(', ')}`, 'error');
      return;
    }

    if (editingMedicineIndex < 0 && isDuplicateMedicine(medicineData.drugCode)) {
      showSnackbar('ไม่สามารถเพิ่มยาตัวเดิมซ้ำได้', 'error');
      return;
    }

    const newMedicine = {
      id: editingMedicineIndex >= 0 ? savedMedicines[editingMedicineIndex].id : Date.now(),
      drugName: medicineData.drugName.trim(),
      drugCode: medicineData.drugCode,
      quantity: parseFloat(medicineData.quantity),
      unit: medicineData.unit,
      unitName: medicineData.unitName || getUnitName(medicineData.unit),
      unitPrice: parseFloat(medicineData.unitPrice) || 0
    };

    if (editingMedicineIndex >= 0) {
      const updatedMedicines = [...savedMedicines];
      updatedMedicines[editingMedicineIndex] = newMedicine;
      setSavedMedicines(updatedMedicines);
      setEditingMedicineIndex(-1);
      showSnackbar('แก้ไขรายการยาสำเร็จ', 'success');
    } else {
      setSavedMedicines(prev => [...prev, newMedicine]);
      showSnackbar('เพิ่มรายการยาสำเร็จ', 'success');
    }

    resetMedicineForm();
  };

  const resetMedicineForm = () => {
    setMedicineData({
      drugName: '',
      drugCode: '',
      quantity: '',
      unit: '',
      unitName: '',
      unitPrice: 0
    });
  };

  const handleEditMedicine = (index) => {
    const medicine = savedMedicines[index];
    setMedicineData({
      drugName: medicine.drugName,
      drugCode: medicine.drugCode,
      quantity: medicine.quantity.toString(),
      unit: medicine.unit,
      unitName: medicine.unitName || getUnitName(medicine.unit),
      unitPrice: medicine.unitPrice || 0
    });
    setEditingMedicineIndex(index);
    showSnackbar('เข้าสู่โหมดแก้ไขยา', 'info');
  };

  const handleDeleteMedicine = (index) => {
    if (window.confirm('ต้องการลบยานี้หรือไม่?')) {
      const updatedMedicines = savedMedicines.filter((_, i) => i !== index);
      setSavedMedicines(updatedMedicines);

      if (editingMedicineIndex === index) {
        resetMedicineForm();
        setEditingMedicineIndex(-1);
      } else if (editingMedicineIndex > index) {
        setEditingMedicineIndex(editingMedicineIndex - 1);
      }

      showSnackbar('ลบรายการยาสำเร็จ', 'success');
    }
  };

  const getUnitName = (unitCode) => {
    const unit = unitOptions.find(u => u.code === unitCode);
    return unit ? unit.name : unitCode;
  };

  const resetForm = () => {
    setProcedureData({
      procedureName: '',
      procedureCode: '',
      note: '',
      doctorName: ''
    });
  };

  const handleEditProcedure = (index) => {
    const procedure = savedProcedures[index];
    setProcedureData({
      procedureName: procedure.procedureName,
      procedureCode: procedure.procedureCode,
      note: procedure.note,
      doctorName: procedure.doctorName
    });
    setEditingIndex(index);
    showSnackbar('เข้าสู่โหมดแก้ไข', 'info');
  };

  const handleDeleteProcedure = (index) => {
    if (window.confirm('ต้องการลบหัตถการนี้หรือไม่?')) {
      const updatedProcedures = savedProcedures.filter((_, i) => i !== index);
      setSavedProcedures(updatedProcedures);
      showSnackbar('ลบรายการหัตถการสำเร็จ', 'success');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (savedProcedures.length === 0 && savedMedicines.length === 0) {
        showSnackbar('กรุณาเพิ่มรายการหัตถการหรือยาอย่างน้อย 1 รายการ', 'error');
        return;
      }

      // เตรียมข้อมูลหัตถการในรูปแบบที่ API ต้องการ
      const procedures = savedProcedures.map(procedure => {
        let finalCode = procedure.procedureCode;

        // ถ้าไม่มีรหัส หรือเป็นรหัสชั่วคราว ให้สร้างใหม่
        if (!finalCode || finalCode.startsWith('CUSTOM_')) {
          const timestamp = Date.now().toString().slice(-6);
          finalCode = `PROC_${timestamp}`;
        }

        return {
          MEDICAL_PROCEDURE_CODE: finalCode,
          PROCEDURE_CODE: finalCode,
          PROCEDURE_NAME: procedure.procedureName,
          NOTE1: procedure.note,
          DOCTOR_NAME: procedure.doctorName,
          PROCEDURE_DATE: new Date().toISOString().split('T')[0],
          QTY: 1,
          UNIT_CODE: 'ครั้ง',
          UNIT_PRICE: 0,
          AMT: 0
        };
      });

      // เตรียมข้อมูลยาในรูปแบบที่ API ต้องการ
      const drugs = savedMedicines.map(medicine => ({
        DRUG_CODE: medicine.drugCode,
        QTY: parseFloat(medicine.quantity) || 1,
        UNIT_CODE: medicine.unit || 'TAB',
        UNIT_PRICE: parseFloat(medicine.unitPrice) || 0,
        AMT: (parseFloat(medicine.quantity) || 1) * (parseFloat(medicine.unitPrice) || 0),
        NOTE1: '',
        TIME1: '' // ไม่ใช้วิธีรับประทาน แต่ต้องส่งไปเพื่อให้ backend ไม่ error
      }));

      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        STATUS1: 'กำลังตรวจ',
        procedures: procedures,  // ส่งข้อมูลหัตถการไปด้วย
        drugs: drugs  // ส่งข้อมูลยาไปด้วย
      };

      console.log('💾 Saving procedure data:', treatmentData);

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

      if (response.success) {
        showSnackbar('บันทึกข้อมูลหัตถการสำเร็จ!', 'success');
        if (onSaveSuccess) {
          setTimeout(() => onSaveSuccess(), 1500);
        }
      } else {
        showSnackbar('ไม่สามารถบันทึกข้อมูลได้: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Error saving procedure data:', error);
      showSnackbar('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning">ไม่พบข้อมูลผู้ป่วย</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูลหัตถการ...
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
                  <Box sx={{
                    bgcolor: TreatmentService.getPatientRight(currentPatient).bgColor,
                    color: TreatmentService.getPatientRight(currentPatient).color,
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${TreatmentService.getPatientRight(currentPatient).color}`,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}>
                    {TreatmentService.getPatientRight(currentPatient).name}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Procedure Form Section */}
        <Grid item xs={12} sm={7}>
          {/* Procedure Form */}
          <Card sx={{ p: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2' }}>
                {editingIndex >= 0 ? '🔄 แก้ไขหัตถการ' : '➕ เพิ่มหัตถการ'}
              </Typography>

              <Grid container spacing={2}>
                {/* Procedure Search with freeSolo */}
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    ค้นหาหัตถการ *
                  </Typography>
                  <Autocomplete
                    options={procedureOptions}
                    freeSolo // เพิ่มบรรทัดนี้เพื่อให้พิมพ์ได้อิสระ
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return `${option.PROCEDURE_NAME} (${option.CATEGORY})`;
                    }}
                    value={procedureOptions.find(opt => opt.PROCEDURE_CODE === procedureData.procedureCode) || procedureData.procedureName || null}
                    onChange={(event, newValue) => handleProcedureSelect(newValue)}
                    onInputChange={(event, newInputValue) => {
                      // อัปเดตชื่อหัตถการเมื่อพิมพ์
                      if (event?.type === 'change') {
                        handleProcedureChange('procedureName', newInputValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="พิมพ์ชื่อหัตถการ หรือเลือกจากรายการ"
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
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {option.PROCEDURE_NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.CATEGORY} | รหัส: {option.PROCEDURE_CODE}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText={
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <AutoFixHighIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          ไม่พบหัตถการในระบบ
                        </Typography>
                        <Typography variant="caption" color="primary">
                          💡 สามารถพิมพ์ชื่อหัตถการใหม่ได้เลย
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    💡 เลือกจากรายการ หรือพิมพ์ชื่อหัตถการใหม่ได้เลย
                  </Typography>
                </Grid>

                {/* Doctor Name */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                    แพทย์ผู้ทำ
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="ชื่อแพทย์ผู้ทำหัตถการ"
                    value={procedureData.doctorName}
                    onChange={(e) => handleProcedureChange('doctorName', e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                {/* Note */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                    หมายเหตุ
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="หมายเหตุเพิ่มเติม"
                    value={procedureData.note}
                    onChange={(e) => handleProcedureChange('note', e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                {/* Add Button */}
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {editingIndex >= 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          resetForm();
                          setEditingIndex(-1);
                          showSnackbar('ยกเลิกการแก้ไข', 'info');
                        }}
                        size="small"
                      >
                        ยกเลิก
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleAddProcedure}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#5698E0',
                        color: '#FFFFFF',
                        minWidth: 130,
                        '&:hover': {
                          bgcolor: '#4285d1'
                        }
                      }}
                    >
                      {editingIndex >= 0 ? 'บันทึกการแก้ไข' : 'เพิ่มหัตถการ'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Medicine Form */}
          <Card sx={{ p: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2' }}>
                {editingMedicineIndex >= 0 ? '🔄 แก้ไขยา' : '💊 เพิ่มยา (สำหรับหัตถการที่ต้องใช้ยา)'}
              </Typography>

              <Grid container spacing={2}>
                {/* Drug Name */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    ชื่อยา *
                  </Typography>
                  <Autocomplete
                    options={getAvailableDrugs()}
                    getOptionLabel={(option) => {
                      const genericName = option.GENERIC_NAME || '';
                      const tradeName = option.TRADE_NAME || '';
                      const drugCode = option.DRUG_CODE || '';
                      return `${genericName}-${tradeName}-${drugCode}`;
                    }}
                    isOptionEqualToValue={(option, value) => {
                      return option.DRUG_CODE === value.DRUG_CODE;
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const drugsWithName = options.filter(option => 
                        (option.GENERIC_NAME && option.GENERIC_NAME.trim() !== '') || 
                        (option.TRADE_NAME && option.TRADE_NAME.trim() !== '')
                      );
                      
                      if (!inputValue || inputValue.trim() === '') {
                        return drugsWithName;
                      }
                      
                      const searchTerm = inputValue.toLowerCase().trim();
                      return drugsWithName.filter(option =>
                        (option.GENERIC_NAME || '').toLowerCase().includes(searchTerm) ||
                        (option.TRADE_NAME || '').toLowerCase().includes(searchTerm) ||
                        (option.DRUG_CODE || '').toLowerCase().includes(searchTerm)
                      );
                    }}
                    value={getAvailableDrugs().find(opt => opt.DRUG_CODE === medicineData.drugCode) || null}
                    onChange={(event, newValue) => {
                      handleDrugSelect(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="ชื่อยา"
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

                {/* Quantity */}
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                    จำนวน *
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="จำนวน"
                    value={medicineData.quantity}
                    onChange={(e) => handleMedicineChange('quantity', e.target.value)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                {/* Unit */}
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                    หน่วยนับ *
                  </Typography>
                  <TextField
                    size="small"
                    value={medicineData.unitName || (medicineData.unit ? getUnitName(medicineData.unit) : '')}
                    placeholder="หน่วยนับ"
                    disabled
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f5f5f5'
                      },
                    }}
                  />
                </Grid>

                {/* Add Medicine Button */}
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {editingMedicineIndex >= 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          resetMedicineForm();
                          setEditingMedicineIndex(-1);
                          showSnackbar('ยกเลิกการแก้ไข', 'info');
                        }}
                        size="small"
                      >
                        ยกเลิก
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleAddMedicine}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#5698E0',
                        color: '#FFFFFF',
                        minWidth: 130,
                        '&:hover': {
                          bgcolor: '#4285d1'
                        }
                      }}
                    >
                      {editingMedicineIndex >= 0 ? 'บันทึกการแก้ไข' : 'เพิ่มยา'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Procedure List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MedicalServicesIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              รายการทำหัตถการ ({savedProcedures.length} รายการ)
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: '#F0F5FF' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>
                    <Checkbox disabled />
                    ลำดับ
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>รายการทำหัตถการ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>รหัส</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>แพทย์ผู้ทำ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>หมายเหตุ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedProcedures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        ยังไม่มีรายการหัตถการ กรุณาเพิ่มรายการหัตถการด้านบน
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  savedProcedures.map((procedure, index) => (
                    <TableRow
                      key={procedure.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                        bgcolor: editingIndex === index ? '#fff3e0' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Checkbox />
                        {index + 1}
                      </TableCell>
                      <TableCell>{procedure.procedureName}</TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: procedure.procedureCode?.startsWith('CUSTOM_') ? '#fff3e0' : '#e3f2fd',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '11px'
                          }}
                        >
                          {procedure.procedureCode || 'ไม่มีรหัส'}
                        </Typography>
                      </TableCell>
                      <TableCell>{procedure.doctorName}</TableCell>
                      <TableCell>{procedure.note}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => handleEditProcedure(index)}
                            size="small"
                            sx={{
                              border: '1px solid #5698E0',
                              borderRadius: '7px',
                              color: '#5698E0'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteProcedure(index)}
                            size="small"
                            sx={{
                              border: '1px solid #F62626',
                              borderRadius: '7px',
                              color: '#F62626'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Medicine List */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MedicalServicesIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              รายการยา ({savedMedicines.length} รายการ)
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: '#F0F5FF' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>รหัสยา</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        ยังไม่มีรายการยา กรุณาเพิ่มรายการยาด้านบน
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  savedMedicines.map((medicine, index) => (
                    <TableRow
                      key={medicine.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                        bgcolor: editingMedicineIndex === index ? '#fff3e0' : 'inherit'
                      }}
                    >
                      <TableCell>
                        {index + 1}
                        {editingMedicineIndex === index && (
                          <Typography component="span" sx={{
                            ml: 1,
                            fontSize: '0.75rem',
                            color: '#ff9800',
                            fontWeight: 'bold'
                          }}>
                            (แก้ไข)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {medicine.drugName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {medicine.drugCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{medicine.quantity}</TableCell>
                      <TableCell>{medicine.unitName || getUnitName(medicine.unit)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => handleEditMedicine(index)}
                            size="small"
                            sx={{
                              border: '1px solid #5698E0',
                              borderRadius: '7px',
                              color: '#5698E0',
                              bgcolor: editingMedicineIndex === index ? '#e3f2fd' : 'transparent'
                            }}
                            disabled={editingMedicineIndex >= 0 && editingMedicineIndex !== index}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteMedicine(index)}
                            size="small"
                            sx={{
                              border: '1px solid #F62626',
                              borderRadius: '7px',
                              color: '#F62626'
                            }}
                            disabled={editingMedicineIndex >= 0}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || (savedProcedures.length === 0 && savedMedicines.length === 0)}
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
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

Procedure.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default Procedure;