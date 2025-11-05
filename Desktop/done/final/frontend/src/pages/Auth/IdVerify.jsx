import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function IdVerify() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [type, setType] = useState("email")
  const [message, setMessage] = useState(""); 
  const [userRole, setUserRole] = useState('');
  const [button , setButtonText] = useState("Send OTP")
  const [placeholder, setPlaceholder] = useState("Enter Your Email")

  const handleSubmit = async(e) => {
    e.preventDefault();

    if(email.length == 6){
        try {
          const otp = email;
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-account`, { otp },{ withCredentials: true });
          if(response.status == 200){
              setMessage(response.data.message);
              const who = await localStorage.getItem("userRole")
              // navigate('/login')
              
              navigate(`/${who == "user" ? "client" : who == "freelancer" ? "freelancer" : "admin" }-dashboard`)
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
    }else{
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-verify-otp`, { email },{ withCredentials: true });
        if(response.status == 200){
            setMessage(response.data.message);
            setPlaceholder("Enter OTP")
            setType('number')
            setEmail("");
            setButtonText("Verify")

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
    
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg w-[400px] border border-gray-100 transition-all duration-300 hover:shadow-2xl"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 d-inline">
        Verify Your Account <img src="../../public/verify.png" className="d-inline h-10"/>
      </h2>

      <div className="mb-4 mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {message && (
        <p className="text-sm text-center text-blue-600 bg-blue-50 py-2 rounded mb-2">
          {message}
        </p>
      )}

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition duration-300"
      >
        {button}
      </button>

      <p className="text-sm mt-4 text-center text-gray-600">
        <Link
          to="/login"
          className="text-blue-600 font-medium hover:underline transition"
        >
          Skip for Now
        </Link>
      </p>
    </form>
  </div>
);

}
export default IdVerify;
