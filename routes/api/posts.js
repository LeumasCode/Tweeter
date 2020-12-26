import express from "express";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res, next) => {

    if(!req.body.content){
        console.log('content not sent')
     return  res.sendStatus(400)
    }
    res.status(200).send("it worked");
  })
);

export default router;
