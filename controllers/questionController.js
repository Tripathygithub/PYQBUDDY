const Question = require('../Models/Question');
const Subject = require('../Models/Subject');
const response = require('../responsecode/response');

// ==================== SEARCH QUESTIONS ====================
// GET /api/v1/questions/search
exports.searchQuestions = async (req, res) => {
    try {
        const {
            keyword,
            year,
            examType,
            subject,
            topic,
            hasAnswer,
            difficulty,
            page = 1,
            limit = 50,
            sortBy = 'year',
            sortOrder = 'desc'
        } = req.query;

        // Input sanitization
        const sanitizedKeyword = keyword ? keyword.trim().substring(0, 200) : '';

        // Parse array parameters
        const yearArray = year ? (Array.isArray(year) ? year : [year]) : null;
        const subjectArray = subject ? (Array.isArray(subject) ? subject : [subject]) : null;
        const topicArray = topic ? (Array.isArray(topic) ? topic : [topic]) : null;

        // Build filters object
        const filters = {
            keyword: sanitizedKeyword,
            year: yearArray,
            examType: examType?.toLowerCase(),
            subject: subjectArray,
            topic: topicArray,
            hasAnswer,
            difficulty: difficulty?.toLowerCase(),
            page: Math.max(1, parseInt(page) || 1),
            limit: Math.min(100, Math.max(1, parseInt(limit) || 50)),
            sortBy,
            sortOrder
        };

        // Use the static method from Question model
        const result = await Question.searchQuestions(filters);

        return response.successResponse(
            res,
            'Questions retrieved successfully',
            {
                questions: result.questions,
                pagination: result.pagination,
                filters: {
                    keyword: sanitizedKeyword,
                    year: yearArray,
                    examType,
                    subject: subjectArray,
                    topic: topicArray,
                    hasAnswer,
                    difficulty
                }
            }
        );

    } catch (error) {
        console.error('Search Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET SINGLE QUESTION ====================
// GET /api/v1/questions/:id
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findOne({ 
            _id: id, 
            isActive: true 
        })
        .select('-searchableText -__v')
        .lean();

        if (!question) {
            return response.notFoundResponse(res, 'Question not found');
        }

        // Increment view count (fire and forget)
        Question.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();

        return response.successResponse(
            res,
            'Question retrieved successfully',
            question
        );

    } catch (error) {
        console.error('Get Question Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET FILTER OPTIONS ====================
// GET /api/v1/questions/filters/options
exports.getFilterOptions = async (req, res) => {
    try {
        // Get filter options from Question model
        const filterOptions = await Question.getFilterOptions();

        // Get subjects from Subject model
        const subjects = await Subject.getActiveSubjects();

        return response.successResponse(
            res,
            'Filter options retrieved successfully',
            {
                years: filterOptions.years,
                examTypes: filterOptions.examTypes,
                subjects: subjects.map(s => ({
                    name: s.name,
                    code: s.code,
                    icon: s.icon,
                    topics: s.topics
                        .filter(t => t.isActive)
                        .map(t => ({
                            name: t.name,
                            code: t.code
                        }))
                })),
                difficulties: ['easy', 'medium', 'hard']
            }
        );

    } catch (error) {
        console.error('Get Filter Options Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET QUESTION STATISTICS ====================
// GET /api/v1/questions/statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Question.getStatistics();

        return response.successResponse(
            res,
            'Statistics retrieved successfully',
            stats
        );
 
    } catch (error) {
        console.error('Get Statistics Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET RANDOM QUESTION ====================
// GET /api/v1/questions/random
exports.getRandomQuestion = async (req, res) => {
    try {
        const { examType, subject, year } = req.query;

        const query = { isActive: true };
        if (examType) query.examType = examType.toLowerCase();
        if (subject) query.subject = subject;
        if (year) query.year = parseInt(year);

        const count = await Question.countDocuments(query);

        if (count === 0) {
            return response.notFoundResponse(res, 'No questions found');
        }

        const random = Math.floor(Math.random() * count);
        const question = await Question.findOne(query)
            .skip(random)
            .select('-searchableText -__v')
            .lean();

        // Increment view count
        Question.updateOne({ _id: question._id }, { $inc: { viewCount: 1 } }).exec();

        return response.successResponse(
            res,
            'Random question retrieved successfully',
            question
        );

    } catch (error) {
        console.error('Get Random Question Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== CREATE QUESTION (Admin) ====================
// POST /api/v1/admin/questions
exports.createQuestion = async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            createdBy: req.user.id
        };

        const question = new Question(questionData);
        await question.save();

        return response.successResponse(
            res,
            'Question created successfully',
            question,
            201
        );

    } catch (error) {
        console.error('Create Question Error:', error);
        if (error.name === 'ValidationError') {
            return response.validationErrorResponse(res, error);
        }
        return response.errorResponse(res, error.message);
    }
};

// ==================== UPDATE QUESTION (Admin) ====================
// PUT /api/v1/admin/questions/:id
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedBy: req.user.id
        };

        // Remove fields that shouldn't be updated directly
        delete updateData.questionId;
        delete updateData.createdBy;
        delete updateData.viewCount;
        delete updateData.bookmarkCount;

        const question = await Question.findOneAndUpdate(
            { _id: id, isActive: true },
            updateData,
            { new: true, runValidators: true }
        );

        if (!question) {
            return response.notFoundResponse(res, 'Question not found');
        }

        return response.successResponse(
            res,
            'Question updated successfully',
            question
        );

    } catch (error) {
        console.error('Update Question Error:', error);
        if (error.name === 'ValidationError') {
            return response.validationErrorResponse(res, error);
        }
        return response.errorResponse(res, error.message);
    }
};

// ==================== DELETE QUESTION (Admin - Soft Delete) ====================
// DELETE /api/v1/admin/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id);

        if (!question) {
            return response.notFoundResponse(res, 'Question not found');
        }

        // Soft delete
        question.isActive = false;
        question.updatedBy = req.user.id;
        await question.save();

        return response.successResponse(
            res,
            'Question deleted successfully',
            { id }
        );

    } catch (error) {
        console.error('Delete Question Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== BULK DELETE QUESTIONS (Admin) ====================
// POST /api/v1/admin/questions/bulk-delete
exports.bulkDeleteQuestions = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return response.errorResponse(res, 'Please provide an array of question IDs');
        }

        const result = await Question.updateMany(
            { _id: { $in: ids } },
            { 
                isActive: false,
                updatedBy: req.user.id
            }
        );

        return response.successResponse(
            res,
            'Questions deleted successfully',
            {
                deletedCount: result.modifiedCount
            }
        );

    } catch (error) {
        console.error('Bulk Delete Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== VERIFY QUESTION (Admin) ====================
// PATCH /api/v1/admin/questions/:id/verify
exports.verifyQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findOneAndUpdate(
            { _id: id, isActive: true },
            { 
                isVerified: true,
                updatedBy: req.user.id
            },
            { new: true }
        );

        if (!question) {
            return response.notFoundResponse(res, 'Question not found');
        }

        return response.successResponse(
            res,
            'Question verified successfully',
            question
        );

    } catch (error) {
        console.error('Verify Question Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET QUESTIONS WITHOUT ANSWERS (Admin) ====================
// GET /api/v1/admin/questions/without-answers
exports.getQuestionsWithoutAnswers = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [questions, total] = await Promise.all([
            Question.find({ isActive: true, hasAnswer: false })
                .select('-searchableText -__v')
                .sort({ year: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Question.countDocuments({ isActive: true, hasAnswer: false })
        ]);

        return response.successResponse(
            res,
            'Questions without answers retrieved successfully',
            {
                questions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        );

    } catch (error) {
        console.error('Get Questions Without Answers Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== SEED SUBJECTS (Admin - One-time) ====================
// POST /api/v1/admin/subjects/seed
exports.seedSubjects = async (req, res) => {
    try {
        const result = await Subject.seedSubjects();

        return response.successResponse(
            res,
            result.message,
            { count: result.count }
        );

    } catch (error) {
        console.error('Seed Subjects Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET ALL SUBJECTS ====================
// GET /api/v1/subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.getActiveSubjects();

        return response.successResponse(
            res,
            'Subjects retrieved successfully',
            subjects
        );

    } catch (error) {
        console.error('Get Subjects Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET TOPICS FOR SUBJECT ====================
// GET /api/v1/subjects/:name/topics
exports.getTopicsForSubject = async (req, res) => {
    try {
        const { name } = req.params;

        const topics = await Subject.getTopicsForSubject(name);

        return response.successResponse(
            res,
            'Topics retrieved successfully',
            topics
        );

    } catch (error) {
        console.error('Get Topics Error:', error);
        return response.errorResponse(res, error.message);
    }
};
