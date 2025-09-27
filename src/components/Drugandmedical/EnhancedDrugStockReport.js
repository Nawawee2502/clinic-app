import React, { useState, useEffect } from "react";
import {
    Container, Grid, TextField, Button, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem, Box, Checkbox, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, Alert, CircularProgress, InputAdornment
} from "@mui/material";
import {
    Search as SearchIcon, Print as PrintIcon, FileDownload as FileDownloadIcon,
    TrendingDown as TrendingDownIcon, Warning as WarningIcon,
    CheckCircle as CheckCircleIcon, Inventory as InventoryIcon,
    CalendarMonth as CalendarIcon
} from "@mui/icons-material";
import { Pagination, Stack } from "@mui/material";
import DrugService from '../../services/drugService';

const EnhancedDrugStockReport = () => {
    // States
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, normal, out
    const [dateRange, setDateRange] = useState({
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        day: new Date().getDate().toString().padStart(2, '0')
    });

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Summary Stats
    const [summaryStats, setSummaryStats] = useState({
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        normalStockItems: 0
    });

    useEffect(() => {
        loadStockData();
    }, []);

    useEffect(() => {
        filterAndCalculateStats();
    }, [reportData, searchTerm, stockFilter]);

    const loadStockData = async () => {
        setLoading(true);
        try {
            // ดึงข้อมูลยาจาก API Drug Information
            const response = await DrugService.getAllDrugs({
                page: 1,
                limit: 1000
            });

            if (response.success && response.data) {
                // สร้างข้อมูล stock จากข้อมูลยาจริง
                const stockData = response.data.map((drug, index) => {
                    const stockQty = Math.floor(Math.random() * 200) + 5;
                    const minStock = Math.floor(Math.random() * 30) + 10;
                    const unitPrice = drug.UNIT_PRICE ? parseFloat(drug.UNIT_PRICE) : (Math.random() * 150 + 20);

                    return {
                        ...drug,
                        STOCK_QTY: stockQty,
                        MIN_STOCK: minStock,
                        UNIT_PRICE: parseFloat(unitPrice.toFixed(2)),
                        TOTAL_VALUE: stockQty * parseFloat(unitPrice.toFixed(2)),
                        LAST_UPDATED: new Date().toISOString(),
                        STOCK_STATUS: stockQty === 0 ? 'out' : stockQty <= minStock ? 'low' : 'normal',
                        SUPPLIER: `ผู้จำหน่าย ${String.fromCharCode(65 + (index % 5))}`,
                        LOCATION: `ชั้น ${Math.floor(index / 5) + 1} - ช่อง ${(index % 10) + 1}`,
                        EXPIRY_DATE: new Date(Date.now() + Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000).toISOString(),
                        LOT_NUMBER: `LOT${String(index + 1).padStart(4, '0')}`
                    };
                });

                setReportData(stockData);
            } else {
                throw new Error('ไม่สามารถดึงข้อมูลยาได้');
            }
        } catch (error) {
            console.error('Error loading stock data:', error);

            // Fallback ใช้ข้อมูลยาจำลองจาก component หลัก
            const mockDrugs = [
                { DRUG_CODE: 'D001', GENERIC_NAME: 'Paracetamol 500mg', TRADE_NAME: 'Tylenol', UNIT_CODE: 'TAB', UNIT_PRICE: 2.50 },
                { DRUG_CODE: 'D002', GENERIC_NAME: 'Ibuprofen 400mg', TRADE_NAME: 'Brufen', UNIT_CODE: 'TAB', UNIT_PRICE: 4.00 },
                { DRUG_CODE: 'D003', GENERIC_NAME: 'Aspirin 100mg', TRADE_NAME: 'Cardiprin', UNIT_CODE: 'TAB', UNIT_PRICE: 1.50 },
                { DRUG_CODE: 'D004', GENERIC_NAME: 'Amoxicillin 250mg', TRADE_NAME: 'Amoxil', UNIT_CODE: 'CAP', UNIT_PRICE: 8.00 },
                { DRUG_CODE: 'D005', GENERIC_NAME: 'Erythromycin 250mg', TRADE_NAME: 'Erythrocin', UNIT_CODE: 'TAB', UNIT_PRICE: 12.00 },
                { DRUG_CODE: 'D006', GENERIC_NAME: 'Cephalexin 250mg', TRADE_NAME: 'Cefalexin', UNIT_CODE: 'CAP', UNIT_PRICE: 15.00 },
                { DRUG_CODE: 'D007', GENERIC_NAME: 'Salbutamol 2mg', TRADE_NAME: 'Ventolin', UNIT_CODE: 'TAB', UNIT_PRICE: 6.00 },
                { DRUG_CODE: 'D008', GENERIC_NAME: 'Cetirizine 10mg', TRADE_NAME: 'Zyrtec', UNIT_CODE: 'TAB', UNIT_PRICE: 8.50 },
                { DRUG_CODE: 'D009', GENERIC_NAME: 'Loratadine 10mg', TRADE_NAME: 'Claritin', UNIT_CODE: 'TAB', UNIT_PRICE: 12.00 },
                { DRUG_CODE: 'D010', GENERIC_NAME: 'Omeprazole 20mg', TRADE_NAME: 'Losec', UNIT_CODE: 'CAP', UNIT_PRICE: 18.00 },
                { DRUG_CODE: 'D011', GENERIC_NAME: 'Domperidone 10mg', TRADE_NAME: 'Motilium', UNIT_CODE: 'TAB', UNIT_PRICE: 12.50 },
                { DRUG_CODE: 'D012', GENERIC_NAME: 'Simethicone 40mg', TRADE_NAME: 'Flatulex', UNIT_CODE: 'TAB', UNIT_PRICE: 5.00 },
                { DRUG_CODE: 'D013', GENERIC_NAME: 'Bisacodyl 5mg', TRADE_NAME: 'Dulcolax', UNIT_CODE: 'TAB', UNIT_PRICE: 3.50 },
                { DRUG_CODE: 'D014', GENERIC_NAME: 'Loperamide 2mg', TRADE_NAME: 'Imodium', UNIT_CODE: 'CAP', UNIT_PRICE: 8.00 },
                { DRUG_CODE: 'D015', GENERIC_NAME: 'Hydrocortisone 1%', TRADE_NAME: 'Dermacort', UNIT_CODE: 'TUB', UNIT_PRICE: 25.00 },
                { DRUG_CODE: 'D016', GENERIC_NAME: 'Povidone Iodine 10%', TRADE_NAME: 'Betadine', UNIT_CODE: 'BOT', UNIT_PRICE: 35.00 },
                { DRUG_CODE: 'D017', GENERIC_NAME: 'Chloramphenicol Eye Drop', TRADE_NAME: 'Chlorsig', UNIT_CODE: 'BOT', UNIT_PRICE: 45.00 },
                { DRUG_CODE: 'D018', GENERIC_NAME: 'Normal Saline Nasal Drop', TRADE_NAME: 'Saline Drop', UNIT_CODE: 'BOT', UNIT_PRICE: 15.00 },
                { DRUG_CODE: 'D019', GENERIC_NAME: 'Vitamin B Complex', TRADE_NAME: 'B-Complex', UNIT_CODE: 'TAB', UNIT_PRICE: 3.00 },
                { DRUG_CODE: 'D020', GENERIC_NAME: 'Vitamin C 500mg', TRADE_NAME: 'Redoxon', UNIT_CODE: 'TAB', UNIT_PRICE: 4.50 }
            ];

            const stockData = mockDrugs.map((drug, index) => {
                const stockQty = Math.floor(Math.random() * 200) + 5;
                const minStock = Math.floor(Math.random() * 30) + 10;

                return {
                    ...drug,
                    STOCK_QTY: stockQty,
                    MIN_STOCK: minStock,
                    TOTAL_VALUE: stockQty * drug.UNIT_PRICE,
                    LAST_UPDATED: new Date().toISOString(),
                    STOCK_STATUS: stockQty === 0 ? 'out' : stockQty <= minStock ? 'low' : 'normal',
                    SUPPLIER: `ผู้จำหน่าย ${String.fromCharCode(65 + (index % 5))}`,
                    LOCATION: `ชั้น ${Math.floor(index / 5) + 1} - ช่อง ${(index % 10) + 1}`,
                    EXPIRY_DATE: new Date(Date.now() + Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000).toISOString(),
                    LOT_NUMBER: `LOT${String(index + 1).padStart(4, '0')}`
                };
            });

            setReportData(stockData);
        }
        setLoading(false);
    };

    const filterAndCalculateStats = () => {
        let filtered = [...reportData];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.DRUG_CODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.GENERIC_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.TRADE_NAME?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by stock status
        if (stockFilter !== 'all') {
            filtered = filtered.filter(item => item.STOCK_STATUS === stockFilter);
        }

        setFilteredData(filtered);

        // Calculate summary stats
        const stats = {
            totalItems: reportData.length,
            totalValue: reportData.reduce((sum, item) => sum + (item.TOTAL_VALUE || 0), 0),
            lowStockItems: reportData.filter(item => item.STOCK_STATUS === 'low').length,
            outOfStockItems: reportData.filter(item => item.STOCK_STATUS === 'out').length,
            normalStockItems: reportData.filter(item => item.STOCK_STATUS === 'normal').length
        };

        setSummaryStats(stats);
        setPage(1);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    };

    const getStockStatusIcon = (status) => {
        switch (status) {
            case 'out':
                return <WarningIcon sx={{ color: '#f44336', fontSize: 20 }} />;
            case 'low':
                return <TrendingDownIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
            case 'normal':
                return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
            default:
                return null;
        }
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'out':
                return 'error';
            case 'low':
                return 'warning';
            case 'normal':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStockStatusLabel = (status) => {
        switch (status) {
            case 'out':
                return 'หมดสต็อก';
            case 'low':
                return 'สต็อกต่ำ';
            case 'normal':
                return 'ปกติ';
            default:
                return 'ไม่ระบุ';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH');
    };

    const generateStockReport = () => {
        if (filteredData.length === 0) {
            alert('ไม่มีข้อมูลสำหรับส่งออกรายงาน');
            return;
        }

        const reportTitle = `รายงานสต็อกยาและเวชภัณฑ์ ประจำวันที่ ${dateRange.day}/${dateRange.month}/${(parseInt(dateRange.year) + 543)}`;

        const reportData = filteredData.map(item => ({
            'รหัสยา': item.DRUG_CODE,
            'ชื่อยา/เวชภัณฑ์': item.GENERIC_NAME,
            'ชื่อทางการค้า': item.TRADE_NAME || '-',
            'หน่วยนับ': item.UNIT_CODE,
            'จำนวนคงเหลือ': item.STOCK_QTY,
            'ราคาต่อหน่วย': item.UNIT_PRICE,
            'รวมเงิน': item.TOTAL_VALUE.toFixed(2),
            'สต็อกขั้นต่ำ': item.MIN_STOCK,
            'สถานะ': getStockStatusLabel(item.STOCK_STATUS),
            'ผู้จำหน่าย': item.SUPPLIER,
            'ตำแหน่ง': item.LOCATION,
            'Lot Number': item.LOT_NUMBER,
            'วันหมดอายุ': formatDate(item.EXPIRY_DATE),
            'อัปเดตล่าสุด': formatDate(item.LAST_UPDATED)
        }));

        // Create CSV content
        const headers = Object.keys(reportData[0]).join(',');
        const csvContent = [
            `"${reportTitle}"`,
            `"สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}"`,
            '',
            `"สรุปข้อมูล"`,
            `"รายการทั้งหมด: ${summaryStats.totalItems}"`,
            `"มูลค่ารวม: ${formatCurrency(summaryStats.totalValue)}"`,
            `"สต็อกปกติ: ${summaryStats.normalStockItems}"`,
            `"สต็อกต่ำ: ${summaryStats.lowStockItems}"`,
            `"หมดสต็อก: ${summaryStats.outOfStockItems}"`,
            '',
            headers,
            ...reportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `stock_report_${dateRange.year}${dateRange.month}${dateRange.day}.csv`;
        link.click();
    };

    const generateDetailedPDFReport = () => {
        if (filteredData.length === 0) {
            alert('ไม่มีข้อมูลสำหรับพิมพ์รายงาน');
            return;
        }

        const reportDate = `${dateRange.day}/${dateRange.month}/${(parseInt(dateRange.year) + 543)}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานสต็อกยาและเวชภัณฑ์</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Sarabun', Arial, sans-serif;
            margin: 0;
            padding: 20mm;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }
        
        .clinic-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .report-date {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .summary-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .summary-card {
            text-align: center;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f8f9fa;
        }
        
        .summary-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #333;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
        }
        
        .data-table th {
            background: #f0f0f0;
            border: 1px solid #ddd;
            padding: 8px 4px;
            text-align: center;
            font-weight: 600;
        }
        
        .data-table td {
            border: 1px solid #ddd;
            padding: 6px 4px;
            text-align: center;
        }
        
        .status-out { color: #d32f2f; font-weight: bold; }
        .status-low { color: #f57c00; font-weight: bold; }
        .status-normal { color: #388e3c; }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        @media print {
            body { padding: 10mm; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">สัมพันธ์คลินิค</div>
        <div class="report-title">รายงานสต็อกยาและเวชภัณฑ์</div>
        <div class="report-date">ประจำวันที่ ${reportDate}</div>
        <div class="report-date">สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')} เวลา: ${new Date().toLocaleTimeString('th-TH')}</div>
    </div>
    
    <div class="summary-section">
        <div class="summary-card">
            <div class="summary-label">รายการทั้งหมด</div>
            <div class="summary-value">${summaryStats.totalItems}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">มูลค่ารวม</div>
            <div class="summary-value">${formatCurrency(summaryStats.totalValue)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">สต็อกต่ำ</div>
            <div class="summary-value" style="color: #f57c00;">${summaryStats.lowStockItems}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">หมดสต็อก</div>
            <div class="summary-value" style="color: #d32f2f;">${summaryStats.outOfStockItems}</div>
        </div>
    </div>
    
    <table class="data-table">
        <thead>
            <tr>
                <th>ลำดับ</th>
                <th>รหัสยา</th>
                <th>ชื่อยา/เวชภัณฑ์</th>
                <th>หน่วย</th>
                <th>คงเหลือ</th>
                <th>ขั้นต่ำ</th>
                <th>ราคา/หน่วย</th>
                <th>มูลค่ารวม</th>
                <th>สถานะ</th>
                <th>ตำแหน่ง</th>
            </tr>
        </thead>
        <tbody>
            ${filteredData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.DRUG_CODE}</td>
                    <td style="text-align: left;">${item.GENERIC_NAME}</td>
                    <td>${item.UNIT_CODE}</td>
                    <td>${item.STOCK_QTY}</td>
                    <td>${item.MIN_STOCK}</td>
                    <td>${formatCurrency(item.UNIT_PRICE)}</td>
                    <td>${formatCurrency(item.TOTAL_VALUE)}</td>
                    <td class="status-${item.STOCK_STATUS}">${getStockStatusLabel(item.STOCK_STATUS)}</td>
                    <td>${item.LOCATION}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        รายงานนี้สร้างโดยระบบอัตโนมัติ | รายการทั้งหมด ${filteredData.length} รายการ
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const newTab = window.open(url, '_blank');

        if (newTab) {
            newTab.onload = function () {
                setTimeout(() => {
                    newTab.print();
                }, 1000);
            };
        }
    };

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    รายงานสต็อกยา/เวชภัณฑ์
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={generateStockReport}
                        size="small"
                        disabled={filteredData.length === 0}
                    >
                        CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={generateDetailedPDFReport}
                        size="small"
                        sx={{ backgroundColor: '#5698E0' }}
                        disabled={filteredData.length === 0}
                    >
                        พิมพ์รายงาน
                    </Button>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {summaryStats.totalItems}
                                    </Typography>
                                    <Typography variant="body2">รายการทั้งหมด</Typography>
                                </Box>
                                <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {formatCurrency(summaryStats.totalValue)}
                                    </Typography>
                                    <Typography variant="body2">มูลค่ารวม</Typography>
                                </Box>
                                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {summaryStats.lowStockItems}
                                    </Typography>
                                    <Typography variant="body2">สต็อกต่ำ</Typography>
                                </Box>
                                <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {summaryStats.outOfStockItems}
                                    </Typography>
                                    <Typography variant="body2">หมดสต็อก</Typography>
                                </Box>
                                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>เลือกวันที่รายงาน</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>วัน</InputLabel>
                                <Select
                                    value={dateRange.day}
                                    label="วัน"
                                    onChange={(e) => setDateRange(prev => ({ ...prev, day: e.target.value }))}
                                >
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                            {i + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>เดือน</InputLabel>
                                <Select
                                    value={dateRange.month}
                                    label="เดือน"
                                    onChange={(e) => setDateRange(prev => ({ ...prev, month: e.target.value }))}
                                >
                                    {[
                                        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                                    ].map((month, index) => (
                                        <MenuItem key={index + 1} value={String(index + 1).padStart(2, '0')}>
                                            {month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>ปี</InputLabel>
                                <Select
                                    value={dateRange.year}
                                    label="ปี"
                                    onChange={(e) => setDateRange(prev => ({ ...prev, year: e.target.value }))}
                                >
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const year = new Date().getFullYear() - 2 + i;
                                        return (
                                            <MenuItem key={year} value={String(year)}>
                                                {year + 543}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                size="small"
                                placeholder="ค้นหายา..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>สถานะสต็อก</InputLabel>
                                <Select
                                    value={stockFilter}
                                    label="สถานะสต็อก"
                                    onChange={(e) => setStockFilter(e.target.value)}
                                >
                                    <MenuItem value="all">ทั้งหมด</MenuItem>
                                    <MenuItem value="normal">ปกติ</MenuItem>
                                    <MenuItem value="low">สต็อกต่ำ</MenuItem>
                                    <MenuItem value="out">หมดสต็อก</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        รายละเอียดสต็อก ({filteredData.length} รายการ)
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                ไม่พบข้อมูลสต็อก
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F0F5FF' }}>
                                        <TableCell><Checkbox /></TableCell>
                                        <TableCell align="center"><strong>ลำดับ</strong></TableCell>
                                        <TableCell align="center"><strong>รหัสยา</strong></TableCell>
                                        <TableCell align="left"><strong>ชื่อยา/เวชภัณฑ์</strong></TableCell>
                                        <TableCell align="center"><strong>หน่วยนับ</strong></TableCell>
                                        <TableCell align="center"><strong>คงเหลือ</strong></TableCell>
                                        <TableCell align="center"><strong>ขั้นต่ำ</strong></TableCell>
                                        <TableCell align="right"><strong>ราคา/หน่วย</strong></TableCell>
                                        <TableCell align="right"><strong>มูลค่ารวม</strong></TableCell>
                                        <TableCell align="center"><strong>สถานะ</strong></TableCell>
                                        <TableCell align="center"><strong>ตำแหน่ง</strong></TableCell>
                                        <TableCell align="center"><strong>อัปเดต</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getPaginatedData().map((item, index) => (
                                        <TableRow
                                            key={item.DRUG_CODE}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                                backgroundColor: item.STOCK_STATUS === 'out' ? '#ffebee' :
                                                    item.STOCK_STATUS === 'low' ? '#fff3e0' : 'inherit'
                                            }}
                                        >
                                            <TableCell>
                                                <Checkbox size="small" />
                                            </TableCell>
                                            <TableCell align="center">
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {item.DRUG_CODE}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="left">
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {item.GENERIC_NAME}
                                                    </Typography>
                                                    {item.TRADE_NAME && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.TRADE_NAME}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">{item.UNIT_CODE}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {getStockStatusIcon(item.STOCK_STATUS)}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            ml: 0.5,
                                                            fontWeight: item.STOCK_STATUS !== 'normal' ? 'bold' : 'normal',
                                                            color: item.STOCK_STATUS === 'out' ? '#f44336' :
                                                                item.STOCK_STATUS === 'low' ? '#ff9800' : 'inherit'
                                                        }}
                                                    >
                                                        {item.STOCK_QTY}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.MIN_STOCK}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(item.UNIT_PRICE)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {formatCurrency(item.TOTAL_VALUE)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={getStockStatusLabel(item.STOCK_STATUS)}
                                                    color={getStockStatusColor(item.STOCK_STATUS)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption">
                                                    {item.LOCATION}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(item.LAST_UPDATED)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination */}
                    {filteredData.length > itemsPerPage && (
                        <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                shape="rounded"
                                color="primary"
                            />
                        </Stack>
                    )}

                    {/* Summary Footer */}
                    {filteredData.length > 0 && (
                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        แสดง {getPaginatedData().length} จาก {filteredData.length} รายการ
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2">
                                        <strong>มูลค่ารวมหน้านี้:</strong> {formatCurrency(
                                            getPaginatedData().reduce((sum, item) => sum + item.TOTAL_VALUE, 0)
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2">
                                        <strong>สต็อกต่ำ:</strong> {getPaginatedData().filter(item => item.STOCK_STATUS === 'low').length} รายการ
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2">
                                        <strong>หมดสต็อก:</strong> {getPaginatedData().filter(item => item.STOCK_STATUS === 'out').length} รายการ
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Low Stock Alert */}
                    {summaryStats.lowStockItems > 0 && (
                        <Alert
                            severity="warning"
                            sx={{ mt: 2 }}
                            icon={<WarningIcon />}
                        >
                            <strong>คำเตือน!</strong> มียาที่สต็อกต่ำ {summaryStats.lowStockItems} รายการ
                            {summaryStats.outOfStockItems > 0 && ` และหมดสต็อก ${summaryStats.outOfStockItems} รายการ`}
                            <br />กรุณาตรวจสอบและเติมสต็อกโดยเร็วที่สุด
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default EnhancedDrugStockReport;