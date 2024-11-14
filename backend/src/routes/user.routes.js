const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  upload,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", upload.single("image"), createUser);
router.post("/login", loginUser);
router.put("/users/:id", upload.single("image"), updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
