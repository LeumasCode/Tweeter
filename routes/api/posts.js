import express from "express";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    res.status(200).send("it worked");
  })
);

export default router;
