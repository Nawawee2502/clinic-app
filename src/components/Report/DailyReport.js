// src/components/Report/DailyReport.js - Complete with DailyReportButton
import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
    CircularProgress, Alert, Autocomplete, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, List, ListItem, ListItemText
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Download as DownloadIcon,
    TrendingUp as TrendingUpIcon, People as PeopleIcon, AttachMoney as MoneyIcon,
    LocalHospital as HospitalIcon, Visibility as VisibilityIcon, Close as CloseIcon
} from '@mui/icons-material';

// Import Services
import TreatmentService from '../../services/treatmentService';
import EmployeeService from '../../services/employeeService';
import PatientService from '../../services/patientService';

// Import Utilities
import { formatThaiDate as formatThaiDateUtil, formatThaiDateShort, getCurrentDateForDB } from '../../utils/dateTimeUtils';

// Import Components
import DailyReportButton from '../Dashboard/DailyReportButton';
import DatePickerBE from '../common/DatePickerBE';

const DailyReport = () => {


    // States for filters
    const [startDate, setStartDate] = useState(getCurrentDateForDB());
    const [endDate, setEndDate] = useState(getCurrentDateForDB());
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedPatientObject, setSelectedPatientObject] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');

    // ✅ New Filters State
    const [rightsType, setRightsType] = useState(''); // '', 'gold_card', 'social_security', 'cash'
    const [ucsStartDate, setUcsStartDate] = useState(getCurrentDateForDB());
    const [ucsEndDate, setUcsEndDate] = useState(getCurrentDateForDB());

    // States for data
    const [doctors, setDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ States for treatment history dialog
    const [historyDialog, setHistoryDialog] = useState({ open: false, vno: null, treatmentData: null });

    // Load doctors and patients on component mount
    useEffect(() => {
        loadDoctors();
        loadAllPatients();
    }, []);

    // Load report data when filters change
    useEffect(() => {
        if (startDate && endDate) {
            loadReportData();
        }
    }, [startDate, endDate, selectedDoctor, selectedPatient, rightsType, ucsStartDate, ucsEndDate]);

    const loadAllPatients = async () => {
        try {
            console.log('Loading all patients...');
            const response = await PatientService.getAllPatients();
            if (response.success) {
                setAllPatients(response.data);
                console.log(`Loaded ${response.data.length} patients`);
            } else {
                console.error('Failed to load patients:', response);
                setError('ไม่สามารถโหลดรายชื่อผู้ป่วยได้');
            }
        } catch (error) {
            console.error('Error loading all patients:', error);
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
                limit: 100000,
                status: 'ปิดการรักษา', // ✅ Fetch all closed treatments
                payment_status: 'all'  // ✅ Ignore payment status (fetch both paid and unpaid)
            };

            if (selectedDoctor) {
                params.emp_code = selectedDoctor;
            }

            if (selectedPatient) {
                params.hnno = selectedPatient;
            }

            // ✅ Add New Filters to Params
            // if (rightsType) {
            //     params.rights_type = rightsType;
            //     // Only send UCS date filters if rights_type is gold_card
            //     if (rightsType === 'gold_card') {
            //         params.ucs_payment_date_from = ucsStartDate;
            //         params.ucs_payment_date_to = ucsEndDate;
            //     }
            // }

            const treatmentResponse = await TreatmentService.getPaidTreatmentsWithDetails(params);

            if (treatmentResponse.success) {
                let data = treatmentResponse.data;

                // ✅ Client-side Filtering for Rights Type
                if (rightsType) {
                    if (rightsType === 'gold_card') {
                        data = data.filter(item =>
                            item.VISIT_UCS_CARD === 'Y' ||
                            item.PAYMENT_METHOD === 'บัตรทอง'
                        );

                        // Also filter by UCS Payment Date if specified
                        if (ucsStartDate && ucsEndDate) {
                            // Convert search dates to comparison format if needed, or string compare YYYY-MM-DD
                            data = data.filter(item => {
                                if (!item.UCS_PAYMENT_DATE) return false;
                                return item.UCS_PAYMENT_DATE >= ucsStartDate && item.UCS_PAYMENT_DATE <= ucsEndDate;
                            });
                        }

                    } else if (rightsType === 'social_security') {
                        data = data.filter(item =>
                            item.VISIT_SOCIAL_CARD === 'Y' ||
                            item.PAYMENT_METHOD === 'ประกันสังคม'
                        );
                    } else if (rightsType === 'cash') { // Self-pay (Cash + Transfer + Others that are NOT Gold/Social)
                        data = data.filter(item => {
                            const isGold = item.VISIT_UCS_CARD === 'Y' || item.PAYMENT_METHOD === 'บัตรทอง';
                            const isSocial = item.VISIT_SOCIAL_CARD === 'Y' || item.PAYMENT_METHOD === 'ประกันสังคม';
                            return !isGold && !isSocial;
                        });
                    }
                }

                setReportData(data);
                calculateSummaryStats(data);
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
        setRightsType('');
        setUcsStartDate(getCurrentDateForDB());
        setUcsEndDate(getCurrentDateForDB());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // ✅ ใช้ utility function สำหรับ format Thai date
    const formatThaiDate = (dateString) => {
        if (!dateString) return '';
        return formatThaiDateUtil(dateString);
    };

    // ✅ ใช้ utility function สำหรับ format Thai date แบบสั้น (DD/MM/YYYY พ.ศ.)
    const formatThaiDateShortDisplay = (dateString) => {
        if (!dateString) return '';
        return formatThaiDateShort(dateString);
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
                    {/* เพิ่มปุ่มสร้างรายงาน PDF */}
                    <DailyReportButton
                        selectedDate={startDate}
                        endDate={endDate}
                        revenueData={reportData}
                    />
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>ตัวกรองข้อมูล</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                            <DatePickerBE
                                label="วันที่เริ่มต้น"
                                value={startDate}
                                onChange={(value) => setStartDate(value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <DatePickerBE
                                label="วันที่สิ้นสุด"
                                value={endDate}
                                onChange={(value) => setEndDate(value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>เลือกหมอ</InputLabel>
                                <Select
                                    value={selectedDoctor}
                                    label="เลือกหมอ"
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    sx={{ borderRadius: "10px", bgcolor: 'white' }}
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
                                options={allPatients}
                                getOptionLabel={(option) => `${option.HNCODE} - ${option.PRENAME || ''}${option.NAME1} ${option.SURNAME || ''}`}
                                value={selectedPatientObject}
                                onChange={(event, newValue) => {
                                    console.log('Patient selected:', newValue);
                                    setSelectedPatientObject(newValue);
                                    setSelectedPatient(newValue ? newValue.HNCODE : '');
                                    setPatientSearch('');
                                }}
                                onInputChange={(event, newInputValue, reason) => {
                                    console.log('Input changed:', newInputValue, reason);
                                    if (reason === 'input') {
                                        setPatientSearch(newInputValue);
                                        if (!newInputValue) {
                                            setSelectedPatientObject(null);
                                            setSelectedPatient('');
                                        }
                                    } else if (reason === 'clear') {
                                        setPatientSearch('');
                                        setSelectedPatientObject(null);
                                        setSelectedPatient('');
                                    }
                                }}
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
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                bgcolor: 'white'
                                            }
                                        }}
                                        size="small"
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
                                clearOnBlur={false}
                                selectOnFocus={false}
                            />
                        </Grid>

                        {/* ✅ Rights Type Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>สิทธิการรักษา</InputLabel>
                                <Select
                                    value={rightsType}
                                    label="สิทธิการรักษา"
                                    onChange={(e) => setRightsType(e.target.value)}
                                    sx={{ borderRadius: "10px", bgcolor: 'white' }}
                                >
                                    <MenuItem value="">ทั้งหมด</MenuItem>
                                    <MenuItem value="gold_card">บัตรทอง (UCS)</MenuItem>
                                    <MenuItem value="cash">จ่ายเอง (เงินสด/เงินโอน)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* ✅ Show UCS Payment Date filters only when Gold Card is selected */}
                        {rightsType === 'gold_card' && (
                            <>
                                <Grid item xs={12} sm={6} md={2}>
                                    <DatePickerBE
                                        label="วันที่รับเงินตั้วแต่"
                                        value={ucsStartDate}
                                        onChange={(value) => setUcsStartDate(value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <DatePickerBE
                                        label="ถึงวันที่"
                                        value={ucsEndDate}
                                        onChange={(value) => setUcsEndDate(value)}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sm={6} md={2}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleClearFilters}
                                sx={{ borderRadius: "10px" }}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                        ระบบมีข้อมูลจำนวนมาก กรุณารอโหลดสักครู่
                    </Typography>
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
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ลำดับ</TableCell>
                                        <TableCell>วันที่</TableCell> {/* ✅ Re-added Date */}
                                        <TableCell>VN</TableCell>
                                        <TableCell>HN</TableCell>
                                        <TableCell>ชื่อคนไข้</TableCell>
                                        <TableCell>สิทธิการรักษา</TableCell> {/* ✅ Re-added Rights */}
                                        <TableCell align="right">ค่ารักษา</TableCell>
                                        <TableCell align="right">ค่าหัตถการ</TableCell>
                                        <TableCell align="right">ค่า LAB</TableCell>
                                        <TableCell align="right">ค่ายา</TableCell>
                                        <TableCell align="right">รวม</TableCell>
                                        <TableCell align="right">เงินสด</TableCell>
                                        <TableCell align="right">เงินโอน</TableCell>
                                        <TableCell align="right">บัตรทอง</TableCell>
                                        <TableCell align="center">วันรับเงินบัตรทอง</TableCell> {/* ✅ Re-added Gold Card Date */}
                                        <TableCell align="center">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.map((row, index) => {
                                        // Calculate breakdowns
                                        const drugFee = row.drugs?.reduce((sum, d) => sum + (parseFloat(d.AMT) || 0), 0) || 0;
                                        const procFee = row.procedures?.reduce((sum, p) => sum + (parseFloat(p.AMT) || 0), 0) || 0;
                                        const labFee = (row.labTests?.reduce((sum, l) => sum + (parseFloat(l.PRICE) || 0), 0) || 0) +
                                            (row.radiologicalTests?.reduce((sum, r) => sum + (parseFloat(r.PRICE) || 0), 0) || 0);
                                        const treatmentFee = parseFloat(row.TREATMENT_FEE) || 0;

                                        // Calculate total and payment distribution
                                        const total = parseFloat(row.TOTAL_AMOUNT) || 0;
                                        const net = parseFloat(row.NET_AMOUNT) || 0;
                                        const method = row.PAYMENT_METHOD || 'เงินสด';

                                        // Payment distribution logic
                                        let cash = 0;
                                        let transfer = 0;
                                        let goldCard = 0;

                                        // ✅ Check Rights Logic (Same as before)
                                        let treatmentRights = 'เงินสด';
                                        let rightsColor = 'text.primary';

                                        if (row.VISIT_UCS_CARD === 'Y' || method === 'บัตรทอง') {
                                            treatmentRights = 'บัตรทอง (UCS)';
                                            rightsColor = 'warning.main';
                                        } else if (row.VISIT_SOCIAL_CARD === 'Y' || method === 'ประกันสังคม') {
                                            treatmentRights = 'ประกันสังคม';
                                            rightsColor = 'info.main';
                                        }

                                        // Check if this is a Gold Card case (UCS_CARD = 'Y') or Payment Method is 'บัตรทอง'
                                        const isGoldCardCase = row.VISIT_UCS_CARD === 'Y' || method === 'บัตรทอง';

                                        if (method === 'เงินโอน') {
                                            transfer = net;
                                        } else if (isGoldCardCase) {
                                            // ✅ ถ้ามีการยืนยันยอดเงินแล้ว (UCS_STATUS === 'paid') ให้ใช้ยอดที่ยืนยัน (CLAIM_ACTUAL_AMOUNT)
                                            // ถ้ายังไม่ยืนยัน ให้เป็น 0 (เพราะยังไม่ได้เงิน) หรือถ้ามีเน็ตที่จ่ายจริง (กรณีส่วนเกิน) ก็ให้แสดง
                                            if (row.UCS_STATUS === 'paid') {
                                                goldCard = parseFloat(row.CLAIM_ACTUAL_AMOUNT) || 0;
                                            } else {
                                                goldCard = method === 'บัตรทอง' ? net : 0;
                                            }
                                        } else {
                                            // Default to cash for other methods like 'เงินสด'
                                            cash = net;
                                        }

                                        // If net is 0 and it IS a gold card case, we might want to show "-" or "0" in gold card column?
                                        // Code above handles: if goldCard > 0 show formatted. Else if isGoldCardCase and net===0 show '0'.

                                        return (
                                            <TableRow key={row.VNO || index} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{formatThaiDateShortDisplay(row.RDATE)}</TableCell> {/* ✅ Date */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {row.VNO}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{row.HNNO}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {`${row.PRENAME || ''}${row.NAME1} ${row.SURNAME || ''}`.trim()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell> {/* ✅ Rights */}
                                                    <Typography variant="body2" sx={{ color: rightsColor, fontWeight: 'bold' }}>
                                                        {treatmentRights}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">{formatCurrency(treatmentFee)}</TableCell>
                                                <TableCell align="right">{formatCurrency(procFee)}</TableCell>
                                                <TableCell align="right">{formatCurrency(labFee)}</TableCell>
                                                <TableCell align="right">{formatCurrency(drugFee)}</TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {formatCurrency(total)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                                    {cash > 0 ? formatCurrency(cash) : '-'}
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: 'info.main' }}>
                                                    {transfer > 0 ? formatCurrency(transfer) : '-'}
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: 'warning.main' }}>
                                                    {goldCard > 0 ? formatCurrency(goldCard) : (isGoldCardCase && net === 0 ? '0' : '-')}
                                                </TableCell>
                                                <TableCell align="center"> {/* ✅ Gold Card Payment Date from UCS_PAYMENT_DATE */}
                                                    {isGoldCardCase ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {row.UCS_PAYMENT_DATE ? formatThaiDateShortDisplay(row.UCS_PAYMENT_DATE) : '-'}
                                                        </Typography>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setHistoryDialog({ open: true, vno: row.VNO, treatmentData: row });
                                                        }}
                                                        sx={{
                                                            border: '1px solid #5698E0',
                                                            borderRadius: '7px',
                                                            color: '#5698E0',
                                                            '&:hover': {
                                                                bgcolor: '#e3f2fd'
                                                            }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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

            {/* ✅ Dialog แสดงประวัติการรักษา (read-only) */}
            <Dialog
                open={historyDialog.open}
                onClose={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">ประวัติการรักษา - VN: {historyDialog.vno}</Typography>
                        <IconButton onClick={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {historyDialog.treatmentData ? (
                        <Box>
                            {/* ข้อมูลการรักษา */}
                            {/* ข้อมูลการรักษา - Fixed key access */}
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2 }}>ข้อมูลการรักษา</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">วันที่:</Typography>
                                            <Typography variant="body1">{formatThaiDateShort(historyDialog.treatmentData.RDATE)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">อาการ:</Typography>
                                            <Typography variant="body1">{historyDialog.treatmentData.SYMPTOM || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">การวินิจฉัย:</Typography>
                                            <Typography variant="body1" color="primary">
                                                {historyDialog.treatmentData.DXCODE || '-'}{' '}
                                                {historyDialog.treatmentData.ICD10CODE ? `(${historyDialog.treatmentData.ICD10CODE})` : ''}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">ชื่อการวินิจฉัย:</Typography>
                                            <Typography variant="body1">
                                                {historyDialog.treatmentData.DXNAME_THAI || historyDialog.treatmentData.ICD10NAME_THAI || '-'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* รายการยา */}
                            {historyDialog.treatmentData.drugs && historyDialog.treatmentData.drugs.length > 0 && (
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>รายการยา ({historyDialog.treatmentData.drugs.length} รายการ)</Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>ชื่อยา</TableCell>
                                                        <TableCell align="right">จำนวน</TableCell>
                                                        <TableCell>หน่วย</TableCell>
                                                        <TableCell align="right">ราคา</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {historyDialog.treatmentData.drugs.map((drug, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{drug.GENERIC_NAME || drug.DRUG_CODE}</TableCell>
                                                            <TableCell align="right">{drug.QTY}</TableCell>
                                                            <TableCell>{drug.UNIT_CODE}</TableCell>
                                                            <TableCell align="right">{formatCurrency(drug.AMT)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* หัตถการ */}
                            {historyDialog.treatmentData.procedures && historyDialog.treatmentData.procedures.length > 0 && (
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>หัตถการ ({historyDialog.treatmentData.procedures.length} รายการ)</Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>ชื่อหัตถการ</TableCell>
                                                        <TableCell align="right">ราคา</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {historyDialog.treatmentData.procedures.map((proc, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{proc.MED_PRO_NAME_THAI || proc.PROCEDURE_NAME}</TableCell>
                                                            <TableCell align="right">{formatCurrency(proc.AMT)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            )}
                            {/* ค่าแล็บ/เอกซเรย์ */}
                            {(
                                (historyDialog.treatmentData.labTests && historyDialog.treatmentData.labTests.length > 0) ||
                                (historyDialog.treatmentData.radiologicalTests && historyDialog.treatmentData.radiologicalTests.length > 0)
                            ) && (
                                    <Card sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2 }}>Lab & X-ray</Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>รายการ</TableCell>
                                                            <TableCell align="right">ราคา</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {/* Labs */}
                                                        {historyDialog.treatmentData.labTests?.map((lab, index) => (
                                                            <TableRow key={`lab-${index}`}>
                                                                <TableCell>{lab.LAB_NAME_THAI || lab.LAB_NAME}</TableCell>
                                                                <TableCell align="right">{formatCurrency(lab.PRICE)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {/* Radio */}
                                                        {historyDialog.treatmentData.radiologicalTests?.map((rad, index) => (
                                                            <TableRow key={`rad-${index}`}>
                                                                <TableCell>{rad.RADIOLOGICAL_NAME_THAI || rad.RADIOLOGICAL_NAME}</TableCell>
                                                                <TableCell align="right">{formatCurrency(rad.PRICE)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}
                        </Box>
                    ) : (
                        <CircularProgress />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialog({ open: false, vno: null, treatmentData: null })}>ปิด</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DailyReport;