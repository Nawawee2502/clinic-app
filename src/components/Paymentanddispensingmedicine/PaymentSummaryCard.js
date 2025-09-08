import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Button,
    Box,
    Divider
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

const PaymentSummaryCard = ({
    editablePrices,
    paymentData,
    onPaymentDataChange,
    onPayment,
    loading
}) => {
    const calculateTotalFromEditablePrices = () => {
        const labTotal = editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0);
        const procedureTotal = editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0);
        const drugTotal = editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0);

        return labTotal + procedureTotal + drugTotal;
    };

    const calculateTotal = () => {
        const totalCost = calculateTotalFromEditablePrices();
        const discount = parseFloat(paymentData.discount || 0);
        return Math.max(0, totalCost - discount);
    };

    const calculateChange = () => {
        const total = calculateTotal();
        const received = parseFloat(paymentData.receivedAmount || 0);
        return Math.max(0, received - total);
    };

    return (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                borderRadius: '12px',
                bgcolor: '#f8f9fa'
            }}
        >
            <Box sx={{
                bgcolor: '#5698E0',
                color: 'white',
                p: 2,
                textAlign: 'center',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
            }}>
                <Typography variant="h6" fontWeight="bold">💰 สรุปการชำระเงิน</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                {/* แสดงยอดแยกตามประเภท */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        รายละเอียดค่าใช้จ่าย:
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่า Lab/X-ray:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            ฿{editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่าหัตถการ:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            ฿{editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่ายา:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            ฿{editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1" fontWeight="bold">รวมทั้งหมด:</Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                            ฿{calculateTotalFromEditablePrices().toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* ส่วนลด */}
                <TextField
                    label="ส่วนลด (บาท)"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={paymentData.discount}
                    onChange={(e) => onPaymentDataChange({ ...paymentData, discount: parseFloat(e.target.value) || 0 })}
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: 'white'
                        }
                    }}
                />

                {/* ยอดชำระสุทธิ */}
                <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    textAlign: 'center',
                    border: '2px solid #d32f2f'
                }}>
                    <Typography variant="caption" color="text.secondary">ยอดชำระสุทธิ</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                        ฿{calculateTotal().toFixed(2)}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* วิธีชำระเงิน */}
                <FormControl fullWidth margin="normal" size="small">
                    <Select
                        value={paymentData.paymentMethod}
                        onChange={(e) => onPaymentDataChange({ ...paymentData, paymentMethod: e.target.value })}
                        disabled
                        sx={{
                            borderRadius: '10px',
                            bgcolor: 'white',
                        }}
                    >
                        <MenuItem value="เงินสด">💵 เงินสด</MenuItem>
                    </Select>
                </FormControl>

                {/* ฟิลด์เพิ่มเติมตามวิธีชำระ */}
                {paymentData.paymentMethod === 'เงินสด' && (
                    <TextField
                        label="จำนวนเงินที่รับ"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={paymentData.receivedAmount}
                        onChange={(e) => onPaymentDataChange({ ...paymentData, receivedAmount: e.target.value })}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                bgcolor: 'white'
                            }
                        }}
                    />
                )}

                {/* แสดงเงินทอน */}
                {paymentData.paymentMethod === 'เงินสด' && paymentData.receivedAmount && (
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: calculateChange() >= 0 ? '#e8f5e8' : '#ffebee',
                        borderRadius: '10px',
                        textAlign: 'center',
                        border: `2px solid ${calculateChange() >= 0 ? '#4caf50' : '#f44336'}`
                    }}>
                        <Typography variant="caption" color="text.secondary">เงินทอน</Typography>
                        <Typography variant="h6" fontWeight="bold"
                            color={calculateChange() >= 0 ? 'success.main' : 'error.main'}
                        >
                            ฿{Math.abs(calculateChange()).toFixed(2)}
                            {calculateChange() < 0 && ' (ขาด)'}
                        </Typography>
                    </Box>
                )}

                {/* ปุ่มบันทึก */}
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={onPayment}
                    sx={{
                        backgroundColor: "#5698E0",
                        fontSize: "1rem",
                        width: '100%',
                        fontWeight: 600,
                        mt: 3,
                        py: 1.5,
                        borderRadius: '12px',
                        '&:hover': {
                            backgroundColor: "#2B69AC",
                        }
                    }}
                    disabled={loading || calculateTotalFromEditablePrices() === 0}
                >
                    {loading ? 'กำลังบันทึก...' : 'บันทึกการชำระเงิน'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default PaymentSummaryCard;