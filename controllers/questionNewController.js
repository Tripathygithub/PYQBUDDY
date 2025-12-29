const QuestionNew = require('../Models/QuestionNew');
const Response = require('../responsecode/response');

// ==========================================
// SIMPLIFIED QUESTION CONTROLLER
// ==========================================
// No complex type-specific validation
// Markdown-based flexible schema
// ==========================================

// Create a new question
exports.createQuestion = async (req, res) => {
    try {
        const questionData = req.body;
        
        // Basic validation
        if (!questionData.questionText || !questionData.options || !questionData.correctAnswer) {
            return Response.errorResponseData(
                res,
                'Question text, options, and correct answer are required',
                400
            );
        }
        
        // Validate options Map structure
        if (typeof questionData.options !== 'object' || Array.isArray(questionData.options)) {
            return Response.errorResponseData(
                res,
                'Options must be an object with keys like A, B, C, D',
                400
            );
        }
        
        const optionsCount = Object.keys(questionData.options).length;
        if (optionsCount < 2) {
            return Response.errorResponseData(
                res,
                'At least 2 options are required',
                400
            );
        }
        
        // Add createdBy from authenticated user
        if (req.user) {
            questionData.createdBy = req.user._id;
        }
        
        const question = new QuestionNew(questionData);
        await question.save();
        
        return Response.successResponseData(
            res,
            question,
            201,
            'Question created successfully'
        );
    } catch (error) {
        console.error('Create question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to create question',
            500
        );
    }
};

// Get all questions with filters
exports.getAllQuestions = async (req, res) => {
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
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let questions;
        let totalCount;
        
        if (search) {
            // Text search
            questions = await QuestionNew.searchQuestions(search, {
                year,
                examType,
                subject
            })
            .limit(parseInt(limit))
            .skip(skip);
            
            totalCount = await QuestionNew.find({
                $text: { $search: search },
                status: 'published'
            }).countDocuments();
        } else {
            // Filter-based query
            const filters = {};
            if (year) filters.year = parseInt(year);
            if (examType) filters.examType = examType;
            if (examName) filters.examName = examName;
            if (subject) filters.subject = subject;
            if (topic) filters.topic = topic;
            if (difficulty) filters.difficulty = difficulty;
            if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
            filters.status = 'published';
            
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            
            questions = await QuestionNew.find(filters)
                .sort(sortOptions)
                .limit(parseInt(limit))
                .skip(skip)
                .select('-__v');
            
            totalCount = await QuestionNew.countDocuments(filters);
        }
        
        return Response.successResponseData(
            res,
            {
                questions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalQuestions: totalCount,
                    questionsPerPage: parseInt(limit)
                }
            },
            200,
            'Questions fetched successfully'
        );
    } catch (error) {
        console.error('Get questions error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to fetch questions',
            500
        );
    }
};

// Get single question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionNew.findOne({
            $or: [{ _id: id }, { questionId: id }]
        }).select('-__v');
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        // Increment view count (async, no need to wait)
        question.incrementViewCount().catch(err => 
            console.error('Failed to increment view count:', err)
        );
        
        return Response.successResponseData(
            res,
            question,
            200,
            'Question fetched successfully'
        );
    } catch (error) {
        console.error('Get question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to fetch question',
            500
        );
    }
};

// Update question
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Remove fields that shouldn't be updated directly
        delete updateData.questionId;
        delete updateData.createdBy;
        delete updateData.createdAt;
        delete updateData.viewCount;
        delete updateData.attemptCount;
        delete updateData.successRate;
        
        // Add lastModifiedBy
        if (req.user) {
            updateData.lastModifiedBy = req.user._id;
        }
        
        const question = await QuestionNew.findOneAndUpdate(
            { $or: [{ _id: id }, { questionId: id }] },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        return Response.successResponseData(
            res,
            question,
            200,
            'Question updated successfully'
        );
    } catch (error) {
        console.error('Update question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to update question',
            500
        );
    }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionNew.findOneAndDelete({
            $or: [{ _id: id }, { questionId: id }]
        });
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        return Response.successResponseData(
            res,
            { questionId: question.questionId },
            200,
            'Question deleted successfully'
        );
    } catch (error) {
        console.error('Delete question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to delete question',
            500
        );
    }
};

// Soft delete (archive) question
exports.archiveQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionNew.findOneAndUpdate(
            { $or: [{ _id: id }, { questionId: id }] },
            { status: 'archived' },
            { new: true }
        );
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        return Response.successResponseData(
            res,
            question,
            200,
            'Question archived successfully'
        );
    } catch (error) {
        console.error('Archive question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to archive question',
            500
        );
    }
};

// Bulk create questions
exports.bulkCreateQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
        
        if (!Array.isArray(questions) || questions.length === 0) {
            return Response.errorResponseData(
                res,
                'Questions array is required',
                400
            );
        }
        
        // Add createdBy to all questions
        const questionsWithUser = questions.map(q => ({
            ...q,
            createdBy: req.user?._id
        }));
        
        const createdQuestions = await QuestionNew.insertMany(questionsWithUser, {
            ordered: false
        });
        
        return Response.successResponseData(
            res,
            {
                created: createdQuestions.length,
                questions: createdQuestions
            },
            201,
            `${createdQuestions.length} questions created successfully`
        );
    } catch (error) {
        console.error('Bulk create error:', error);
        
        // Handle partial success in bulk insert
        if (error.writeErrors) {
            const successCount = error.result?.nInserted || 0;
            return Response.successResponseData(
                res,
                {
                    created: successCount,
                    failed: error.writeErrors.length,
                    errors: error.writeErrors.map(e => e.errmsg)
                },
                207,
                `${successCount} questions created, ${error.writeErrors.length} failed`
            );
        }
        
        return Response.errorResponseData(
            res,
            error.message || 'Failed to create questions',
            500
        );
    }
};

// Get question statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await QuestionNew.getStatistics();
        
        return Response.successResponseData(
            res,
            stats,
            200,
            'Statistics fetched successfully'
        );
    } catch (error) {
        console.error('Get statistics error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to fetch statistics',
            500
        );
    }
};

// Verify question (admin only)
exports.verifyQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await QuestionNew.findOneAndUpdate(
            { $or: [{ _id: id }, { questionId: id }] },
            {
                isVerified: true,
                verifiedBy: req.user?._id,
                verifiedAt: new Date()
            },
            { new: true }
        );
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        return Response.successResponseData(
            res,
            question,
            200,
            'Question verified successfully'
        );
    } catch (error) {
        console.error('Verify question error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to verify question',
            500
        );
    }
};

// Record user attempt
exports.recordAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCorrect } = req.body;
        
        const question = await QuestionNew.findOne({
            $or: [{ _id: id }, { questionId: id }]
        });
        
        if (!question) {
            return Response.errorResponseData(
                res,
                'Question not found',
                404
            );
        }
        
        await question.recordAttempt(isCorrect);
        
        return Response.successResponseData(
            res,
            {
                attemptCount: question.attemptCount,
                successRate: question.successRate
            },
            200,
            'Attempt recorded successfully'
        );
    } catch (error) {
        console.error('Record attempt error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to record attempt',
            500
        );
    }
};

// Get distinct values for filters
exports.getFilterOptions = async (req, res) => {
    try {
        const { field } = req.params;
        
        const allowedFields = ['year', 'examType', 'examName', 'subject', 'topic', 'difficulty'];
        
        if (!allowedFields.includes(field)) {
            return Response.errorResponseData(
                res,
                'Invalid filter field',
                400
            );
        }
        
        const values = await QuestionNew.distinct(field, { status: 'published' });
        
        return Response.successResponseData(
            res,
            values.sort(),
            200,
            'Filter options fetched successfully'
        );
    } catch (error) {
        console.error('Get filter options error:', error);
        return Response.errorResponseData(
            res,
            error.message || 'Failed to fetch filter options',
            500
        );
    }
};
