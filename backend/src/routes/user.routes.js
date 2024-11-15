const express = require("express");
const router = express.Router();
const {
  getUsers,
  getMe,
  getUserById,
  loginUser,
  updateUser,
  deleteUser,
  registerUser,
} = require("../controllers/user.controller");

router.get("/users", getUsers);
router.get("/auth/me", getMe);
router.get("/users/:id", getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
