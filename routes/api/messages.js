import express from "express";
import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import Message from "../../models/messageModel.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
   if(!req.body.content || !req.body.chatId){
       console.log('invalid data passed into request')
       return res.sendStatus(400)
   }

   let newMessage = {
       sender: req.session.user._id,
       content: req.body.content,
       chat: req.body.chatId
   }

   let message = await Message.create(newMessage)

   message = await message.populate('sender').execPopulate()
   message = await message.populate("chat").execPopulate();



    res.status(201).send(message);
  })
);




export default router;
