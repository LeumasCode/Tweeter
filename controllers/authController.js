import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;

  const payload = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    payload.errorMessage = "Make sure each field has a valid value";
    res.status(200).render("register", payload);
  }

  const user = await User.findOne({ $or: [{ email, username }] });

  if (user) {
    payload.errorMessage = "Username or Email already in use";
    res.status(200).render("register", payload);
  }

  const newUser = await User.create(req.body);
  req.session.user = newUser;
  res.status(201).redirect("/");
});

export const login = asyncHandler(async (req, res, next) => {
  const { logUsername, logPassword } = req.body;

  const payload = req.body;

  if (!logUsername || !logPassword) {
    payload.errorMessage = "Make sure each field has a valid value";
    res.status(200).render("login", payload);
  }

  const user = await User.findOne({
    $or: [{ email: logUsername }, { username: logUsername }],
  });

  if (!user || !(await user.comparePassword(logPassword))) {
    payload.errorMessage = "invalid login details";
    res.status(200).render("login", payload);
  }
  req.session.user = user;
  res.status(201).redirect("/");
});

export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => res.redirect("/login"));
  }
};
