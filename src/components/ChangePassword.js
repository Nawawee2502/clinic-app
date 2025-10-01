// src/components/ChangePassword.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../store/authSlice';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, InputAdornment, IconButton, Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ChangePassword = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
    const [localError, setLocalError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError(null);
    };

    const handleSubmit = async () => {
        setLocalError(null);
        setSuccess(false);

        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setLocalError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (formData.newPassword.length < 6) {
            setLocalError('Password ใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setLocalError('Password ใหม่ไม่ตรงกัน');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setLocalError('Password ใหม่ต้องไม่ซ้ำกับ Password เก่า');
            return;
        }

        try {
            await dispatch(changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            })).unwrap();

            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            setLocalError(error);
        }
    };

    const handleClose = () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setLocalError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>เปลี่ยน Password</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {(localError || error) && <Alert severity="error">{localError || error}</Alert>}
                    {success && <Alert severity="success">เปลี่ยน Password สำเร็จ</Alert>}

                    <TextField label="Password เก่า" name="oldPassword"
                        type={showPasswords.old ? 'text' : 'password'}
                        value={formData.oldPassword} onChange={handleChange}
                        required fullWidth autoFocus
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })} edge="end">
                                        {showPasswords.old ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField label="Password ใหม่" name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword} onChange={handleChange}
                        required fullWidth helperText="ต้องมีอย่างน้อย 6 ตัวอักษร"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} edge="end">
                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField label="ยืนยัน Password ใหม่" name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword} onChange={handleChange}
                        required fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} edge="end">
                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>ยกเลิก</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || success}>
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePassword;