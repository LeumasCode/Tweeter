import express from "express";
import { requireLogin } from "./middleware.js";

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.get("/", requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "home page",
  };
  res.render("home", payload);
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
