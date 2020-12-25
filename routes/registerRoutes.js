import express from "express";
import { register } from "../controllers/authController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

router.post("/", register);

export default router;
