import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Snackbar,
  Alert,
  Container,
  Card,
  Tabs,
  Tab,
  CardContent,

} from "@mui/material";

// Import Components
import QueueDisplayPanel from '../components/patientregistration/QueueDisplayPanel';
import PatientReceptionSection from '../components/patientregistration/PatientReceptionSection';
import AppointmentManagementSection from '../components/patientregistration/AppointmentManagementSection';
import GeneralInfoTab from '../components/patientregistration/GeneralInfoTab';
import ContactInfoTab from '../components/patientregistration/ContactInfoTab';
import HealthHistoryTab from '../components/patientregistration/HealthHistoryTab';

// Import Services
import PatientService from "../services/patientService";
import QueueService from "../services/queueService";

const PatientRegistration = () => {
  const [mainView, setMainView] = useState('reception'); // reception, newPatient, appointments
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ เพิ่ม state สำหรับเก็บข้อมูลผู้ป่วยที่เพิ่งลงทะเบียน
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState(null);

  // Queue State
  const [todayQueue, setTodayQueue] = useState([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    waiting: 0,
    completed: 0
  });

  // Appointments State
  const [appointments, setAppointments] = useState([]);

  // New Patient Registration State (ใช้ของเดิม)
  const [newPatientTabIndex, setNewPatientTabIndex] = useState(0);
  const [patientData, setPatientData] = useState({
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

  // Load initial data
  useEffect(() => {
    loadTodayQueue();
    loadQueueStats();
    loadTodayAppointments();
  }, []);

  // Load today's queue
  const loadTodayQueue = async () => {
    try {
      setLoading(true);
      const response = await QueueService.getTodayQueue();

      if (response.success) {
        setTodayQueue(response.data);
      } else {
        showSnackbar('ไม่สามารถโหลดข้อมูลคิวได้', 'error');
      }
    } catch (error) {
      console.error('Error loading today queue:', error);
      showSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลคิว', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load queue statistics
  const loadQueueStats = async () => {
    try {
      const response = await QueueService.getQueueStats();

      if (response.success) {
        setQueueStats({
          total: response.data.today_queue.total || 0,
          waiting: response.data.today_queue.waiting || 0,
          completed: response.data.today_queue.completed || 0
        });
      }
    } catch (error) {
      console.error('Error loading queue stats:', error);
    }
  };

  // Load today's appointments
  const loadTodayAppointments = async () => {
    try {
      const response = await PatientService.getTodayAppointments();

      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    loadTodayQueue();
    loadQueueStats();
    loadTodayAppointments();
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // New Patient Registration Functions (ใช้ของเดิม)
  const updatePatientData = (newData) => {
    setPatientData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const handleNextNewPatient = () => {
    if (newPatientTabIndex < 2) {
      setNewPatientTabIndex(newPatientTabIndex + 1);
    }
  };

  const handlePrevNewPatient = () => {
    if (newPatientTabIndex > 0) {
      setNewPatientTabIndex(newPatientTabIndex - 1);
    }
  };

  // ✅ ปรับปรุงฟังก์ชัน handleSaveNewPatient เพื่อส่งต่อไปหน้ารับผู้ป่วย
  const handleSaveNewPatient = async () => {
    setLoading(true);

    try {
      const validationErrors = PatientService.validatePatientData(patientData);
      if (validationErrors.length > 0) {
        showSnackbar(validationErrors.join(', '), 'error');
        setLoading(false);
        return;
      }

      const formattedData = PatientService.formatPatientData(patientData);
      const result = await PatientService.createPatient(formattedData);

      if (result.success) {
        const newPatientInfo = {
          HNCODE: result.data.HNCODE,
          PRENAME: patientData.PRENAME,
          NAME1: patientData.NAME1,
          SURNAME: patientData.SURNAME,
          AGE: patientData.AGE,
          SEX: patientData.SEX,
          TEL1: patientData.TEL1,
          WEIGHT1: patientData.WEIGHT1,
          HIGH1: patientData.HIGH1
        };

        // ✅ เก็บข้อมูลผู้ป่วยที่เพิ่งลงทะเบียน
        setNewlyRegisteredPatient(newPatientInfo);

        showSnackbar(`ลงทะเบียนผู้ป่วยสำเร็จ! HN: ${result.data.HNCODE} - กรุณากรอก Vital Signs`, 'success');

        // ✅ รีเซ็ตฟอร์มและไปหน้ารับผู้ป่วย
        resetNewPatientForm();

        // รอ 1 วินาทีแล้วไปหน้ารับผู้ป่วย
        setTimeout(() => {
          setMainView('reception');
        }, 1000);

      } else {
        showSnackbar(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    } catch (error) {
      console.error('Error saving patient data:', error);
      showSnackbar('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetNewPatientForm = () => {
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
    setNewPatientTabIndex(0);
  };

  const handleEditNewPatient = () => {
    setNewPatientTabIndex(0);
  };

  // ✅ ฟังก์ชันสำหรับเคลียร์ข้อมูลผู้ป่วยที่เพิ่งลงทะเบียนหลังจากส่งคิวแล้ว
  const handleClearNewlyRegistered = () => {
    setNewlyRegisteredPatient(null);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2, maxWidth: "1600px" }}>
      <Grid container spacing={3}>
        {/* Left Panel - Queue Display */}
        <Grid item xs={12} md={3}>
          <QueueDisplayPanel
            todayQueue={todayQueue}
            queueStats={queueStats}
            mainView={mainView}
            setMainView={setMainView}
            onRefresh={handleRefresh}
          />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Header */}
          <Typography sx={{
            fontWeight: '600',
            fontSize: '24px',
            fontFamily: 'Instrument Sans',
            letterSpacing: '1.5px',
            lineHeight: '2',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
            mb: 2
          }}>
            {mainView === 'reception' && '🏥 รับผู้ป่วย'}
            {mainView === 'newPatient' && '👤 เพิ่มผู้ป่วยใหม่'}
            {mainView === 'appointments' && '📅 จัดการนัดหมาย'}
          </Typography>

          {/* รับผู้ป่วย */}
          {mainView === 'reception' && (
            <PatientReceptionSection
              onRefresh={handleRefresh}
              showSnackbar={showSnackbar}
              newlyRegisteredPatient={newlyRegisteredPatient}
              onClearNewlyRegistered={handleClearNewlyRegistered}
            />
          )}

          {/* เพิ่มผู้ป่วยใหม่ - ใช้ Components เดิม */}
          {mainView === 'newPatient' && (
            <Card>
              <Tabs
                value={newPatientTabIndex}
                onChange={(e, newValue) => setNewPatientTabIndex(newValue)}
                variant="scrollable"
                sx={{
                  backgroundColor: "#F0F5FF",
                  borderRadius: "8px",
                  "& .MuiTab-root": {
                    color: "#6B7280",
                    fontWeight: "bold",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#D6E4FF",
                    borderRadius: "8px",
                    color: "#1D4ED8",
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  }
                }}
              >
                <Tab label="ข้อมูลทั่วไป" />
                <Tab label="ข้อมูลติดต่อ" />
                <Tab label="ประวัติสุขภาพ" />
              </Tabs>

              <CardContent>
                {newPatientTabIndex === 0 && (
                  <GeneralInfoTab
                    onNext={handleNextNewPatient}
                    patientData={patientData}
                    updatePatientData={updatePatientData}
                  />
                )}
                {newPatientTabIndex === 1 && (
                  <ContactInfoTab
                    onNext={handleNextNewPatient}
                    onPrev={handlePrevNewPatient}
                    patientData={patientData}
                    updatePatientData={updatePatientData}
                  />
                )}
                {newPatientTabIndex === 2 && (
                  <HealthHistoryTab
                    onPrev={handlePrevNewPatient}
                    onSave={handleSaveNewPatient}
                    onEdit={handleEditNewPatient}
                    patientData={patientData}
                    updatePatientData={updatePatientData}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* จัดการนัดหมาย */}
          {mainView === 'appointments' && (
            <AppointmentManagementSection
              appointments={appointments}
              setAppointments={setAppointments}
              onRefresh={handleRefresh}
              showSnackbar={showSnackbar}
            />
          )}
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientRegistration;