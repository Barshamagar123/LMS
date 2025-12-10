import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/register", form);
      
      // Store token and user data
      const userData = { ...res.data.user, token: res.data.accessToken };
      login(userData);
      
      // Check if instructor needs to complete profile
      if (form.role === "INSTRUCTOR" && res.data.requiresProfileCompletion) {
        // Redirect to profile completion
        navigate("/instructor/complete-profile", {
          state: { 
            newInstructor: true,
            message: "Welcome! Please complete your instructor profile to get started."
          }
        });
      } else {
        // Student or already completed profile
        navigate("/login", {
          state: { 
            message: "Registration successful! Please login to continue.",
            email: form.email 
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our learning community today</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Instructor Note */}
        {form.role === "INSTRUCTOR" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Instructor Registration</p>
                <p className="text-sm text-blue-600 mt-1">
                  After registration, you'll be asked to complete your professional profile to start creating courses.
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
          onSubmit={handleSubmit}
        >
          <InputField 
            label="Full Name" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Enter your full name" 
            required
          />
          <InputField 
            label="Email Address" 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="Enter your email" 
            required
          />
          <InputField 
            label="Password" 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Create a password" 
            required
            minLength={6}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "STUDENT" })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${form.role === "STUDENT" ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-gray-300 bg-white hover:bg-gray-50"}`}
              >
                <div className="text-center">
                  <div className={`text-sm font-semibold mb-1 ${form.role === "STUDENT" ? "text-indigo-700" : "text-gray-700"}`}>Student</div>
                  <div className="text-xs text-gray-500">Learn & Grow</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "INSTRUCTOR" })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${form.role === "INSTRUCTOR" ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-gray-300 bg-white hover:bg-gray-50"}`}
              >
                <div className="text-center">
                  <div className={`text-sm font-semibold mb-1 ${form.role === "INSTRUCTOR" ? "text-indigo-700" : "text-gray-700"}`}>Instructor</div>
                  <div className="text-xs text-gray-500">Teach & Inspire</div>
                </div>
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Registration Flow Info */}
        {form.role === "INSTRUCTOR" && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructor Registration Flow:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</div>
                <span>Basic registration (this page)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</div>
                <span>Complete professional profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</div>
                <span>Access instructor dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</div>
                <span>Start creating courses</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;