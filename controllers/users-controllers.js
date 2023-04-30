require("dotenv").config();
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Blog = require("../models/blog");

// get all users

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Fetching users failed, please try again later." });
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//get user by Id

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Fetching user failed, please try again later." });
  }

  if (!user) {
    return res.status(500).json({ msg: "User does'nt exist" });
  }
 
  res.status(200).json({ user: user.toObject({ getters: true }) });
};

// signup

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs, please check your data." });
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({ msg: "Sign up failed, please try again." });
  }

  if (existingUser) {
    return res
      .status(422)
      .json({ msg: "User exists already, please login instead." });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return res.status(500).json({ msg: "Sign up failed, please try again." });
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    blogs: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return res.status(500).json({ msg: "Sign up failed, please try again." });
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return res.status(500).json({ msg: "Sign up failed, please try again." });
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// login

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs, please check your data." });
  }

  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({ msg: "Log in failed, please try again." });
  }

  if (!existingUser) {
    return res
      .status(403)
      .json({ msg: "Invalid credentials, could not log you in." });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Invalid credentials, could not log you in." });
  }

  if (!isValidPassword) {
    return res
      .status(403)
      .json({ msg: "Invalid credentials, could not log you in." });
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Log in failed, please try again later." });
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

//update user

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs, please check your data." });
  }

  const { name, email } = req.body;
  const userId = req.userData.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, could not update User." });
  }

  user.name = name;
  user.email = email;

  try {
    await user.save();
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, could not update User." });
  }

  res.status(200).json({ msg: "User updated successfully" });
};

// Delete User 

const deleteUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs, please check your data." });
  }
  const userId = req.userData.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, User deletion failed" });
  }

  if (!user) {
    return res.status(404).json({ msg: "User does'nt exist" });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await User.findByIdAndDelete(userId)
      .session(sess)
      .then(async () => {
        if (user.blogs.length !== 0) {
          await Blog.deleteMany({ author: userId })
            .session(sess)
            .then(() => {
              console.log("delted blogs also");
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ msg: "Something went wrong, could not update User." });
            });
        }
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ msg: "Something went wrong, User deletion failed" });
      });
    await sess.commitTransaction();
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, User deletion failed" });
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.getUserById = getUserById;
exports.login = login;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
