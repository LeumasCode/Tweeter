import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";

const router = express.Router();

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

  res.status(200).send(req.session.user);
});

router.get(
  "/:userId/following",
  asyncHandler(async (req, res, next) => {
    let userId = req.params.userId;
    console.log(userId)

    let user = await User.findById(userId).populate("following");
console.log(user)
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


export default router;
