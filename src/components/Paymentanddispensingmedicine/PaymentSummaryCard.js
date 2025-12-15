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
    Divider,
    Chip
} from "@mui/material";
import {
    Save as SaveIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import CloseCaseButton from './CloseCaseButton'; // import component ใหม่

const PaymentSummaryCard = ({
    editablePrices,
    paymentData,
    onPaymentDataChange,
    onPayment,
    onCloseCase,
    patient,
    ucsUsageInfo = { isExceeded: false }, // ✅ รับข้อมูลการใช้งานสิทธิ์บัตรทอง
    loading
}) => {
    const calculateTotalFromEditablePrices = () => {
        const labTotal = editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0);
        const procedureTotal = editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0);
        
        // ✅ สำหรับผู้ป่วยบัตรทอง: คำนวณยาที่ UCS_CARD = 'N' หรือยาที่แก้ราคาแล้ว (editablePrice > 0)
        const isGoldCard = patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y';
        const isUcsExceeded = ucsUsageInfo?.isExceeded || false;
        
        let drugTotal = 0;
        if (isGoldCard && !isUcsExceeded) {
            // คำนวณยาที่ UCS_CARD = 'N' หรือยาที่แก้ราคาแล้ว (editablePrice > 0)
            drugTotal = editablePrices.drugs.reduce((sum, item) => {
                // ถ้าเป็นยาที่ต้องจ่าย (UCS_CARD = 'N') หรือแก้ราคาแล้ว (editablePrice > 0) ให้นับ
                if (item.DRUG_UCS_CARD === 'N' || (item.DRUG_UCS_CARD === 'Y' && item.editablePrice > 0)) {
                    return sum + item.editablePrice;
                }
                return sum;
            }, 0);
        } else {
            // ผู้ป่วยไม่ใช่บัตรทอง หรือใช้สิทธิ์บัตรทองเกิน 2 ครั้งแล้ว: คำนวณยาทั้งหมด
            drugTotal = editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0);
        }

        // ✅ เพิ่มค่ารักษา (ถ้าไม่ใช่บัตรทอง หรือใช้สิทธิ์เกิน 2 ครั้ง)
        // ✅ ใช้เช็ค undefined/null แทน || เพื่อให้ 0 ถูกยอมรับได้
        const treatmentFee = (isGoldCard && !isUcsExceeded) ? 0 : (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null ? parseFloat(paymentData.treatmentFee) : 100.00);

        return labTotal + procedureTotal + drugTotal + treatmentFee;
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

    // เช็คสถานะการชำระเงิน
    const isPaymentCompleted = patient?.PAYMENT_STATUS === 'ชำระเงินแล้ว' || patient?.paymentStatus === 'ชำระแล้ว';

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
                <Typography variant="h6" fontWeight="bold">สรุปการชำระเงิน</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                {/* สถานะการชำระเงิน */}
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Chip
                        icon={isPaymentCompleted ? <CheckCircleIcon /> : null}
                        label={isPaymentCompleted ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระ'}
                        color={isPaymentCompleted ? 'success' : 'warning'}
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            py: 1,
                            px: 2
                        }}
                    />
                </Box>

                {/* แสดงยอดแยกตามประเภท */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        รายละเอียดค่าใช้จ่าย:
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่า Lab/X-ray:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)} บาท
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่าหัตถการ:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2)} บาท
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">ค่ายา:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {(() => {
                                // ✅ สำหรับผู้ป่วยบัตรทอง: คำนวณยาที่ UCS_CARD = 'N' หรือยาที่แก้ราคาแล้ว (editablePrice > 0)
                                const isGoldCard = patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y';
                                if (isGoldCard) {
                                    return editablePrices.drugs.reduce((sum, item) => {
                                        // ถ้าเป็นยาที่ต้องจ่าย (UCS_CARD = 'N') หรือแก้ราคาแล้ว (editablePrice > 0) ให้นับ
                                        if (item.DRUG_UCS_CARD === 'N' || (item.DRUG_UCS_CARD === 'Y' && item.editablePrice > 0)) {
                                            return sum + item.editablePrice;
                                        }
                                        return sum;
                                    }, 0).toFixed(2);
                                } else {
                                    return editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0).toFixed(2);
                                }
                            })()} บาท
                        </Typography>
                    </Box>

                    {/* ✅ ค่ารักษา - แสดงและแก้ไขได้ */}
                    {!isPaymentCompleted && (
                        <TextField
                            label="ค่ารักษา (บาท)"
                            fullWidth
                            margin="normal"
                            type="number"
                            value={paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null ? paymentData.treatmentFee : ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                // ✅ อนุญาตให้กรอก 0.00 ได้ - ถ้าค่าว่างให้เป็น undefined, ถ้าเป็น 0 ให้เป็น 0
                                let treatmentFeeValue;
                                if (value === '' || value === null || value === undefined) {
                                    treatmentFeeValue = undefined; // ให้เป็น undefined เพื่อใช้ default
                                } else {
                                    const parsed = parseFloat(value);
                                    treatmentFeeValue = isNaN(parsed) ? undefined : parsed; // ถ้า parse ไม่ได้ให้เป็น undefined
                                }
                                onPaymentDataChange({ ...paymentData, treatmentFee: treatmentFeeValue });
                            }}
                            size="small"
                            inputProps={{ step: "0.01", min: "0" }}
                            disabled={(patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y') && !ucsUsageInfo?.isExceeded}
                            helperText={(patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y') && !ucsUsageInfo?.isExceeded 
                                ? 'บัตรทอง: ค่ารักษา = 0.00' 
                                : 'สามารถแก้ไขได้ (กรอก 0.00 ได้)'}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    bgcolor: 'white'
                                }
                            }}
                        />
                    )}

                    {/* ✅ แสดงค่ารักษาเมื่อชำระแล้ว หรือเมื่อกรอกค่ารักษา */}
                    {(isPaymentCompleted || (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null)) && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">ค่ารักษา:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {(() => {
                                    const isGoldCard = patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y';
                                    const isUcsExceeded = ucsUsageInfo?.isExceeded || false;
                                    // ✅ ใช้เช็ค undefined/null แทน || เพื่อให้ 0 ถูกยอมรับได้
                                    const treatmentFee = (isGoldCard && !isUcsExceeded) ? 0.00 : (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null ? parseFloat(paymentData.treatmentFee) : 100.00);
                                    return treatmentFee.toFixed(2);
                                })()} บาท
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight="bold">รวมทั้งหมด:</Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                            {calculateTotalFromEditablePrices().toFixed(2)} บาท
                        </Typography>
                    </Box>
                </Box>

                {/* ส่วนลด - แสดงเฉพาะเมื่อยังไม่ชำระ */}
                {!isPaymentCompleted && (
                    <TextField
                        label="ส่วนลด (บาท)"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={paymentData.discount || ''}
                        onChange={(e) => {
                            const discountValue = parseFloat(e.target.value) || 0;
                            onPaymentDataChange({ ...paymentData, discount: discountValue });
                        }}
                        size="small"
                        inputProps={{ step: "0.01", min: "0" }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                bgcolor: 'white'
                            }
                        }}
                    />
                )}

                {/* ✅ แสดงส่วนลดเมื่อชำระแล้ว หรือเมื่อกรอกส่วนลด */}
                {(isPaymentCompleted || (paymentData.discount && parseFloat(paymentData.discount) > 0)) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold">ส่วนลด:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error">
                            -{parseFloat(paymentData.discount || 0).toFixed(2)} บาท
                        </Typography>
                    </Box>
                )}

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
                        {calculateTotal().toFixed(2)} บาท
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* วิธีชำระเงิน - แสดงเฉพาะเมื่อยังไม่ชำระ */}
                {!isPaymentCompleted && (
                    <>
                        <FormControl fullWidth margin="normal" size="small">
                            <Select
                                value={paymentData.paymentMethod}
                                onChange={(e) => onPaymentDataChange({ ...paymentData, paymentMethod: e.target.value })}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: 'white',
                                }}
                            >
                                <MenuItem value="เงินสด">เงินสด</MenuItem>
                                <MenuItem value="เงินโอน">เงินโอน</MenuItem>
                            </Select>
                        </FormControl>

                        {/* ฟิลด์เพิ่มเติมตามวิธีชำระ */}
                        {(paymentData.paymentMethod === 'เงินสด' || paymentData.paymentMethod === 'เงินโอน') && (
                            <TextField
                                label={paymentData.paymentMethod === 'เงินสด' ? 'จำนวนเงินที่รับ' : 'จำนวนเงินที่โอน'}
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
                                    {Math.abs(calculateChange()).toFixed(2)} บาท
                                    {calculateChange() < 0 && ' (ขาด)'}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}

                {/* แสดงข้อมูลการชำระเมื่อชำระแล้ว */}
                {isPaymentCompleted && patient?.paymentData && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            ข้อมูลการชำระเงิน:
                        </Typography>
                        <Box sx={{ bgcolor: '#e8f5e8', p: 2, borderRadius: 2 }}>
                            <Typography variant="body2">
                                <strong>วิธีชำระ:</strong> {patient.paymentData.paymentMethod}
                            </Typography>
                            <Typography variant="body2">
                                <strong>รับเงิน:</strong> {patient.paymentData.receivedAmount?.toFixed(2)} บาท
                            </Typography>
                            <Typography variant="body2">
                                <strong>เงินทอน:</strong> {patient.paymentData.changeAmount?.toFixed(2)} บาท
                            </Typography>
                            <Typography variant="body2">
                                <strong>วันที่:</strong> {patient.paymentData.paymentDate} เวลา {patient.paymentData.paymentTime}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* ปุ่มต่างๆ */}
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* ปุ่มบันทึกการชำระเงิน - แสดงเฉพาะเมื่อยังไม่ชำระ */}
                    {!isPaymentCompleted && (
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={onPayment}
                            sx={{
                                backgroundColor: "#5698E0",
                                fontSize: "1rem",
                                width: '100%',
                                fontWeight: 600,
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
                    )}

                    {/* ปุ่มปิดการรักษา - แสดงเสมอ */}
                    <CloseCaseButton
                        patient={patient}
                        onCloseCase={onCloseCase}
                        disabled={loading}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default PaymentSummaryCard;