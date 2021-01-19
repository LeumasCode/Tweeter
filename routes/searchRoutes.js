import express from "express";
import { getPost } from "../controllers/postController.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const payload = createPayload(req.session.user);
  res.status(200).render("searchPage", payload);
});

router.get("/:selectedTab", async (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render("searchPage", payload);
});

function createPayload(userLoggedIn) {
  return {
    pageTitle: "Search",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  };
}

export default router;
