import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ use the hook
import API from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const { login } = useAuth(); // ✅ fixed
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      login({ ...res.data.user, token: res.data.accessToken });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
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

        <form
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
          onSubmit={handleSubmit}
        >
          <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" />
          <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
          <InputField label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" />

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

          <Button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
            Create Account
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
      </div>
    </div>
  );
};

export default Register;
