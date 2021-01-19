import mongoose from "mongoose";
import validator from "validator";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: Boolean,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    retweetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    retweetData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    pinned: Boolean,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
