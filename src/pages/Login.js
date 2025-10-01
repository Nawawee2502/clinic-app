// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';

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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 3 }}>
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              เข้าสู่ระบบ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ระบบจัดการคลินิก
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" name="username"
              value={formData.username} onChange={handleChange}
              margin="normal" required autoComplete="username"
              autoFocus disabled={loading}
            />

            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange}
              margin="normal" required autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth type="submit" variant="contained" size="large"
              disabled={loading || !formData.username || !formData.password}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>หรือ</Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              ยังไม่มีบัญชี?{' '}
              <Link
                to="/register"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                ลงทะเบียนที่นี่
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Token จะหมดอายุใน 24 ชั่วโมง
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
              บัญชีทดสอบ:
            </Typography>
            <Typography variant="caption" display="block">
              Admin: admin / admin123
            </Typography>
            <Typography variant="caption" display="block">
              Doctor: doctor1 / doctor123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;