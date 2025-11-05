import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    type:{type:String, enum:["deposit","withdaw"], required:true},
    amount:{type:Number, required:true},
    status:{type:String, enum:["success","failed"], default:"success"},
    timestamp:{type:Date, default:Date.now}
})


const transactionModel = mongoose.model('transaction',transactionSchema)

export default transactionModel