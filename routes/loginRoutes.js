import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).render("login");
});

router.post("/", login);

export default router;
