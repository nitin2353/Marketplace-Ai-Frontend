import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js"
import transporter from "../config/nodemailer.js"
import cloudinary from "../middleware/upload.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const skills = "";

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Missing Details..." });
  }

  try {

    const profileImagePath = path.join(__dirname, "..", req.file.path);
    console.log("Uploading to Cloudinary:", profileImagePath);


    const cloudUpload = await cloudinary.uploader.upload(profileImagePath);
    const profileImage = cloudUpload.secure_url;
    console.log("Uploaded Image URL:", profileImage);


    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists..." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword, role, skills, profileImage });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to gigConnect",
      text: `Welcome to gigConnect. Your account has been created with email id: ${email}`,
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json("User Created Successfully....");
  } catch (error) {
    console.error("Error uploading image or creating user:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again later" });
  }
};





export const login = async(req,res)=>{
    
    const{email,password} = req.body

    if(!email || !password){
        return res.status(400).json({success:false,message:"Email and Passeord required..."})
    }
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).json({success:false,message:"User not found"})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({success:false,message:"Invalid email or password"})
        }

        console.log(user._id + "  this is user")

        await res.cookie('userId', user._id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge: 7*24*60*60*1000   
        })

        console.log(req.cookies.userId+' temp')


        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.cookie('token',token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge: 7*24*60*60*1000   
        })
        return res.status(200).json({success:true,message:"User LoggedIn....",_id: user._id, role : user.role}) 

    }catch(error){
        res.status(500).json({success:false,message:"Server error. Please try again later"})
    }

}


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/login", 
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
var servOtp;

export const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email received:", email);


    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified...." });
    }


    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    servOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours


    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    console.log("Generated OTP:", otp);

    await transporter.sendMail(mailOption);
    await user.save();

    return res.json({ success: true, message: "Verification OTP Sent on Email...." });
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const verifyEmail = async (req, res) => {
  const userId = req.cookies.userId;
  const { otp } = req.body;

  console.log("Client OTP:", otp);
  console.log("Server OTP:", servOtp);

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details..." });
  }

  try {
    if (otp != servOtp) {
      return res.json({ success: false, message: "Invalid OTP..." });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found..." });
    }

    servOtp = null;

    return res.json({
      success: true,
      message: "Email Verified Successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.json({
      success: false,
      message: "Server error during verification.",
      error: error.message,
    });
  }
};



//Check if user is authenticated

export const isAuthenticated = async(req,res)=>{
    try{
 
        return res.json({success:true})

    }catch(error){
        res.status({success:false,message:error})
    }
}


// send password reset otp

export const sendResetOtp = async(req,res)=>{
    const {email} = req.body
    
    if(!email){
        return res.status(400).json({success:false,message:'Email is Required..'});
    }
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).json({success:false,message:'User notsdfsd found..'})
        }
        else{

            const otp = String(Math.floor(100000 + Math.random()*900000))
            user.resetOtp = otp
            user.resetOtpExpiresAt = Date.now()+24*60*60*1000
            await user.save()
            

            const mailOption ={
                from: process.env.SENDER_EMAIL,
                to:user.email,
                subject: "Password Reset OTP",
                text: `Your OTP for Resetting Password is ${otp}. Using this OTP to proceed with resetting your password.`
            }
      
            await transporter.sendMail(mailOption)
            return res.status(200).json({success:true,message:'OTP sent to your email..'})
        }

    
    }catch(error){
        res.status(500).json({success:false,message:"Server error. Please try again later"})
    }
}


// Reset User Password

export const resetPassword = async(req,res)=>{
    const {email, otp, password} = req.body

    console.log(email, otp, password)

    if(!email || !otp || !password){
        return res.json({success:false,message:'Email,OTP,newPassword are required....'})
    }
    try{
        const user = await userModel.findOne({email})
        if(!user){
         return res.status({success:false,message:'user not found...'})

        }
     
        if(user.resetOtp!=otp){

            return res.json({success:false,message:'Invalid OTP...'})

        }
        if(user.resetOtpExpiresAt<Date.now()){
            return res.json({success:false,message:'OTP Expired...'})

        }
        const hashedPassword = await bcrypt.hash(password,10)
        user.password = hashedPassword
        user.resetOtp = ''
        user.resetOtpExpiresAt = 0

        try {
            await user.save()
        } catch (error) {
            res.json(error)
        }

         return res.json({success:true,message:'Password has been reset Successfully...'})


    }catch(error){
        res.status({success:false,message:error})

    }
}
