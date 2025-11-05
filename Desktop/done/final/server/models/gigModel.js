import mongoose from "mongoose";

const gigSchema = new mongoose.Schema({
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String },
        budget: { type: Number },
        image: {type: String , required: true},
        location: { type: String },
        status: { type: String, default: "open" },
        createdAt: { type: Date, default: Date.now }
})

  // The freelancer who posted this gig
const gigModel = mongoose.model("Gig", gigSchema);
export default gigModel
