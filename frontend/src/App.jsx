import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home/Home';
import RegisterPage from './pages/Register/Register';
import LoginPage from './pages/Login/Login';
import InstructorDashboard from './pages/instructor-dashboard/InstructorDashboard';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/student-dashboard/StudentDashboard';
import SendOTP from './pages/AdminOTPLogin/AdminOTPLogin';
import VerifyOTP from './pages/AdminOTPLogin/VerifyOTP';

import CourseManagement from './pages/admin-dashboard/CourseManagement';
import AnalyticsDashboard from './pages/admin-dashboard/AnalyticsDashboard';
import SystemSettings from './pages/admin-dashboard/SystemSettings';
import UserManagement from './pages/admin-dashboard/UserManagement';
import CourseGrid from './components/CourseGrid';
import CourseForm from './components/CourseForm';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/send-otp' element={<SendOTP />} />
          <Route path='/verify-otp' element={<VerifyOTP />} />
          <Route path='/card' element={<CourseGrid />} />
          
          {/* Protected Create Course Route for Instructors */}
          <Route
            path='/create-course'
            element={
              <ProtectedRoute role="INSTRUCTOR">
                <CourseForm />
              </ProtectedRoute>
            }
          />
          
          <Route path='/unauthorized' element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page</p>
                <a href="/" className="text-blue-600 hover:underline">Go back home</a>
              </div>
            </div>
          } />
          
          {/* Protected Admin Routes */}
          <Route
            path='/admin-dashboard'
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/user-management'
            element={
              <ProtectedRoute role="ADMIN">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path='/course-management'
            element={
              <ProtectedRoute role="ADMIN">
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path='/analytics-dashboard'
            element={
              <ProtectedRoute role="ADMIN">
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <ProtectedRoute role="ADMIN">
                <SystemSettings />
              </ProtectedRoute>
            }
          />

          {/* Protected Instructor Routes */}
          <Route
            path='/instructor-dashboard'
            element={
              <ProtectedRoute role="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Student Routes */}
          <Route
            path='/student-dashboard'
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path='*' element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a href="/" className="text-blue-600 hover:underline">Go back home</a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;