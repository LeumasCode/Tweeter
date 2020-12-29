import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";

const router = express.Router();

const getPosts = async (filter) => {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .sort({ createdAt: -1 });

  return await User.populate(results, {
    path: "retweetData.postedBy",
  });
};

router.get("/", async (req, res, next) => {
  const results = await getPosts({});

  res.status(200).send(results);
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  let results = await getPosts({ _id: id });
  results = results[0];

  console.log(results);
  res.status(200).send(results);
});

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
    let postId = req.params.id; // get the post id
    let userId = req.session.user._id; // get the user id

    //check if user already like
    let isLiked =
      req.session.user.likes && req.session.user.likes.includes(postId);

    let option = isLiked ? "$pull" : "$addToSet";

    // insert user like
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { likes: postId } },
      {
        new: true,
      }
    ); //

    // insert post like

    let post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { likes: userId } },
      {
        new: true,
      }
    );

    res.status(200).send(post);
  })
);

router.post(
  "/:id/retweet",
  asyncHandler(async (req, res, next) => {
    let postId = req.params.id; // get the post id
    let userId = req.session.user._id; // get the user id

    // try and delete retweet
    let deletedPost = await Post.findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    });

    let option = deletedPost != null ? "$pull" : "$addToSet";

    let rePost = deletedPost;

    if (rePost == null) {
      rePost = await Post.create({ postedBy: userId, retweetData: postId });
    }

    // insert user retweet
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { retweets: rePost._id } },
      {
        new: true,
      }
    ); //

    //   // insert post like

    let post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      {
        new: true,
      }
    );

    res.status(200).send(post);
  })
);

export default router;
