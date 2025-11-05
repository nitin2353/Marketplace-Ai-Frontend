import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 0 },
    transactions: [
        {
            amount: Number,
            type: { type: String, enum: ["credit", "debit"] },
            description: String,
            date: { type: Date, default: Date.now }
        }
    ]

})

const paymentModel = mongoose.model('wallet',paymentSchema)

export default paymentModel