import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Divider,
  Autocomplete
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';

const ContactInfoTab = ({ onNext, onPrev, patientData, updatePatientData }) => {
  // State สำหรับเก็บข้อมูลจาก API
  const [provinces, setProvinces] = useState([]);
  const [amphers, setAmphers] = useState([]);
  const [tumbols, setTumbols] = useState([]);

  // State สำหรับ Card Address
  const [cardAmphers, setCardAmphers] = useState([]);
  const [cardTumbols, setCardTumbols] = useState([]);

  // State สำหรับเก็บค่าที่เลือก
  const [selectedCardProvince, setSelectedCardProvince] = useState(null);
  const [selectedCardAmpher, setSelectedCardAmpher] = useState(null);
  const [selectedCardTumbol, setSelectedCardTumbol] = useState(null);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedAmpher, setSelectedAmpher] = useState(null);
  const [selectedTumbol, setSelectedTumbol] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const defaultAddress = {
    PROVINCE_CODE: '50',
    PROVINCE_NAME: 'เชียงใหม่',
    AMPHER_CODE: '5002',
    AMPHER_NAME: 'จอมทอง',
    TUMBOL_CODE: '500201',
    TUMBOL_NAME: 'บ้านหลวง',
    ZIPCODE: '50160'
  };

  // โหลดข้อมูลจังหวัดเมื่อ component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!patientData.CARD_PROVINCE_CODE) {
      updatePatientData({
        CARD_PROVINCE_CODE: defaultAddress.PROVINCE_CODE,
        CARD_AMPHER_CODE: defaultAddress.AMPHER_CODE,
        CARD_TUMBOL_CODE: defaultAddress.TUMBOL_CODE,
        CARD_ZIPCODE: defaultAddress.ZIPCODE
      });

      const defaultProvince = {
        PROVINCE_CODE: defaultAddress.PROVINCE_CODE,
        PROVINCE_NAME: defaultAddress.PROVINCE_NAME
      };

      const defaultAmpher = {
        AMPHER_CODE: defaultAddress.AMPHER_CODE,
        AMPHER_NAME: defaultAddress.AMPHER_NAME
      };

      const defaultTumbol = {
        TUMBOL_CODE: defaultAddress.TUMBOL_CODE,
        TUMBOL_NAME: defaultAddress.TUMBOL_NAME,
        zipcode: defaultAddress.ZIPCODE
      };

      setSelectedCardProvince(defaultProvince);
      setSelectedCardAmpher(defaultAmpher);
      setSelectedCardTumbol(defaultTumbol);

      fetchAmphersByProvince(defaultAddress.PROVINCE_CODE, true);
      fetchTumbolsByAmpher(defaultAddress.AMPHER_CODE, true);
    }
  }, []);

  // ฟังก์ชันดึงข้อมูลจังหวัด
  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/provinces`);
      const result = await response.json();
      if (result.success) {
        setProvinces(result.data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  // ฟังก์ชันดึงข้อมูลอำเภอตามจังหวัด
  const fetchAmphersByProvince = async (provinceCode, isCardAddress = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/amphers/province/${provinceCode}`);
      const result = await response.json();
      if (result.success) {
        if (isCardAddress) {
          setCardAmphers(result.data);
        } else {
          setAmphers(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching amphers:', error);
    }
  };

  // ฟังก์ชันดึงข้อมูลตำบลตามอำเภอ
  const fetchTumbolsByAmpher = async (ampherCode, isCardAddress = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tumbols/ampher/${ampherCode}`);
      const result = await response.json();
      if (result.success) {
        if (isCardAddress) {
          setCardTumbols(result.data);
        } else {
          setTumbols(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tumbols:', error);
    }
  };

  // Handle การเปลี่ยนจังหวัดสำหรับที่อยู่ตามบัตรประชาชน
  const handleCardProvinceChange = (event, newValue) => {
    setSelectedCardProvince(newValue);
    setSelectedCardAmpher(null);
    setSelectedCardTumbol(null);
    setCardAmphers([]);
    setCardTumbols([]);

    updatePatientData({
      CARD_PROVINCE_CODE: newValue ? newValue.PROVINCE_CODE : '',
      CARD_AMPHER_CODE: '',
      CARD_TUMBOL_CODE: '',
      CARD_ZIPCODE: ''
    });

    if (newValue) {
      fetchAmphersByProvince(newValue.PROVINCE_CODE, true);
    }
  };

  // Handle การเปลี่ยนอำเภอสำหรับที่อยู่ตามบัตรประชาชน
  const handleCardAmpherChange = (event, newValue) => {
    setSelectedCardAmpher(newValue);
    setSelectedCardTumbol(null);
    setCardTumbols([]);

    updatePatientData({
      CARD_AMPHER_CODE: newValue ? newValue.AMPHER_CODE : '',
      CARD_TUMBOL_CODE: '',
      CARD_ZIPCODE: ''
    });

    if (newValue) {
      fetchTumbolsByAmpher(newValue.AMPHER_CODE, true);
    }
  };

  // Handle การเปลี่ยนตำบลสำหรับที่อยู่ตามบัตรประชาชน
  const handleCardTumbolChange = (event, newValue) => {
    setSelectedCardTumbol(newValue);

    updatePatientData({
      CARD_TUMBOL_CODE: newValue ? newValue.TUMBOL_CODE : '',
      CARD_ZIPCODE: newValue && newValue.zipcode ? newValue.zipcode : patientData.CARD_ZIPCODE || ''
    });
  };

  // Handle การเปลี่ยนจังหวัดสำหรับที่อยู่ปัจจุบัน
  const handleProvinceChange = (event, newValue) => {
    setSelectedProvince(newValue);
    setSelectedAmpher(null);
    setSelectedTumbol(null);
    setAmphers([]);
    setTumbols([]);

    updatePatientData({
      PROVINCE_CODE: newValue ? newValue.PROVINCE_CODE : '',
      AMPHER_CODE: '',
      TUMBOL_CODE: '',
      ZIPCODE: ''
    });

    if (newValue) {
      fetchAmphersByProvince(newValue.PROVINCE_CODE, false);
    }
  };

  // Handle การเปลี่ยนอำเภอสำหรับที่อยู่ปัจจุบัน
  const handleAmpherChange = (event, newValue) => {
    setSelectedAmpher(newValue);
    setSelectedTumbol(null);
    setTumbols([]);

    updatePatientData({
      AMPHER_CODE: newValue ? newValue.AMPHER_CODE : '',
      TUMBOL_CODE: '',
      ZIPCODE: ''
    });

    if (newValue) {
      fetchTumbolsByAmpher(newValue.AMPHER_CODE, false);
    }
  };

  // Handle การเปลี่ยนตำบลสำหรับที่อยู่ปัจจุบัน
  const handleTumbolChange = (event, newValue) => {
    setSelectedTumbol(newValue);

    updatePatientData({
      TUMBOL_CODE: newValue ? newValue.TUMBOL_CODE : '',
      ZIPCODE: newValue && newValue.zipcode ? newValue.zipcode : patientData.ZIPCODE || ''
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    updatePatientData({ [field]: value });
  };

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    updatePatientData({ useCardAddress: isChecked });

    // ถ้า checkbox ถูกเลือก ให้คัดลอกข้อมูลที่อยู่ตามบัตรประชาชนไปยังที่อยู่ปัจจุบัน
    if (isChecked) {
      setSelectedProvince(selectedCardProvince);
      setSelectedAmpher(selectedCardAmpher);
      setSelectedTumbol(selectedCardTumbol);
      setAmphers(cardAmphers);
      setTumbols(cardTumbols);

      updatePatientData({
        useCardAddress: true,
        ADDR1: patientData.CARD_ADDR1,
        TUMBOL_CODE: patientData.CARD_TUMBOL_CODE,
        AMPHER_CODE: patientData.CARD_AMPHER_CODE,
        PROVINCE_CODE: patientData.CARD_PROVINCE_CODE,
        ZIPCODE: patientData.CARD_ZIPCODE // ใช้ zipcode จากบัตรประชาชน
      });
    } else {
      // รีเซ็ตค่าเมื่อยกเลิก checkbox
      setSelectedProvince(null);
      setSelectedAmpher(null);
      setSelectedTumbol(null);
      setAmphers([]);
      setTumbols([]);

      // เคลียร์ข้อมูลที่อยู่ปัจจุบัน
      updatePatientData({
        ADDR1: '',
        TUMBOL_CODE: '',
        AMPHER_CODE: '',
        PROVINCE_CODE: '',
        ZIPCODE: ''
      });
    }
  };

  // ฟังก์ชันสำหรับ validate ข้อมูลก่อน next
  const handleNext = () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!patientData.CARD_ADDR1) {
      alert('กรุณากรอกที่อยู่ตามบัตรประชาชน');
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
          ข้อมูลติดต่อ
        </Box>

        <Divider sx={{ borderColor: '#5698E0', borderWidth: 1 }} />

        <h4 style={{ textAlign: "left", paddingLeft: "16px", color: '#5698E0' }}>
          ที่อยู่ตามบัตรประชาชน
        </h4>

        {/* ID Card Address Section */}
        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ที่อยู่ตามบัตรประชาชน <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              placeholder="ที่อยู่ตามบัตรประชาชน"
              size="small"
              fullWidth
              value={patientData.CARD_ADDR1 || ''}
              onChange={handleInputChange('CARD_ADDR1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              จังหวัด
            </Typography>
            <Autocomplete
              size="small"
              options={provinces}
              getOptionLabel={(option) => option.PROVINCE_NAME || ''}
              value={selectedCardProvince}
              onChange={handleCardProvinceChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกจังหวัด"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.PROVINCE_CODE === value?.PROVINCE_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อำเภอ/เขต
            </Typography>
            <Autocomplete
              size="small"
              options={cardAmphers}
              getOptionLabel={(option) => option.AMPHER_NAME || ''}
              value={selectedCardAmpher}
              onChange={handleCardAmpherChange}
              disabled={!selectedCardProvince}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกอำเภอ/เขต"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.AMPHER_CODE === value?.AMPHER_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ตำบล/แขวง
            </Typography>
            <Autocomplete
              size="small"
              options={cardTumbols}
              getOptionLabel={(option) => option.TUMBOL_NAME || ''}
              value={selectedCardTumbol}
              onChange={handleCardTumbolChange}
              disabled={!selectedCardAmpher}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกตำบล/แขวง"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.TUMBOL_CODE === value?.TUMBOL_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              รหัสไปรษณีย์
            </Typography>
            <TextField
              size="small"
              placeholder="รหัสไปรษณีย์"
              fullWidth
              value={patientData.CARD_ZIPCODE || ''}
              onChange={handleInputChange('CARD_ZIPCODE')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Current Address Section */}
        <h4 style={{ textAlign: "left", paddingLeft: "16px", color: '#5698E0', marginTop: "30px" }}>
          ที่อยู่ปัจจุบัน
        </h4>

        <Box sx={{ textAlign: "left", pl: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={patientData.useCardAddress || false}
                onChange={handleCheckboxChange}
              />
            }
            label="ใช้ที่อยู่เดียวกับที่อยู่ตามบัตรประชาชน"
            sx={{ fontWeight: 'normal' }}
          />
        </Box>

        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ที่อยู่ปัจจุบัน
            </Typography>
            <TextField
              size="small"
              placeholder="ที่อยู่ปัจจุบัน"
              fullWidth
              value={patientData.useCardAddress ? patientData.CARD_ADDR1 : (patientData.ADDR1 || '')}
              onChange={handleInputChange('ADDR1')}
              disabled={patientData.useCardAddress}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              จังหวัด
            </Typography>
            <Autocomplete
              size="small"
              options={provinces}
              getOptionLabel={(option) => option.PROVINCE_NAME || ''}
              value={patientData.useCardAddress ? selectedCardProvince : selectedProvince}
              onChange={handleProvinceChange}
              disabled={patientData.useCardAddress}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกจังหวัด"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.PROVINCE_CODE === value?.PROVINCE_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อำเภอ/เขต
            </Typography>
            <Autocomplete
              size="small"
              options={patientData.useCardAddress ? cardAmphers : amphers}
              getOptionLabel={(option) => option.AMPHER_NAME || ''}
              value={patientData.useCardAddress ? selectedCardAmpher : selectedAmpher}
              onChange={handleAmpherChange}
              disabled={patientData.useCardAddress || !(patientData.useCardAddress ? selectedCardProvince : selectedProvince)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกอำเภอ/เขต"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.AMPHER_CODE === value?.AMPHER_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ตำบล/แขวง
            </Typography>
            <Autocomplete
              size="small"
              options={patientData.useCardAddress ? cardTumbols : tumbols}
              getOptionLabel={(option) => option.TUMBOL_NAME || ''}
              value={patientData.useCardAddress ? selectedCardTumbol : selectedTumbol}
              onChange={handleTumbolChange}
              disabled={patientData.useCardAddress || !(patientData.useCardAddress ? selectedCardAmpher : selectedAmpher)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกตำบล/แขวง"
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.TUMBOL_CODE === value?.TUMBOL_CODE}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              รหัสไปรษณีย์
            </Typography>
            <TextField
              size="small"
              placeholder="รหัสไปรษณีย์"
              fullWidth
              value={patientData.useCardAddress ? patientData.CARD_ZIPCODE : (patientData.ZIPCODE || '')}
              onChange={handleInputChange('ZIPCODE')}
              disabled={patientData.useCardAddress}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เบอร์โทรศัพท์
            </Typography>
            <TextField
              size="small"
              placeholder="เบอร์โทรศัพท์ (10 หลัก)"
              fullWidth
              value={patientData.TEL1 || ''}
              onChange={(event) => {
                const value = event.target.value;
                // อนุญาตเฉพาะตัวเลขและจำกัดที่ 10 หลัก
                const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
                updatePatientData({ TEL1: numericValue });
              }}
              inputProps={{
                maxLength: 10,
                pattern: '[0-9]*',
              }}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อีเมล
            </Typography>
            <TextField
              size="small"
              placeholder="อีเมล"
              fullWidth
              type="email"
              value={patientData.EMAIL1 || ''}
              onChange={handleInputChange('EMAIL1')}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          px: 2
        }}>
          <Button
            variant="contained"
            onClick={onPrev}
            sx={{
              backgroundColor: "white",
              color: "#2196F3",
              border: "0.5px solid #2196F3",
              fontSize: "1rem",
              width: '110px',
              font: 'Lato',
              fontWeight: 600
            }}
          >
            ย้อนกลับ
          </Button>
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

export default ContactInfoTab;