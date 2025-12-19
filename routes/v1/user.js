var express = require('express');
var router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require('../../controllers/userController');
const { checkRole } = require('../../service/middleware');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// User routes (all require authentication via middleware in index.js)

// Get current user profile (handled in authController, but can also be here)
router.get('/profile', userController.updateProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/change-password', userController.changePassword);

// Delete account
router.delete('/account', userController.deleteAccount);

// Get user by ID
router.get('/:id', userController.getUserById);

// Admin only - Get all users
router.get('/all', checkRole(['admin']), userController.getAllUsers);

module.exports = router;