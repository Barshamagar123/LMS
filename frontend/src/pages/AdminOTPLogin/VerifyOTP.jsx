import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const email = location?.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30); // countdown for resend

  // Redirect if user comes without email
  useEffect(() => {
    if (!email) navigate("/send-otp");
  }, [email, navigate]);

  // Countdown for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!otp.trim()) return alert("Please enter OTP");

    try {
      setLoading(true);

      const res = await API.post("/admin/login/verify-otp", { email, otp });

      const token = res.data.accessToken;

      const userData = {
        ...res.data.user,
        token,       // for ProtectedRoute
        role: "ADMIN" // critical for admin access
      };

      login(userData);
      localStorage.setItem("token", token);

      navigate("/admin-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return; // prevent spamming

    try {
      setLoading(true);
      await API.post("/admin/login/send-otp", { email });
      alert("OTP resent successfully!");
      setResendTimer(30); // restart countdown
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
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
          className="w-full border border-gray-400 p-2 rounded mb-4 
                     focus:ring-2 focus:ring-green-500 outline-none 
                     tracking-widest text-center text-lg"
        />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
          className={`w-full py-2 rounded text-white font-medium 
                      ${loading || otp.length < 6 ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} 
                      transition`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || loading}
          className={`w-full text-sm text-gray-600 hover:text-gray-800 mt-4 underline 
                      ${resendTimer > 0 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP?"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
