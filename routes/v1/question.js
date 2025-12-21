const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/questionController');
const { searchLimiter } = require('../../service/rateLimiter');
const { 
    validateSearch, 
    validateQuestionId,
    validateRandomQuestion
} = require('../../service/validation');

// ==================== PUBLIC ROUTES ====================

// Search questions with filters
// GET /api/v1/questions/search?keyword=constitution&year=2021&examType=prelims
router.get('/search', searchLimiter, validateSearch, questionController.searchQuestions);

// Get filter options (years, subjects, topics, exam types)
// GET /api/v1/questions/filters/options
router.get('/filters/options', questionController.getFilterOptions);

// Get question statistics
// GET /api/v1/questions/statistics
router.get('/statistics', questionController.getStatistics);

// Get random question (with optional filters)
// GET /api/v1/questions/random?examType=prelims&subject=Polity
router.get('/random', validateRandomQuestion, questionController.getRandomQuestion);

// Get single question by ID
// GET /api/v1/questions/:id
router.get('/:id', validateQuestionId, questionController.getQuestionById);

// ==================== SUBJECT ROUTES ====================

// Get all subjects with topics
// GET /api/v1/subjects
router.get('/subjects/all', questionController.getAllSubjects);

// Get topics for a specific subject
// GET /api/v1/subjects/:name/topics
router.get('/subjects/:name/topics', questionController.getTopicsForSubject);

module.exports = router;
