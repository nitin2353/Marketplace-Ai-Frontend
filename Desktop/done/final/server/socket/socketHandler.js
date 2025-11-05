import chatModel from "../models/chatModel.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);


    socket.on("join_room", (bookingId) => {
      socket.join(bookingId);
      console.log(`User ${socket.id} joined room ${bookingId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const { bookingId, senderId, text } = data;
        const date = Date.now();

        const chatting = new chatModel({
          bookingId,
          senderId,
          message: text,
          date,
        });
        await chatting.save();


        io.to(bookingId).emit("receive_message", data);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketHandler;
