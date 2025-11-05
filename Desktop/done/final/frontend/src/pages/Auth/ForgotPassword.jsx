import { useState } from "react";
import axios from "axios";
import ForgotDetails from './ForgotDetails'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [button, setButton] = useState("Send OTP");
  const [email, setEmail] = useState("");
  const [forget, setForget] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(email);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-reset-otp`, { email });
        if(response.status == 200){
          setMessage(response.data.message);
          setForget(true)
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
  };

 return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
    {forget ? (
      <ForgotDetails />
    ) : (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transform transition duration-300 hover:shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Forgot Password 🔐
        </h2>

        <p className="text-gray-600 text-center mb-4 text-sm">
          Enter your registered email address to receive password reset
          instructions.
        </p>

        <input
          type="email"
          placeholder="Enter your Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        {message && (
          <p
            className={`mt-4 text-sm text-center font-medium ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {button}
        </button>

        <p className="text-sm text-center mt-4">
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            ⬅ Back to Login
          </Link>
        </p>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble?{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Contact Support
            </span>
          </p>
        </div>
      </form>
    )}
  </div>
);


}
export default ForgotPassword;
