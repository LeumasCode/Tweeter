import path from "path";
import express, { urlencoded } from "express";
import * as io from "socket.io";
import { requireLogin } from "./middleware.js";
import authRouter from "./routes/authRoutes.js";

import apiPostRouter from "./routes/api/posts.js";
import apiUserRouter from "./routes/api/users.js";
import apiChatRouter from "./routes/api/chats.js";
import apiMessageRouter from "./routes/api/messages.js";
import postRouter from "./routes/postRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import messagesRouter from "./routes/messagesRoutes.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

//config
dotenv.config();

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

app.set("view engine", "pug");
app.set("views", "views");

// connect to db
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connected"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.render("home", payload);
});

// MOUNT ROUTES
app.use("/", authRouter);
app.use("/api/posts", apiPostRouter);
app.use("/api/users", apiUserRouter);
app.use("/api/chats", apiChatRouter);
app.use("/api/messages", apiMessageRouter);

app.use("/posts", requireLogin, postRouter);
app.use("/profile", requireLogin, profileRouter);
app.use("/uploads", uploadRouter);
app.use("/search", requireLogin, searchRouter);
app.use("/messages", requireLogin, messagesRouter);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));

//instantiate socket io

const socketio = new io.Server(server, { pingTimeout: 60000 });

socketio.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room);
    socket.emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room);
    socket.emit("stop typing");
  });

  socket.on("new message", (newMessage) => {
    let chat = newMessage.chat;

    if (!chat.users) return console.log("chat.user not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;

      socket.in(user._id).emit("message received", newMessage);
    });
  });
});
