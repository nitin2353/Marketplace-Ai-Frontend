import mongoose from "mongoose";

const connectDB = async()=>{
    
    mongoose.connect(process.env.MONGO_URI)

    .then(()=>console.log('MongoDB Connected'))
    .catch(error=>console.log(error))
}

export default connectDB



