import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";

const router = express.Router();

router.put("/:userId/follow", async (req, res, next) => {
  let userId = req.params.userId;

  let user = await User.findById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  let isFollowing =
    user.followers && user.followers.includes(req.session.user._id);

  res.status(200).send(isFollowing);
});

export default router;
