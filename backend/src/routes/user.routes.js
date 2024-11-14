const express = require("express");
const router = express.Router();
const {
  getUsers,
  getMe,
  getUserById,
  createUser,
  loginUser,
  upload,
  updateUser,
  deleteUser,
  registerUser,
} = require("../controllers/user.controller");

router.get("/users", getUsers);
router.get("/auth/me", getMe);
router.get("/users/:id", getUserById);
router.post("/users", upload.single("image"), createUser);
router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.put("/users/:id", upload.single("image"), updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
