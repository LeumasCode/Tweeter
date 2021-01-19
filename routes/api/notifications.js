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
    const notification = await Notification.find({
      userTo: req.session.user._id,
      notificationType: { $ne: "newMessage" },
    })
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 });

    res.status(200).send(notification);
  })
);

router.put(
  "/",
  asyncHandler(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, {
      opened: true,
    });

    res.sendStatus(204);
  })
);

export default router;
