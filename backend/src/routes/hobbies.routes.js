const express = require("express");
const router = express.Router();
const { getHobbies } = require("../controllers/hobbies.controller");

router.get("/hobbies", getHobbies);

module.exports = router;
