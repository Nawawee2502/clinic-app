import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, Autocomplete, FormControl, InputLabel, Select, MenuItem,
    Snackbar
} from '@mui/material';
import {
    Print as PrintIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import StockCardService from '../../services/stockCardService';
import DrugService from '../../services/drugService';

const StockCardReport = () => {
    const [stockCardData, setStockCardData] = useState([]);
    const [drugList, setDrugList] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [lotOptions, setLotOptions] = useState([]);
    const [selectedLot, setSelectedLot] = useState(null);
    const [lotLoading, setLotLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState((new Date().getFullYear() + 543).toString());
    const getInitialMonth = () => {
        const month = new Date().getMonth() + 1;
        return month.toString().padStart(2, '0');
    };

    const convertYearToAD = (yearString) => {
        if (!yearString) return '';
        const yearNumber = parseInt(yearString, 10);
        if (Number.isNaN(yearNumber)) return '';
        // ถ้ามากกว่า 2400 ถือว่าเป็นปี พ.ศ. ให้แปลงเป็น ค.ศ.
        return (yearNumber > 2400 ? yearNumber - 543 : yearNumber).toString();
    };

    const [selectedMonth, setSelectedMonth] = useState(getInitialMonth());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // ชื่อเดือนภาษาไทย
    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    useEffect(() => {
        loadDrugs();
    }, []);

    const loadDrugs = async () => {
        try {
            const response = await DrugService.getAllDrugs();
            if (response.success && response.data) {
                setDrugList(response.data);
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
            showSnackbar('ไม่สามารถโหลดรายชื่อยาได้', 'error');
        }
    };

    const loadStockCardData = async () => {
        if (!selectedDrug || !selectedLot) {
            showSnackbar('กรุณาเลือกยาและ LOT NO ก่อนค้นหา', 'warning');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // ✅ ถ้าไม่ได้เลือกยา ให้ดึงข้อมูลทั้งหมดในเดือนนั้น
            const filters = {
                year: convertYearToAD(selectedYear),
                month: selectedMonth.padStart(2, '0')
            };

            if (selectedDrug) {
                filters.drugCode = selectedDrug.DRUG_CODE;
            }

            filters.lotNo = selectedLot;

            console.log('📊 Loading stock card data with filters:', filters);

            // ✅ ใช้ API ดึงข้อมูลแบบคำนวณย้อนกลับ (Reverse Calculation) 
            // เพื่อให้ข้อมูลตรงกับ Stock Balance ปัจจุบัน โดยไม่ต้องกดปิดยอด
            console.log('🔄 Fetching Reverse Stock Report...');
            const response = await StockCardService.getReverseStockReport(filters);

            console.log('📊 Stock card API response:', response);

            if (response.success && response.data) {
                console.log('📊 Raw stock card data:', response.data);
                console.log('📊 Total records:', response.data.length);

                // ✅ เรียงตามยา (ถ้าเลือกทั้งหมด) จากนั้นเรียงตามวันที่และเลขที่เอกสาร
                const sortedData = [...response.data].sort((a, b) => {
                    if (!selectedDrug && a.DRUG_CODE !== b.DRUG_CODE) {
                        return a.DRUG_CODE.localeCompare(b.DRUG_CODE);
                    }
                    const dateA = new Date(a.RDATE);
                    const dateB = new Date(b.RDATE);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return (a.REFNO || '').localeCompare(b.REFNO || '');
                });

                // ✅ คำนวณยอดคงเหลือแบบสะสม (cumulative)
                // แยกตามยาและ LOT NO เพื่อคำนวณยอดคงเหลือแยกกัน
                const processedData = [];
                const balanceMap = {}; // เก็บยอดคงเหลือล่าสุดของแต่ละยาและ LOT

                sortedData.forEach((item, index) => {
                    const drugKey = `${item.DRUG_CODE || ''}_${item.LOTNO || '-'}`;

                    // ดึงยอดยกมาจากแถวก่อนหน้า (หรือใช้ BEG1 ถ้าเป็นแถวแรกของยาและ LOT นี้)
                    let begQty = 0;
                    let begAmt = 0;

                    if (balanceMap[drugKey] !== undefined) {
                        // ใช้ยอดคงเหลือจากแถวก่อนหน้าเป็นยอดยกมา
                        begQty = balanceMap[drugKey].endingQty;
                        begAmt = balanceMap[drugKey].endingAmt;
                    } else {
                        // แถวแรกของยาและ LOT นี้ 
                        // ✅ ใช้ CALCULATED_BEG ที่คำนวณจาก backend (Reverse Calc) ถ้ามี
                        // ถ้าไม่มีค่อยใช้ BEG1 จากฐานข้อมูล
                        if (item.CALCULATED_BEG !== undefined) {
                            begQty = parseFloat(item.CALCULATED_BEG);
                        } else {
                            begQty = parseFloat(item.BEG1) || 0;
                        }
                        begAmt = parseFloat(item.BEG1_AMT) || 0; // BEG1_AMT might need similar handling but usually less critical for Qty check
                    }

                    const inQty = parseFloat(item.IN1) || 0;
                    const outQty = parseFloat(item.OUT1) || 0;
                    const updQty = parseFloat(item.UPD1) || 0;

                    // คำนวณยอดคงเหลือ: ยอดยกมา + รับ - จ่าย + ปรับปรุง
                    const endingQty = begQty + inQty - outQty + updQty;

                    const inAmt = parseFloat(item.IN1_AMT) || 0;
                    const outAmt = parseFloat(item.OUT1_AMT) || 0;
                    const updAmt = parseFloat(item.UPD1_AMT) || 0;

                    // คำนวณยอดคงเหลือเงิน: ยอดยกมา + รับ - จ่าย + ปรับปรุง
                    const endingAmt = begAmt + inAmt - outAmt + updAmt;

                    // บันทึกยอดคงเหลือล่าสุดสำหรับยาและ LOT นี้
                    balanceMap[drugKey] = {
                        endingQty,
                        endingAmt
                    };

                    processedData.push({
                        ...item,
                        // ใช้ยอดยกมาที่คำนวณได้ (ไม่ใช่ BEG1 จากฐานข้อมูล)
                        calculatedBEG1: begQty,
                        calculatedBEG1_AMT: begAmt,
                        endingQty,
                        endingAmt
                    });
                });

                console.log('📊 Processed stock card data:', processedData);
                setStockCardData(processedData);
            } else {
                setStockCardData([]);
                showSnackbar('ไม่พบข้อมูลสต็อกการ์ด', 'info');
            }
        } catch (error) {
            console.error('❌ Error loading stock card data:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
            setStockCardData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadLotsForDrug = async (drug) => {
        if (!drug?.DRUG_CODE) {
            setLotOptions([]);
            setSelectedLot(null);
            return;
        }

        try {
            setLotLoading(true);
            const response = await StockCardService.getStockCardsByDrug(drug.DRUG_CODE);
            if (response.success && Array.isArray(response.data)) {
                const uniqueLots = Array.from(
                    new Set(
                        response.data
                            .map(item => (item.LOTNO && item.LOTNO.trim() !== '' ? item.LOTNO.trim() : '-'))
                    )
                ).sort((a, b) => {
                    if (a === '-') return 1;
                    if (b === '-') return -1;
                    return a.localeCompare(b);
                });
                setLotOptions(uniqueLots);
            } else {
                setLotOptions([]);
            }
            setSelectedLot(null);
        } catch (error) {
            console.error('Error loading lot numbers:', error);
            showSnackbar('ไม่สามารถโหลด LOT NO ได้', 'error');
            setLotOptions([]);
            setSelectedLot(null);
        } finally {
            setLotLoading(false);
        }
    };

    const formatDateBE = (dateString) => {
        if (!dateString) return '-';
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

    const formatDateCEForExpire = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear(); // CE form
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    const calculateTotals = () => {
        if (stockCardData.length === 0) {
            return {
                totalBEG1: 0,
                totalIN1: 0,
                totalOUT1: 0,
                totalUPD1: 0,
                totalBEG1_AMT: 0,
                totalIN1_AMT: 0,
                totalOUT1_AMT: 0,
                totalUPD1_AMT: 0,
                totalEndingQty: 0,
                totalEndingAmt: 0
            };
        }

        // ✅ ยอดยกมา: ใช้ยอดยกมาของแถวแรก (calculatedBEG1)
        const firstItem = stockCardData[0];
        const totalBEG1 = firstItem.calculatedBEG1 || 0;
        const totalBEG1_AMT = firstItem.calculatedBEG1_AMT || 0;

        // ✅ รวม รับ, จ่าย, ปรับปรุง จากทุกแถว
        const totals = stockCardData.reduce((acc, item) => {
            acc.totalIN1 += parseFloat(item.IN1) || 0;
            acc.totalOUT1 += parseFloat(item.OUT1) || 0;
            acc.totalUPD1 += parseFloat(item.UPD1) || 0;
            acc.totalIN1_AMT += parseFloat(item.IN1_AMT) || 0;
            acc.totalOUT1_AMT += parseFloat(item.OUT1_AMT) || 0;
            acc.totalUPD1_AMT += parseFloat(item.UPD1_AMT) || 0;
            return acc;
        }, {
            totalIN1: 0,
            totalOUT1: 0,
            totalUPD1: 0,
            totalIN1_AMT: 0,
            totalOUT1_AMT: 0,
            totalUPD1_AMT: 0
        });

        // ✅ ยอดคงเหลือ: ใช้ยอดคงเหลือของแถวสุดท้าย
        const lastItem = stockCardData[stockCardData.length - 1];
        const totalEndingQty = lastItem.endingQty || 0;
        const totalEndingAmt = lastItem.endingAmt || 0;

        return {
            totalBEG1,
            totalIN1: totals.totalIN1,
            totalOUT1: totals.totalOUT1,
            totalUPD1: totals.totalUPD1,
            totalBEG1_AMT,
            totalIN1_AMT: totals.totalIN1_AMT,
            totalOUT1_AMT: totals.totalOUT1_AMT,
            totalUPD1_AMT: totals.totalUPD1_AMT,
            totalEndingQty,
            totalEndingAmt
        };
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintHTML();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // รอให้โหลดเสร็จก่อนพิมพ์
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const generatePrintHTML = () => {
        const totals = calculateTotals();
        const monthName = monthNames[parseInt(selectedMonth) - 1];
        const drugName = selectedDrug ? (() => {
            const genericName = selectedDrug.GENERIC_NAME || '';
            const tradeName = selectedDrug.TRADE_NAME || '';
            const drugCode = selectedDrug.DRUG_CODE || '';
            return `${genericName}-${tradeName}-${drugCode}`;
        })() : '';
        const lotDisplay = selectedLot ? selectedLot : '';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานสต็อกการ์ดประจำเดือน - ${monthName} ${selectedYear}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
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
            margin-bottom: 5px;
        }
        .period {
            font-size: 14px;
            margin-bottom: 15px;
        }
        .drug-name {
            margin-bottom: 15px;
            font-size: 14px;
        }
        .drug-name label {
            font-weight: bold;
        }
        .drug-name span {
            border-bottom: 1px solid #000;
            padding: 0 10px;
            min-width: 300px;
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
            padding: 4px 6px;
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
            background-color: #f0f0f0;
        }
        .total-row td:last-child {
            border: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">สัมพันธ์คลีนิค</div>
        <div class="report-title">รายงานสต็อกการ์ดประจำเดือน</div>
        <div class="period">เดือน${monthName} ${selectedYear}</div>
    </div>
    
    <div class="drug-name">
        <label>ยา:</label>
        <span>${drugName}</span>
    </div>
    ${lotDisplay ? `
    <div class="drug-name">
        <label>LOT:</label>
        <span>${lotDisplay}</span>
    </div>` : ''}
    
    <table>
        <thead>
            <tr>
                <th rowspan="2">ที่</th>
                <th rowspan="2">วันที่</th>
                <th rowspan="2">เลขที่เอกสาร</th>
                <th rowspan="2">LOT No</th>
                <th rowspan="2">Expire Date</th>
                <th colspan="5">จำนวน</th>
                <th rowspan="2">ราคาต่อหน่วย</th>
                <th colspan="5">จำนวนเงิน</th>
            </tr>
            <tr>
                <th>ยกมา</th>
                <th>รับ</th>
                <th>จ่าย</th>
                <th>ปรับปรุง</th>
                <th>คงเหลือ</th>
                <th>ยกมา</th>
                <th>รับ</th>
                <th>จ่าย</th>
                <th>ปรับปรุง</th>
                <th>คงเหลือ</th>
            </tr>
        </thead>
        <tbody>
            ${stockCardData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatDateBE(item.RDATE)}</td>
                    <td class="text-left">${item.REFNO || '-'}</td>
                    <td>${item.LOTNO || '-'}</td>
                    <td>${formatDateCEForExpire(item.EXPIRE_DATE)}</td>
                    <td class="text-right">
                        ${(index === 0 || item.DRUG_CODE !== stockCardData[index - 1].DRUG_CODE || item.LOTNO !== stockCardData[index - 1].LOTNO)
                ? (item.calculatedBEG1 || 0).toFixed(2)
                : '0.00'}
                    </td>
                    <td class="text-right">${(parseFloat(item.IN1) || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.OUT1) || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.UPD1) || 0).toFixed(2)}</td>
                    <td class="text-right">${(item.endingQty || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.UNIT_COST) || 0).toFixed(2)}</td>
                    <td class="text-right">
                        ${(index === 0 || item.DRUG_CODE !== stockCardData[index - 1].DRUG_CODE || item.LOTNO !== stockCardData[index - 1].LOTNO)
                ? (item.calculatedBEG1_AMT || 0).toFixed(2)
                : '0.00'}
                    </td>
                    <td class="text-right">${(parseFloat(item.IN1_AMT) || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.OUT1_AMT) || 0).toFixed(2)}</td>
                    <td class="text-right">${(parseFloat(item.UPD1_AMT) || 0).toFixed(2)}</td>
                    <td class="text-right">${(item.endingAmt || 0).toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="5" class="text-right">รวม</td>
                <td class="text-right">${totals.totalBEG1.toFixed(2)}</td>
                <td class="text-right">${totals.totalIN1.toFixed(2)}</td>
                <td class="text-right">${totals.totalOUT1.toFixed(2)}</td>
                <td class="text-right">${totals.totalUPD1.toFixed(2)}</td>
                <td class="text-right">${totals.totalEndingQty.toFixed(2)}</td>
                <td></td>
                <td class="text-right">${totals.totalBEG1_AMT.toFixed(2)}</td>
                <td class="text-right">${totals.totalIN1_AMT.toFixed(2)}</td>
                <td class="text-right">${totals.totalOUT1_AMT.toFixed(2)}</td>
                <td class="text-right">${totals.totalUPD1_AMT.toFixed(2)}</td>
                <td class="text-right">${totals.totalEndingAmt.toFixed(2)}</td>
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

    const getYearOptionsBE = () => {
        const currentYear = new Date().getFullYear() + 543;
        const options = [];
        for (let i = 0; i <= 5; i++) {
            const year = currentYear - i;
            options.push({ value: year.toString(), label: year.toString() });
        }
        return options;
    };

    const totals = calculateTotals();

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Autocomplete
                                options={drugList}
                                getOptionLabel={(option) => {
                                    const genericName = option.GENERIC_NAME || '';
                                    const tradeName = option.TRADE_NAME || '';
                                    const drugCode = option.DRUG_CODE || '';
                                    return `${genericName}-${tradeName}-${drugCode}`;
                                }}
                                value={selectedDrug}
                                onChange={(event, newValue) => {
                                    setSelectedDrug(newValue);
                                    loadLotsForDrug(newValue);
                                }}
                                // ✅ ใช้ DRUG_CODE เพื่อเปรียบเทียบเพื่อหลีกเลี่ยง duplicate key
                                isOptionEqualToValue={(option, value) => option?.DRUG_CODE === value?.DRUG_CODE}
                                renderOption={(props, option) => {
                                    const genericName = option.GENERIC_NAME || '';
                                    const tradeName = option.TRADE_NAME || '';
                                    const drugCode = option.DRUG_CODE || '';
                                    return (
                                        <li {...props} key={option.DRUG_CODE}>
                                            {`${genericName}-${tradeName}-${drugCode}`}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="ยา (ไม่เลือก = ดูทั้งหมด)"
                                        placeholder="เลือกยา หรือเว้นว่างเพื่อดูทั้งหมด"
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                )}
                                filterOptions={(options, { inputValue }) => {
                                    const searchTerm = inputValue.toLowerCase();
                                    return options.filter(option =>
                                        (option.GENERIC_NAME || '').toLowerCase().includes(searchTerm) ||
                                        (option.TRADE_NAME || '').toLowerCase().includes(searchTerm) ||
                                        (option.DRUG_CODE || '').toLowerCase().includes(searchTerm)
                                    );
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Autocomplete
                                options={lotOptions}
                                value={selectedLot}
                                onChange={(event, newValue) => setSelectedLot(newValue)}
                                loading={lotLoading}
                                disabled={!selectedDrug}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="LOT NO *"
                                        placeholder={selectedDrug ? "ต้องเลือก LOT NO" : "เลือกยาก่อน"}
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>ปี (พ.ศ.)</InputLabel>
                                <Select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    label="ปี (พ.ศ.)"
                                    sx={{ borderRadius: "10px" }}
                                >
                                    {getYearOptionsBE().map((year) => (
                                        <MenuItem key={year.value} value={year.value}>
                                            {year.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>เดือน</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value.padStart(2, '0'))}
                                    label="เดือน"
                                    sx={{ borderRadius: "10px" }}
                                >
                                    {monthNames.map((month, index) => (
                                        <MenuItem key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
                                            {month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadStockCardData}
                                    disabled={loading || !selectedDrug || !selectedLot}
                                    sx={{ borderRadius: "10px", backgroundColor: '#5698E0' }}
                                >
                                    ค้นหา
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                    disabled={loading || stockCardData.length === 0}
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

            {!loading && !error && stockCardData.length > 0 && (
                <Card>
                    <CardContent>
                        {/* Header สำหรับแสดงผล */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                สัมพันธ์คลีนิค
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                รายงานสต็อกการ์ดประจำเดือน
                            </Typography>
                            <Typography variant="body1">
                                เดือน{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
                            </Typography>
                            <Box sx={{ mt: 2, textAlign: 'left', display: 'inline-block' }}>
                                <Typography variant="body1">
                                    <strong>ยา:</strong> {selectedDrug
                                        ? (() => {
                                            const genericName = selectedDrug.GENERIC_NAME || '';
                                            const tradeName = selectedDrug.TRADE_NAME || '';
                                            const drugCode = selectedDrug.DRUG_CODE || '';
                                            return `${genericName}-${tradeName}-${drugCode}`;
                                        })()
                                        : 'ทั้งหมด'}
                                </Typography>
                                {/* {selectedLot && (
                                    <Typography variant="body1">
                                        <strong>LOT:</strong> {selectedLot}
                                    </Typography>
                                )} */}
                            </Box>
                        </Box>

                        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ที่</TableCell>
                                        {!selectedDrug && (
                                            <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ชื่อยา</TableCell>
                                        )}
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>วันที่</TableCell>
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>เลขที่เอกสาร</TableCell>
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>LOT No</TableCell>
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Expire Date</TableCell>
                                        <TableCell colSpan={5} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จำนวน</TableCell>
                                        <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ราคาต่อหน่วย</TableCell>
                                        <TableCell colSpan={5} align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จำนวนเงิน</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ยกมา</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>รับ</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จ่าย</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ปรับปรุง</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>คงเหลือ</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ยกมา</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>รับ</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>จ่าย</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>ปรับปรุง</TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>คงเหลือ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockCardData.map((item, index) => (
                                        <TableRow key={`${item.DRUG_CODE}-${item.REFNO}-${item.RDATE}-${index}`}>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{index + 1}</TableCell>
                                            {!selectedDrug && (
                                                <TableCell align="left" sx={{ border: '1px solid #ddd' }}>
                                                    {(() => {
                                                        const genericName = item.GENERIC_NAME || '';
                                                        const tradeName = item.TRADE_NAME || '';
                                                        const drugCode = item.DRUG_CODE || '';
                                                        return `${genericName}-${tradeName}-${drugCode}`;
                                                    })()}
                                                </TableCell>
                                            )}
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{formatDateBE(item.RDATE)}</TableCell>
                                            <TableCell align="left" sx={{ border: '1px solid #ddd' }}>{item.REFNO || '-'}</TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{item.LOTNO || '-'}</TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid #ddd' }}>{formatDateCEForExpire(item.EXPIRE_DATE)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>
                                                {(index === 0 || item.DRUG_CODE !== stockCardData[index - 1].DRUG_CODE || item.LOTNO !== stockCardData[index - 1].LOTNO)
                                                    ? (item.calculatedBEG1 || 0).toFixed(2)
                                                    : '0.00'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.IN1) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.OUT1) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.UPD1) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>{(item.endingQty || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.UNIT_COST) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>
                                                {(index === 0 || item.DRUG_CODE !== stockCardData[index - 1].DRUG_CODE || item.LOTNO !== stockCardData[index - 1].LOTNO)
                                                    ? (item.calculatedBEG1_AMT || 0).toFixed(2)
                                                    : '0.00'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.IN1_AMT) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.OUT1_AMT) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{(parseFloat(item.UPD1_AMT) || 0).toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>{(item.endingAmt || 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <TableCell colSpan={selectedDrug ? 5 : 6} align="right" sx={{ border: '1px solid #ddd' }}>รวม</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalBEG1.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalIN1.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalOUT1.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalUPD1.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalEndingQty.toFixed(2)}</TableCell>
                                        <TableCell sx={{ border: '1px solid #ddd' }}></TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalBEG1_AMT.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalIN1_AMT.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalOUT1_AMT.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalUPD1_AMT.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ border: '1px solid #ddd' }}>{totals.totalEndingAmt.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && stockCardData.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    {selectedDrug
                        ? 'ไม่พบข้อมูลสต็อกการ์ดสำหรับยาที่เลือกในช่วงเวลาที่ระบุ'
                        : 'ไม่พบข้อมูลสต็อกการ์ดในช่วงเวลาที่ระบุ'}
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

export default StockCardReport;

