import { useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";

function ForgotDetails() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");        
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async(e) => {
      e.preventDefault();
        try {
          
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {email, otp, password});
            
            if(response.status == 200){
                setMessage(response.data.message);
                setTimeout(() => {
                  navigate("/login")
                }, 1000)
            }
        } catch (error) {
            if(error.response){
                setMessage(error.response.data.message)
            }
            else if(error.request){
              setMessage("No response from server. Try again later.")
            }
            else(
              setMessage(error.message)
            )
        }
      }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96 space-y-5 "
    >
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-700">
        Forgot Password
      </h2>
      <p className="text-sm text-center text-gray-500 mb-4">
        Reset your account password securely
      </p>

      <input
        type="email"
        placeholder="Enter your Email"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />

      <input
        type="text"
        placeholder="Enter OTP"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setOtp(e.target.value)}
        value={otp}
        required
      />

      <input
        type="password"
        placeholder="Enter New Password"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {message && (
        <p className="text-sm text-center text-gray-600">{message}</p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300 font-medium"
      >
        Submit
      </button>

      <p className="text-sm text-center mt-3">
        <Link to="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
);

};
export default ForgotDetails;