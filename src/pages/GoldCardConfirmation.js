import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, CircularProgress,
    Snackbar, Alert, Pagination, InputAdornment, Grid
} from '@mui/material';
import { CheckCircle, Today } from '@mui/icons-material';

// Define API Base URL (same as other services)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get today's date in YYYY-MM-DD format (Thailand timezone)
const getTodayDate = () => {
    const now = new Date();
    const thailandDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
    return thailandDateStr;
};

const GoldCardConfirmation = () => {
    // State
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Modal State
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [confirmAmount, setConfirmAmount] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch Data
    const fetchTreatments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const dateParam = selectedDate ? `&date=${selectedDate}` : '';
            const response = await fetch(`${API_BASE_URL}/treatments/ucs/pending?page=${page}&limit=20${dateParam}`);
            const data = await response.json();

            if (data.success) {
                setTreatments(data.data);
                setTotalPages(data.pagination.totalPages);
            } else {
                setError(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, selectedDate]);

    useEffect(() => {
        fetchTreatments();
    }, [fetchTreatments]);

    // Handle Confirm Click
    const handleConfirmClick = (treatment) => {
        // ใช้ ACTUAL_PRICE ในการคำนวณยอดคงเหลือ
        const actualPrice = parseFloat(treatment.ACTUAL_PRICE || treatment.TOTAL_AMOUNT || 0);
        const paidAmount = parseFloat(treatment.RECEIVED_AMOUNT || 0);

        // ถ้าเคยบันทึกค่า claim ไว้แล้ว ให้ใช้ค่านั้น หรือถ้าไม่มีให้คำนวณใหม่
        const existingClaim = treatment.CLAIM_ACTUAL_AMOUNT ? parseFloat(treatment.CLAIM_ACTUAL_AMOUNT) : null;

        const balance = existingClaim !== null ? existingClaim : Math.max(0, actualPrice - paidAmount);

        setSelectedTreatment(treatment);
        setConfirmAmount(balance.toString());
        setOpenDialog(true);
    };

    // Handle Submit Confirmation
    const handleSubmitConfirm = async () => {
        if (!selectedTreatment) return;

        try {
            const response = await fetch(`${API_BASE_URL}/treatments/ucs/confirm/${selectedTreatment.VNO}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(confirmAmount)
                })
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({ open: true, message: 'ยืนยันการรับเงินสำเร็จ', severity: 'success' });
                setOpenDialog(false);
                fetchTreatments(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update');
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึก', severity: 'error' });
            console.error(err);
        }
    };

    // Handle date change
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setPage(1); // Reset to first page when date changes
    };

    // Handle reset to today
    const handleResetToToday = () => {
        setSelectedDate(getTodayDate());
        setPage(1);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ยืนยันผู้ป่วยบัตรทอง
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    จัดการยืนยันยอดเงินสำหรับผู้ป่วยสิทธิ์ บัตรทอง (UCS)
                </Typography>
            </Box>

            {/* Date Filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="เลือกวันที่"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                max: getTodayDate() // Prevent selecting future dates
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            variant="outlined"
                            startIcon={<Today />}
                            onClick={handleResetToToday}
                            fullWidth
                            size="small"
                            sx={{ height: '40px' }}
                        >
                            วันนี้
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            แสดง {treatments.length} รายการ
                            {selectedDate === getTodayDate() ? ' (วันนี้)' : ` (${new Date(selectedDate).toLocaleDateString('th-TH')})`}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell width="5%">ลำดับ</TableCell>
                                <TableCell width="15%">VN</TableCell>
                                <TableCell width="10%">HN</TableCell>
                                <TableCell width="25%">ชื่อคนไข้</TableCell>
                                <TableCell align="right" width="10%">ราคาจริง</TableCell>
                                <TableCell align="right" width="10%">เก็บแล้ว</TableCell>
                                <TableCell align="right" width="10%">คงเหลือ</TableCell>
                                <TableCell align="center" width="15%">ดำเนินการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : treatments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">ไม่พบรายการที่ต้องยืนยัน</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                treatments.map((item, index) => {
                                    const net = parseFloat(item.NET_AMOUNT || 0);
                                    const paid = parseFloat(item.RECEIVED_AMOUNT || 0);
                                    const balance = Math.max(0, net - paid);

                                    return (
                                        <TableRow key={item.VNO} hover>
                                            <TableCell>{((page - 1) * 20) + index + 1}</TableCell>
                                            <TableCell>{item.VNO}</TableCell>
                                            <TableCell>{item.HNNO}</TableCell>
                                            <TableCell>{`${item.PRENAME || ''}${item.NAME1} ${item.SURNAME || ''}`}</TableCell>
                                            <TableCell align="right">
                                                {/* Original NET: {net.toLocaleString()} */}
                                                {(parseFloat(item.ACTUAL_PRICE || item.TOTAL_AMOUNT || 0)).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">{paid.toLocaleString()}</TableCell>
                                            {/* ยอดคงเหลือ (Claim Amount) = Actual Price - Paid */}
                                            <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                                {Math.max(0, (parseFloat(item.ACTUAL_PRICE || item.TOTAL_AMOUNT || 0)) - paid).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleConfirmClick(item)}
                                                >
                                                    ยืนยัน
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, p) => setPage(p)}
                        color="primary"
                    />
                </Box>
            </Paper>

            {/* Confirmation Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>ยืนยันรับเงินจาก สปสช.</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        ยืนยันการรับชำระเงินสำหรับ VN: <b>{selectedTreatment?.VNO}</b><br />
                        คนไข้: <b>{selectedTreatment?.NAME1} {selectedTreatment?.SURNAME}</b>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="จำนวนเงินที่ได้รับชดเชย"
                        type="number"
                        fullWidth
                        value={confirmAmount}
                        onChange={(e) => setConfirmAmount(e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSubmitConfirm} variant="contained" color="success">
                        ยืนยันรับเงิน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GoldCardConfirmation;
