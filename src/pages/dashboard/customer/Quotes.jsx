import { useEffect, useState } from "react";
import API from "../../../config/axios-config";

export default function Quotes({ requirement_id }) {

    const [quotes, setQuotes] = useState([]);

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        const res = await API.get(`/quote/${requirement_id}`);
        setQuotes(res.data.data);
    };

    const createOrder = async (quote_id) => {

        const res = await API.post("/order", {
            quote_id,
            user_id: "64805ea0-14ba-44d9-9c9a-e1f764fad6a5"
        });

        const order = res.data.data;

        startPayment(order.id, order.total_amount);
    };

    const startPayment = async (order_id, amount) => {

        const res = await API.post("/razorpay/create-order", {
            order_id,
            amount
        });

        const rzpOrder = res.data.data;

        const options = {
            key: "YOUR_KEY_ID",
            amount: rzpOrder.amount,
            currency: "INR",
            order_id: rzpOrder.id,

            handler: async function (response) {

                await API.post("/razorpay/verify", {
                    ...response,
                    order_id,
                    amount
                });

                alert("Payment Success 🔥");
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // const startPayment = async (order_id, amount) => {

    //     const res = await API.post("/razorpay/create-order", {
    //         order_id,
    //         amount
    //     });

    //     const rzpOrder = res.data.data;

    //     const options = {
    //         key: "YOUR_KEY_ID",
    //         amount: rzpOrder.amount,
    //         currency: "INR",
    //         order_id: rzpOrder.id,

    //         handler: async function (response) {

    //             await API.post("/razorpay/verify", {
    //                 ...response,
    //                 order_id,
    //                 amount
    //             });

    //             alert("Payment Success 🔥");
    //         }
    //     };

    //     const rzp = new window.Razorpay(options);
    //     rzp.open();
    // };


    return (
        <div>
            <h2>Quotes</h2>

            {quotes.map(q => (
                <div key={q.id}>
                    <p>₹ {q.price}</p>
                    <button onClick={() => createOrder(q.id)}>
                        Select
                    </button>
                </div>
            ))}
        </div>
    );
}