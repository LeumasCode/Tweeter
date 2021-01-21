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
    let searchObj = {
      userTo: req.session.user._id,
      notificationType: { $ne: "newMessage" },
    };

    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
      searchObj.opened = false;
    }

    const notification = await Notification.find(searchObj)
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 });

    res.status(200).send(notification);
  })
);

router.put(
  "/:id/markAsOpened",
  asyncHandler(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, {
      opened: true,
    });

    res.sendStatus(204);
  })
);

router.put(
  "/markAsOpened",
  asyncHandler(async (req, res, next) => {
    const notification = await Notification.updateMany(
      { userTo: req.session.user._id },
      {
        opened: true,
      }
    );

    res.sendStatus(204);
  })
);

export default router;
