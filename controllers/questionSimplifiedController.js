const QuestionSimplified = require('../Models/QuestionSimplified');
const { successResponse, errorResponse } = require('../responsecode/response');

// ================== CREATE QUESTION ==================
const createQuestion = async (req, res) => {
    try {
        const questionData = req.body;
        
        // Convert options object to Map if needed
        if (questionData.options && typeof questionData.options === 'object' && !questionData.options instanceof Map) {
            questionData.options = new Map(Object.entries(questionData.options));
        }
        
        // Set createdBy
        questionData.createdBy = req.user.userId;
        
        // Create question
        const question = new QuestionSimplified(questionData);
        await question.save();
        
        return successResponse(res, 'Question created successfully', { question }, 201);
        
    } catch (error) {
        console.error('Create question error:', error);
        
        if (error.code === 11000) {
            return errorResponse(res, 'Question with this ID already exists', 400);
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return errorResponse(res, `Validation error: ${errors.join(', ')}`, 400);
        }
        
        return errorResponse(res, 'Failed to create question', 500);
    }
};

// ================== GET ALL QUESTIONS (ADMIN) ==================
const getAllQuestions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            year,
            examType,
            examName,
            subject,
            topic,
            difficulty,
            isVerified,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        // Build filter query
        const filter = {};
        
        if (year) filter.year = parseInt(year);
        if (examType) filter.examType = examType.toLowerCase();
        if (examName) filter.examName = new RegExp(examName, 'i');
        if (subject) filter.subject = new RegExp(subject, 'i');
        if (topic) filter.topic = new RegExp(topic, 'i');
        if (difficulty) filter.difficulty = difficulty.toLowerCase();
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        
        // Execute query
        const [questions, total] = await Promise.all([
            QuestionSimplified.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            QuestionSimplified.countDocuments(filter)
        ]);
        
        return successResponse(res, 'Questions retrieved successfully', {
            questions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalQuestions: total,
                questionsPerPage: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Get all questions error:', error);
        return errorResponse(res, 'Failed to fetch questions', 500);
    }
};

// ================== GET SINGLE QUESTION ==================
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionSimplified.findById(id);
        
        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }
        
        return successResponse(res, 'Question retrieved successfully', { question });
        
    } catch (error) {
        console.error('Get question by ID error:', error);
        return errorResponse(res, 'Failed to fetch question', 500);
    }
};

// ================== UPDATE QUESTION ==================
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Convert options object to Map if needed
        if (updateData.options && typeof updateData.options === 'object' && !updateData.options instanceof Map) {
            updateData.options = new Map(Object.entries(updateData.options));
        }
        
        // Set updatedBy
        updateData.updatedBy = req.user.userId;
        
        // Find and update
        const question = await QuestionSimplified.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }
        
        return successResponse(res, {
            message: 'Question updated successfully',
            question
        });
        
    } catch (error) {
        console.error('Update question error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return errorResponse(res, `Validation error: ${errors.join(', ')}`, 400);
        }
        
        return errorResponse(res, 'Failed to update question', 500);
    }
};

// ================== DELETE QUESTION (SOFT DELETE) ==================
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false } = req.query;
        
        if (permanent === 'true') {
            // Permanent delete (only super admin should have this access)
            const question = await QuestionSimplified.findByIdAndDelete(id);
            
            if (!question) {
                return errorResponse(res, 'Question not found', 404);
            }
            
            return successResponse(res, {
                message: 'Question permanently deleted'
            });
        } else {
            // Soft delete
            const question = await QuestionSimplified.findByIdAndUpdate(
                id,
                { 
                    isActive: false,
                    updatedBy: req.user.userId
                },
                { new: true }
            );
            
            if (!question) {
                return errorResponse(res, 'Question not found', 404);
            }
            
            return successResponse(res, {
                message: 'Question deactivated successfully',
                question
            });
        }
        
    } catch (error) {
        console.error('Delete question error:', error);
        return errorResponse(res, 'Failed to delete question', 500);
    }
};

// ================== BULK CREATE QUESTIONS ==================
const bulkCreateQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
        
        if (!Array.isArray(questions) || questions.length === 0) {
            return errorResponse(res, 'Please provide an array of questions', 400);
        }
        
        if (questions.length > 100) {
            return errorResponse(res, 'Maximum 100 questions can be created at once', 400);
        }
        
        // Add createdBy to all questions and convert options
        const questionsToCreate = questions.map(q => {
            if (q.options && typeof q.options === 'object' && !q.options instanceof Map) {
                q.options = new Map(Object.entries(q.options));
            }
            return {
                ...q,
                createdBy: req.user.userId
            };
        });
        
        // Insert all questions
        const createdQuestions = await QuestionSimplified.insertMany(questionsToCreate);
        
        return successResponse(res, {
            message: `Successfully created ${createdQuestions.length} questions`,
            count: createdQuestions.length,
            questions: createdQuestions
        }, 201);
        
    } catch (error) {
        console.error('Bulk create questions error:', error);
        return errorResponse(res, 'Failed to create questions', 500);
    }
};

// ================== TOGGLE VERIFICATION STATUS ==================
const toggleVerification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionSimplified.findById(id);
        
        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }
        
        question.isVerified = !question.isVerified;
        question.updatedBy = req.user.userId;
        await question.save();
        
        return successResponse(res, {
            message: `Question ${question.isVerified ? 'verified' : 'unverified'} successfully`,
            question
        });
        
    } catch (error) {
        console.error('Toggle verification error:', error);
        return errorResponse(res, 'Failed to update verification status', 500);
    }
};

// ================== GET STATISTICS ==================
const getQuestionStatistics = async (req, res) => {
    try {
        const stats = await QuestionSimplified.getStatistics();
        
        return successResponse(res, {
            statistics: stats
        });
        
    } catch (error) {
        console.error('Get statistics error:', error);
        return errorResponse(res, 'Failed to fetch statistics', 500);
    }
};

// ================== DUPLICATE QUESTION ==================
const duplicateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const originalQuestion = await QuestionSimplified.findById(id);
        
        if (!originalQuestion) {
            return errorResponse(res, 'Question not found', 404);
        }
        
        // Create duplicate
        const duplicateData = originalQuestion.toObject();
        delete duplicateData._id;
        delete duplicateData.questionId;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        delete duplicateData.__v;
        
        duplicateData.createdBy = req.user.userId;
        duplicateData.isVerified = false;  // Duplicates should be re-verified
        
        const duplicateQuestion = new QuestionSimplified(duplicateData);
        await duplicateQuestion.save();
        
        return successResponse(res, {
            message: 'Question duplicated successfully',
            question: duplicateQuestion
        }, 201);
        
    } catch (error) {
        console.error('Duplicate question error:', error);
        return errorResponse(res, 'Failed to duplicate question', 500);
    }
};

// ================== SEARCH QUESTIONS ==================
const searchQuestions = async (req, res) => {
    try {
        const { 
            q,  // search query
            year,
            examType,
            subject,
            page = 1,
            limit = 20
        } = req.query;
        
        if (!q || q.trim().length === 0) {
            return errorResponse(res, 'Search query is required', 400);
        }
        
        const filters = {};
        if (year) filters.year = parseInt(year);
        if (examType) filters.examType = examType;
        if (subject) filters.subject = subject;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let questions = [];
        let total = 0;
        let searchMethod = 'regex';
        
        // Create a smarter regex that matches word variations
        // If search term ends with common suffixes, remove them to match variations
        let searchPattern = q;
        const suffixesToRemove = ['ure', 'ural', 'al', 'ion', 'ment', 'ly'];
        
        // Check if the word might have variations (e.g., agriculture -> agricult)
        for (const suffix of suffixesToRemove) {
            if (q.toLowerCase().endsWith(suffix) && q.length > suffix.length + 3) {
                // Create a pattern that matches the root word
                searchPattern = q.substring(0, q.length - suffix.length);
                console.log(`Smart search: "${q}" → using root pattern "${searchPattern}" to match variations`);
                break;
            }
        }
        
        // Use regex search (works for partial and full matching)
        const query = {
            isActive: true,
            $or: [
                { questionText: new RegExp(searchPattern, 'i') },
                { explanation: new RegExp(searchPattern, 'i') },
                { subject: new RegExp(searchPattern, 'i') },
                { topic: new RegExp(searchPattern, 'i') },
                { examName: new RegExp(searchPattern, 'i') },
                { tags: { $in: [new RegExp(searchPattern, 'i')] } },
                { keywords: { $in: [new RegExp(searchPattern, 'i')] } }
            ]
        };
        
        if (filters.year) query.year = filters.year;
        if (filters.examType) query.examType = filters.examType;
        if (filters.subject && !query.subject) query.subject = new RegExp(filters.subject, 'i');
        
        // Debug: Check total questions with the word before filtering
        const debugAll = await QuestionSimplified.find({
            isActive: true,
            $or: [
                { questionText: new RegExp(q, 'i') },
                { topic: new RegExp(q, 'i') }
            ]
        }).select('questionId topic questionText');
        
        console.log(`Debug: Found ${debugAll.length} total questions with "${q}"`);
        debugAll.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.questionId} - Topic: ${item.topic}`);
            console.log(`     QuestionText: ${item.questionText?.substring(0, 150)}`);
        });
        
        const [results, count] = await Promise.all([
            QuestionSimplified.find(query)
                .sort({ year: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            QuestionSimplified.countDocuments(query)
        ]);
        
        questions = results;
        total = count;
        console.log('✓ Regex search found', total, 'results for query:', q);
        
        // Debug: Show what fields matched
        questions.forEach((q, idx) => {
            console.log(`Question ${idx + 1} (${q.questionId}):`);
            console.log('  - Topic:', q.topic);
            console.log('  - Subject:', q.subject);
            console.log('  - QuestionText preview:', q.questionText?.substring(0, 100));
            console.log('  - Tags:', q.tags);
            console.log('  - Keywords:', q.keywords);
        });
        
        return successResponse(res, 'Search results retrieved successfully', {
            questions,
            searchMethod,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalQuestions: total,
                questionsPerPage: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Search questions error:', error);
        console.error('Error stack:', error.stack);
        return errorResponse(res, 'Failed to search questions: ' + error.message, 500);
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    bulkCreateQuestions,
    toggleVerification,
    getQuestionStatistics,
    duplicateQuestion,
    searchQuestions
};
