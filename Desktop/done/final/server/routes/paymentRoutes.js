
import express from "express";
import {
  checkoutPayment,
  getKey,
  verification,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", checkoutPayment);
paymentRouter.get("/getkey", getKey);
paymentRouter.post("/verification", verification);

export default paymentRouter;
