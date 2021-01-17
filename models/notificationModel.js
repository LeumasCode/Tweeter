import mongoose from "mongoose";
import validator from "validator";

const notificationSchema = new mongoose.Schema(
  {
    userTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    NotificationType: String,

    opened: {
      type: Boolean,
      default: false,
    },


    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
