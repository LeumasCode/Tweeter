import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Chat from "../../models/chatModel.js";
import Message from "../../models/messageModel.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    let { users } = req.body;

    if (!users) {
      console.log("users not sent from client");
      return;
    }

    //convert the users back to object
    users = JSON.parse(users);

    if (users.length == 0) {
      console.log("users array is empty");
      return;
    }

    users.push(req.session.user); // push ourself inside the array

    let chatData = {
      users,
      isGroupChat: true,
    };

    const chat = await Chat.create({
      users,
      isGroupChat: true,
    });

    res.status(201).send(chat);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.session.user._id } },
    })
      .populate("users")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, { path: "latestMessage.sender" });
    res.status(200).send(chats);
  })
);

router.get(
  "/:chatId",
  asyncHandler(async (req, res, next) => {
    let chats = await Chat.findOne({
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: req.session.user._id } },
    }).populate("users");
    res.status(200).send(chats);
  })
);

router.get(
  "/:chatId/messages",
  asyncHandler(async (req, res, next) => {
    let message = await Message.find({
      chat: req.params.chatId,
    }).populate("sender");
    res.status(200).send(message);
  })
);

router.put(
  "/:chatId",
  asyncHandler(async (req, res, next) => {
    let chats = await Chat.findByIdAndUpdate(req.params.chatId, req.body);

    res.sendStatus(204);
  })
);

export default router;
