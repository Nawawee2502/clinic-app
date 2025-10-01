// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../services/authService';

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(username, password);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await AuthService.register(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'ลงทะเบียนไม่สำเร็จ');
        }
    }
);

export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await AuthService.verifyToken();
            if (!response.success) {
                return rejectWithValue(response.message || 'Token หมดอายุ');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'ตรวจสอบ Token ไม่สำเร็จ');
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ oldPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await AuthService.changePassword(oldPassword, newPassword);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'เปลี่ยน Password ไม่สำเร็จ');
        }
    }
);

const initialState = {
    user: AuthService.getUser(),
    token: AuthService.getToken(),
    isAuthenticated: !!AuthService.getToken(),
    loading: false,
    error: null,
    tokenExpired: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            AuthService.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            state.tokenExpired = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            AuthService.setUser(state.user);
        },
        setTokenExpired: (state) => {
            state.tokenExpired = true;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.tokenExpired = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.tokenExpired = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.tokenExpired = false;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.tokenExpired = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Verify Token
            .addCase(verifyToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
                state.tokenExpired = false;
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.tokenExpired = true;
                AuthService.logout();
            })
            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, updateUser, setTokenExpired } = authSlice.actions;
export default authSlice.reducer;