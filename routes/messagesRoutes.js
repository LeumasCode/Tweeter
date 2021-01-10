import express from "express";
import { getPost } from "../controllers/postController.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const payload = {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("inboxPage", payload);
});

router.get("/new", async (req, res, next) => {
  const payload = {
    pageTitle: "New Message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("newMessage", payload);
});

router.get("/:chatId", async (req, res, next) => {
  let userId = req.session.user;
  let chatId = req.params.chatId;

  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate("users");

  if (chat == null) {
    // check if chat id is really user id
  }

  const payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    chat,
  };
  res.status(200).render("chatPage", payload);
});

export default router;
