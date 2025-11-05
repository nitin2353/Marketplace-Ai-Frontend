import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin", "user"],
      default: "user",
    },
    bio: String,
    skills: [String],
    profileImage: String,
    isVerified: {type : Boolean, default : false}
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
export default userModel;
