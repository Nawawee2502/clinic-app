// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken, logout } from '../store/authSlice';
import { Box, Alert, Button, Typography, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, user, tokenExpired, loading } = useSelector((state) => state.auth);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated) {
                try {
                    await dispatch(verifyToken()).unwrap();
                } catch (error) {
                    console.error('Token verification failed:', error);
                }
            }
            setIsVerifying(false);
        };

        checkAuth();
    }, [dispatch, isAuthenticated]);

    if (isVerifying || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (tokenExpired) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 3, bgcolor: '#f5f5f5' }}>
                <Alert severity="warning" sx={{ maxWidth: 500, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        เซสชันหมดอายุ
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        เซสชันของคุณหมดอายุแล้ว (24 ชั่วโมง) กรุณาเข้าสู่ระบบใหม่อีกครั้ง
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth onClick={() => {
                        dispatch(logout());
                        window.location.href = '/login';
                    }}>
                        ไปหน้า Login
                    </Button>
                </Alert>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 3, bgcolor: '#f5f5f5' }}>
                <Alert severity="error" sx={{ maxWidth: 500 }}>
                    <Typography variant="h6" gutterBottom>
                        ไม่มีสิทธิ์เข้าถึง
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องการ Role: {requiredRole})
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth onClick={() => window.history.back()}>
                        กลับหน้าที่แล้ว
                    </Button>
                </Alert>
            </Box>
        );
    }

    return children;
};

export default ProtectedRoute;