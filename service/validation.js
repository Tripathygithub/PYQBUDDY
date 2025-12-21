const { body, query, param, validationResult } = require('express-validator');
const response = require('../responsecode/response');

// ==================== VALIDATION ERROR HANDLER ====================
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return response.errorResponse(res, 'Validation failed', errors.array(), 400);
    }
    next();
};

// ==================== SEARCH VALIDATION ====================
const validateSearch = [
    query('keyword')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Keyword cannot exceed 200 characters')
        .escape(),
    
    query('year')
        .optional()
        .custom((value) => {
            const years = Array.isArray(value) ? value : [value];
            return years.every(y => {
                const year = parseInt(y);
                return !isNaN(year) && year >= 2000 && year <= 2030;
            });
        })
        .withMessage('Year must be between 2000 and 2030'),
    
    query('examType')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['prelims', 'mains', 'optional'])
        .withMessage('Exam type must be prelims, mains, or optional'),
    
    query('subject')
        .optional()
        .custom((value) => {
            if (Array.isArray(value)) {
                return value.every(s => typeof s === 'string' && s.length > 0);
            }
            return typeof value === 'string' && value.length > 0;
        })
        .withMessage('Invalid subject format'),
    
    query('topic')
        .optional()
        .custom((value) => {
            if (Array.isArray(value)) {
                return value.every(t => typeof t === 'string' && t.length > 0);
            }
            return typeof value === 'string' && value.length > 0;
        })
        .withMessage('Invalid topic format'),
    
    query('hasAnswer')
        .optional()
        .isBoolean()
        .withMessage('hasAnswer must be boolean'),
    
    query('difficulty')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Difficulty must be easy, medium, or hard'),
    
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be between 1 and 1000'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
        .optional()
        .trim()
        .isIn(['year', 'viewCount', 'createdAt'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    
    handleValidationErrors
];

// ==================== CREATE QUESTION VALIDATION ====================
const validateCreateQuestion = [
    body('year')
        .notEmpty()
        .withMessage('Year is required')
        .isInt({ min: 2000, max: 2030 })
        .withMessage('Year must be between 2000 and 2030'),
    
    body('examType')
        .notEmpty()
        .withMessage('Exam type is required')
        .trim()
        .toLowerCase()
        .isIn(['prelims', 'mains', 'optional'])
        .withMessage('Exam type must be prelims, mains, or optional'),
    
    body('subject')
        .notEmpty()
        .withMessage('Subject is required')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Subject must be between 1 and 100 characters'),
    
    body('topic')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Topic cannot exceed 100 characters'),
    
    body('subTopic')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Sub-topic cannot exceed 100 characters'),
    
    body('questionText')
        .notEmpty()
        .withMessage('Question text is required')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Question text must be between 10 and 5000 characters'),
    
    body('answerText')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('Answer text cannot exceed 10000 characters'),
    
    body('explanation')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Explanation cannot exceed 5000 characters'),
    
    body('difficulty')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Difficulty must be easy, medium, or hard'),
    
    body('marks')
        .optional()
        .isInt({ min: 0, max: 250 })
        .withMessage('Marks must be between 0 and 250'),
    
    body('paperNumber')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Paper number cannot exceed 10 characters'),
    
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array'),
    
    handleValidationErrors
];

// ==================== UPDATE QUESTION VALIDATION ====================
const validateUpdateQuestion = [
    param('id')
        .notEmpty()
        .withMessage('Question ID is required')
        .isMongoId()
        .withMessage('Invalid question ID'),
    
    body('year')
        .optional()
        .isInt({ min: 2000, max: 2030 })
        .withMessage('Year must be between 2000 and 2030'),
    
    body('examType')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['prelims', 'mains', 'optional'])
        .withMessage('Exam type must be prelims, mains, or optional'),
    
    body('subject')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Subject must be between 1 and 100 characters'),
    
    body('questionText')
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Question text must be between 10 and 5000 characters'),
    
    body('answerText')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('Answer text cannot exceed 10000 characters'),
    
    body('difficulty')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['easy', 'medium', 'hard'])
        .withMessage('Difficulty must be easy, medium, or hard'),
    
    body('marks')
        .optional()
        .isInt({ min: 0, max: 250 })
        .withMessage('Marks must be between 0 and 250'),
    
    handleValidationErrors
];

// ==================== DELETE QUESTION VALIDATION ====================
const validateQuestionId = [
    param('id')
        .notEmpty()
        .withMessage('Question ID is required')
        .isMongoId()
        .withMessage('Invalid question ID'),
    
    handleValidationErrors
];

// ==================== BULK DELETE VALIDATION ====================
const validateBulkDelete = [
    body('ids')
        .notEmpty()
        .withMessage('IDs array is required')
        .isArray({ min: 1, max: 100 })
        .withMessage('IDs must be an array with 1-100 items'),
    
    body('ids.*')
        .isMongoId()
        .withMessage('Each ID must be a valid MongoDB ID'),
    
    handleValidationErrors
];

// ==================== CONFIRM IMPORT VALIDATION ====================
const validateConfirmImport = [
    body('tempFileName')
        .notEmpty()
        .withMessage('Temp file name is required')
        .trim()
        .matches(/^temp_\d+_.+\.json$/)
        .withMessage('Invalid temp file name format'),
    
    handleValidationErrors
];

// ==================== RANDOM QUESTION VALIDATION ====================
const validateRandomQuestion = [
    query('examType')
        .optional()
        .trim()
        .toLowerCase()
        .isIn(['prelims', 'mains', 'optional'])
        .withMessage('Exam type must be prelims, mains, or optional'),
    
    query('subject')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid subject'),
    
    query('year')
        .optional()
        .isInt({ min: 2000, max: 2030 })
        .withMessage('Year must be between 2000 and 2030'),
    
    handleValidationErrors
];

// ==================== BULK UPDATE VALIDATION ====================
const validateBulkUpdate = [
    body('ids')
        .notEmpty()
        .withMessage('IDs array is required')
        .isArray({ min: 1, max: 100 })
        .withMessage('IDs must be an array with 1-100 items'),
    
    body('ids.*')
        .isMongoId()
        .withMessage('Each ID must be a valid MongoDB ID'),
    
    body('updateData')
        .notEmpty()
        .withMessage('Update data is required')
        .isObject()
        .withMessage('Update data must be an object'),
    
    handleValidationErrors
];

// ==================== CHECK DUPLICATE VALIDATION ====================
const validateCheckDuplicate = [
    body('questionText')
        .notEmpty()
        .withMessage('Question text is required')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Question text must be between 10 and 5000 characters'),
    
    body('year')
        .notEmpty()
        .withMessage('Year is required')
        .isInt({ min: 2000, max: 2030 })
        .withMessage('Year must be between 2000 and 2030'),
    
    body('examType')
        .notEmpty()
        .withMessage('Exam type is required')
        .trim()
        .toLowerCase()
        .isIn(['prelims', 'mains', 'optional'])
        .withMessage('Exam type must be prelims, mains, or optional'),
    
    handleValidationErrors
];

// ==================== EXPORT ====================
module.exports = {
    validateSearch,
    validateCreateQuestion,
    validateUpdateQuestion,
    validateQuestionId,
    validateBulkDelete,
    validateConfirmImport,
    validateRandomQuestion,
    validateBulkUpdate,
    validateCheckDuplicate,
    handleValidationErrors
};
