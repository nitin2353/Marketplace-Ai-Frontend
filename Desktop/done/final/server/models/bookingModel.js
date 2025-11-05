import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});


const bookingModel = mongoose.model('booking', bookingSchema);

export default bookingModel;