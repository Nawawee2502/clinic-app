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
import EmployeeService from "../../services/employeeService";
import MedicalProcedureService from "../../services/medicalProcesureService";

const Procedure = ({ currentPatient, onSaveSuccess }) => {
  const [procedureData, setProcedureData] = useState({
    procedureName: '',
    procedureCode: '',
    note: '',
    doctorName: '',
    EMP_CODE: ''
  });

  const [savedProcedures, setSavedProcedures] = useState([]);
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Medicine states
  const [medicineData, setMedicineData] = useState({
    drugName: '',
    drugCode: '',
    genericName: '', // ✅ เพิ่ม genericName
    tradeName: '', // ✅ เพิ่ม tradeName
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
  const hasProcedures = savedProcedures.length > 0;

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    loadProcedureOptions();
    loadDrugOptions();
    loadEmployees();
  }, []);

  // โหลดข้อมูลหัตถการเมื่อ currentPatient หรือ employeeList เปลี่ยน
  useEffect(() => {
    if (currentPatient?.VNO) {
      loadProcedureData();
    }
  }, [currentPatient, employeeList]);

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
          // ✅ Deduplicate procedures โดยใช้ procedureCode หรือ procedureName
          const seenProcedures = new Map();
          const uniqueProcedures = [];
          
          response.data.procedures.forEach((procedure, index) => {
            const procedureCode = procedure.MEDICAL_PROCEDURE_CODE || procedure.PROCEDURE_CODE;
            const procedureName = procedure.MED_PRO_NAME_THAI || procedure.PROCEDURE_NAME || 'ไม่ระบุชื่อ';
            const key = procedureCode || procedureName;
            
            // ถ้ายังไม่เคยเห็น procedure นี้ ให้เพิ่มเข้าไป
            if (!seenProcedures.has(key)) {
              seenProcedures.set(key, true);
              
              // หา employee จาก employeeList
              const employee = employeeList.find(e => e.EMP_CODE === procedure.EMP_CODE);
              // ✅ เก็บ UNIT_PRICE และ AMT จาก database
              const unitPrice = parseFloat(procedure.UNIT_PRICE || 0);
              const qty = parseFloat(procedure.QTY || 1);
              const amt = parseFloat(procedure.AMT || 0);
              
              uniqueProcedures.push({
                id: uniqueProcedures.length + 1,
                procedureName: procedureName,
                procedureCode: procedureCode,
                note: procedure.NOTE1 || '',
                doctorName: employee ? employee.EMP_NAME : (procedure.DOCTOR_NAME || 'นพ.ผู้รักษา'),
                EMP_CODE: procedure.EMP_CODE || '',
                unitPrice: unitPrice, // ✅ เก็บราคาไว้
                amt: amt // ✅ เก็บยอดรวมไว้
              });
            }
          });
          
          setSavedProcedures(uniqueProcedures);
        }

        // Load medicines - ดึง GENERIC_NAME และ TRADE_NAME ที่ถูกต้องจาก DrugService
        // ✅ กรองเฉพาะยาฉีด (Type1 = 'TD002') เหมือนตอนเรียกเพิ่มยา
        if (response.data.drugs) {
          // ✅ Deduplicate medicines โดยใช้ DRUG_CODE และกรองเฉพาะยาฉีด
          const seenDrugs = new Map();
          const uniqueDrugs = [];
          
          response.data.drugs.forEach((drug, index) => {
            const drugCode = drug.DRUG_CODE;
            
            // ✅ กรองเฉพาะยาฉีด (Type1 = 'TD002') หรือถ้ายังไม่มี Type1 ให้ดึงจาก DrugService
            // ถ้ายังไม่เคยเห็นยาตัวนี้ ให้เพิ่มเข้าไป
            if (drugCode && !seenDrugs.has(drugCode)) {
              seenDrugs.set(drugCode, true);
              
              // ✅ ตรวจสอบว่าเป็นยาฉีดหรือไม่
              // ถ้ามี Type1 = 'TD002' หรือยังไม่มี Type1 ให้เพิ่มเข้าไปก่อน (จะตรวจสอบอีกทีตอนดึงข้อมูล)
              if (!drug.Type1 || drug.Type1 === 'TD002') {
                uniqueDrugs.push(drug);
              }
            }
          });
          
          // ✅ โหลดข้อมูลเพิ่มเติมสำหรับยาที่ไม่ซ้ำ - ดึง GENERIC_NAME, TRADE_NAME และ Type1 ที่ถูกต้อง
          const uniqueMedicines = await Promise.all(
            uniqueDrugs.map(async (drug, index) => {
              // ✅ ตั้งค่าเริ่มต้นจากข้อมูลที่มี
              let genericName = drug.GENERIC_NAME || '';
              let tradeName = drug.TRADE_NAME || '';
              let drugType = drug.Type1 || '';
              
              // ✅ ดึงข้อมูลจาก DrugService เพื่อให้ได้ GENERIC_NAME, TRADE_NAME และ Type1 ที่ถูกต้อง
              // และตรวจสอบว่าเป็นยาฉีดหรือไม่
              const needsUpdate = 
                !genericName || 
                !tradeName ||
                genericName.toLowerCase().startsWith('ยา ') ||
                tradeName.toLowerCase().startsWith('ยา ') ||
                !drugType;
              
              // ✅ ต้องดึงข้อมูลจาก DrugService เสมอเพื่อตรวจสอบ Type1
              try {
                const drugResponse = await DrugService.getDrugByCode(drug.DRUG_CODE);
                if (drugResponse.success && drugResponse.data) {
                  // ✅ อัปเดต GENERIC_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                  if (!genericName || genericName.toLowerCase().startsWith('ยา ')) {
                    genericName = drugResponse.data.GENERIC_NAME || genericName || '';
                  }
                  // ✅ อัปเดต TRADE_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                  if (!tradeName || tradeName.toLowerCase().startsWith('ยา ')) {
                    tradeName = drugResponse.data.TRADE_NAME || tradeName || '';
                  }
                  // ✅ อัปเดต Type1 จาก DrugService (สำคัญ!)
                  drugType = drugResponse.data.Type1 || drugType || '';
                }
              } catch (error) {
                console.warn(`Could not fetch drug details for ${drug.DRUG_CODE}:`, error);
              }
              
              // ✅ กรองเฉพาะยาฉีด (Type1 = 'TD002')
              // ถ้าไม่ใช่ยาฉีด ให้ return null และ filter ออกภายหลัง
              if (drugType !== 'TD002') {
                console.log(`⚠️ Skipping non-injection drug: ${drug.DRUG_CODE} (Type1: ${drugType})`);
                return null;
              }
              
              return {
                id: index + 1,
                drugName: genericName || drug.DRUG_CODE, // ✅ ใช้ genericName ที่ถูกต้อง
                genericName: genericName, // ✅ เก็บ GENERIC_NAME ที่ถูกต้อง
                tradeName: tradeName, // ✅ เก็บ TRADE_NAME ที่ถูกต้อง
                drugCode: drug.DRUG_CODE,
                quantity: drug.QTY,
                unit: drug.UNIT_CODE || 'AMP',
                unitName: drug.UNIT_NAME || getUnitName(drug.UNIT_CODE || 'AMP'),
                unitPrice: drug.UNIT_PRICE || 0
              };
            })
          );
          
          // ✅ กรองเฉพาะยาฉีด (filter out null values)
          const injectionMedicines = uniqueMedicines.filter(medicine => medicine !== null);
          
          console.log(`💉 Loaded ${injectionMedicines.length} injection drugs from ${uniqueDrugs.length} total drugs`);
          
          setSavedMedicines(injectionMedicines);
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
      // ✅ ใช้ MedicalProcedureService
      const response = await MedicalProcedureService.getAllProcedures({ limit: 10000 });

      if (response.success && response.data) {
        // ✅ Deduplicate options based on PROCEDURE_CODE
        const uniqueProcedures = [];
        const seenCodes = new Set();

        response.data.forEach(item => {
          const code = item.MEDICAL_PROCEDURE_CODE;
          if (code && !seenCodes.has(code)) {
            seenCodes.add(code);
            uniqueProcedures.push({
              PROCEDURE_CODE: code,
              PROCEDURE_NAME: item.MED_PRO_NAME_THAI,
              CATEGORY: item.MED_PRO_TYPE || 'ทั่วไป',
              UNIT_PRICE: item.UNIT_PRICE || 0
            });
          }
        });

        setProcedureOptions(uniqueProcedures);
      } else {
        throw new Error('Invalid response format');
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

  const loadEmployees = async () => {
    try {
      // ✅ ดึงเฉพาะแพทย์ (เช่นเดียวกับระบบนัดหมาย)
      const response = await EmployeeService.getAllEmployees('หมอ');
      if (response.success && response.data) {
        setEmployeeList(response.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
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
    const finalProcedureName = procedureData.procedureName.trim();

    if (!finalProcedureCode || finalProcedureCode.trim() === '') {
      const timestamp = Date.now().toString().slice(-6);
      finalProcedureCode = `CUSTOM_${timestamp}`;

      // เพิ่มรหัสนี้เข้าไปในตาราง TABLE_MEDICAL_PROCEDURES
      try {
        await addCustomProcedureToDatabase(finalProcedureCode, finalProcedureName);
      } catch (error) {
        console.warn('Could not add custom procedure to database:', error);
      }
    }

    // ✅ เช็ค duplicate procedure (ถ้าไม่ใช่โหมดแก้ไข)
    if (editingIndex < 0) {
      const isDuplicate = savedProcedures.some(proc => 
        (proc.procedureCode && proc.procedureCode === finalProcedureCode) ||
        (!proc.procedureCode && proc.procedureName === finalProcedureName)
      );
      
      if (isDuplicate) {
        showSnackbar('หัตถการนี้ถูกเพิ่มไปแล้ว กรุณาเลือกหัตถการอื่น', 'warning');
        return;
      }
    }

    // ✅ ดึงราคาจาก procedureOptions
    const procedureOption = procedureOptions.find(
      opt => opt.PROCEDURE_CODE === finalProcedureCode ||
        opt.PROCEDURE_NAME === finalProcedureName
    );
    const unitPrice = parseFloat(procedureOption?.UNIT_PRICE || 0);
    const qty = 1;
    const amt = unitPrice * qty;

    const newProcedure = {
      id: editingIndex >= 0 ? savedProcedures[editingIndex].id : Date.now(),
      procedureName: finalProcedureName,
      procedureCode: finalProcedureCode,
      note: procedureData.note.trim(),
      doctorName: selectedEmployee ? selectedEmployee.EMP_NAME : (procedureData.doctorName.trim() || 'นพ.ผู้รักษา'),
      EMP_CODE: procedureData.EMP_CODE || '',
      unitPrice: unitPrice, // ✅ เก็บราคาไว้
      amt: amt // ✅ เก็บยอดรวมไว้
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
      console.log('Loading drug options (ยาฉีด only - TD002)...');
      setApiStatus('checking');
      // ✅ กรองเฉพาะยาที่มี Type1 = 'TD002' (ยาฉีด)
      const response = await DrugService.getAllDrugs({
        limit: 10000,
        type: 'TD002'
      });

      if (response.success && response.data) {
        console.log('Drug API available, loaded', response.data.length, 'drugs');
        // ✅ กรองเฉพาะยาที่มี Type1 = 'TD002' (ยาฉีด)
        const injectionDrugs = response.data.filter(drug =>
          drug.Type1 === 'TD002'
        );

        console.log('Filtered injection drugs (TD002):', injectionDrugs.length);

        // ✅ ดึงข้อมูลเพิ่มเติมจาก DrugService เพื่อให้ได้ GENERIC_NAME และ TRADE_NAME ที่ถูกต้อง
        const formattedDrugs = await Promise.all(
          injectionDrugs.map(async (drug) => {
            let genericName = drug.GENERIC_NAME || '';
            let tradeName = drug.TRADE_NAME || '';
            
            // ✅ เช็คว่าข้อมูลปัจจุบันดูเหมือนมีปัญหา (เช่น GENERIC_NAME เป็น "ยา D0001")
            const needsUpdate = 
              !genericName || 
              !tradeName ||
              genericName.toLowerCase().startsWith('ยา ') ||
              tradeName.toLowerCase().startsWith('ยา ');
            
            if (needsUpdate) {
              try {
                const drugResponse = await DrugService.getDrugByCode(drug.DRUG_CODE);
                if (drugResponse.success && drugResponse.data) {
                  // ✅ อัปเดต GENERIC_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                  if (!genericName || genericName.toLowerCase().startsWith('ยา ')) {
                    genericName = drugResponse.data.GENERIC_NAME || genericName || '';
                  }
                  // ✅ อัปเดต TRADE_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
                  if (!tradeName || tradeName.toLowerCase().startsWith('ยา ')) {
                    tradeName = drugResponse.data.TRADE_NAME || tradeName || '';
                  }
                }
              } catch (error) {
                console.warn(`Could not fetch drug details for ${drug.DRUG_CODE}:`, error);
              }
            }
            
            return {
              DRUG_CODE: drug.DRUG_CODE,
              GENERIC_NAME: genericName,
              TRADE_NAME: tradeName,
              UNIT_CODE: drug.UNIT_CODE || 'AMP',
              UNIT_NAME: drug.UNIT_NAME || drug.UNIT_NAME1 || '',
              UNIT_PRICE: drug.UNIT_PRICE || 0,
              Type1: drug.Type1 || '',
              Dose1: drug.Dose1 || '',
              Indication1: drug.Indication1 || '',
              Comment1: drug.Comment1 || '',
              eat1: drug.eat1 || ''
            };
          })
        );
        
        setDrugOptions(formattedDrugs);
        setApiStatus('connected');
        console.log('Formatted injection drugs:', formattedDrugs.slice(0, 3));
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

  const handleDrugSelect = async (newValue) => {
    if (!hasProcedures) {
      showSnackbar('กรุณาเพิ่มหัตถการอย่างน้อย 1 รายการก่อนเลือกยา', 'warning');
      return;
    }
    if (newValue) {
      if (isDuplicateMedicine(newValue.DRUG_CODE)) {
        showSnackbar('ยาตัวนี้ถูกเพิ่มไปแล้ว กรุณาเลือกยาตัวอื่น', 'warning');
        return;
      }

      const defaultQuantity = newValue.Dose1 || '1';
      
      // ✅ ดึงข้อมูลยาจาก DrugService เพื่อให้ได้ GENERIC_NAME และ TRADE_NAME ที่ถูกต้อง
      let genericName = newValue.GENERIC_NAME || '';
      let tradeName = newValue.TRADE_NAME || '';
      
      // เช็คว่าข้อมูลปัจจุบันดูเหมือนมีปัญหา (เช่น GENERIC_NAME เป็น "ยา D0001")
      const needsUpdate = 
        !genericName || 
        !tradeName ||
        genericName.toLowerCase().startsWith('ยา ') ||
        tradeName.toLowerCase().startsWith('ยา ');
      
      if (needsUpdate) {
        try {
          const drugResponse = await DrugService.getDrugByCode(newValue.DRUG_CODE);
          if (drugResponse.success && drugResponse.data) {
            // ✅ อัปเดต GENERIC_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
            if (!genericName || genericName.toLowerCase().startsWith('ยา ')) {
              genericName = drugResponse.data.GENERIC_NAME || genericName || '';
            }
            // ✅ อัปเดต TRADE_NAME ถ้ายังไม่มีหรือดูเหมือนมีปัญหา
            if (!tradeName || tradeName.toLowerCase().startsWith('ยา ')) {
              tradeName = drugResponse.data.TRADE_NAME || tradeName || '';
            }
          }
        } catch (error) {
          console.warn(`Could not fetch drug details for ${newValue.DRUG_CODE}:`, error);
        }
      }

      setMedicineData(prev => ({
        ...prev,
        drugCode: newValue.DRUG_CODE,
        drugName: genericName || newValue.DRUG_CODE,
        genericName: genericName, // ✅ เก็บ GENERIC_NAME ที่ถูกต้อง
        tradeName: tradeName, // ✅ เก็บ TRADE_NAME ที่ถูกต้อง
        unit: newValue.UNIT_CODE || 'AMP',
        unitName: newValue.UNIT_NAME || getUnitName(newValue.UNIT_CODE || 'AMP'),
        unitPrice: newValue.UNIT_PRICE || 0,
        quantity: defaultQuantity
      }));
    } else {
      setMedicineData(prev => ({
        ...prev,
        drugCode: '',
        drugName: '',
        genericName: '', // ✅ เพิ่ม genericName
        tradeName: '', // ✅ เพิ่ม tradeName
        unit: '',
        unitName: '',
        unitPrice: 0,
        quantity: ''
      }));
    }
  };

  const handleAddMedicine = () => {
    if (!hasProcedures) {
      showSnackbar('ต้องมีหัตถการก่อนจึงจะเพิ่มยาได้', 'error');
      return;
    }
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
      genericName: medicineData.genericName || medicineData.drugName.trim(), // ✅ เก็บ GENERIC_NAME
      tradeName: medicineData.tradeName || '', // ✅ เก็บ TRADE_NAME
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
      genericName: '', // ✅ เพิ่ม genericName
      tradeName: '', // ✅ เพิ่ม tradeName
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
      genericName: medicine.genericName || medicine.drugName, // ✅ โหลด genericName
      tradeName: medicine.tradeName || '', // ✅ โหลด tradeName
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
      doctorName: '',
      EMP_CODE: ''
    });
    setSelectedEmployee(null);
  };

  const handleEditProcedure = (index) => {
    const procedure = savedProcedures[index];
    // หา employee จาก employeeList
    const employee = employeeList.find(e => e.EMP_CODE === procedure.EMP_CODE);
    setProcedureData({
      procedureName: procedure.procedureName,
      procedureCode: procedure.procedureCode,
      note: procedure.note,
      doctorName: procedure.doctorName,
      EMP_CODE: procedure.EMP_CODE || ''
    });
    setSelectedEmployee(employee || null);
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
        setSaving(false);
        return;
      }

      // เตรียมข้อมูลหัตถการในรูปแบบที่ API ต้องการ
      const lockedStatuses = ['รอชำระเงิน', 'ชำระเงินแล้ว', 'ปิดการรักษา'];
      const currentStatus =
        (currentPatient?.queueStatus || currentPatient?.STATUS1 || '').trim();
      const isLockedStatus = lockedStatuses.includes(currentStatus);

      const procedures = savedProcedures.map(procedure => {
        let finalCode = procedure.procedureCode;

        // ถ้าไม่มีรหัส หรือเป็นรหัสชั่วคราว ให้สร้างใหม่
        if (!finalCode || finalCode.startsWith('CUSTOM_')) {
          const timestamp = Date.now().toString().slice(-6);
          finalCode = `PROC_${timestamp}`;
        }

        // ✅ ดึงราคาจาก procedure.unitPrice (ที่โหลดมาจาก database) หรือจาก procedureOptions
        let unitPrice = parseFloat(procedure.unitPrice);
        if (isNaN(unitPrice) || unitPrice === 0) {
          // ถ้าไม่มีราคาใน procedure ให้หาจาก procedureOptions
          const procedureOption = procedureOptions.find(
            opt => opt.PROCEDURE_CODE === finalCode ||
              opt.PROCEDURE_NAME === procedure.procedureName
          );
          unitPrice = parseFloat(procedureOption?.UNIT_PRICE || 0);
          if (isNaN(unitPrice)) unitPrice = 0;
        }

        const qty = 1;
        const amt = unitPrice * qty;

        return {
          MEDICAL_PROCEDURE_CODE: finalCode,
          PROCEDURE_CODE: finalCode,
          PROCEDURE_NAME: procedure.procedureName,
          NOTE1: procedure.note || '',
          DOCTOR_NAME: procedure.doctorName || 'นพ.ผู้รักษา',
          EMP_CODE: procedure.EMP_CODE || '',
          PROCEDURE_DATE: new Date().toISOString().split('T')[0],
          QTY: qty,
          UNIT_CODE: 'ครั้ง', // ✅ ใช้ 'ครั้ง' ให้ตรงกับ database
          UNIT_PRICE: unitPrice, // ✅ ส่งเป็นตัวเลขเสมอ
          AMT: amt // ✅ ส่งเป็นตัวเลขเสมอ
        };
      });

      // เตรียมข้อมูลยาในรูปแบบที่ API ต้องการ
      const drugs = savedMedicines.map(medicine => {
        const qty = parseFloat(medicine.quantity);
        const unitPrice = parseFloat(medicine.unitPrice);
        const validQty = (isNaN(qty) || qty <= 0) ? 1 : qty;
        const validUnitPrice = isNaN(unitPrice) ? 0 : unitPrice;
        const amt = validQty * validUnitPrice;

        return {
          DRUG_CODE: medicine.drugCode,
          QTY: validQty, // ✅ ส่งเป็นตัวเลขเสมอ
          UNIT_CODE: medicine.unit || 'TAB',
          UNIT_PRICE: validUnitPrice, // ✅ ส่งเป็นตัวเลขเสมอ
          AMT: amt, // ✅ ส่งเป็นตัวเลขเสมอ
          NOTE1: '',
          TIME1: '' // ไม่ใช้วิธีรับประทาน แต่ต้องส่งไปเพื่อให้ backend ไม่ error
        };
      });

      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        ...(isLockedStatus ? {} : { STATUS1: 'กำลังตรวจ' }),
        procedures: procedures,  // ส่งข้อมูลหัตถการไปด้วย
        drugs: drugs  // ส่งข้อมูลยาไปด้วย
      };

      console.log('💾 Saving procedure data:', {
        VNO: treatmentData.VNO,
        proceduresCount: procedures.length,
        drugsCount: drugs.length,
        procedures: procedures,
        drugs: drugs
      });

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

      console.log('📥 Response from API:', response);

      if (response && response.success) {
        showSnackbar('บันทึกข้อมูลหัตถการสำเร็จ!', 'success');
        if (onSaveSuccess) {
          setTimeout(() => onSaveSuccess(), 1500);
        }
      } else {
        const errorMessage = (response && response.message) || 'ไม่สามารถบันทึกข้อมูลได้';
        showSnackbar('ไม่สามารถบันทึกข้อมูลได้: ' + errorMessage, 'error');
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
                        id="procedure-name"
                        name="procedureName"
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
                    getOptionKey={(option) => {
                      if (typeof option === 'string') return option;
                      return option.PROCEDURE_CODE || option.PROCEDURE_NAME || String(option);
                    }}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      const optionKey = typeof option === 'string' ? option : (option.PROCEDURE_CODE || option.PROCEDURE_NAME || key);
                      return (
                        <Box component="li" key={optionKey} {...otherProps}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {typeof option === 'string' ? option : option.PROCEDURE_NAME}
                            </Typography>
                            {typeof option !== 'string' && (
                              <Typography variant="caption" color="text.secondary">
                                {option.CATEGORY} | รหัส: {option.PROCEDURE_CODE}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
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
                  <Autocomplete
                    fullWidth
                    options={employeeList}
                    getOptionLabel={(option) => option.EMP_NAME || `${option.EMP_CODE}`}
                    value={selectedEmployee}
                    onChange={(event, newValue) => {
                      setSelectedEmployee(newValue);
                      if (newValue) {
                        setProcedureData(prev => ({
                          ...prev,
                          EMP_CODE: newValue.EMP_CODE,
                          doctorName: newValue.EMP_NAME
                        }));
                      } else {
                        setProcedureData(prev => ({
                          ...prev,
                          EMP_CODE: '',
                          doctorName: ''
                        }));
                      }
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="เลือกแพทย์ผู้ทำหัตถการ"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                      />
                    )}
                  />
                </Grid>

                {/* Note */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', mb: 1 }}>
                    หมายเหตุ
                  </Typography>
                  <TextField
                    id="procedure-note"
                    name="procedureNote"
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
          <Card sx={{ p: 2, mb: 2, position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2' }}>
                {editingMedicineIndex >= 0 ? '🔄 แก้ไขยา' : '💊 เพิ่มยา (สำหรับหัตถการที่ต้องใช้ยา)'}
              </Typography>

              {!hasProcedures && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  กรุณาเพิ่มหัตถการก่อน จากนั้นจึงสามารถเพิ่มยาที่ใช้ร่วมได้
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Drug Name */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: "400", fontSize: "16px", mb: 1 }}>
                    ชื่อยา *
                  </Typography>
                  <Autocomplete
                    disabled={!hasProcedures}
                    options={getAvailableDrugs()}
                    disablePortal
                    filterSelectedOptions
                    getOptionLabel={(option) => {
                      const genericName = option.GENERIC_NAME || '';
                      const tradeName = option.TRADE_NAME || '';
                      const drugCode = option.DRUG_CODE || '';
                      return [genericName, tradeName, drugCode].filter(Boolean).join(' / ') || drugCode || '';
                    }}
                    getOptionKey={(option) => option.DRUG_CODE || `${option.GENERIC_NAME}-${option.TRADE_NAME}`}
                    isOptionEqualToValue={(option, value) => {
                      return option.DRUG_CODE === value.DRUG_CODE;
                    }}
                    filterOptions={(options, { inputValue }) => {
                      // ✅ กรองยาที่ไม่มีชื่อออกก่อน
                      const drugsWithName = options.filter(option =>
                        (option.GENERIC_NAME && option.GENERIC_NAME.trim() !== '') ||
                        (option.TRADE_NAME && option.TRADE_NAME.trim() !== '')
                      );

                      // ✅ ลบ duplicate โดยใช้ DRUG_CODE
                      const uniqueDrugs = drugsWithName.filter((drug, index, self) =>
                        index === self.findIndex(d => d.DRUG_CODE === drug.DRUG_CODE)
                      );

                      if (!inputValue || inputValue.trim() === '') {
                        return uniqueDrugs;
                      }

                      const searchTerm = inputValue.toLowerCase().trim();
                      
                      if (!searchTerm) {
                        return uniqueDrugs;
                      }
                      
                      // ✅ ค้นหาแบบครอบคลุม - ค้นหาในทั้ง 3 อย่าง (GENERIC_NAME, TRADE_NAME, DRUG_CODE)
                      // ใช้ includes เพื่อให้ค้นหาได้ทั้งตัวที่ขึ้นต้นและอยู่ตรงกลาง
                      const filtered = uniqueDrugs.filter(option => {
                        const genericName = String(option.GENERIC_NAME || '').toLowerCase().trim();
                        const tradeName = String(option.TRADE_NAME || '').toLowerCase().trim();
                        const drugCode = String(option.DRUG_CODE || '').toLowerCase().trim();
                        
                        // ✅ ค้นหาในทั้ง 3 fields - ใช้ includes เพื่อให้ครอบคลุม
                        const matchesGeneric = genericName.includes(searchTerm);
                        const matchesTrade = tradeName.includes(searchTerm);
                        const matchesCode = drugCode.includes(searchTerm);
                        
                        // ต้องมีอย่างน้อย 1 field ที่ตรงกับ searchTerm
                        return matchesGeneric || matchesTrade || matchesCode;
                      });
                      
                      // Debug: log ผลลัพธ์การค้นหา
                      if (filtered.length > 0) {
                        console.log(`🔍 Search "${searchTerm}": Found ${filtered.length} drugs`, filtered.slice(0, 3).map(d => ({
                          code: d.DRUG_CODE,
                          generic: d.GENERIC_NAME,
                          trade: d.TRADE_NAME
                        })));
                      }
                      
                      return filtered;
                    }}
                    value={getAvailableDrugs().find(opt => opt.DRUG_CODE === medicineData.drugCode) || null}
                    onChange={(event, newValue) => {
                      handleDrugSelect(newValue);
                    }}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box 
                          component="li" 
                          key={option.DRUG_CODE || key}
                          {...otherProps} 
                          sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                        >
                          <Box component="span" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {[
                              option.GENERIC_NAME,
                              option.TRADE_NAME,
                              option.DRUG_CODE
                            ].filter(Boolean).join(' / ') || option.DRUG_CODE || ''}
                          </Box>
                          {option.UNIT_CODE && (
                            <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              หน่วย: {option.UNIT_CODE}
                            </Box>
                          )}
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="medicine-drug-name"
                        name="medicineDrugName"
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
                    id="medicine-quantity"
                    name="medicineQuantity"
                    disabled={!hasProcedures}
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
                    id="medicine-unit"
                    name="medicineUnit"
                    disabled
                    size="small"
                    value={medicineData.unitName || (medicineData.unit ? getUnitName(medicineData.unit) : '')}
                    placeholder="หน่วยนับ"
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
                        disabled={!hasProcedures}
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
                      disabled={!hasProcedures}
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
                  <TableCell sx={{ fontWeight: 'bold' }}>แพทย์ผู้ทำ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>หมายเหตุ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedProcedures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
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
                          {[
                            medicine.genericName || medicine.drugName,
                            medicine.tradeName,
                            medicine.drugCode
                          ].filter(Boolean).join(' / ') || medicine.drugCode || '-'}
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