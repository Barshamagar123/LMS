import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ✅ wrap with AuthProvider

import Home from './pages/Home/Home';
import RegisterPage from './pages/Register/Register';
import LoginPage from './pages/Login/Login';
import InstructorDashboard from './pages/instructor-dashboard/InstructorDashboard';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // for role-based routes
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import AdminOTPLogin from './pages/AdminOTPLogin/AdminOTPLogin';
import AdminVerifyOTP from './pages/AdminOTPLogin/VerifyOTP';
import SendOTP from './pages/AdminOTPLogin/AdminOTPLogin';
import VerifyOTP from './pages/AdminOTPLogin/VerifyOTP';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/send-otp' element={<SendOTP />} />
          <Route path='/verify-otp' element={<VerifyOTP />} />
          {/* Protected Instructor Dashboard */}
          <Route
            path='/instructor-dashboard'
            element={
              <ProtectedRoute role="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
            <Route
            path='/student-dashboard'
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          {/* Protected Admin Dashboard */}
          <Route
            path='/admin-dashboard'
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
