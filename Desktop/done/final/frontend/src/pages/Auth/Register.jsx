import axios from "axios";
import { useState } from "react";
import IdVerify from "./IdVerify";
import { Link, redirect, replace, useNavigate } from "react-router-dom";
function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Role",
    profileImage: null, 
  });

  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("")
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleFileChange = (e) => {
    setForm({ ...form, profileImage: e.target.files[0] });
  };


  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return setMessage("Enter your Name First!");
    if (!form.email) return setMessage("Enter your Email!");
    if (!isStrongPassword(form.password))
      return setMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    if (form.password !== form.confirmPassword)
      return setMessage("Passwords not match!");
    if (form.role === "Role") return setMessage("Select your role");
    if (!form.profileImage) return setMessage("Please upload a profile image!");

    await setUserRole(form.role)
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      setMessage("Please Wait...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        
        await localStorage.setItem("userRole", userRole);
        navigate('/idverify')
        setMessage(response.data.message || "Registered successfully!");
      }
    } catch (error) {
      if (error.response) setMessage(error.response.data.message);
      else if (error.request) setMessage("No response from server.");
      else setMessage(error.message);
    }

     (role == 'freelancer') ? navigate("/freelancer-dashboard") : navigate("/user-dashboard");
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transform transition duration-300 hover:shadow-2xl"
      encType="multipart/form-data"
    >
      <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
        Create Your Account
      </h2>

      <div className="flex flex-col items-center space-y-2 mb-4">
        <label
          htmlFor="profileImage"
          className="cursor-pointer bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
        >
          Upload Profile Image
        </label>
        <input
          id="profileImage"
          type="file"
          name="profileImage"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          onChange={handleChange}
        />

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

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"
          onChange={handleChange}
          required
        >
          <option disabled selected>
            Select Role
          </option>
          <option value="user">User</option>
          <option value="freelancer">Freelancer</option>
        </select>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm text-center font-medium ${
            message.includes("success") ? "text-blue-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Register
      </button>

      <p className="text-sm text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  </div>
);

}
export default Register;
