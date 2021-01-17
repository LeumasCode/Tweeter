import express from "express";
import mongoose from "mongoose";
import { getPost } from "../controllers/postController.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const payload = {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("notificationsPage", payload);
});

export default router;
