const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { authMiddleware } = require('../../service/middleware');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes (authentication required)
router.get('/me', authMiddleware, authController.getProfile);
router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;
