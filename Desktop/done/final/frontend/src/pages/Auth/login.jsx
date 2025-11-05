import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommonStyle from "../../styles/CommonStyle.module.css";



function Login({ setUserRole }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 

    if (form.email && form.password) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          form, 
          {
              withCredentials: true
          })

        console.log(response.data.role)

        if (response.status === 200) {
          setMessage(response.data.message);

          
          const userRole = response.data.role; 
          const userId = response.data._id;

          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userId", userId);

          if (setUserRole) setUserRole(userRole);

         
          navigate("/dashboard");
        }
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.message || "Login failed");
        } else if (error.request) {
          setMessage("No response from server. Try again later.");
        } else {
          setMessage(error.message);
        }
      }
    } else {
      setMessage("Please enter valid credentials!");
    }
  };

 return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transform transition duration-300 hover:shadow-2xl"
    >
      <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
        Welcome Back 👋
      </h2>

      <div className="space-y-5">
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          onChange={handleChange}
        />
      </div>

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
        Login
      </button>

      <div className="flex justify-between items-center mt-4 text-sm text-blue-600">
        <Link
          to="/forgot-password"
          className="hover:underline transition duration-150"
        >
          Forgot Password?
        </Link>
        <Link
          to="/register"
          className="hover:underline font-semibold transition duration-150"
        >
          Create Account
        </Link>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By logging in, you agree to our{" "}
          <span className="text-blue-600 font-medium hover:underline cursor-pointer">
            Terms
          </span>{" "}
          &{" "}
          <span className="text-blue-600 font-medium hover:underline cursor-pointer">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </form>
  </div>
);

}

export default Login;
