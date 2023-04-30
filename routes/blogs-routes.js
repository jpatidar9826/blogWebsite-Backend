const express = require("express");
const { check } = require("express-validator");

const blogsControllers = require("../controllers/blogs-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", blogsControllers.getAllBlogs); // get all blogs

router.get("/:bid", blogsControllers.getBlogById); //get a blog by id

router.get("/user/:uid", blogsControllers.getBlogsByUserId); //get list of blogs of users

router.use(checkAuth); // authentication

router.post(
  "/",
  [
    check("title").not().isEmpty().isLength({ min: 5 }),
    check("content").isLength({ min: 50 }),
  ],
  blogsControllers.createBlog
); // create new blog

router.patch(
  "/:bid",
  [
    check("title").not().isEmpty().isLength({ min: 5 }),
    check("content").isLength({ min: 50 }),
  ],
  blogsControllers.updateBlog
); //update blog by bid

router.delete("/:bid", blogsControllers.deleteBlog); //delete blog by blog id

module.exports = router;
