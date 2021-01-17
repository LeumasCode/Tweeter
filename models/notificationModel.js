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

notificationSchema.statics.insertNotification = async(
  userTo,
  userFrom,
  NotificationType,
  entityId
) => {
    
  let data = {
    userTo,
    userFrom,
    NotificationType,
    entityId,
  };

 await Notification.deleteOne(data).catch((err) => console.log(err));

  return Notification.create(data);
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
