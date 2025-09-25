import { Route, Routes, HashRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Patientregistration from "./pages/Patientregistration";
import AppBarWithProps from "./pages/AppBarWithProps";
import ตรวจรักษา from './pages/ตรวจรักษา';
import Medicalstock from './pages/Drugandmedical';
import Cerwork from "./components/ตรวจรักษา/cerwork";
import Paymentanddispensingmedicine from "./pages/Paymentanddispensingmedicine";
import PatientManagement from "./pages/PatientManagementPage";
import Report from "./pages/Report";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.authentication.token);
  const userData = localStorage.getItem('userData2');

  if (!isAuthenticated && !userData) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.authentication.token);
  const userData = localStorage.getItem('userData2');

  if (isAuthenticated || userData) {
    return <Navigate to="/clinic/dashboard" replace />;
  }

  return children;
};

// คอมโพเนนต์สำหรับ layout ที่มี AppBar และ Sidebar
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <AppBarWithProps>
        <Outlet /> {/* ตรงนี้จะแสดงเนื้อหาของ route ที่ match */}
      </AppBarWithProps>
    </ProtectedRoute>
  );
};

const Router = () => {
  return (
    <HashRouter> {/* เปลี่ยนจาก BrowserRouter เป็น HashRouter */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Protected routes with AppBar and Sidebar */}
        <Route path="/clinic" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/clinic/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patientregistration" element={<Patientregistration />} />
          <Route path="patients" element={<PatientManagement />} /> {/* เพิ่ม route ใหม่ */}
          <Route path="treatment" element={<ตรวจรักษา />} />
          <Route path="medicalstock" element={<Medicalstock />} />
          <Route path="cerwork" element={<Cerwork />} />
          <Route path="payment" element={<Paymentanddispensingmedicine />} />
          {/* <Route path="personnel" element={<Personnel />} /> */}
          {/* <Route path="finance" element={<Financialandaccounting />} /> */}
          <Route path="report" element={<Report />} />
          {/* <Route path="rights" element={<Rightsmanagementsystem />} /> */}
        </Route>

        {/* Logout route */}
        <Route path="/logout" element={
          <ProtectedRoute>
            <Navigate to="/login" replace />
          </ProtectedRoute>
        } />

        {/* Legacy paths - redirect to new structure */}
        <Route path="/dashboard" element={<Navigate to="/clinic/dashboard" replace />} />
        <Route path="/patientregistration" element={<Navigate to="/clinic/patientregistration" replace />} />
        <Route path="/ตรวจรักษา" element={<Navigate to="/clinic/ตรวจรักษา" replace />} />
        <Route path="/Medicalstock" element={<Navigate to="/clinic/medicalstock" replace />} />
        <Route path="/cerwork" element={<Navigate to="/clinic/cerwork" replace />} />
        <Route path="/payment" element={<Navigate to="/clinic/payment" replace />} />
        <Route path="/Personnel" element={<Navigate to="/clinic/personnel" replace />} />
        <Route path="/Financialandaccounting" element={<Navigate to="/clinic/finance" replace />} />
        <Route path="/Report" element={<Navigate to="/clinic/report" replace />} />
        <Route path="/Rightsmanagementsystem" element={<Navigate to="/clinic/rights" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default Router;