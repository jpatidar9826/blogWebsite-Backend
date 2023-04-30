const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();
const usersController = require("../controllers/users-controllers");

router.get("/all", usersController.getUsers); //get all users

router.get("/:uid", usersController.getUserById); //get a user by id

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
); // signup

router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.login
); // login

router.use(checkAuth);

router.patch(
  "/:uid",
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  usersController.updateUser
); //update name and email of user
 
router.delete("/:uid", usersController.deleteUser); // delete user( associated blogs will also deleted )

module.exports = router;
