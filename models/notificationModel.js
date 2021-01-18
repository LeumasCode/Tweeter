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

    notificationType: String,

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
  notificationType,
  entityId
) => {
    
  let data = {
    userTo,
    userFrom,
    notificationType,
    entityId,
  };

 await Notification.deleteOne(data).catch((err) => console.log(err));

  return Notification.create(data);
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
