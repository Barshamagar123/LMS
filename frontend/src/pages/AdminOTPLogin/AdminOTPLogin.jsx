import React, { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const SendOTP = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) return alert("Enter admin email");

    try {
      setLoading(true);

      await API.post("/admin/login/send-otp", { email });

      // Navigate to verify page with the email included
      navigate("/verify-otp", { state: { email } });

    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-3">
      <div className="bg-white shadow-lg p-8 rounded-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Admin Login — Send OTP
        </h2>

        <label className="block mb-2 text-gray-700 font-medium">
          Admin Email
        </label>

        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4 focus:ring-2 focus:ring-blue-600 outline-none"
        />

        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

      </div>
    </div>
  );
};

export default SendOTP;
