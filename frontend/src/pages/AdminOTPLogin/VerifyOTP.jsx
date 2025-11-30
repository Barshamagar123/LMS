import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location?.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate("/send-otp");
  }, [email, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) return alert("Enter 6-digit OTP");

    try {
      setLoading(true);

      // Call backend route correctly
      const res = await API.post("/admin/login/verify-otp", { email, otp });

      // Save token & user info
      const token = res.data.accessToken;
      const userData = { ...res.data.admin, token };
      login(userData);

      // Small delay to ensure state update
      setTimeout(() => {
        navigate("/admin-dashboard", { replace: true });
      }, 100);
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 shadow-md rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
        <p className="text-center mb-4">
          Code sent to: <strong>{email}</strong>
        </p>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full border p-2 mb-4 rounded text-center text-xl"
        />
        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify & Login"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
