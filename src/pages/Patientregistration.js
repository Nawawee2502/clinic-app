import React, { useState } from "react";
import { Tabs, Tab, Card, CardContent, Typography, Box, Alert, Snackbar } from "@mui/material";
import GeneralInfoTab from '../components/patientregistration/GeneralInfoTab';
import ContactInfoTab from '../components/patientregistration/ContactInfoTab';
import HealthHistoryTab from '../components/patientregistration/HealthHistoryTab';
// import PatientService from '../services/patientService';
import PatientService from "../services/patientService";

const PatientRegistration = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State สำหรับเก็บข้อมูลทั้งหมด
  const [patientData, setPatientData] = useState({
    // ข้อมูลทั่วไป
    HNCODE: '',
    IDNO: '',
    PRENAME: '',
    NAME1: '',
    SURNAME: '',
    SEX: '',
    BDATE: '',
    AGE: '',
    BLOOD_GROUP1: '',
    OCCUPATION1: '',
    ORIGIN1: '',
    NATIONAL1: '',
    RELIGION1: '',
    STATUS1: '',
    WEIGHT1: '',
    HIGH1: '',

    // ข้อมูลที่อยู่ตามบัตรประชาชน
    CARD_ADDR1: '',
    CARD_TUMBOL_CODE: '',
    CARD_AMPHER_CODE: '',
    CARD_PROVINCE_CODE: '',
    CARD_ZIPCODE: '',

    // ข้อมูลที่อยู่ปัจจุบัน
    ADDR1: '',
    TUMBOL_CODE: '',
    AMPHER_CODE: '',
    PROVINCE_CODE: '',
    ZIPCODE: '',
    TEL1: '',
    EMAIL1: '',

    // ประวัติสุขภาพ
    DISEASE1: '',
    DRUG_ALLERGY: '',
    FOOD_ALLERGIES: '',

    // การตั้งค่าเพิ่มเติม
    useCardAddress: false // สำหรับ checkbox ใช้ที่อยู่เดียวกัน
  });

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  // ฟังก์ชันสำหรับอัพเดทข้อมูล
  const updatePatientData = (newData) => {
    setPatientData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  // ฟังก์ชันสำหรับไปแท็บถัดไป
  const handleNext = () => {
    if (tabIndex < 2) {
      setTabIndex(tabIndex + 1);
    }
  };

  // ฟังก์ชันสำหรับกลับแท็บก่อนหน้า
  const handlePrev = () => {
    if (tabIndex > 0) {
      setTabIndex(tabIndex - 1);
    }
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูล
  const handleSave = async () => {
    setLoading(true);

    try {
      // Validate ข้อมูลโดยใช้ PatientService
      const validationErrors = PatientService.validatePatientData(patientData);
      if (validationErrors.length > 0) {
        setSnackbar({
          open: true,
          message: validationErrors.join(', '),
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // จัดรูปแบบข้อมูลก่อนส่ง
      const formattedData = PatientService.formatPatientData(patientData);

      console.log('Sending data to API:', formattedData);

      // เรียก API ผ่าน PatientService
      const result = await PatientService.createPatient(formattedData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: `บันทึกข้อมูลผู้ป่วยสำเร็จ! HN: ${result.data.HNCODE}`,
          severity: 'success'
        });

        // รีเซ็ตฟอร์ม
        resetForm();

      } else {
        setSnackbar({
          open: true,
          message: result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving patient data:', error);

      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';

      if (error.message.includes('409')) {
        errorMessage = 'รหัส HN นี้มีอยู่แล้วในระบบ';
      } else if (error.message.includes('400')) {
        errorMessage = 'ข้อมูลที่ส่งไปไม่ถูกต้อง';
      } else if (error.message.includes('500')) {
        errorMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
  const resetForm = () => {
    setPatientData({
      HNCODE: '',
      IDNO: '',
      PRENAME: '',
      NAME1: '',
      SURNAME: '',
      SEX: '',
      BDATE: '',
      AGE: '',
      BLOOD_GROUP1: '',
      OCCUPATION1: '',
      ORIGIN1: '',
      NATIONAL1: '',
      RELIGION1: '',
      STATUS1: '',
      WEIGHT1: '',
      HIGH1: '',
      CARD_ADDR1: '',
      CARD_TUMBOL_CODE: '',
      CARD_AMPHER_CODE: '',
      CARD_PROVINCE_CODE: '',
      CARD_ZIPCODE: '',
      ADDR1: '',
      TUMBOL_CODE: '',
      AMPHER_CODE: '',
      PROVINCE_CODE: '',
      ZIPCODE: '',
      TEL1: '',
      EMAIL1: '',
      DISEASE1: '',
      DRUG_ALLERGY: '',
      FOOD_ALLERGIES: '',
      useCardAddress: false
    });

    // กลับไปแท็บแรก
    setTabIndex(0);
  };

  // ฟังก์ชันสำหรับแก้ไขข้อมูล (กลับไปแท็บแรก)
  const handleEdit = () => {
    setTabIndex(0);
    setSnackbar({
      open: true,
      message: 'เข้าสู่โหมดแก้ไขข้อมูล',
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: "100%", pt: 2 }}>
      <Typography sx={{
        fontWeight: '600',
        fontSize: '24px',
        fontFamily: 'Instrument Sans',
        letterSpacing: '1.5px',
        lineHeight: '2',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        ลงทะเบียนผู้ป่วย
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        sx={{
          backgroundColor: "#F0F5FF",
          borderRadius: "8px",
          alignSelf: "start",
          "& .MuiTab-root": {
            color: "#6B7280",
            fontWeight: "bold",
            textAlign: "left",
          },
          "& .Mui-selected": {
            backgroundColor: "#D6E4FF",
            borderRadius: "8px",
            color: "#1D4ED8",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
          width: 'auto'
        }}
      >
        <Tab label="ข้อมูลทั่วไป" />
        <Tab label="ข้อมูลติดต่อ" />
        <Tab label="ประวัติสุขภาพ" />
      </Tabs>

      <Card sx={{ width: "100%", mt: 2 }}>
        <CardContent>
          {tabIndex === 0 && (
            <GeneralInfoTab
              onNext={handleNext}
              patientData={patientData}
              updatePatientData={updatePatientData}
            />
          )}
          {tabIndex === 1 && (
            <ContactInfoTab
              onNext={handleNext}
              onPrev={handlePrev}
              patientData={patientData}
              updatePatientData={updatePatientData}
            />
          )}
          {tabIndex === 2 && (
            <HealthHistoryTab
              onPrev={handlePrev}
              onSave={handleSave}
              onEdit={handleEdit}
              patientData={patientData}
              updatePatientData={updatePatientData}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Snackbar สำหรับแสดงข้อความ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientRegistration;