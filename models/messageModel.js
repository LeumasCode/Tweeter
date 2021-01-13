import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    readBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
