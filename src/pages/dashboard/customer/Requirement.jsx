import { useState } from "react";
import API from "../../../config/axios-config";

export default function Requirement() {

    const [input, setInput] = useState("");

    const createRequirement = async () => {
        const res = await API.post("/requirement", {
            user_id: "64805ea0-14ba-44d9-9c9a-e1f764fad6a5",
            user_input: input
        });

        alert("Requirement Created 🔥");
        console.log(res.data);
    };

    return (
        <div>
            <h2>Create Requirement</h2>

            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your need"
            />

            <button onClick={createRequirement}>
                Submit
            </button>
        </div>
    );
}