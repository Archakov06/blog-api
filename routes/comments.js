const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/Comment");
const { checkUser } = require("../utils/checkUser");
const { decodeJwtToken } = require("../utils/decodeJwtToken");
const { Comment } = require("../models/Comment");

router.get("/", CommentController.all);
router.get("/post/:id", CommentController.postComments);
router.post("/", decodeJwtToken, CommentController.create);
router.patch(
  "/:id",
  decodeJwtToken,
  checkUser(true, Comment),
  CommentController.update
);
router.delete(
  "/:id",
  decodeJwtToken,
  checkUser(true, Comment),
  CommentController.delete
);

module.exports.commentsRoutes = router;
