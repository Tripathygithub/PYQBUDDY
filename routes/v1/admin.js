const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const questionController = require('../../controllers/questionController');
const adminController = require('../../controllers/adminController');
const { adminLimiter, uploadLimiter } = require('../../service/rateLimiter');
const { 
    validateCreateQuestion,
    validateUpdateQuestion,
    validateQuestionId,
    validateBulkDelete,
    validateConfirmImport
} = require('../../service/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and Excel files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// ==================== QUESTION CRUD ROUTES ====================

// Create single question
// POST /api/v1/admin/questions
router.post('/questions', adminLimiter, validateCreateQuestion, questionController.createQuestion);

// Update question
// PUT /api/v1/admin/questions/:id
router.put('/questions/:id', adminLimiter, validateUpdateQuestion, questionController.updateQuestion);

// Delete question (soft delete)
// DELETE /api/v1/admin/questions/:id
router.delete('/questions/:id', adminLimiter, validateQuestionId, questionController.deleteQuestion);

// Bulk delete questions
// POST /api/v1/admin/questions/bulk-delete
router.post('/questions/bulk-delete', adminLimiter, validateBulkDelete, questionController.bulkDeleteQuestions);

// Verify question
// PATCH /api/v1/admin/questions/:id/verify
router.patch('/questions/:id/verify', adminLimiter, validateQuestionId, questionController.verifyQuestion);

// Get questions without answers
// GET /api/v1/admin/questions/without-answers
router.get('/questions/without-answers', questionController.getQuestionsWithoutAnswers);

// ==================== CSV/EXCEL UPLOAD ROUTES ====================

// Upload and validate CSV/Excel file
// POST /api/v1/admin/questions/upload-csv
router.post('/questions/upload-csv', uploadLimiter, upload.single('file'), adminController.uploadAndValidateCSV);

// Confirm and import validated questions
// POST /api/v1/admin/questions/confirm-import
router.post('/questions/confirm-import', adminLimiter, validateConfirmImport, adminController.confirmImport);

// Cancel import (cleanup temp files)
// POST /api/v1/admin/questions/cancel-import
router.post('/questions/cancel-import', adminController.cancelImport);

// Download CSV template
// GET /api/v1/admin/questions/download-template
router.get('/questions/download-template', adminController.downloadTemplate);

// Download Excel template
// GET /api/v1/admin/questions/download-template-excel
router.get('/questions/download-template-excel', adminController.downloadTemplateExcel);

// Get upload history
// GET /api/v1/admin/questions/upload-history
router.get('/questions/upload-history', adminController.getUploadHistory);

// ==================== SUBJECT MANAGEMENT ====================

// Seed subjects (one-time operation)
// POST /api/v1/admin/subjects/seed
router.post('/subjects/seed', questionController.seedSubjects);

module.exports = router;