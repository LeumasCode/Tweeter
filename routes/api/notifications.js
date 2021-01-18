import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Message from "../../models/messageModel.js";
import Chat from "../../models/chatModel.js";
import Notification from "../../models/notificationModel.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    res.status(200).send('it works')
  }
))

export default router;
