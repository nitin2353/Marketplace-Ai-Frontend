import express from "express";
import { sendMessage, getMessagesByBooking, deleteChatByBooking } from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/:bookingId", getMessagesByBooking);
router.delete("/:bookingId", deleteChatByBooking);

export default router;
