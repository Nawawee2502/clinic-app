// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, InputAdornment, IconButton, CircularProgress, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';

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
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 3
        }}>
            <Card sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <PersonAdd sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            ลงทะเบียน
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            ลงทะเบียนสำเร็จ! กำลังนำคุณเข้าสู่ระบบ...
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Username *"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.username}
                                    helperText={validationErrors.username}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Password *"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.password}
                                    helperText={validationErrors.password}
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ยืนยัน Password *"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.confirmPassword}
                                    helperText={validationErrors.confirmPassword}
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อ-นามสกุล *"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.fullName}
                                    helperText={validationErrors.fullName}
                                    autoComplete="name"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="รหัสพนักงาน"
                                    name="empCode"
                                    value={formData.empCode}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    autoComplete="off"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="เบอร์โทรศัพท์"
                                    name="tel"
                                    value={formData.tel}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    autoComplete="tel"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    error={!!validationErrors.email}
                                    helperText={validationErrors.email}
                                    autoComplete="email"
                                />
                            </Grid>
                        </Grid>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || success}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    กำลังลงทะเบียน...
                                </>
                            ) : success ? 'ลงทะเบียนสำเร็จ' : 'ลงทะเบียน'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                มีบัญชีอยู่แล้ว?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </Typography>
                        </Box>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            * ข้อมูลที่จำเป็นต้องกรอก
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterPage;