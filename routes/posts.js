const express = require('express');
const PostController = require('../controllers/Post');
const { checkUser } = require('../utils/checkUser');
const { decodeJwtToken } = require('../utils/decodeJwtToken');
const { Post } = require('../models/Post');

const router = express.Router();

router.get('/', PostController.all);
// router.get("/search", PostController.search);

router.post('/', decodeJwtToken, PostController.create);
router.post('/upload', PostController.upload);
router.get('/:id', PostController.show);
router.patch('/:id', decodeJwtToken, checkUser(true, Post), PostController.update);
router.delete('/:id', decodeJwtToken, checkUser(true, Post), PostController.delete);

module.exports.postsRoutes = router;
