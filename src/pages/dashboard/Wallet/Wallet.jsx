import { useEffect, useState } from "react";
import API from "../../../config/axios-config";

export default function Wallet() {

    const [wallet, setWallet] = useState({});
    const [amount, setAmount] = useState("");

    useEffect(() => {
        loadWallet();
    }, []);

    const loadWallet = async () => {
        const res = await API.get("/wallet/SELLER_ID");
        setWallet(res.data.data);
    };

    const withdraw = async () => {
        await API.post("/wallet/withdraw", {
            seller_id: "SELLER_ID",
            amount
        });

        alert("Withdraw Request Sent 💸");
    };

    return (
        <div>
            <h2>Wallet</h2>

            <h3>Balance: ₹ {wallet.balance || 0}</h3>

            <input
                placeholder="Withdraw amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <button onClick={withdraw}>
                Withdraw
            </button>
        </div>
    );
}