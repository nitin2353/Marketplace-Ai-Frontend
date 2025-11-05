import { instance } from "../server.js"
import crypto from "crypto"




export const checkoutPayment = async (req,res)=>{
    try{
        const options = {
        amount:Number(req.body.amount*100),
        currency:"INR"
    }

    const order = await instance.orders.create(options)
    
    res.status(200).json({success:true, order})
    
    }catch(error){
            res.json({success:false,error})

    }
        
}



export const getKey = async (req,res)=>{
    try{
        res.status(200).json({
        key:process.env.RAZORPAY_API_KEY
    })

    }catch(error){
        res.status(500).json({success:false,error})

    }
  
}


export const verification = async(req,res)=>{

    const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body

    const body = razorpay_order_id + '|' + razorpay_payment_id

    const expectedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature
    if(isAuthentic){
        return res.redirect(`http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`)
    }else{
        res.status(404).json({success:false})
    }
    

    res.status(200).json({success:true})
}
