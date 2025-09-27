// 1. สร้าง CloseCaseButton component
import React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CloseCaseButton = ({ patient, onCloseCase, disabled = false }) => {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
        onCloseCase();
        setOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => setOpen(true)}
                disabled={disabled}
                sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    py: 1.5,
                    px: 3,
                    borderRadius: '12px',
                    backgroundColor: '#d32f2f',
                    '&:hover': {
                        backgroundColor: '#b71c1c',
                    }
                }}
            >
                ปิดการรักษา
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
                    ยืนยันการปิดการรักษา
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            คุณต้องการปิดการรักษาของผู้ป่วยรายนี้หรือไม่?
                        </Typography>
                        {patient && (
                            <Box sx={{
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                border: '1px solid #ddd'
                            }}>
                                <Typography variant="body1" fontWeight="bold">
                                    {patient.PRENAME} {patient.NAME1} {patient.SURNAME}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    VN: {patient.VNO} | HN: {patient.HNCODE}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            หลังจากปิดการรักษาแล้ว ผู้ป่วยรายนี้จะออกจากคิวชำระเงิน
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        variant="outlined"
                        color="inherit"
                        sx={{ px: 3 }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color="error"
                        sx={{ px: 3 }}
                    >
                        ยืนยันปิดการรักษา
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CloseCaseButton;