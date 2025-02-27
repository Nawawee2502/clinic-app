// import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import LoginPage from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useSelector((state) => state.authentication.token);
//   const userData = localStorage.getItem("userData2");

//   return isAuthenticated || userData ? children : <Navigate to="/" replace />;
// };

// const PublicRoute = ({ children }) => {
//   const isAuthenticated = useSelector((state) => state.authentication.token);
//   const userData = localStorage.getItem("userData2");

//   return isAuthenticated || userData ? <Navigate to="/dashboard" replace /> : children;
// };

// const Router = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <PublicRoute>
//               <LoginPage />
//             </PublicRoute>
//           }
//         />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default Router;





import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./components/Dashboard";
import Patientregistration from "./pages/Patientregistration";
import AppBarWithProps from "./pages/AppBarWithProps";
import ตรวจรักษา from './pages/ตรวจรักษา';
import Medicalstock from './pages/Drugandmedical';
import Cerwork from "./components/ตรวจรักษา/cerwork";


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
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/patientregistration" element={
          <ProtectedRoute>
            <Patientregistration />
          </ProtectedRoute>
        } />
         <Route path="/ตรวจรักษา" element={
          <ProtectedRoute>
            <ตรวจรักษา />
          </ProtectedRoute>
        } />
        <Route path="/Medicalstock" element={
          <ProtectedRoute>
            <Medicalstock />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/clinic" element={
          <ProtectedRoute>
            <AppBarWithProps />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <ProtectedRoute>
            <LoginPage />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute>
            <Signup/>
          </ProtectedRoute>
        } />
        <Route path="/cerwork" element={
          <ProtectedRoute>
            <Cerwork/>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
};

export default Router;