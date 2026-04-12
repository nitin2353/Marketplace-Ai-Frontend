import { useState } from "react";
import API from "../../../api/axios";

export default function Review({ seller_id }) {

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const submitReview = async () => {
        await API.post("/review", {
            user_id: "USER_ID",
            seller_id,
            rating,
            comment
        });

        alert("Review submitted ⭐");
    };

    return (
        <div>
            <h3>Give Review</h3>

            <input 
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
            />

            <input 
                placeholder="Comment"
                onChange={(e) => setComment(e.target.value)}
            />

            <button onClick={submitReview}>Submit</button>
        </div>
    );
}