import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
   
    bookingId : {type : String, ref:"Booking", required: true},
    senderId: { type: String, ref: "User", required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }

})

const chatModel = mongoose.model('chat', chatSchema);

export default chatModel;