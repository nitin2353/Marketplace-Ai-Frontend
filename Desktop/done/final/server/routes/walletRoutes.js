import express from "express";
import paymentModel from "../models/paymentModel.js";
import transactionModel from "../models/transactionModel.js";

const walletRouter = express.Router();


walletRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await paymentModel.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

walletRouter.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const wallet = await paymentModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      amount,
      type: "debit",
      description: "Withdrawal",
    });
    await wallet.save();

    await transactionModel.create({
      userId,
      amount,
      type: "withdraw",
      status: "success",
    });

    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default walletRouter;
