import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Message from "../../models/messageModel.js";
import Chat from "../../models/chatModel.js";
import Notification from "../../models/notificationModel.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    if (!req.body.content || !req.body.chatId) {
      console.log("invalid data passed into request");
      return res.sendStatus(400);
    }

    let newMessage = {
      sender: req.session.user._id,
      content: req.body.content,
      chat: req.body.chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, { path: "chat.users" });

    let chat = await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    insertNotifications(chat, message);

    res.status(201).send(message);
  })
);

function insertNotifications(chat, message) {
  chat.users.forEach((userId) => {
    if (userId == message.sender._id.toString()) return;

    Notification.insertNotification(
      userId,
      message.sender._id,
      "newMessage",
      message.chat._id
    );
  });
}

export default router;
