// src/router.js
import { Route, Routes, HashRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import { verifyToken } from "./store/authSlice";
import AuthProvider from "./components/AuthProvider";

// Import หน้าเดิม
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patientregistration from "./pages/Patientregistration";
import AppBarWithProps from "./pages/AppBarWithProps";
import ตรวจรักษา from './pages/ตรวจรักษา';
import Medicalstock from './pages/Drugandmedical';
import Cerwork from "./components/ตรวจรักษา/cerwork";
import Paymentanddispensingmedicine from "./pages/Paymentanddispensingmedicine";
import PatientManagement from "./pages/PatientManagementPage";
import Report from "./pages/Report";
import SettingsPage from "./pages/SettingsPage";

// Import หน้าใหม่ (Lazy loading)
const UserManagement = lazy(() => import("./pages/UserManagement"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

// ProtectedRoute
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const dispatch = useDispatch();
  const oldAuth = useSelector((state) => state.authentication?.token);
  const oldUserData = localStorage.getItem('userData2');
  const newAuth = useSelector((state) => state.auth);

  const isAuthenticated = newAuth?.isAuthenticated || oldAuth || oldUserData;
  const user = newAuth?.user;

  useEffect(() => {
    if (newAuth?.isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, newAuth?.isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/clinic/dashboard" replace />;
  }

  return children;
};

// PublicRoute
const PublicRoute = ({ children }) => {
  const oldAuth = useSelector((state) => state.authentication?.token);
  const oldUserData = localStorage.getItem('userData2');
  const newAuth = useSelector((state) => state.auth?.isAuthenticated);

  if (oldAuth || oldUserData || newAuth) {
    return <Navigate to="/clinic/dashboard" replace />;
  }

  return children;
};

// Layout
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <AppBarWithProps>
        <Outlet />
      </AppBarWithProps>
    </ProtectedRoute>
  );
};

// Loading
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>กำลังโหลด...</div>
  </div>
);

const Router = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />

            {/* Protected routes */}
            <Route path="/clinic" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/clinic/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="patientregistration" element={<Patientregistration />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="treatment" element={<ตรวจรักษา />} />
              <Route path="medicalstock" element={<Medicalstock />} />
              <Route path="cerwork" element={<Cerwork />} />
              <Route path="payment" element={<Paymentanddispensingmedicine />} />
              <Route path="report" element={<Report />} />
              <Route path="settings" element={<SettingsPage />} />


              {/* Admin Only */}
              <Route path="admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Route>

            {/* Logout */}
            <Route path="/logout" element={<ProtectedRoute><Navigate to="/login" replace /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/clinic/dashboard" replace />} />
            <Route path="/patientregistration" element={<Navigate to="/clinic/patientregistration" replace />} />
            <Route path="/ตรวจรักษา" element={<Navigate to="/clinic/treatment" replace />} />
            <Route path="/Medicalstock" element={<Navigate to="/clinic/medicalstock" replace />} />
            <Route path="/cerwork" element={<Navigate to="/clinic/cerwork" replace />} />
            <Route path="/payment" element={<Navigate to="/clinic/payment" replace />} />
            <Route path="/Report" element={<Navigate to="/clinic/report" replace />} />
            <Route path="/settings" element={<Navigate to="/clinic/settings" replace />} />


            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HashRouter>
  );
};

export default Router;