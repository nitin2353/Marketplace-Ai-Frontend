import { useEffect, useState } from "react";
import API from "../../../config/axios-config";

export default function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const res = await API.get("/order");
        setOrders(res.data.data);
    };

    return (
        <div>
            <h3>Orders</h3>

            {orders.map(o => (
                <div key={o.id}>
                    <p>₹ {o.total_amount}</p>
                    <p>Status: {o.status}</p>
                </div>
            ))}
        </div>
    );
}