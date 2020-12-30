import express from "express";
import { getPost } from "../controllers/postController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user
  };
  res.status(200).render("profilePage", payload);
});

export default router;
