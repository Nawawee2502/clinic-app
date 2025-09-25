// src/components/Report/DailyReport.js - Fixed Patient Selection
import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
    CircularProgress, Alert, Autocomplete, Divider
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Download as DownloadIcon,
    TrendingUp as TrendingUpIcon, People as PeopleIcon, AttachMoney as MoneyIcon,
    LocalHospital as HospitalIcon
} from '@mui/icons-material';

// Import Services
import TreatmentService from '../../services/treatmentService';
import EmployeeService from '../../services/employeeService';
import PatientService from '../../services/patientService';

const DailyReport = () => {
    // States for filters
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedPatientObject, setSelectedPatientObject] = useState(null); // เพิ่ม state สำหรับเก็บ object ผู้ป่วยที่เลือก
    const [patientSearch, setPatientSearch] = useState('');

    // States for data
    const [doctors, setDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]); // เก็บข้อมูลผู้ป่วยทั้งหมด
    const [reportData, setReportData] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load doctors and patients on component mount
    useEffect(() => {
        loadDoctors();
        loadAllPatients(); // โหลดผู้ป่วยทั้งหมดตั้งแต่เริ่ม
    }, []);

    // Load report data when filters change
    useEffect(() => {
        if (startDate && endDate) {
            loadReportData();
        }
    }, [startDate, endDate, selectedDoctor, selectedPatient]);

    const loadAllPatients = async () => {
        try {
            console.log('Loading all patients...');
            const response = await PatientService.getAllPatients(); // หรือ searchPatients('') ถ้าไม่มี getAllPatients
            if (response.success) {
                setAllPatients(response.data);
                console.log(`Loaded ${response.data.length} patients`);
            } else {
                console.error('Failed to load patients:', response);
                setError('ไม่สามารถโหลดรายชื่อผู้ป่วยได้');
            }
        } catch (error) {
            console.error('Error loading all patients:', error);
            // ถ้าไม่มี getAllPatients ให้ใช้ searchPatients แทน
            try {
                const response = await PatientService.searchPatients('');
                if (response.success) {
                    setAllPatients(response.data);
                    console.log(`Loaded ${response.data.length} patients via search`);
                }
            } catch (searchError) {
                setError('เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ป่วย');
            }
        }
    };

    const loadDoctors = async () => {
        try {
            console.log('Loading doctors...');
            const response = await EmployeeService.getEmployeesByType('หมอ');
            console.log('Doctors response:', response);
            if (response.success) {
                setDoctors(response.data);
                console.log(`Loaded ${response.data.length} doctors`);
            } else {
                console.error('Failed to load doctors:', response);
                setError('ไม่สามารถโหลดรายชื่อแพทย์ได้');
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            setError('เกิดข้อผิดพลาดในการโหลดรายชื่อแพทย์: ' + error.message);
        }
    };

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                date_from: startDate,
                date_to: endDate,
                limit: 100
            };

            if (selectedDoctor) {
                params.emp_code = selectedDoctor;
            }

            if (selectedPatient) {
                params.hnno = selectedPatient;
            }

            const treatmentResponse = await TreatmentService.getPaidTreatments(params);

            if (treatmentResponse.success) {
                setReportData(treatmentResponse.data);
                calculateSummaryStats(treatmentResponse.data);
            } else {
                setError('ไม่สามารถดึงข้อมูลได้');
            }

        } catch (error) {
            console.error('Error loading report data:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummaryStats = (data) => {
        const totalPatients = data.length;
        const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.NET_AMOUNT) || 0), 0);
        const totalDiscount = data.reduce((sum, item) => sum + (parseFloat(item.DISCOUNT_AMOUNT) || 0), 0);
        const avgRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;

        const doctorStats = {};
        data.forEach(item => {
            const doctor = item.EMP_NAME || 'ไม่ระบุแพทย์';
            if (!doctorStats[doctor]) {
                doctorStats[doctor] = { count: 0, revenue: 0 };
            }
            doctorStats[doctor].count++;
            doctorStats[doctor].revenue += parseFloat(item.NET_AMOUNT) || 0;
        });

        setSummaryStats({
            totalPatients,
            totalRevenue,
            totalDiscount,
            avgRevenuePerPatient,
            doctorStats: Object.entries(doctorStats).map(([name, stats]) => ({
                name,
                ...stats
            }))
        });
    };

    const handleExportData = () => {
        if (reportData.length === 0) {
            alert('ไม่มีข้อมูลสำหรับการส่งออก');
            return;
        }

        try {
            TreatmentService.downloadCSV(reportData, `daily-report-${startDate}-to-${endDate}`);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
        }
    };

    const handleClearFilters = () => {
        setSelectedDoctor('');
        setSelectedPatient('');
        setSelectedPatientObject(null);
        setPatientSearch('');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatThaiDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ชำระเงินแล้ว': return 'success';
            case 'เสร็จแล้ว': return 'info';
            case 'รอชำระ': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    รายงานประจำวัน
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadReportData}
                        disabled={loading}
                    >
                        รีเฟรช
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportData}
                        disabled={loading || reportData.length === 0}
                    >
                        ส่งออก CSV
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>ตัวกรองข้อมูล</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                label="วันที่เริ่มต้น"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                label="วันที่สิ้นสุด"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>เลือกหมอ</InputLabel>
                                <Select
                                    value={selectedDoctor}
                                    label="เลือกหมอ"
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                >
                                    <MenuItem value="">ทั้งหมด</MenuItem>
                                    {doctors.map((doctor) => (
                                        <MenuItem key={doctor.EMP_CODE} value={doctor.EMP_CODE}>
                                            {doctor.EMP_NAME}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={allPatients} // ใช้ allPatients แทน patients
                                getOptionLabel={(option) => `${option.HNCODE} - ${option.PRENAME || ''}${option.NAME1} ${option.SURNAME || ''}`}
                                value={selectedPatientObject}
                                onChange={(event, newValue) => {
                                    console.log('Patient selected:', newValue);
                                    setSelectedPatientObject(newValue);
                                    setSelectedPatient(newValue ? newValue.HNCODE : '');
                                    setPatientSearch(''); // clear search หลังเลือก
                                }}
                                onInputChange={(event, newInputValue, reason) => {
                                    console.log('Input changed:', newInputValue, reason);
                                    // เฉพาะเมื่อ user พิมพ์เท่านั้น
                                    if (reason === 'input') {
                                        setPatientSearch(newInputValue);
                                        // ถ้าลบข้อความหมด ให้ clear selection
                                        if (!newInputValue) {
                                            setSelectedPatientObject(null);
                                            setSelectedPatient('');
                                        }
                                    } else if (reason === 'clear') {
                                        setPatientSearch('');
                                        setSelectedPatientObject(null);
                                        setSelectedPatient('');
                                    }
                                    // ไม่ทำอะไรกับ reason === 'reset' (เกิดขึ้นเมื่อเลือก option)
                                }}
                                // ถ้ามีการเลือกแล้ว ให้แสดงชื่อเต็ม ไม่งั้นให้แสดง search text
                                inputValue={selectedPatientObject ? 
                                    `${selectedPatientObject.HNCODE} - ${selectedPatientObject.PRENAME || ''}${selectedPatientObject.NAME1} ${selectedPatientObject.SURNAME || ''}` : 
                                    patientSearch
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="ค้นหาผู้ป่วย"
                                        placeholder="กรอก HN หรือชื่อผู้ป่วย"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                                            {option.NAME1?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {`${option.PRENAME || ''}${option.NAME1} ${option.SURNAME || ''}`.trim()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                HN: {option.HNCODE} | อายุ: {option.AGE} ปี
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                loading={loading}
                                loadingText="กำลังค้นหา..."
                                noOptionsText="พิมพ์เพื่อค้นหาผู้ป่วย"
                                clearOnBlur={false} // ป้องกัน clear เมื่อ blur
                                selectOnFocus={false} // ป้องกัน select ทั้งหมดเมื่อ focus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleClearFilters}
                            >
                                ล้างตัวกรอง
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {summaryStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PeopleIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">ผู้ป่วยทั้งหมด</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {summaryStats.totalPatients}
                                </Typography>
                                <Typography variant="body2">คน</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MoneyIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">รายรับรวม</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {formatCurrency(summaryStats.totalRevenue)}
                                </Typography>
                                <Typography variant="body2">บาท</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TrendingUpIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">เฉลี่ย/คน</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {formatCurrency(summaryStats.avgRevenuePerPatient)}
                                </Typography>
                                <Typography variant="body2">บาท</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <HospitalIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">ส่วนลด</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {formatCurrency(summaryStats.totalDiscount)}
                                </Typography>
                                <Typography variant="body2">บาท</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Doctor Performance */}
            {summaryStats && summaryStats.doctorStats.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>สถิติตามแพทย์</Typography>
                                <Divider sx={{ mb: 2 }} />
                                {summaryStats.doctorStats.map((doctor, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body1" fontWeight="medium">
                                                {doctor.name}
                                            </Typography>
                                            <Chip label={`${doctor.count} คน`} color="primary" size="small" />
                                        </Box>
                                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                            {formatCurrency(doctor.revenue)}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Data Table */}
            {!loading && reportData.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            รายละเอียดการรักษา ({reportData.length} รายการ)
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>วันที่</TableCell>
                                        <TableCell>VN</TableCell>
                                        <TableCell>ผู้ป่วย</TableCell>
                                        <TableCell>HN</TableCell>
                                        <TableCell>อายุ</TableCell>
                                        <TableCell>แพทย์</TableCell>
                                        <TableCell>อาการ</TableCell>
                                        <TableCell>การวินิจฉัย</TableCell>
                                        <TableCell align="right">จำนวนเงิน</TableCell>
                                        <TableCell align="right">ส่วนลด</TableCell>
                                        <TableCell align="right">สุทธิ</TableCell>
                                        <TableCell>วิธีชำระ</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.map((row, index) => (
                                        <TableRow key={row.VNO || index} hover>
                                            <TableCell>{formatThaiDate(row.PAYMENT_DATE || row.RDATE)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {row.VNO}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        {row.NAME1?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {`${row.PRENAME || ''}${row.NAME1} ${row.SURNAME || ''}`.trim()}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {row.SEX}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{row.HNNO}</TableCell>
                                            <TableCell>{row.AGE}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {row.EMP_NAME || 'ไม่ระบุ'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                                    {row.SYMPTOM || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                                    {row.DXNAME_THAI || row.ICD10NAME_THAI || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(row.TOTAL_AMOUNT)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(row.DISCOUNT_AMOUNT)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {formatCurrency(row.NET_AMOUNT)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.PAYMENT_METHOD || 'เงินสด'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.PAYMENT_STATUS || row.STATUS1 || 'ไม่ระบุ'}
                                                    color={getStatusColor(row.PAYMENT_STATUS || row.STATUS1)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* No Data */}
            {!loading && reportData.length === 0 && (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            ไม่มีข้อมูลในช่วงวันที่ที่เลือก
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ลองปรับเปลี่ยนช่วงวันที่หรือตัวกรองอื่นๆ
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default DailyReport;