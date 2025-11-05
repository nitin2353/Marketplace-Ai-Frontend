import mongoose from "mongoose";

const reviewModel = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    clientId : {type: mongoose.Schema.Types.ObjectId, ref: "User", requierd: true},
    freelancerId : {type: mongoose.Schema.Types.ObjectId, ref: "User", requierd: true},
    rating : {type: Number, min:1, max:5, requierd: true},
    comment : {type : String},
    createdAt : {type : Date, default: Date.now}
})


export default mongoose.model( "Review", reviewModel);