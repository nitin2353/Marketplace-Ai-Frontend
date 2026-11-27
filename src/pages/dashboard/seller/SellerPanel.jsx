import { useEffect, useState } from "react";
import API from "../../../config/axios-config";

export default function SellerPanel() {

    const [requirements, setRequirements] = useState([]);

    useEffect(() => {
        loadRequirements();
    }, []);

    const loadRequirements = async () => {
        const res = await API.get("/requirement");
        setRequirements(res.data.data);
    };

    const submitQuote = async (req_id) => {
        await API.post("/quote", {
            requirement_id: req_id,
            seller_id: "SELLER_ID",
            price: 1200,
            delivery_time: "2 days"
        });

        alert("Quote Submitted 🔥");
    };

    return (
        <div>
            <h2>Seller Panel</h2>

            {requirements.map(r => (
                <div key={r.id}>
                    <p>{r.description}</p>
                    <button onClick={() => submitQuote(r.id)}>
                        Send Quote
                    </button>
                </div>
            ))}
        </div>
    );
}