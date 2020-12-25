import path from "path";
import express, { urlencoded } from "express";
import { requireLogin } from "./middleware.js";
import loginRouter from "./routes/loginRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "views");

console.log(__dirname);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "home page",
  };
  res.render("home", payload);
});

// MOUNT ROUTES
app.use("/login", loginRouter);
app.use("/register", registerRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
