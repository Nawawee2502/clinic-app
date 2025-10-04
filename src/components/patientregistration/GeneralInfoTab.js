import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Card,
  Divider,
  IconButton,
  Tooltip,
  Autocomplete,
  Checkbox
} from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';

const GeneralInfoTab = ({ onNext, patientData, updatePatientData }) => {

  // State สำหรับ dropdown วันเกิด
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [idCardError, setIdCardError] = useState('');
  const [isCheckingIdCard, setIsCheckingIdCard] = useState(false);


  // Default values
  const defaultValues = {
    เชื้อชาติ: 'ไทย',
    สัญชาติ: 'ไทย',
    ศาสนา: 'พุทธ',
    สถานภาพ: 'โสด'
  };

  // Options สำหรับคำนำหน้าชื่อ
  const prenameOptions = [
    'นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง',
    'ดร.', 'ศ.ดร.', 'รศ.ดร.', 'ผศ.ดร.', 'อาจารย์',
    'คุณหมอ', 'พยาบาล', 'ครู', 'อาจารย์ใหญ่', 'ผู้อำนวยการ'
  ];

  // ✅ ฟังก์ชันกำหนดเพศจากคำนำหน้า
  const getGenderFromPrefix = (prefix) => {
    const malePrefix = ['นาย', 'เด็กชาย'];
    const femalePrefix = ['นาง', 'นางสาว', 'เด็กหญิง'];

    if (malePrefix.includes(prefix)) {
      return 'ชาย';
    } else if (femalePrefix.includes(prefix)) {
      return 'หญิง';
    }
    return ''; // ไม่เปลี่ยนเพศสำหรับคำนำหน้าที่เป็นกลาง เช่น ดร.
  };

  // Auto-generate HN เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    if (!patientData.HNCODE) {
      generateHN();
    }

    // ตั้งค่า default values ถ้ายังไม่มีข้อมูล
    const updates = {};
    if (!patientData.ORIGIN1) updates.ORIGIN1 = defaultValues.เชื้อชาติ;
    if (!patientData.NATIONAL1) updates.NATIONAL1 = defaultValues.สัญชาติ;
    if (!patientData.RELIGION1) updates.RELIGION1 = defaultValues.ศาสนา;
    if (!patientData.STATUS1) updates.STATUS1 = defaultValues.สถานภาพ;

    if (Object.keys(updates).length > 0) {
      updatePatientData(updates);
    }
  }, [patientData.HNCODE]);

  // อัพเดท dropdown เมื่อ BDATE เปลี่ยน (สำหรับกรณีโหลดข้อมูลจากภายนอก)
  useEffect(() => {
    if (patientData.BDATE) {
      const { day, month, year } = parseDateString(patientData.BDATE);
      setSelectedDay(day);
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  }, [patientData.BDATE]);

  // เมื่อเปลี่ยนเพศ ให้เปลี่ยนคำนำหน้าชื่อด้วย
  useEffect(() => {
    if (patientData.SEX && !patientData.PRENAME) {
      let defaultPrename = '';
      if (patientData.SEX === 'ชาย') {
        defaultPrename = 'นาย';
      } else if (patientData.SEX === 'หญิง') {
        defaultPrename = 'นางสาว';
      }

      if (defaultPrename) {
        updatePatientData({ PRENAME: defaultPrename });
      }
    }
  }, [patientData.SEX]);

  const checkDuplicateIdCard = async (idno) => {
    if (!idno || idno.length !== 13) {
      setIdCardError('');
      return false;
    }

    try {
      setIsCheckingIdCard(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

      const response = await fetch(`${API_BASE_URL}/patients/check-idcard/${idno}`);
      const result = await response.json();

      if (result.success && result.exists) {
        const existingPatient = result.patient;
        setIdCardError(`บัตรประชาชนนี้มีอยู่แล้ว (HN: ${existingPatient.HNCODE} - ${existingPatient.NAME1} ${existingPatient.SURNAME})`);
        return true;
      } else {
        setIdCardError('');
        return false;
      }
    } catch (error) {
      console.error('Error checking ID card:', error);
      setIdCardError('ไม่สามารถตรวจสอบบัตรประชาชนได้');
      return false;
    } finally {
      setIsCheckingIdCard(false);
    }
  };

  const handleIdCardChange = async (event) => {
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 13);
    updatePatientData({ IDNO: value });

    if (value.length === 13) {
      await checkDuplicateIdCard(value);
    } else {
      setIdCardError('');
    }
  };

  const generateHN = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

      // ดึงข้อมูลผู้ป่วยทั้งหมดเพื่อหา HN ล่าสุด
      const response = await fetch(`${API_BASE_URL}/patients`);
      const result = await response.json();

      // รับปีปัจจุบัน (พ.ศ.) เอาเฉพาะ 2 หลักท้าย
      const currentYear = new Date().getFullYear() + 543; // แปลงเป็น พ.ศ.
      const yearSuffix = currentYear.toString().slice(-2); // เอา 2 หลักท้าย เช่น 68 จาก 2568

      let nextNumber = 1;

      if (result.success && result.data && result.data.length > 0) {
        // หา HN ที่เป็นรูปแบบ HN[ปี][####] ของปีปัจจุบัน
        const currentYearHNs = result.data
          .map(patient => patient.HNCODE)
          .filter(hn => {
            // ตรวจสอบรูปแบบ HN[ปี][4หลัก] เช่น HN680001
            const pattern = new RegExp(`^HN${yearSuffix}\\d{4}$`);
            return pattern.test(hn);
          })
          .map(hn => parseInt(hn.substring(4))) // เอาเฉพาะ 4 หลักท้าย
          .filter(num => !isNaN(num));

        if (currentYearHNs.length > 0) {
          nextNumber = Math.max(...currentYearHNs) + 1;
        }
      }

      // สร้าง HN ใหม่แบบ HN[ปี][runno] เช่น HN680001
      const newHN = `HN${yearSuffix}${nextNumber.toString().padStart(4, '0')}`;
      updatePatientData({ HNCODE: newHN });

    } catch (error) {
      console.error('Error generating HN:', error);
      // ถ้าเกิดข้อผิดพลาด ให้ใช้ timestamp แทน
      const currentYear = new Date().getFullYear() + 543;
      const yearSuffix = currentYear.toString().slice(-2);
      const fallbackHN = `HN${yearSuffix}${Date.now().toString().slice(-4).padStart(4, '0')}`;
      updatePatientData({ HNCODE: fallbackHN });
    }
  };

  // ฟังก์ชันคำนวณอายุจากวันเกิด
  const calculateAge = (day, month, year) => {
    if (!day || !month || !year) return '';

    try {
      const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();

      // ตรวจสอบว่าวันที่ valid หรือไม่
      if (isNaN(birth.getTime())) return '';

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age >= 0 ? age.toString() : '';
    } catch (error) {
      console.error('Error calculating age:', error);
      return '';
    }
  };

  // ฟังก์ชันสำหรับจัดรูปแบบวันที่เป็น YYYY-MM-DD
  const formatDateString = (day, month, year) => {
    if (!day || !month || !year) return '';

    try {
      const dayStr = parseInt(day).toString().padStart(2, '0');
      const monthStr = parseInt(month).toString().padStart(2, '0');
      const yearStr = parseInt(year).toString();

      return `${yearStr}-${monthStr}-${dayStr}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // ฟังก์ชันสำหรับแยกวันที่จาก string
  const parseDateString = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { day: '', month: '', year: '' };

      return {
        day: date.getDate().toString(),
        month: (date.getMonth() + 1).toString(),
        year: date.getFullYear().toString()
      };
    } catch (error) {
      console.error('Error parsing date:', error);
      return { day: '', month: '', year: '' };
    }
  };

  // สร้าง array สำหรับ dropdown
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i); // 120 ปีย้อนหลัง

  const handleDateChange = (type) => (event) => {
    const value = event.target.value;

    let newDay = selectedDay;
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    // อัพเดท state ของ dropdown
    if (type === 'day') {
      newDay = value;
      setSelectedDay(value);
    }
    if (type === 'month') {
      newMonth = value;
      setSelectedMonth(value);
    }
    if (type === 'year') {
      newYear = value;
      setSelectedYear(value);
    }

    // อัพเดทวันที่และคำนวณอายุ
    if (newDay && newMonth && newYear) {
      const dateString = formatDateString(newDay, newMonth, newYear);
      const age = calculateAge(newDay, newMonth, newYear);

      updatePatientData({
        BDATE: dateString,
        AGE: age
      });
    } else {
      // ถ้ายังเลือกไม่ครบ ให้เคลียร์อายุ แต่ไม่เคลียร์วันที่
      updatePatientData({
        AGE: ''
      });
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    updatePatientData({ [field]: value });
  };

  // Handle การเปลี่ยนเพศพร้อมอัพเดทคำนำหน้าชื่อ
  const handleSexChange = (event) => {
    const sex = event.target.value;
    let prename = '';

    if (sex === 'ชาย') {
      prename = 'นาย';
    } else if (sex === 'หญิง') {
      prename = 'นางสาว';
    }

    updatePatientData({
      SEX: sex,
      PRENAME: prename
    });
  };

  // ✅ Handle การเปลี่ยนคำนำหน้าชื่อพร้อมอัพเดทเพศอัตโนมัติ
  const handlePrenameChange = (event, newValue) => {
    const prefix = newValue || '';
    const autoGender = getGenderFromPrefix(prefix);

    console.log(`🔄 คำนำหน้า: "${prefix}" → เพศ: "${autoGender}"`);

    const updates = { PRENAME: prefix };

    // ✅ ถ้าระบบระบุเพศได้จากคำนำหน้า ให้อัพเดทเพศด้วย
    if (autoGender) {
      updates.SEX = autoGender;
    }

    updatePatientData(updates);
  };

  // ฟังก์ชันสำหรับ validate ข้อมูลก่อน next
  const handleNext = () => {
    if (!patientData.HNCODE) {
      alert('กรุณากรอกรหัส HN');
      return;
    }
    if (!patientData.NAME1) {
      alert('กรุณากรอกชื่อ');
      return;
    }
    if (!patientData.SURNAME) {
      alert('กรุณากรอกนามสกุล');
      return;
    }
    if (idCardError) {
      alert('กรุณาแก้ไขปัญหาบัตรประชาชนก่อน');
      return;
    }
    onNext();
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
      margin: "0 auto",
    }}>
      {/* Profile Section */}
      <div style={{
        textAlign: "center",
        marginBottom: "30px",
        width: "100%"
      }}>
        <Avatar
          alt="User Avatar"
          src="https://via.placeholder.com/150"
          sx={{ width: 180, height: 180, margin: "0 auto" }}
        />
        <Typography variant="h6">
          {patientData.NAME1 || patientData.SURNAME
            ? `${patientData.PRENAME || ''} ${patientData.NAME1} ${patientData.SURNAME}`.trim()
            : 'ผู้ป่วยใหม่'
          }
        </Typography>
        <Typography variant="body2">
          {patientData.AGE ? `${patientData.AGE} ปี` : ''}
          {patientData.AGE && patientData.SEX ? ', ' : ''}
          {patientData.SEX || ''}
        </Typography>
        <Button
          variant="contained"
          size="small"
          sx={{
            mt: 1,
            backgroundColor: 'white',
            color: '#2196F3',
            border: '1px solid #2196F3',
            '&:hover': { backgroundColor: '#f0f0f0' }
          }}
        >
          แก้ไขรูปภาพ
        </Button>
      </div>

      {/* Form Section */}
      <Card sx={{
        width: "100%",
        padding: '20px',
        textAlign: "center",
        border: "1px solid #BDBDBD",
        borderRadius: '20px',
        boxSizing: "border-box"
      }}>
        <Box
          sx={{
            width: '110px',
            height: '39px',
            bgcolor: '#70A1E5',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          ข้อมูลทั่วไป
        </Box>

        <Divider sx={{ borderColor: '#5698E0', borderWidth: 1 }} />

        <Grid container spacing={2} sx={{ px: 2, mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              HN <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                placeholder="HN จะสร้างอัตโนมัติ"
                size="small"
                fullWidth
                value={patientData.HNCODE || ''}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
              <Tooltip title="สร้าง HN ใหม่">
                <IconButton
                  onClick={generateHN}
                  sx={{
                    bgcolor: '#70A1E5',
                    color: 'white',
                    '&:hover': { bgcolor: '#5698E0' }
                  }}
                >
                  <AutorenewIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เลขบัตรประชาชน <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              placeholder="เลขบัตรประชาชน"
              size="small"
              fullWidth
              value={patientData.IDNO || ''}
              onChange={handleIdCardChange}
              error={!!idCardError}
              helperText={idCardError}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  borderColor: idCardError ? 'red' : undefined
                },
                '& .MuiFormHelperText-root': {
                  color: 'red',
                  fontSize: '0.75rem'
                }
              }}
              InputProps={{
                endAdornment: isCheckingIdCard && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      กำลังตรวจสอบ...
                    </Typography>
                  </Box>
                )
              }}
            />
          </Grid>



          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              คำนำหน้า
            </Typography>
            <Autocomplete
              freeSolo
              size="small"
              options={prenameOptions}
              value={patientData.PRENAME || ''}
              onChange={handlePrenameChange}
              onInputChange={(event, newInputValue) => {
                // ✅ เมื่อพิมพ์เข้าไปใน field ให้เช็คเพศด้วย
                const autoGender = getGenderFromPrefix(newInputValue);
                const updates = { PRENAME: newInputValue };

                if (autoGender) {
                  updates.SEX = autoGender;
                  console.log(`⌨️ พิมพ์คำนำหน้า: "${newInputValue}" → เพศ: "${autoGender}"`);
                }

                updatePatientData(updates);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกหรือพิมพ์คำนำหน้า"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      bgcolor: patientData.PRENAME ? '#f0f8ff' : 'inherit'
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ชื่อ <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              placeholder="ชื่อ"
              size="small"
              fullWidth
              value={patientData.NAME1 || ''}
              onChange={handleInputChange('NAME1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              นามสกุล <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              placeholder="นามสกุล"
              size="small"
              fullWidth
              value={patientData.SURNAME || ''}
              onChange={handleInputChange('SURNAME')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เพศ
            </Typography>
            <TextField
              select
              label="เพศ"
              size="small"
              fullWidth
              value={patientData.SEX || ''}
              onChange={handleSexChange}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: patientData.SEX ? '#f0f8ff' : 'inherit'
                },
              }}
            >
              <MenuItem value="">เลือกเพศ</MenuItem>
              <MenuItem value="ชาย">ชาย</MenuItem>
              <MenuItem value="หญิง">หญิง</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              วันเกิด
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {/* วัน */}
              <TextField
                select
                label="วัน"
                size="small"
                value={selectedDay || ''}
                onChange={handleDateChange('day')}
                sx={{
                  minWidth: '80px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              >
                <MenuItem value="">วัน</MenuItem>
                {days.map((day) => (
                  <MenuItem key={day} value={day.toString()}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>

              {/* เดือน */}
              <TextField
                select
                label="เดือน"
                size="small"
                value={selectedMonth || ''}
                onChange={handleDateChange('month')}
                sx={{
                  minWidth: '120px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              >
                <MenuItem value="">เดือน</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* ปี */}
              <TextField
                select
                label="ปี"
                size="small"
                value={selectedYear || ''}
                onChange={handleDateChange('year')}
                sx={{
                  minWidth: '100px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              >
                <MenuItem value="">ปี</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year + 543} {/* แสดงปี พ.ศ. */}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อายุ (ปี)
            </Typography>
            <TextField
              placeholder="อายุจะคำนวณอัตโนมัติจากวันเกิด"
              size="small"
              fullWidth
              type="number"
              value={patientData.AGE || ''}
              onChange={handleInputChange('AGE')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
                '& input': {
                  backgroundColor: (selectedDay && selectedMonth && selectedYear) ? '#f5f5f5' : 'white',
                }
              }}
              InputProps={{
                readOnly: !!(selectedDay && selectedMonth && selectedYear), // ถ้ามีวันเกิดครบแล้วให้ readonly
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              กรุ๊ปเลือด
            </Typography>
            <TextField
              select
              label="กรุ๊ปเลือด"
              size="small"
              fullWidth
              value={patientData.BLOOD_GROUP1 || ''}
              onChange={handleInputChange('BLOOD_GROUP1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="">เลือกกรุ๊ปเลือด</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="O">O</MenuItem>
              <MenuItem value="AB">AB</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อาชีพ
            </Typography>
            <TextField
              placeholder="อาชีพ"
              size="small"
              fullWidth
              value={patientData.OCCUPATION1 || ''}
              onChange={handleInputChange('OCCUPATION1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เชื้อชาติ
            </Typography>
            <TextField
              placeholder="เชื้อชาติ"
              size="small"
              fullWidth
              value={patientData.ORIGIN1 || ''}
              onChange={handleInputChange('ORIGIN1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              สัญชาติ
            </Typography>
            <TextField
              placeholder="สัญชาติ"
              size="small"
              fullWidth
              value={patientData.NATIONAL1 || ''}
              onChange={handleInputChange('NATIONAL1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ศาสนา
            </Typography>
            <TextField
              placeholder="ศาสนา"
              size="small"
              fullWidth
              value={patientData.RELIGION1 || ''}
              onChange={handleInputChange('RELIGION1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              สถานภาพ
            </Typography>
            <TextField
              select
              label="สถานภาพ"
              size="small"
              fullWidth
              value={patientData.STATUS1 || ''}
              onChange={handleInputChange('STATUS1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="">เลือกสถานภาพ</MenuItem>
              <MenuItem value="โสด">โสด</MenuItem>
              <MenuItem value="สมรส">สมรส</MenuItem>
              <MenuItem value="หม้าย">หม้าย</MenuItem>
              <MenuItem value="หย่าร้าง">หย่าร้าง</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              น้ำหนัก (kg.)
            </Typography>
            <TextField
              placeholder="น้ำหนัก"
              size="small"
              fullWidth
              type="number"
              value={patientData.WEIGHT1 || ''}
              onChange={handleInputChange('WEIGHT1')}
              inputProps={{
                min: "0",
                max: "500",
                step: "0.1"
              }}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ส่วนสูง (cm.)
            </Typography>
            <TextField
              placeholder="ส่วนสูง"
              size="small"
              fullWidth
              type="number"
              value={patientData.HIGH1 || ''}
              onChange={handleInputChange('HIGH1')}
              inputProps={{
                min: "0",
                max: "300",
                step: "0.1"
              }}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left", mb: 1 }}>
              สิทธิการรักษา
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              backgroundColor: '#fafafa'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={patientData.SOCIAL_CARD === 'Y'}
                  onChange={(e) => updatePatientData({
                    SOCIAL_CARD: e.target.checked ? 'Y' : 'N'
                  })}
                  sx={{
                    '&.Mui-checked': {
                      color: '#70A1E5',
                    },
                  }}
                />
                <Typography sx={{ fontSize: '14px' }}>
                  ประกันสังคม (Social Security)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={patientData.UCS_CARD === 'Y'}
                  onChange={(e) => updatePatientData({
                    UCS_CARD: e.target.checked ? 'Y' : 'N'
                  })}
                  sx={{
                    '&.Mui-checked': {
                      color: '#70A1E5',
                    },
                  }}
                />
                <Typography sx={{ fontSize: '14px' }}>
                  บัตรทอง (UCS - Universal Coverage)
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 4,
          px: 2
        }}>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isCheckingIdCard || !!idCardError}
            sx={{
              backgroundColor: "#BCD8FF",
              color: "#2B69AC",
              fontSize: "1rem",
              width: '100px',
              font: 'Lato',
              fontWeight: 600
            }}
          >
            ถัดไป
          </Button>
        </Box>
      </Card>
    </div>
  );
};

export default GeneralInfoTab;