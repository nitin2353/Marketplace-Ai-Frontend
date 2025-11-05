import walletModel from "../models/walletModel.js"
import transactionModel from "../models/transactionModel.js"

export const withdrawFunds = async (req, res) => {
  try {

    const userId = req.user?.id || req.body.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }

   
    const wallet = await walletModel.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }


    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }


    wallet.balance -= amount;


    const transaction = new transactionModel({
      userId,
      type: "withdraw",
      amount,
      status: "success",
      timestamp: new Date(),
    });

    await transaction.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Withdraw successful",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
