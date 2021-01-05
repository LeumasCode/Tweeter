import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { getPost } from "../controllers/postController.js";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get("/images/:path", (req, res, next) => {
  res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`));
});

export default router;
