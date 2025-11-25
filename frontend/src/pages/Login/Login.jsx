import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      login({ ...res.data.user, accessToken: res.data.accessToken });

      // Role-based redirection
      if (res.data.user.role === "ADMIN") navigate("/admin-otp-login");
      else if (res.data.user.role === "INSTRUCTOR") {
        res.data.user.isApproved
          ? navigate("/instructor-dashboard")
          : navigate("/pending-approval");
      } else navigate("/student-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API.defaults.baseURL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
          onSubmit={handleSubmit}
        >
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
          </Button>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="grow border-t border-gray-300"></div>
            <span className="shrink mx-4 text-gray-500 text-sm">Or continue with</span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Create account
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;