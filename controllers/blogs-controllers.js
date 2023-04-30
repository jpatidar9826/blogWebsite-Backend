const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const User = require("../models/user");
const Blog = require("../models/blog");

// get all blogs

const getAllBlogs = async (req, res, next) => {
  let blogs;
  try {
    blogs = await Blog.find({}).populate("author", "name");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, couldn't find Blogs" });
  }
  res.json({ blogs: blogs.map((blog) => blog.toObject({ getters: true })) });
};

// get a blog by blogId

const getBlogById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;
  try {
    blog = await Blog.findById(blogId).populate("author", "name");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, couldn't find Blog" });
  }

  if (!blog) {
    return res.status(404).json({ msg: "Could not find blog for this Id" });
  }

  res.json({ blog: blog.toObject({ getters: true }) });
};

// get all blogs associated with userId

const getBlogsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithBlogs;

  try {
    userWithBlogs = await User.findById(userId).populate("blogs");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, couldn't find Blogs" });
  }

  // if (!places || places.length === 0) {
  if (!userWithBlogs || userWithBlogs.blogs.length === 0) {
    return res
      .status(404)
      .json({ msg: "Could not find blogs for the provided user id." });
  }

  res.json({
    blogs: userWithBlogs.blogs.map((blog) => blog.toObject({ getters: true })),
  });
};

// create a blog

const createBlog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs passed, please check your data." });
  }

  const { title, content } = req.body;

  const createdBlog = new Blog({
    title,
    content,
    author: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Creating blog failed, Please try again." });
  }

  if (!user) {
    return res
      .status(404)
      .json({ msg: "Could not find user for provided id." });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBlog.save({ session: sess });
    user.blogs.push(createdBlog);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Creating blog failed, Please try again." });
  }

  res.status(201).json({ msg: "Created blog successfully." });
};

// update a blog

const updateBlog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs passed, please check your data." });
  }

  const { title, content } = req.body;
  const blogId = req.params.bid;

  let blog;
  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Updating blog failed, Please try again." });
  }

  if (blog.author.toString() !== req.userData.userId) {
    return res
      .status(401)
      .json({ msg: "You are not allowed to edit this blog." });
  }

  blog.title = title;
  blog.content = content;

  try {
    await blog.save();
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, could not update blog." });
  }

  res.status(200).json({ blog: blog.toObject({ getters: true }) });
};

//delete a blog

const deleteBlog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ msg: "Invalid inputs passed, please check your data." });
  }
  const blogId = req.params.bid;

  let blog;
  try {
    blog = await Blog.findById(blogId).populate("author");
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, could not delete blog." });
  }

  if (!blog) {
    return res.status(404).json({ msg: "Could not find blog for this id." });
  }

  if (blog.author.id !== req.userData.userId) {
    return res
      .status(401)
      .json({ msg: "You are not allowed to delete this blog." });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Blog.findByIdAndDelete(blogId)
      .session(sess)
      .then(async () => {
        await User.findByIdAndUpdate(req.userData.userId, {
          $pull: { blogs: blogId },
        })
          .session(sess)
          .catch((err) => {
            return res
              .status(500)
              .json({ msg: "Something went wrong, could not delete blog." });
          });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ msg: "Something went wrong, could not delete blog." });
      });
    await sess.commitTransaction();
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Something went wrong, could not delete blog." });
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getAllBlogs = getAllBlogs;
exports.getBlogById = getBlogById;
exports.getBlogsByUserId = getBlogsByUserId;
exports.createBlog = createBlog;
exports.updateBlog = updateBlog;
exports.deleteBlog = deleteBlog;
