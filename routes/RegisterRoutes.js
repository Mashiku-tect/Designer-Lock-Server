

 const { registerLimiter } = require('../middleware/RateLimiter');

const express = require("express");
const router = express.Router();
const authController = require("../controllers/RegisterController");

router.post("/register", registerLimiter,authController.register);

module.exports = router;
