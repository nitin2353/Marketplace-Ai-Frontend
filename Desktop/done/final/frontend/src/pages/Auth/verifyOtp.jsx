// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function VerifyOtp() {
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();
//   const email = localStorage.getItem("resetEmail");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await api.post("/users/verify-otp", {
//         email,
//         otp,
//         newPassword,
//       });
//       setMessage("✅ Password reset successful!");
//       console.log(data);
//       localStorage.removeItem("resetEmail");
//       setTimeout(() => navigate("/login"), 1500);
//     } catch (err) {
//       setMessage("❌ Invalid OTP or error resetting password");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4"
//       >
//         <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
//         <input
//           type="text"
//           placeholder="Enter OTP"
//           className="w-full p-2 border rounded"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Enter new password"
//           className="w-full p-2 border rounded"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
//         >
//           Reset Password
//         </button>
//         {message && (
//           <p className="text-center text-gray-600 text-sm">{message}</p>
//         )}
//       </form>
//     </div>
//   );
// }
