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
  Tooltip
} from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';

const GeneralInfoTab = ({ onNext, patientData, updatePatientData }) => {

  // State สำหรับ dropdown วันเกิด
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Auto-generate HN เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    if (!patientData.HNCODE) {
      generateHN();
    }
  }, [patientData.HNCODE]); // เพิ่ม dependency

  // อัพเดท dropdown เมื่อ BDATE เปลี่ยน (สำหรับกรณีโหลดข้อมูลจากภายนอก)
  useEffect(() => {
    if (patientData.BDATE) {
      const { day, month, year } = parseDateString(patientData.BDATE);
      setSelectedDay(day);
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  }, [patientData.BDATE]);

  // ฟังก์ชันสำหรับสร้าง HN อัตโนมัติ
  const generateHN = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

      // ดึงข้อมูลผู้ป่วยทั้งหมดเพื่อหา HN ล่าสุด
      const response = await fetch(`${API_BASE_URL}/patients`);
      const result = await response.json();

      let nextNumber = 1;

      if (result.success && result.data && result.data.length > 0) {
        // หา HN ที่เป็นรูปแบบ HN##### และหาตัวเลขสูงสุด
        const numericHNs = result.data
          .map(patient => patient.HNCODE)
          .filter(hn => /^HN\d{5}$/.test(hn)) // เฉพาะ HN ที่เป็นรูปแบบ HN#####
          .map(hn => parseInt(hn.substring(2))) // เอาเฉพาะตัวเลขหลัง HN
          .filter(num => !isNaN(num));

        if (numericHNs.length > 0) {
          nextNumber = Math.max(...numericHNs) + 1;
        }
      }

      // สร้าง HN ใหม่แบบ HN##### เช่น HN00001, HN00002
      const newHN = `HN${nextNumber.toString().padStart(5, '0')}`;
      updatePatientData({ HNCODE: newHN });

    } catch (error) {
      console.error('Error generating HN:', error);
      // ถ้าเกิดข้อผิดพลาด ให้ใช้ timestamp แทน
      const fallbackHN = `HN${Date.now().toString().slice(-5).padStart(5, '0')}`;
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

  // ฟังก์ชันสำหรับ validate ข้อมูลก่อน next
  const handleNext = () => {
    // ตรวจสอบข้อมูลที่จำเป็น
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
              onChange={handleInputChange('IDNO')}
              inputProps={{ maxLength: 17 }} // รองรับ format x-xxxx-xxxxx-xx-x
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
              คำนำหน้า
            </Typography>
            <TextField
              select
              label="คำนำหน้า"
              size="small"
              fullWidth
              value={patientData.PRENAME || ''}
              onChange={handleInputChange('PRENAME')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="">เลือกคำนำหน้า</MenuItem>
              <MenuItem value="นาย">นาย</MenuItem>
              <MenuItem value="นาง">นาง</MenuItem>
              <MenuItem value="นางสาว">นางสาว</MenuItem>
              <MenuItem value="เด็กชาย">เด็กชาย</MenuItem>
              <MenuItem value="เด็กหญิง">เด็กหญิง</MenuItem>
            </TextField>
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
              onChange={handleInputChange('SEX')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
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