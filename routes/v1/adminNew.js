const express = require('express');
const router = express.Router();
const questionNewController = require('../../controllers/questionNewController');
const { authenticate, isAdmin } = require('../../service/middleware');

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(isAdmin);

// ================== QUESTION CRUD ROUTES ==================

// Create single question
router.post('/questions', questionNewController.createQuestion);

// Get all questions with filters and pagination
router.get('/questions', questionNewController.getAllQuestions);

// Get single question by ID
router.get('/questions/:id', questionNewController.getQuestionById);

// Update question
router.put('/questions/:id', questionNewController.updateQuestion);

// Delete question (soft delete by default, permanent with ?permanent=true)
router.delete('/questions/:id', questionNewController.deleteQuestion);

// ================== BULK OPERATIONS ==================

// Bulk create questions
router.post('/questions/bulk', questionNewController.bulkCreateQuestions);

// ================== ADDITIONAL OPERATIONS ==================

// Toggle verification status - COMMENTED OUT (function not implemented)
// router.patch('/questions/:id/verify', questionNewController.toggleVerification);

// Duplicate question - COMMENTED OUT (function not implemented)
// router.post('/questions/:id/duplicate', questionNewController.duplicateQuestion);

// Get statistics - COMMENTED OUT (function not implemented)
// router.get('/statistics/questions', questionNewController.getQuestionStatistics);

module.exports = router;
