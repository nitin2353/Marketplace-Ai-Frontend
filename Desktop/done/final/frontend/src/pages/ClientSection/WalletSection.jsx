import React, { useEffect, useState } from "react";
import axios from "axios";

const WalletSection = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wallet/${userId}`
      );
      setBalance(response.data.balance);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const { data: keyRes } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payment/getkey`
      );
      const key = keyRes.key;
      const { data: orderRes } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        { amount }
      );
      const { order } = orderRes;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "GigConnect",
        description: "Wallet Top-up",
        order_id: order.id,
        handler: async (response) => {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/payment/verification`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              amount,
            }
          );
          alert(`₹${amount} added to wallet`);
          fetchWalletDetails();
        },
        prefill: {
          name: "Freelancer",
          email: "freelancer@example.com",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error adding funds:", err);
      alert("Payment failed, please try again.");
    }
  };

 const handleWithdraw = async () => {
   console.log(userId)
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/wallet/withdraw`,
      {
        userId,
        amount: 500,
      },
      { withCredentials: true } 
    );


    if (response.data.success) {
      fetchWalletDetails();
      alert("₹500 withdrawn successfully!");
    } else {
      alert(response.data.message || "Withdraw failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to withdraw funds.");
  }
};

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Wallet</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg font-medium mb-2">
          Balance:{" "}
          <span className="text-green-600 font-semibold">₹{balance}</span>
        </p>
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          />
          <button
            onClick={handleAddFunds}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Funds
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Withdraw ₹500
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Transaction History</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Description</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="py-2">{txn.description}</td>
                  <td
                    className={`py-2 ${
                      txn.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{txn.amount}
                  </td>
                  <td className="py-2 capitalize">{txn.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3 text-gray-500">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletSection;
