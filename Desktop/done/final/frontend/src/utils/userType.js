export const getUserType = () => {
  return localStorage.getItem("userType") || "freelancer";
};
