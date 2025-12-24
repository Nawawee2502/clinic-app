
import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Stack,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
// import api from '../utils/api'; // Removed as it does not exist
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const MonthlyClosing = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [loading, setLoading] = useState(false);

    // Generate years (Current - 5 to Current + 5)
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Thai Month Names
    const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const handleCloseMonth = async () => {
        // Confirmation Dialog
        const result = await Swal.fire({
            title: 'ยืนยันการปิดยอดประจำเดือน?',
            html: `
                <div style="text-align: left; font-size: 16px;">
                    <p>ท่านกำลังจะปิดยอดของเดือน: <strong>${thaiMonths[selectedMonth - 1]} ${selectedYear + 543}</strong></p>
                    <p style="color: #d32f2f;">⚠️ คำเตือน:</p>
                    <ul style="color: #555;">
                        <li>ระบบจะนำยอดคงเหลือปัจจุบัน (Current Stock) ไปบันทึกเป็น <b>"ยอดยกมา"</b> ของเดือนนี้</li>
                        <li>หากเคยปิดยอดเดือนนี้ไปแล้ว <b>ข้อมูลเก่าจะถูกทับใหม่ทั้งหมด</b></li>
                    </ul>
                    <p>ต้องการดำเนินการต่อหรือไม่?</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2e7d32',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยันปิดยอด',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/bal_month_drug/close-month`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        year: selectedYear,
                        month: selectedMonth
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ปิดยอดสำเร็จ!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(data.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
                }
            } catch (error) {
                console.error('Closing validation error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error.message || 'ไม่สามารถเชื่อมต่อเครื่องแม่ข่ายได้'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                📅 ปิดยอดสินค้าคงคลังประจำเดือน
                <Typography variant="subtitle1" component="span" sx={{ ml: 2, color: 'text.secondary' }}>
                    (Monthly Inventory Closing)
                </Typography>
            </Typography>

            <Alert severity="info" sx={{ mb: 4, fontSize: '1.1rem' }}>
                ฟังก์ชันนี้ใช้สำหรับจับภาพข้อมูลสินค้าคงคลังปัจจุบัน (Stock Snapshot) เพื่อบันทึกเป็น
                <strong> "ยอดยกมา" (Beginning Balance)</strong> สำหรับใช้ในการคำนวณและตรวจสอบ stock ในเดือนถัดไป
            </Alert>

            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                        <Typography variant="h6" color="text.primary">
                            เลือกเดือนและปีที่ต้องการปิดยอด / บันทึกยอดยกมา
                        </Typography>

                        <Divider />

                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>เดือน (Month)</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="เดือน (Month)"
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    {thaiMonths.map((name, index) => (
                                        <MenuItem key={index + 1} value={index + 1}>
                                            {index + 1}. {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>ปี (Year)</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="ปี (Year)"
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year} ({year + 543})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleCloseMonth}
                                disabled={loading}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderRadius: 2
                                }}
                            >
                                {loading ? 'กำลังประมวลผล...' : 'ยืนยันปิดยอดประจำเดือน'}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    * หมายเหตุ: การปิดยอดจะทำการล้างข้อมูลยอดยกมาเดิมของเดือนที่เลือก (ถ้ามี) และบันทึกใหม่ด้วยยอดคงเหลือปัจจุบัน
                </Typography>
            </Box>
        </Box>
    );
};

export default MonthlyClosing;
