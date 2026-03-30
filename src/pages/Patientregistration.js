// PatientRegistration.js - แก้ไขให้ใช้คิวตัวเดียวกันกับหน้าตรวจรักษา

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
import AppointmentService from "../services/appointmentService";

const PatientRegistration = () => {
  const [mainView, setMainView] = useState('reception');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState(null);

  // ✅ เปลี่ยนให้ใช้ข้อมูลเดียวกันกับหน้าตรวจรักษา
  const [todayQueue, setTodayQueue] = useState([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    waiting: 0,
    completed: 0
  });

  // Appointments State
  const [appointments, setAppointments] = useState([]);

  // New Patient Registration State
  const [newPatientTabIndex, setNewPatientTabIndex] = useState(0);
  const [patientData, setPatientData] = useState({
    HNCODE: '',
    IDNO: '',
    ID_TYPE: 'IDCARD',
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
    useCardAddress: false,
    SOCIAL_CARD: 'N',
    UCS_CARD: 'N'
  });

  // Load initial data
  useEffect(() => {
    loadTodayQueue();
    loadQueueStats();
    loadTodayAppointments();
    checkDuplicateVNOs(); // ✅ เช็ค VN ซ้ำตอนเปิดหน้า
  }, []);

  // ✅ รีเฟรชคิว/สถิติเป็นระยะ ให้สถานะในคิวตรงกับห้องตรวจโดยไม่ต้องกดรีเฟรช
  useEffect(() => {
    const intervalMs = 25000;
    const id = setInterval(() => {
      loadTodayQueue();
      loadQueueStats();
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  // ✅ เช็ค VN ซ้ำในวันนี้
  const checkDuplicateVNOs = async () => {
    try {
      const response = await PatientService.getTodayPatientsFromQueue();
      if (response.success && response.data) {
        const vnoMap = new Map();
        const duplicates = [];

        // เก็บ VN ทั้งหมด
        response.data.forEach(patient => {
          const vno = patient.VNO || patient.VNNO;
          if (vno) {
            if (vnoMap.has(vno)) {
              duplicates.push({
                vno,
                patients: [vnoMap.get(vno), patient]
              });
            } else {
              vnoMap.set(vno, patient);
            }
          }
        });

        if (duplicates.length > 0) {
          console.error('⚠️ พบ VN ซ้ำ:', duplicates);
          showSnackbar(
            `⚠️ พบ VN ซ้ำ ${duplicates.length} คู่: ${duplicates.map(d => d.vno).join(', ')} กรุณาตรวจสอบ`,
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Error checking duplicate VNOs:', error);
    }
  };

  // ✅ Listen for queue updates from other components
  useEffect(() => {
    const handleQueueUpdate = (event) => {
      console.log('🔄 Queue update event received:', event.type);
      // Refresh queue data without showing full loading spinner if possible, 
      // but reusable functions might set loading. 
      // Here we just call the load functions.
      loadTodayQueue();
      loadQueueStats();
      loadTodayAppointments(); // Also refresh appointments if status changed
    };

    window.addEventListener('queueAdded', handleQueueUpdate);
    window.addEventListener('queueStatusChanged', handleQueueUpdate);

    return () => {
      window.removeEventListener('queueAdded', handleQueueUpdate);
      window.removeEventListener('queueStatusChanged', handleQueueUpdate);
    };
  }, []);

  // ✅ เปลี่ยนให้ใช้ Service เดียวกันกับหน้าตรวจรักษา
  const loadTodayQueue = async () => {
    try {
      setLoading(true);
      // ใช้ PatientService.getTodayPatientsFromQueue() เหมือนหน้าตรวจรักษา
      const response = await PatientService.getTodayPatientsFromQueue();

      if (response.success) {
        // ✅ แสดงทุกคิว ไม่กรองเหมือนหน้าตรวจรักษา (เพราะหน้านี้ต้องเห็นทุกสถานะ)
        setTodayQueue(response.data);

        console.log('✅ Loaded queue data from PatientService:', response.data);
      } else {
        showSnackbar('ไม่สามารถโหลดข้อมูลคิวได้', 'error');
        setTodayQueue([]);
      }
    } catch (error) {
      console.error('❌ Error loading today queue:', error);
      showSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูลคิว', 'error');
      setTodayQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดสถิติจาก QueueService (ใช้เดิม)
  const loadQueueStats = async () => {
    try {
      const response = await QueueService.getQueueStats();

      if (response.success) {
        setQueueStats({
          total: response.data.today_queue.total || 0,
          waiting: response.data.today_queue.waiting || 0,
          completed: response.data.today_queue.completed || 0
        });

        console.log('✅ Loaded queue stats:', response.data.today_queue);
      }
    } catch (error) {
      console.error('❌ Error loading queue stats:', error);
    }
  };

  // Load today's appointments
  const loadTodayAppointments = async () => {
    try {
      const response = await AppointmentService.getTodayAppointments();

      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // ✅ ปรับปรุง Refresh function
  const handleRefresh = () => {
    console.log('🔄 Refreshing all data...');
    loadTodayQueue();      // ใช้ PatientService
    loadQueueStats();      // ใช้ QueueService
    loadTodayAppointments(); // ใช้ PatientService
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

  // New Patient Registration Functions
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
          HIGH1: patientData.HIGH1,
          UCS_CARD: patientData.UCS_CARD, // ✅ ส่งข้อมูลสิทธิ์บัตรทองไปด้วย
          SOCIAL_CARD: patientData.SOCIAL_CARD
        };

        setNewlyRegisteredPatient(newPatientInfo);
        showSnackbar(`ลงทะเบียนผู้ป่วยสำเร็จ! HN: ${result.data.HNCODE
          }`, 'success');

        resetNewPatientForm();

        setTimeout(() => {
          setMainView('reception');
          handleRefresh();
        }, 1000);

      } else {
        showSnackbar(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    } catch (error) {
      console.error('Error saving patient data:', error);
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetNewPatientForm = () => {
    setPatientData({
      HNCODE: '',
      IDNO: '',
      ID_TYPE: 'IDCARD',
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
      useCardAddress: false,
      SOCIAL_CARD: 'N',
      UCS_CARD: 'N'
    });
    setNewPatientTabIndex(0);
  };

  const handleEditNewPatient = () => {
    setNewPatientTabIndex(0);
  };

  const handleClearNewlyRegistered = () => {
    setNewlyRegisteredPatient(null);
  };

  // ✅ เพิ่ม Debug info
  console.log('📊 Queue Debug Info:', {
    todayQueueLength: todayQueue.length,
    queueStats,
    firstQueueItem: todayQueue[0],
    mainView
  });

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

          {/* เพิ่มผู้ป่วยใหม่ */}
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