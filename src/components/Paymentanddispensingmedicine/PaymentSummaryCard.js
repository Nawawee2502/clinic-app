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
    treatmentData, // ✅ รับข้อมูลการรักษา (เพื่อดึง EXTERNAL_UCS_COUNT)
    loading
}) => {

    // ✅ Helper Function for Gold Card Logic
    const getGoldCardStatus = () => {
        const isGoldCard = patient?.UCS_CARD === 'Y';
        // Check API Flag
        const isUcsExceeded = ucsUsageInfo?.isExceeded;
        // Check Manual Count (Displayed in Header)
        const manualUcsCount = treatmentData?.treatment?.EXTERNAL_UCS_COUNT || 0;
        const apiUsageCount = ucsUsageInfo?.usageCount || 0;

        // ✅ Critical Fix: Trust the displayed count (manualUcsCount) if available
        // If Manual Count is 2, it implies "2nd Visit" -> Free.
        const effectiveCount = manualUcsCount > 0 ? manualUcsCount : apiUsageCount;

        // Free if: Gold Card AND (Usage <= 2 OR Not Exceeded)
        // This 'effectiveCount <= 2' safeguard fixes the issue where API might say Exceeded/3 but record says 2.
        const shouldBeFree = isGoldCard && (effectiveCount <= 2 || !isUcsExceeded);

        return { isGoldCard, shouldBeFree, effectiveCount };
    };

    const { isGoldCard, shouldBeFree, effectiveCount } = getGoldCardStatus();

    // คำนวณราคายา
    const calculateDrugTotal = () => {
        if (shouldBeFree) {
            return editablePrices.drugs.reduce((sum, item) => {
                // ถ้าเป็นยาที่ต้องจ่าย (UCS_CARD = 'N') หรือแก้ราคาแล้ว (editablePrice > 0) ให้นับ
                if (item.DRUG_UCS_CARD === 'N' || (item.DRUG_UCS_CARD === 'Y' && item.editablePrice > 0)) {
                    return sum + item.editablePrice;
                }
                return sum;
            }, 0);
        } else {
            return editablePrices.drugs.reduce((sum, item) => sum + item.editablePrice, 0);
        }
    };

    const drugTotal = parseFloat(calculateDrugTotal());
    const labTotal = editablePrices.labs.reduce((sum, item) => sum + item.editablePrice, 0);
    const procedureTotal = editablePrices.procedures.reduce((sum, item) => sum + item.editablePrice, 0);

    // คำนวณค่ารักษา
    let treatmentFee;
    // ✅ Fix: Manual Override respected
    if (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null) {
        if (paymentData.treatmentFee === '') {
            treatmentFee = 0;
        } else {
            treatmentFee = parseFloat(paymentData.treatmentFee);
        }
    } else if (patient?.paymentData?.treatmentFee !== undefined && patient?.paymentData?.treatmentFee !== null) {
        treatmentFee = parseFloat(patient.paymentData.treatmentFee);
    } else if (patient?.TREATMENT_FEE !== undefined && patient?.TREATMENT_FEE !== null) {
        treatmentFee = parseFloat(patient.TREATMENT_FEE);
    } else {
        // Default Logic (No Manual Override)
        treatmentFee = shouldBeFree ? 0.00 : 100.00;
    }

    const subtotal = drugTotal + labTotal + procedureTotal + treatmentFee;
    const discount = parseFloat(paymentData.discount || 0);

    // Prevent negative total
    const total = Math.max(0, subtotal - discount);

    const calculateTotalFromEditablePrices = () => {
        return subtotal;
    };

    const calculateTotal = () => {
        return total;
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
                                const isGoldCard = patient?.PATIENT_UCS_CARD === 'Y' || patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y';
                                const isUcsExceeded = ucsUsageInfo?.isExceeded || false;
                                // Logic: Free if Gold Card AND (Not Exceeded OR Usage <= 2)
                                const shouldBeFree = isGoldCard && (!isUcsExceeded || ((ucsUsageInfo?.usageCount || 0) <= 2));

                                if (shouldBeFree) {
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
                                // ✅ Allow empty string during editing
                                if (value === '' || value === null) {
                                    onPaymentDataChange({ ...paymentData, treatmentFee: '' });
                                } else {
                                    const parsed = parseFloat(value);
                                    // Keep raw value if it ends with decimal point to allow typing "10."
                                    if (value.endsWith('.')) {
                                        onPaymentDataChange({ ...paymentData, treatmentFee: value });
                                    } else {
                                        onPaymentDataChange({ ...paymentData, treatmentFee: isNaN(parsed) ? 0 : value });
                                    }
                                }
                            }}
                            size="small"
                            inputProps={{ step: "0.01", min: "0" }}
                            disabled={false} // ✅ Fix: Always enable editing
                            helperText={(patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y') && !ucsUsageInfo?.isExceeded
                                ? 'บัตรทอง: เริ่มต้น 0.00 (แก้ไขได้)'
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
                                    const isGoldCard = patient?.PATIENT_UCS_CARD === 'Y' || patient?.UCS_CARD === 'Y' || patient?.treatment?.UCS_CARD === 'Y';
                                    const isUcsExceeded = ucsUsageInfo?.isExceeded || false;

                                    // ✅ Fix: Manual Override respected
                                    let treatmentFee;
                                    if (paymentData.treatmentFee !== undefined && paymentData.treatmentFee !== null) {
                                        treatmentFee = parseFloat(paymentData.treatmentFee);
                                    } else if (patient?.paymentData?.treatmentFee !== undefined && patient?.paymentData?.treatmentFee !== null) {
                                        treatmentFee = parseFloat(patient.paymentData.treatmentFee);
                                    } else {
                                        // Logic: Free if Gold Card AND (Usage <= 2 OR Not Exceeded)
                                        const shouldBeFree = isGoldCard && (!isUcsExceeded || (ucsUsageInfo && ucsUsageInfo.usageCount <= 2));
                                        treatmentFee = shouldBeFree ? 0.00 : 100.00;
                                    }
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
                            const value = e.target.value;
                            // ✅ Fix: Allow empty value to prevent 0 snapping
                            if (value === '') {
                                onPaymentDataChange({ ...paymentData, discount: '' });
                            } else {
                                onPaymentDataChange({ ...paymentData, discount: value });
                            }
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