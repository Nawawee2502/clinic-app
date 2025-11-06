import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
    Snackbar
} from '@mui/material';
import {
    Print as PrintIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import BalDrugService from '../../services/balDrugService';

const ExpiringDrugsReport = () => {
    const [expiringDrugs, setExpiringDrugs] = useState([]);
    const [selectedDays, setSelectedDays] = useState(90);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const loadExpiringDrugs = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📊 Loading expiring drugs - Days:', selectedDays, 'Date:', selectedDate);

            // ดึงข้อมูลทั้งหมดจาก BAL_DRUG
            const response = await BalDrugService.getAllBalances({ limit: 10000 });

            if (response.success && response.data) {
                console.log('📊 Raw data from API:', response.data);
                console.log('📊 Total records:', response.data.length);

                // คำนวณวันที่สุดท้ายที่ยอมรับได้ (selectedDate + selectedDays)
                const baseDate = new Date(selectedDate);
                const expiryDate = new Date(baseDate);
                expiryDate.setDate(expiryDate.getDate() + selectedDays);

                console.log('📊 Base date:', baseDate.toISOString());
                console.log('📊 Expiry threshold date:', expiryDate.toISOString());

                // กรองยาที่ใกล้หมดอายุ
                const filtered = response.data.filter(item => {
                    if (!item.EXPIRE_DATE || item.EXPIRE_DATE === '-' || item.EXPIRE_DATE === '') {
                        return false;
                    }

                    // ตรวจสอบว่ามีจำนวนคงเหลือมากกว่า 0
                    const qty = parseFloat(item.QTY) || 0;
                    if (qty <= 0) {
                        return false;
                    }

                    try {
                        const expireDate = new Date(item.EXPIRE_DATE);
                        const isValidDate = !isNaN(expireDate.getTime());

                        if (!isValidDate) {
                            return false;
                        }

                        // ตรวจสอบว่าวันหมดอายุอยู่ระหว่าง baseDate และ expiryDate
                        const isExpiring = expireDate >= baseDate && expireDate <= expiryDate;

                        console.log(`📊 Drug ${item.DRUG_CODE} - Expire: ${expireDate.toISOString()}, QTY: ${qty}, IsExpiring: ${isExpiring}`);

                        return isExpiring;
                    } catch (err) {
                        console.warn(`⚠️ Invalid EXPIRE_DATE for ${item.DRUG_CODE}:`, item.EXPIRE_DATE);
                        return false;
                    }
                });

                // เรียงตามวันหมดอายุ (ใกล้หมดก่อน)
                filtered.sort((a, b) => {
                    const dateA = new Date(a.EXPIRE_DATE);
                    const dateB = new Date(b.EXPIRE_DATE);
                    return dateA.getTime() - dateB.getTime();
                });

                console.log('📊 Filtered expiring drugs:', filtered);
                console.log('📊 Total expiring drugs:', filtered.length);

                setExpiringDrugs(filtered);
            } else {
                setExpiringDrugs([]);
                showSnackbar('ไม่พบข้อมูลยา', 'info');
            }
        } catch (error) {
            console.error('❌ Error loading expiring drugs:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
            setExpiringDrugs([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateBE = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear() + 543;
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    const formatDateBEForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 10);
        } catch (error) {
            return '';
        }
    };

    const convertDateCEToBE = (ceDate) => {
        if (!ceDate) return '';
        const [year, month, day] = ceDate.split('-');
        const beYear = parseInt(year) + 543;
        return `${beYear}-${month}-${day}`;
    };

    const convertDateBEToCE = (beDate) => {
        if (!beDate) return '';
        const [year, month, day] = beDate.split('-');
        const ceYear = parseInt(year) - 543;
        return `${ceYear}-${month}-${day}`;
    };

    const DateInputBE = ({ label, value, onChange, ...props }) => {
        const displayValue = value ? convertDateCEToBE(value) : '';

        const handleChange = (e) => {
            const beValue = e.target.value;
            const ceValue = beValue ? convertDateBEToCE(beValue) : '';
            onChange(ceValue);
        };

        return (
            <TextField
                {...props}
                fullWidth
                label={label}
                type="date"
                value={displayValue}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    max: convertDateCEToBE('9999-12-31')
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
        );
    };

    const calculateTotals = () => {
        if (expiringDrugs.length === 0) {
            return {
                totalQty: 0,
                totalAmount: 0
            };
        }

        const totals = expiringDrugs.reduce((acc, item) => {
            acc.totalQty += parseFloat(item.QTY) || 0;
            acc.totalAmount += parseFloat(item.AMT) || 0;
            return acc;
        }, {
            totalQty: 0,
            totalAmount: 0
        });

        return totals;
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintHTML();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const generatePrintHTML = () => {
        const totals = calculateTotals();
        const reportDate = formatDateBE(selectedDate);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานยาเวชภัณฑ์ใกล้หมดอายุ</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        body {
            font-family: 'Sarabun', Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .clinic-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-date {
            font-size: 14px;
            margin-bottom: 15px;
        }
        .report-date span {
            border-bottom: 1px solid #000;
            padding: 0 10px;
            min-width: 200px;
            display: inline-block;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: center;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .text-left {
            text-align: left;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            background-color: #f0f0f5;
        }
        .total-row td:last-child {
            border: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">สัมพันธ์คลีนิค</div>
        <div class="report-title">รายงานยาเวชภัณฑ์ใกล้หมดอายุ</div>
        <div class="report-date">
            ณ วันที่ <span>${reportDate}</span>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>ที่</th>
                <th>รหัส</th>
                <th>ชื่อยา/เวชภัณฑ์</th>
                <th>Lot No</th>
                <th>วันหมดอายุ</th>
                <th>จำนวน</th>
                <th>หน่วยนับ</th>
                <th>ราคาต่อหน่วย</th>
                <th>จำนวนเงิน</th>
            </tr>
        </thead>
        <tbody>
            ${expiringDrugs.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="text-left">${item.DRUG_CODE || '-'}</td>
                    <td class="text-left">${item.GENERIC_NAME || '-'}</td>
                    <td>${item.LOT_NO || '-'}</td>
                    <td>${formatDateBE(item.EXPIRE_DATE)}</td>
                    <td class="text-right">${(parseFloat(item.QTY) || 0).toFixed(2)}</td>
                    <td>${item.UNIT_NAME1 || item.UNIT_CODE1 || '-'}</td>
                    <td class="text-right">${(parseFloat(item.UNIT_PRICE) || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.AMT) || 0).toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="7" class="text-right">รวมเงิน</td>
                <td class="text-right"></td>
                <td class="text-right">${totals.totalAmount.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
        `;
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const totals = calculateTotals();

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>ช่วงเวลาใกล้หมดอายุ</InputLabel>
                                <Select
                                    value={selectedDays}
                                    onChange={(e) => setSelectedDays(e.target.value)}
                                    label="ช่วงเวลาใกล้หมดอายุ"
                                    sx={{ borderRadius: "10px" }}
                                >
                                    <MenuItem value={90}>90 วัน</MenuItem>
                                    <MenuItem value={180}>180 วัน</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <DateInputBE
                                label="ณ วันที่"
                                value={selectedDate}
                                onChange={(value) => setSelectedDate(value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadExpiringDrugs}
                                    disabled={loading}
                                    sx={{ borderRadius: "10px", backgroundColor: '#5698E0' }}
                                >
                                    ค้นหา
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                    disabled={loading || expiringDrugs.length === 0}
                                    sx={{ borderRadius: "10px" }}
                                >
                                    พิมพ์
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && expiringDrugs.length > 0 && (
                <Card>
                    <CardContent>
                        {/* Header สำหรับแสดงผล */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                สัมพันธ์คลีนิค
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                รายงานยาเวชภัณฑ์ใกล้หมดอายุ
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                ณ วันที่ {formatDateBE(selectedDate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (ยาที่หมดอายุภายใน {selectedDays} วัน)
                            </Typography>
                        </Box>

                        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ที่</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>รหัส</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ชื่อยา/เวชภัณฑ์</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Lot No</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>วันหมดอายุ</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จำนวน</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>หน่วยนับ</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ราคาต่อหน่วย</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จำนวนเงิน</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {expiringDrugs.map((item, index) => (
                                        <TableRow key={`${item.DRUG_CODE}-${item.LOT_NO}-${index}`}>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{index + 1}</TableCell>
                                            <TableCell align="left" sx={{ border: '1px solid #ddd' }}>{item.DRUG_CODE || '-'}</TableCell>
                                            <TableCell align="left" sx={{ border: '1px solid #ddd' }}>{item.GENERIC_NAME || '-'}</TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{item.LOT_NO || '-'}</TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{formatDateBE(item.EXPIRE_DATE)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.QTY) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{item.UNIT_NAME1 || item.UNIT_CODE1 || '-'}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.UNIT_PRICE) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.AMT) || 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <TableCell colSpan={7} align="right" sx={{ border: '1px solid #ddd' }}>รวมเงิน</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}></TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && expiringDrugs.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    ไม่พบยาหรือเวชภัณฑ์ที่ใกล้หมดอายุในช่วงเวลาที่เลือก
                </Alert>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExpiringDrugsReport;

