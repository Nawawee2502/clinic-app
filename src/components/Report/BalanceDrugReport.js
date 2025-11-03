// src/components/Report/BalanceDrugReport.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
    Chip, Avatar
} from '@mui/material';
import {
    Refresh as RefreshIcon, Download as DownloadIcon,
    Print as PrintIcon, Inventory as InventoryIcon,
    Warning as WarningIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import BalDrugService from '../../services/balDrugService';
import DrugService from '../../services/drugService';
import BalanceDrugReportButton from './BalanceDrugReportButton';

const BalanceDrugReport = () => {
    // States
    const [reportData, setReportData] = useState([]);
    const [drugList, setDrugList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, low-stock, out-of-stock
    const [summaryStats, setSummaryStats] = useState(null);

    // Load data on mount
    useEffect(() => {
        loadReportData();
        loadDrugs();
    }, []);

    // Filter data when search or filter changes
    useEffect(() => {
        if (reportData.length > 0) {
            filterData();
        }
    }, [searchTerm, filterType]);

    const loadDrugs = async () => {
        try {
            const response = await DrugService.getAllDrugs();
            if (response.success && response.data) {
                setDrugList(response.data);
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
        }
    };

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await BalDrugService.getAllBalances({ limit: 1000 });

            if (response.success && response.data) {
                // เพิ่มข้อมูลยาเข้าไปใน balance
                const enrichedData = response.data.map(balance => {
                    const drug = drugList.find(d => d.DRUG_CODE === balance.DRUG_CODE);
                    return {
                        ...balance,
                        GENERIC_NAME: drug?.GENERIC_NAME || '',
                        UNIT_NAME1: drug?.UNIT_NAME1 || balance.UNIT_CODE1 || '',
                        UNIT_PRICE: parseFloat(balance.UNIT_PRICE) || 0,
                        AMT: parseFloat(balance.AMT) || 0
                    };
                });

                setReportData(enrichedData);
                calculateSummaryStats(enrichedData);
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
        const totalItems = data.length;
        const totalQty = data.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0);
        const totalValue = data.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0);

        const lowStock = data.filter(item => parseFloat(item.QTY) > 0 && parseFloat(item.QTY) <= 10).length;
        const outOfStock = data.filter(item => parseFloat(item.QTY) <= 0).length;
        const inStock = data.filter(item => parseFloat(item.QTY) > 10).length;

        setSummaryStats({
            totalItems,
            totalQty,
            totalValue,
            lowStock,
            outOfStock,
            inStock
        });
    };

    const filterData = () => {
        let filtered = reportData;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.DRUG_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.GENERIC_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        switch (filterType) {
            case 'low-stock':
                filtered = filtered.filter(item => parseFloat(item.QTY) > 0 && parseFloat(item.QTY) <= 10);
                break;
            case 'out-of-stock':
                filtered = filtered.filter(item => parseFloat(item.QTY) <= 0);
                break;
            case 'in-stock':
                filtered = filtered.filter(item => parseFloat(item.QTY) > 10);
                break;
            default:
                break;
        }

        return filtered;
    };

    const handleExportCSV = () => {
        const filteredData = filterData();
        if (filteredData.length === 0) {
            alert('ไม่มีข้อมูลสำหรับการส่งออก');
            return;
        }

        try {
            BalDrugService.downloadCSV(filteredData, `balance-drug-report-${new Date().toISOString().slice(0, 10)}`);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStockStatus = (qty) => {
        const quantity = parseFloat(qty) || 0;
        if (quantity <= 0) return { label: 'หมด', color: 'error', icon: <WarningIcon /> };
        if (quantity <= 10) return { label: 'ใกล้หมด', color: 'warning', icon: <WarningIcon /> };
        return { label: 'ปกติ', color: 'success', icon: <CheckCircleIcon /> };
    };

    const displayData = filterData();

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    รายงานสินค้าคงเหลือ
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
                        onClick={handleExportCSV}
                        disabled={loading || displayData.length === 0}
                        sx={{ backgroundColor: '#4CAF50' }}
                    >
                        ส่งออก CSV
                    </Button>
                    {/* ปุ่มพิมพ์ PDF */}
                    <BalanceDrugReportButton
                        reportData={displayData}
                        summaryStats={summaryStats}
                    />
                </Box>
            </Box>

            {/* Summary Cards */}
            {summaryStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <InventoryIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">รายการทั้งหมด</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {summaryStats.totalItems}
                                </Typography>
                                <Typography variant="body2">รายการ</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CheckCircleIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">คงเหลือปกติ</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {summaryStats.inStock}
                                </Typography>
                                <Typography variant="body2">รายการ</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <WarningIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">ใกล้หมด</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {summaryStats.lowStock}
                                </Typography>
                                <Typography variant="body2">รายการ</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <WarningIcon sx={{ fontSize: 40, mr: 1, opacity: 0.8 }} />
                                    <Typography variant="h6">หมดสต็อก</Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold">
                                    {summaryStats.outOfStock}
                                </Typography>
                                <Typography variant="body2">รายการ</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="ค้นหา (รหัสยา หรือ ชื่อยา)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="กรอกรหัสยาหรือชื่อยา"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>ประเภท</InputLabel>
                                <Select
                                    value={filterType}
                                    label="ประเภท"
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <MenuItem value="all">ทั้งหมด</MenuItem>
                                    <MenuItem value="in-stock">คงเหลือปกติ</MenuItem>
                                    <MenuItem value="low-stock">ใกล้หมด (≤10)</MenuItem>
                                    <MenuItem value="out-of-stock">หมดสต็อก</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

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
            {!loading && displayData.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            รายละเอียด ({displayData.length} รายการ)
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F0F5FF' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ลำดับ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>รหัสยา</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยา</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Lot No.</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>วันหมดอายุ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>ราคา/หน่วย</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>มูลค่ารวม</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayData.map((row, index) => {
                                        const status = getStockStatus(row.QTY);
                                        return (
                                            <TableRow key={`${row.DRUG_CODE}-${index}`} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {row.DRUG_CODE}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {row.GENERIC_NAME || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{row.LOT_NO || '-'}</TableCell>
                                                <TableCell>
                                                    {BalDrugService.formatDate(row.EXPIRE_DATE)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="bold"
                                                        color={
                                                            parseFloat(row.QTY) <= 0 ? 'error.main' :
                                                                parseFloat(row.QTY) <= 10 ? 'warning.main' :
                                                                    'success.main'
                                                        }
                                                    >
                                                        {formatCurrency(row.QTY)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{row.UNIT_NAME1 || row.UNIT_CODE1 || '-'}</TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(row.UNIT_PRICE)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                                        {formatCurrency(row.AMT)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={status.label}
                                                        color={status.color}
                                                        size="small"
                                                        icon={status.icon}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {/* Summary Row */}
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <TableCell colSpan={5} align="right">
                                            <Typography variant="body1" fontWeight="bold">
                                                รวมทั้งสิ้น
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatCurrency(displayData.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0))}
                                            </Typography>
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight="bold" color="primary">
                                                {formatCurrency(displayData.reduce((sum, item) => sum + (parseFloat(item.AMT) || 0), 0))} บาท
                                            </Typography>
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* No Data */}
            {!loading && displayData.length === 0 && (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            ไม่พบข้อมูล
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default BalanceDrugReport;