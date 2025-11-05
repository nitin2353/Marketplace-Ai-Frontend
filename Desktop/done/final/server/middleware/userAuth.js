import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'

const userAuth = async(req,res,next)=>{
   const token = req.cookies.token
   if(!token){
      return res.json({success:false,message:"Not Authorized Login again..."})
      
   }
   try{
      const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
      
      if(tokenDecode.id){
         
         const user = await userModel.findById(tokenDecode.id);
         if(!user){
            return res.status(404).json({ success: false, message: "User not found....." });
         }
         

        await res.cookie('userId', tokenDecode.id, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge: 7*24*60*60*1000   
        })
         
      }else{
         return res.json({success:false,message:"Not Authorized..."})
         
      }
       next();

    }catch(error){
      res.json({success:false,message:error})

    }
}

export default userAuth;