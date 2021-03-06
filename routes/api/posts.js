import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";
import Notification from "../../models/notificationModel.js";

const router = express.Router();

const getPosts = async (filter) => {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: -1 });
  results = await User.populate(results, {
    path: "replyTo.postedBy",
  });
  return await User.populate(results, {
    path: "retweetData.postedBy",
  });
};

router.get("/", async (req, res, next) => {
  let searchObj = req.query;
  if (searchObj.isReply !== undefined) {
    let isReply = searchObj.isReply == "true";

    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.search !== undefined) {
    searchObj.content = { $regex: searchObj.search, $options: "i" };
    delete searchObj.search;
  }

  if (searchObj.followingOnly !== undefined) {
    let followingOnly = searchObj.followingOnly == "true";

    if (followingOnly) {
      let objectIds = [];
      if (!req.session.user.following) {
        req.session.user.following = [];
      }

      req.session.user.following.forEach((user) => {
        objectIds.push(user);
      });

      objectIds.push(req.session.user._id);

      searchObj.postedBy = { $in: objectIds };
    }

    delete searchObj.followingOnly;
  }
  const results = await getPosts(searchObj);

  res.status(200).send(results);
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  let postData = await getPosts({ _id: id });
  postData = postData[0];

  let result = {
    postData,
  };

  if (postData.replyTo !== undefined) {
    result.replyTo = postData.replyTo;
  }

  result.replies = await getPosts({ replyTo: id });

  res.status(200).send(result);
});

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const { content, replyTo } = req.body;

    if (!content) {
      console.log("content not sent");
      return res.sendStatus(400);
    }

    if (!req.session.user) {
      console.log("User not logged in!");
      res.redirect("/logout");
      return;
    }

    let post = await Post.create({
      content,
      postedBy: req.session.user,
      replyTo,
    });

    post = await User.populate(post, { path: "postedBy" });

    post = await Post.populate(post, { path: "replyTo" });

    if (post.replyTo !== undefined) {
      await Notification.insertNotification(
        post.replyTo.postedBy,
        req.session.user._id,
        "reply",
        post._id
      );
    }
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

    if (!isLiked) {
      await Notification.insertNotification(
        post.postedBy,
        userId,
        "like",
        post._id
      );
    }

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

    if (!deletedPost) {
      await Notification.insertNotification(
        post.postedBy,
        req.session.user._id,
        "retweet",
        post._id
      );
    }

    res.status(200).send(post);
  })
);

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);

  res.status(204).send();
});

router.put(
  "/:id",
  asyncHandler(async (req, res, next) => {
    if (req.body.pinned !== undefined) {
      await Post.updateMany({ postedBy: req.session.user }, { pinned: false });
    }
    const { id } = req.params;

    await Post.findByIdAndUpdate(id, req.body);

    res.status(204).send();
  })
);

export default router;
