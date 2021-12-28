const express = require("express");
const router = express.Router();
const UserController = require("../controllers/User");

router.get("/", UserController.all);
router.get("/:id", UserController.show);

module.exports.usersRoutes = router;
