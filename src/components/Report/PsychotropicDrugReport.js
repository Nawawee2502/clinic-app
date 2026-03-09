// src/components/Report/PsychotropicDrugReport.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
    Chip, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import {
    Refresh as RefreshIcon, Download as DownloadIcon,
    Search as SearchIcon, Clear as ClearIcon,
    Medication as MedIcon, People as PeopleIcon, Inventory as InventoryIcon
} from '@mui/icons-material';
import MonthYearFilter from '../common/MonthYearFilter';
import { formatThaiDateShort } from '../../utils/dateTimeUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const formatQty = (qty) => {
    const n = parseFloat(qty);
    return isNaN(n) ? '-' : n.toLocaleString('th-TH', { maximumFractionDigits: 2 });
};

const PsychotropicDrugReport = () => {
    const now = new Date();
    const currentBEYear = (now.getFullYear() + 543).toString();
    const [startYear, setStartYear] = useState(currentBEYear);
    const [startMonth, setStartMonth] = useState((now.getMonth() + 1).toString());
    const [endYear, setEndYear] = useState(currentBEYear);
    const [endMonth, setEndMonth] = useState((now.getMonth() + 1).toString());

    const [selectedDrug, setSelectedDrug] = useState('');
    const [search, setSearch] = useState('');
    const [drugList, setDrugList] = useState([]);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Build date range strings: convert BE year -> CE for SQL
    const getDateRange = useCallback(() => {
        const sy = parseInt(startYear) - 543; // BE -> CE
        const sm = parseInt(startMonth);
        const ey = parseInt(endYear) - 543;   // BE -> CE
        const em = parseInt(endMonth);
        const lastDay = new Date(ey, em, 0).getDate();
        return {
            date_from: `${sy}-${String(sm).padStart(2, '0')}-01`,
            date_to: `${ey}-${String(em).padStart(2, '0')}-${lastDay}`
        };
    }, [startYear, startMonth, endYear, endMonth]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { date_from, date_to } = getDateRange();
            const params = new URLSearchParams({ date_from, date_to, limit: 100000 });
            if (selectedDrug) params.append('drug_code', selectedDrug);
            if (search.trim()) params.append('search', search.trim());

            const res = await fetch(`${API_BASE_URL}/treatments/reports/psychotropic-drugs?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = await res.json();

            if (result.success) {
                setRecords(result.data || []);
                setSummary(result.summary || null);
                // Always update the full drug list (for dropdown) from first load
                if (result.drugs && result.drugs.length > 0) {
                    setDrugList(result.drugs);
                }
            } else {
                throw new Error(result.message || 'โหลดข้อมูลไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error loading psychotropic report:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getDateRange, selectedDrug, search]);

    // Load drug list on mount (no date filter so we get ALL psychotropic drugs)
    useEffect(() => {
        const loadDrugList = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/treatments/reports/psychotropic-drugs?limit=1`);
                if (!res.ok) return;
                const result = await res.json();
                if (result.drugs) setDrugList(result.drugs);
            } catch { /* ignore */ }
        };
        loadDrugList();
        loadData();
    }, []);  // eslint-disable-line

    const handleExportCSV = () => {
        if (records.length === 0) return;
        const headers = ['วันที่', 'VN', 'HN', 'ชื่อ-นามสกุล', 'เลขบัตร', 'เพศ', 'เบอร์โทร', 'รหัสยา', 'ชื่อยา (Generic)', 'ชื่อยา (Trade)', 'จำนวน', 'หน่วย', 'ราคาต่อหน่วย', 'รวมเป็นเงิน', 'แพทย์'];
        const rows = records.map(r => [
            r.RDATE ? r.RDATE.substring(0, 10) : '',
            r.VNO, r.HN, r.PATIENT_NAME, r.IDNO, r.SEX, r.TEL1,
            r.DRUG_CODE, r.GENERIC_NAME, r.TRADE_NAME,
            r.QTY, r.UNIT_CODE, r.UNIT_PRICE, r.AMT, r.EMP_NAME
        ].map(v => {
            const s = String(v === null || v === undefined ? '' : v);
            return s.includes(',') || s.includes('\n') ? `"${s}"` : s;
        }).join(','));
        const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `รายงานยาวัตถุออกฤทธิ์_${getDateRange().date_from}_ถึง_${getDateRange().date_to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setSelectedDrug('');
        setSearch('');
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    รายงานยาวัตถุออกฤทธิ์ (TD004)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
                        รีเฟรช
                    </Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={loading || records.length === 0}>
                        ส่งออก CSV
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>ตัวกรองข้อมูล</Typography>
                    <Grid container spacing={2} alignItems="center">
                        {/* Start Month/Year */}
                        <Grid item xs={12} sm={6} md={3}>
                            <MonthYearFilter
                                year={startYear}
                                setYear={setStartYear}
                                month={startMonth}
                                setMonth={setStartMonth}
                                yearLabel="ปีเริ่มต้น"
                                monthLabel="เดือนเริ่มต้น"
                            />
                        </Grid>
                        {/* End Month/Year */}
                        <Grid item xs={12} sm={6} md={3}>
                            <MonthYearFilter
                                year={endYear}
                                setYear={setEndYear}
                                month={endMonth}
                                setMonth={setEndMonth}
                                yearLabel="ปีสิ้นสุด"
                                monthLabel="เดือนสิ้นสุด"
                            />
                        </Grid>
                        {/* Drug Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>ยาวัตถุออกฤทธิ์</InputLabel>
                                <Select
                                    value={selectedDrug}
                                    label="ยาวัตถุออกฤทธิ์"
                                    onChange={(e) => setSelectedDrug(e.target.value)}
                                    sx={{ borderRadius: '10px', bgcolor: 'white' }}
                                >
                                    <MenuItem value="">ทั้งหมด</MenuItem>
                                    {drugList.map(d => (
                                        <MenuItem key={d.DRUG_CODE} value={d.DRUG_CODE}>
                                            {d.GENERIC_NAME || d.DRUG_CODE}
                                            {d.TRADE_NAME ? ` (${d.TRADE_NAME})` : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Search */}
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                label="ค้นหาคนไข้"
                                placeholder="HN / ชื่อ / เลขบัตร"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                                    endAdornment: search ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearch('')}><ClearIcon fontSize="small" /></IconButton>
                                        </InputAdornment>
                                    ) : null
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white' } }}
                            />
                        </Grid>
                        {/* Buttons */}
                        <Grid item xs={12} sm={6} md={1}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="contained" fullWidth onClick={loadData} disabled={loading} sx={{ borderRadius: '10px' }}>
                                    ค้นหา
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                            <Button variant="outlined" fullWidth onClick={handleClear} sx={{ borderRadius: '10px' }}>
                                ล้าง
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <InventoryIcon sx={{ mr: 1, fontSize: 36, opacity: 0.85 }} />
                                    <Typography variant="h6">รายการทั้งหมด</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">{summary.totalRecords.toLocaleString()}</Typography>
                                <Typography variant="body2">รายการจ่ายยา</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PeopleIcon sx={{ mr: 1, fontSize: 36, opacity: 0.85 }} />
                                    <Typography variant="h6">คนไข้ที่รับยา</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">{summary.uniquePatients.toLocaleString()}</Typography>
                                <Typography variant="body2">คน (unique)</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <MedIcon sx={{ mr: 1, fontSize: 36, opacity: 0.85 }} />
                                    <Typography variant="h6">ชนิดยา</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">{drugList.length}</Typography>
                                <Typography variant="body2">ชนิด (ทั้งหมดในระบบ)</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Drug Summary (breakdown per drug) */}
            {summary && summary.drugSummary && summary.drugSummary.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 1.5 }}>สรุปแยกตามชนิดยา</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {summary.drugSummary.map((d) => (
                                <Tooltip
                                    key={d.DRUG_CODE}
                                    title={`จ่ายรวม ${formatQty(d.totalQty)} หน่วย | คนไข้ ${d.uniquePatients} คน`}
                                    arrow
                                >
                                    <Chip
                                        label={`${d.GENERIC_NAME || d.DRUG_CODE}: ${d.dispensingCount} ครั้ง`}
                                        color="primary"
                                        variant="outlined"
                                        onClick={() => setSelectedDrug(d.DRUG_CODE === selectedDrug ? '' : d.DRUG_CODE)}
                                        sx={{ cursor: 'pointer', fontWeight: d.DRUG_CODE === selectedDrug ? 'bold' : 'normal' }}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>กำลังโหลดข้อมูล...</Typography>
                </Box>
            )}

            {/* Table */}
            {!loading && records.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            รายละเอียดการจ่ายยาวัตถุออกฤทธิ์ ({records.length.toLocaleString()} รายการ)
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>วันที่จ่ายยา</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>VN</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>HN</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ-นามสกุล</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>เลขบัตร</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>เพศ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>รหัสยา</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา (Generic)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา (Trade)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคา/หน่วย</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>รวม (บาท)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>แพทย์</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {records.map((row, idx) => (
                                        <TableRow key={`${row.VNO}-${row.DRUG_CODE}-${idx}`} hover>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{formatThaiDateShort(row.RDATE)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium" sx={{ whiteSpace: 'nowrap' }}>
                                                    {row.VNO}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{row.HN}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {row.PATIENT_NAME}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.IDNO || '-'}</TableCell>
                                            <TableCell>{row.SEX || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.DRUG_CODE}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                                {row.GENERIC_NAME}
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {row.TRADE_NAME || '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                                                {formatQty(row.QTY)}
                                            </TableCell>
                                            <TableCell>{row.UNIT_CODE || row.DRUG_UNIT || '-'}</TableCell>
                                            <TableCell align="right">{formatQty(row.UNIT_PRICE)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                                                {formatQty(row.AMT)}
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                                {row.EMP_NAME || '-'}
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
            {!loading && records.length === 0 && !error && (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            ไม่มีข้อมูลในช่วงที่เลือก
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ลองเปลี่ยนช่วงเดือน หรือล้างตัวกรองแล้วค้นหาใหม่
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PsychotropicDrugReport;
