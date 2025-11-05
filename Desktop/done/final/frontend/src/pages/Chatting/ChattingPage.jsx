import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL); 

const messageStyle = {
  border: "1px solid black",
  borderRadius: "20px",
  padding: "8px 16px",
  fontSize: "16px",
  maxWidth: "70%",
  wordWrap: "break-word",
  margin: "4px 0",
};

function ChattingPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [headName, setHeadName] = useState("Select Chat");


  useEffect(() => {
    const load = () => {
      // alert(selectedChat)
      if (selectedChat) {
        axios.get(`${import.meta.env.VITE_API_URL}/chat/${selectedChat}`)
        .then((res) => setMessages(res.data.messages))
        .catch(console.error);
      }
    }
    
    load()
  }, [selectedChat]);

  console.log({messages})
  
  async function listHandler() {
    try {
      const uid = localStorage.getItem("userId");
      if (!uid) return alert("User ID not found in localStorage!");

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/client/workers/${uid}`,
        { withCredentials: true }
      );

      const workers = data?.workers || [];
      const bookings = data?.UserBookings || [];


      const mergedList = workers.map((worker) => {
        const booking = bookings.find((b) => b.freelancerId === worker._id);
        return {
          ...worker,
          _id: booking ? booking._id : null,
          gigId: booking ? booking.gigId : null,
          status: booking ? booking.status : null,
        };
      });
      console.log(mergedList)
      setChatList(mergedList);
    } catch (err) {
      console.error("Error fetching worker list:", err);
      alert("Something went wrong while fetching the worker list.");
    }
  }


  async function freelancerListHandler() {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/booking/all`,
          { withCredentials: true }
        );
        console.log(data)
        const gigDet = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/gigs`,
          { withCredentials: true }
        );


        const bookings = data.message || [];

        const gigs = gigDet.data || [];


        const mergedData = bookings.map((booking) => {
          const gig = gigs.find((g) => g._id === booking.gigId);
          return {
            ...booking,
            gigDetails: gig || null,
          };
        });

        console.log(mergedData);

        setChatList(mergedData);
      } catch (error) {
        console.error(error);
      }
  }

  
  useEffect(() => {
    if (user === "client") listHandler();
    if (user === "freelancer") freelancerListHandler();
  }, [user]);


  const joinRoom = (chat, chatting) => {

    if (!chat) {
      alert("Invalid bookingId for this chat");
      return;
    }
    if(localStorage.getItem('userRole') === "freelancer"){
      setHeadName(chatting.gigDetails.title)
    }
    else{
      setHeadName(chatting.name)
    }
    
    console.log(chatting)
    setSelectedChat(chat);
    setMessages([]); 
    socket.emit("join_room", chat); 
  };

  const msgHandler = async (msg) => {
    if (!msg.trim() || !selectedChat) return;

    const senderId = localStorage.getItem("userId");

    const data = {
      bookingId: selectedChat,
      senderId : senderId,
      text: msg,
    };


    const chatSave = await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`,
      {data},
      {withCredentials : true}
    )

    console.log(chatSave+"save message from server");


    socket.emit("send_message", data);

    setMessages((prev) => [...prev, { ...data, sender: "me" }]);
    setMessage("");
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const userId = localStorage.getItem("userId");

      if (data.senderId === userId) return;

      if (data.bookingId === selectedChat) {
        setMessages((prev) => [...prev, { ...data, sender: "other" }]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedChat]);


  return (
    <div className="flex h-screen">

      <aside className="w-1/4 border-r-2 border-gray-300 flex flex-col bg-gray-100">
        <header className="h-16 flex items-center px-4 bg-blue-500 text-white font-semibold text-lg">
          Chats
        </header>

        <div className="flex-1 overflow-auto">
          {chatList.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">No chats available</p>
          ) : (
            chatList.map((chat) => (
              <div
                key={chat._id || chat.bookingId}
                onClick={() => {joinRoom(chat._id, chat), console.log(chat._id)}}
                className={`p-4 border-b cursor-pointer hover:bg-blue-100 ${
                  selectedChat && selectedChat._id === chat._id
                    ? "bg-blue-200"
                    : ""
                }`}
              >
                <div className="font-semibold">{chat.name || chat.gigDetails.title || "Unknown" }</div>
                <div className="text-sm text-gray-600 truncate">
                  {chat.status || "Active"}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>


      <div className="flex flex-col flex-1">
        <header className="border-b bg-blue-500 text-white h-16 flex items-center px-4">
          <div className="font-semibold">
            {headName}
          </div>
        </header>


        <main className="flex-1 overflow-auto p-4 flex flex-col">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.senderId === localStorage.getItem('userId') ? "justify-end" : "justify-start"
                }`}
              >{console.log(msg.senderId)}
                <div
                  style={{
                    ...messageStyle,
                    backgroundColor:
                      msg.sender === "me" ? "#DCF8C6" : "#FFF",
                  }}
                >
                  {msg.message || msg.text}
                </div>
              </div>
            ))
          )}
        </main>


        <footer className="border-t-2 p-2 flex items-center gap-2 h-16">
          <input
            type="text"
            placeholder="Message Here.."
            className="flex-1 h-full border-2 rounded px-4 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && msgHandler(message)}
          />
          <button
            className="h-full w-24 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => msgHandler(message)}
          >
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ChattingPage;
