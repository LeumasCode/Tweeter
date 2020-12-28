import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const post = await Post.find().populate("postedBy").sort({ createdAt: -1 });

    res.status(200).send(post);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
      console.log("content not sent");
      return res.sendStatus(400);
    }

    if (!req.session.user) {
      console.log("User not logged in!");
      res.redirect("/logout");
      return;
    }

    const post = await Post.create({
      content,
      postedBy: req.session.user,
    });
    await post.populate("postedBy").execPopulate();
    res.status(201).send(post);
  })
);

router.put(
  "/:id/like",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params; // get the post id
    const { user } = req.session; // get the user id

    //check if user already like
    const isLiked = user.likes && user.likes.includes(id);

    const option = isLiked ? "$pull" : "$addToSet";

    console.log(isLiked);

    console.log(option);


    console.log(user._id);

    console.log(id)

    // insert user like
    await User.findByIdAndUpdate(user._id, { [option]: { likes: id } }); //

    // insert post like

    res.status(200).send("yahoo");
  })
);

export default router;
