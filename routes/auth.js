const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth');
const { decodeJwtToken } = require('../utils/decodeJwtToken');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', decodeJwtToken, AuthController.me);

module.exports.authRoutes = router;
