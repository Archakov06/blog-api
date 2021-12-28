const express = require("express");
const router = express.Router();
const PostController = require("../controllers/Home");

router.get("/", PostController.index);

module.exports.homeRoutes = router;
