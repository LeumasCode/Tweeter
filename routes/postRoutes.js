import express from "express";
import { getPost } from "../controllers/postController.js";

const router = express.Router();

router.get("/:id", (req, res, next) => {
  const payload = {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

export default router;
