// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider,
  Container, Paper
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    try {
      await dispatch(loginUser({
        username: formData.username,
        password: formData.password
      })).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
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
      <Container maxWidth="xs">
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
                display: 'flex',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <img
                src="/logo.png"
                alt="Clinic Logo"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '180px',
                  maxHeight: '100px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
              เข้าสู่ระบบ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ระบบบริหารจัดการคลินิก
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { color: '#ef4444' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                ชื่อผู้ใช้งาน
              </Typography>
              <TextField
                fullWidth
                name="username"
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                autoFocus
                disabled={loading}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#4A9EFF' }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                รหัสผ่าน
              </Typography>
              <TextField
                fullWidth
                name="password"
                placeholder="กรอกรหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={loading}
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#4A9EFF' }
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !formData.username || !formData.password}
              sx={{
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
                  กำลังเข้าสู่ระบบ...
                </>
              ) : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
            <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
              หรือ
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#e2e8f0' }} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ยังไม่มีบัญชี?{' '}
              <Link
                to="/register"
                style={{
                  color: '#4A9EFF',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                ลงทะเบียนเจ้าหน้าที่
              </Link>
            </Typography>
          </Box>

          {/* <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <Typography variant="caption" display="block" color="text.secondary" fontWeight="600" gutterBottom>
              Demo Credentials:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Admin: admin / admin123</span>
            </Box>
          </Box> */}
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

export default LoginPage;