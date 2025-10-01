// src/components/AuthProvider.jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken, setTokenExpired } from '../store/authSlice';

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth || {});
    const intervalRef = useRef(null);
    const lastCheckRef = useRef(Date.now());

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const checkToken = async () => {
            try {
                const now = Date.now();
                if (now - lastCheckRef.current < 60000) {
                    return;
                }
                lastCheckRef.current = now;

                const result = await dispatch(verifyToken()).unwrap();
                console.log('Token verified:', result);
            } catch (error) {
                console.error('Token verification failed:', error);
                dispatch(setTokenExpired());
            }
        };

        checkToken();
        intervalRef.current = setInterval(checkToken, 5 * 60 * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [dispatch, isAuthenticated]);

    return <>{children}</>;
};

export default AuthProvider;