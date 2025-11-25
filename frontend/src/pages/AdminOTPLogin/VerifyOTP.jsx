import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const email = location?.state?.email; // get email from send-otp page
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // if user directly comes to this page without email, redirect back
  useEffect(() => {
    if (!email) navigate("/send-otp");
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!otp.trim()) return alert("Please enter OTP");

    try {
      setLoading(true);
      const res = await API.post("/admin/login/verify-otp", { email, otp });

      // Store user + token
      login({
        ...res.data.user,
        accessToken: res.data.accessToken,
      });

      // Redirect to Admin Dashboard
      navigate("/admin-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg p-8 rounded-md w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
          Verify OTP
        </h2>

        <p className="text-gray-600 mb-4 text-center">
          OTP has been sent to <strong>{email}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full border border-gray-400 p-2 rounded mb-4 focus:ring-2 focus:ring-green-500 outline-none tracking-widest text-center"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={() => navigate("/send-otp")}
          className="w-full text-sm text-gray-600 hover:text-gray-800 mt-4 underline"
        >
          Resend OTP?
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
