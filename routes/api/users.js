import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";
import multer from "multer";
import Notification from "../../models/notificationModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    let searchObj = req.query;

    if (searchObj.search !== undefined) {
      searchObj = {
        $or: [
          { firstName: { $regex: searchObj.search, $options: "i" } },
          { lastName: { $regex: searchObj.search, $options: "i" } },
          { username: { $regex: searchObj.search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(searchObj);

    res.status(200).send(users);
  })
);

router.put("/:userId/follow", async (req, res, next) => {
  let userId = req.params.userId;

  let user = await User.findById(userId);

  if (user == null) {
    return res.sendStatus(404);
  }

  let isFollowing =
    user.followers && user.followers.includes(req.session.user._id);

  let option = isFollowing ? "$pull" : "$addToSet";

  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    {
      new: true,
    }
  ).catch((err) => console.log(err)); //

  await User.findByIdAndUpdate(userId, {
    [option]: { followers: req.session.user._id },
  }); //

  if(!isFollowing){
    await Notification.insertNotification(userId, req.session.user._id, 'follow', req.session.user._id)
  }

  res.status(200).send(req.session.user);
});

router.get(
  "/:userId/following",
  asyncHandler(async (req, res, next) => {
    let userId = req.params.userId;
    console.log(userId);

    let user = await User.findById(userId).populate("following");
    console.log(user);
    res.status(200).send(user);
  })
);

router.get(
  "/:userId/followers",
  asyncHandler(async (req, res, next) => {
    let userId = req.params.userId;

    let user = await User.findById(userId).populate("followers");

    res.status(200).send(user);
  })
);

const upload = multer({ dest: "uploads/" });

router.post(
  "/profilePicture",
  upload.single("croppedImage"),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded");
      res.sendStatus(400);
      return;
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;

    let tempPath = req.file.path;

    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { image: filePath },
        { new: true }
      );

      res.status(204).send();
    });
  })
);

router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded");
      res.sendStatus(400);
      return;
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;

    let tempPath = req.file.path;

    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );

      res.status(204).send();
    });
  })
);

export default router;
