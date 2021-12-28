const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/Auth");

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

module.exports.authRoutes = router;
