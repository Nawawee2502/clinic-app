// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, InputAdornment, IconButton, CircularProgress, Grid,
    Container, Paper, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, LocalHospital } from '@mui/icons-material';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        empCode: '',
        email: '',
        tel: ''
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        // ถ้ามี Token อยู่แล้ว ให้ redirect ไปหน้าหลัก
        const token = AuthService.getToken();
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear validation error เมื่อ user แก้ไข
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: '' });
        }
        setError('');
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'กรุณากรอก Username';
        } else if (formData.username.length < 3) {
            errors.username = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร';
        }

        if (!formData.password) {
            errors.password = 'กรุณากรอก Password';
        } else if (formData.password.length < 6) {
            errors.password = 'Password ต้องมีอย่างน้อย 6 ตัวอักษร';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'กรุณายืนยัน Password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Password ไม่ตรงกัน';
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            await AuthService.register(registerData);

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            setError(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f1f5f9',
                backgroundImage: 'radial-gradient(at 50% 50%, rgba(74, 158, 255, 0.1) 0%, transparent 50%)',
                padding: 3
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                backgroundColor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                mb: 2,
                                color: '#4A9EFF'
                            }}
                        >
                            <PersonAdd sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
                            ลงทะเบียนเจ้าหน้าที่
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            severity="success"
                            sx={{
                                mb: 3,
                                borderRadius: 2
                            }}
                        >
                            ลงทะเบียนสำเร็จ! กำลังนำคุณเข้าสู่ระบบ...
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    ชื่อผู้ใช้งาน <span style={{ color: '#ef4444' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="username"
                                    placeholder="กำหนดชื่อผู้ใช้งาน"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.username}
                                    helperText={validationErrors.username}
                                    autoComplete="username"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    รหัสผ่าน <span style={{ color: '#ef4444' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="กำหนดรหัสผ่าน"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.password}
                                    helperText={validationErrors.password}
                                    autoComplete="new-password"
                                    InputProps={{
                                        sx: { borderRadius: 2 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    ยืนยันรหัสผ่าน <span style={{ color: '#ef4444' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.confirmPassword}
                                    helperText={validationErrors.confirmPassword}
                                    autoComplete="new-password"
                                    InputProps={{
                                        sx: { borderRadius: 2 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="fullName"
                                    placeholder="ชื่อ-นามสกุลจริง"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.fullName}
                                    helperText={validationErrors.fullName}
                                    autoComplete="name"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    รหัสพนักงาน
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="empCode"
                                    placeholder="ระบุรหัสพนักงาน (ถ้ามี)"
                                    value={formData.empCode}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    autoComplete="off"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    เบอร์โทรศัพท์
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="tel"
                                    placeholder="0xx-xxxxxxx"
                                    value={formData.tel}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    autoComplete="tel"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    อีเมล
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.email}
                                    helperText={validationErrors.email}
                                    autoComplete="email"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || success}
                            sx={{
                                mt: 4,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                backgroundColor: '#4A9EFF',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(74, 158, 255, 0.2)',
                                '&:hover': {
                                    backgroundColor: '#3b82f6',
                                    boxShadow: '0 6px 16px rgba(74, 158, 255, 0.3)'
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                                    กำลังลงทะเบียน...
                                </>
                            ) : success ? 'ลงทะเบียนสำเร็จ' : 'ยืนยันการลงทะเบียน'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                มีบัญชีอยู่แล้ว?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#4A9EFF',
                                        textDecoration: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.disabled">
                        © 2024 Clinic Management System. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default RegisterPage;