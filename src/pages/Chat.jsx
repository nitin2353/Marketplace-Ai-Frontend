import { useEffect, useState } from "react";
import API from "../../../api/axios";

export default function Chat({ receiver_id }) {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const user_id = "USER_ID";

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        const res = await API.get(`/message/${user_id}/${receiver_id}`);
        setMessages(res.data.data);
    };

    const sendMessage = async () => {
        await API.post("/message", {
            sender_id: user_id,
            receiver_id,
            message: text
        });

        setText("");
        loadMessages();
    };

    return (
        <div>
            <h3>Chat</h3>

            <div>
                {messages.map(m => (
                    <p key={m.id}>
                        {m.sender_id === user_id ? "You: " : "Seller: "}
                        {m.message}
                    </p>
                ))}
            </div>

            <input 
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}