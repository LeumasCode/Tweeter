import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";

const router = express.Router();


router.get(
  "/",
  asyncHandler(async (req, res, next) => {
   const post = await Post.find().populate('postedBy')

   res.status(200).send(post)
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

export default router;
