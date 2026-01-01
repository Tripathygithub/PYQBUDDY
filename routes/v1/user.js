var express = require('express');
var router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const questionController = require('../../controllers/questionSimplifiedController');
const { checkRole } = require('../../service/middleware');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// User routes (all require authentication via middleware in index.js)

// ================== USER PROFILE ROUTES ==================

// Get current user profile
router.get('/profile', authController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/change-password', userController.changePassword);

// Delete account
router.delete('/account', userController.deleteAccount);

// Admin only - Get all users
router.get('/all', checkRole(['admin']), userController.getAllUsers);

// ================== QUESTION ACCESS ROUTES (READ-ONLY) ==================
// These routes allow authenticated users to view and search questions

// IMPORTANT: These specific routes must come BEFORE the /:id route
// Search questions - read-only access for users
router.get('/questions/search', questionController.searchQuestions);

// Get all questions (with filters) - read-only access for users
router.get('/questions', questionController.getAllQuestions);

// Get single question by ID - read-only access for users
router.get('/questions/:id', questionController.getQuestionById);

// ================== PARAMETERIZED ROUTES (MUST BE LAST) ==================
// Get user by ID - MUST be last to avoid matching other routes
router.get('/:id', userController.getUserById);

module.exports = router;