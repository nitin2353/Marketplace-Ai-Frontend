import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail} from '../controllers/authController.js'
import userAuth from '../middleware/userAuth.js'
import upload from '../middleware/multer.js'

const authRouter = express.Router()


// User Authentication routes

authRouter.post('/register', upload.single("profileImage"), register)   //done
authRouter.post('/login',login)    //done
authRouter.post('/logout',logout)  //done
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)  //done
authRouter.post('/verify-account', userAuth, verifyEmail)        //done
authRouter.post('/is-auth', userAuth,isAuthenticated)     //done
authRouter.post('/send-reset-otp',sendResetOtp)     //done
authRouter.post('/reset-password',resetPassword)    //done


export default authRouter