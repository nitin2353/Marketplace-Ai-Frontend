import chatModel from "../models/chatModel.js";


export const sendMessage = async (req, res) => {
  try {
    const { bookingId, senderId, text } = req.body.data;

    if (!bookingId || !senderId || !text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newMsg = await chatModel({ bookingId, senderId, text });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMsg,
    });

  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending message",
      error: error.message,
    });
  }
};


export const getMessagesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const messages = await chatModel
      .find({ bookingId })
      .sort({ sentAt: 1 }); 

    if (!messages || messages.length === 0) {
      return res.status(404).json({ success: false, message: "No messages found" });
    }

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching messages",
      error: error.message,
    });
  }
};


export const deleteChatByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID required" });
    }

    await chatModel.deleteMany({ bookingId });
    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting chat",
      error: error.message,
    });
  }
};
