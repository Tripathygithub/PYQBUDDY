const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/questionSimplifiedController');
const { authenticate, isAdmin } = require('../../service/middleware');

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// ================== QUESTION MANAGEMENT ROUTES ==================

// Create single question
router.post('/questions', questionController.createQuestion);

// Get all questions (with filters)
router.get('/questions', questionController.getAllQuestions);

// Search questions
router.get('/questions/search', questionController.searchQuestions);

// Get statistics
router.get('/questions/statistics', questionController.getQuestionStatistics);

// Get single question
router.get('/questions/:id', questionController.getQuestionById);

// Update question
router.put('/questions/:id', questionController.updateQuestion);

// Delete question (soft delete by default, ?permanent=true for hard delete)
router.delete('/questions/:id', questionController.deleteQuestion);

// Bulk create questions
router.post('/questions/bulk', questionController.bulkCreateQuestions);

// Toggle verification status
router.patch('/questions/:id/verify', questionController.toggleVerification);

// Duplicate question
router.post('/questions/:id/duplicate', questionController.duplicateQuestion);

module.exports = router;
