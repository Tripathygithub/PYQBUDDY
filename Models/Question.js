const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const questionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        default: () => `Q-${Date.now()}-${uuidv4().substring(0, 8)}`,
        unique: true,
        required: true,
        index: true
    },
    
    // Core Content
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [5000, 'Question text cannot exceed 5000 characters']
    },
    answerText: {
        type: String,
        trim: true,
        maxlength: [10000, 'Answer text cannot exceed 10000 characters']
    },
    explanation: {
        type: String,
        trim: true,
        maxlength: [5000, 'Explanation cannot exceed 5000 characters']
    },
    
    // Metadata - Required Fields
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be 2000 or later'],
        max: [2030, 'Year cannot exceed 2030'],
        index: true
    },
    examType: {
        type: String,
        required: [true, 'Exam type is required'],
        enum: {
            values: ['prelims', 'mains', 'optional'],
            message: '{VALUE} is not a valid exam type'
        },
        lowercase: true,
        index: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        index: true
    },
    
    // Additional Classification
    topic: {
        type: String,
        trim: true,
        index: true
    },
    subTopic: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        lowercase: true
    },
    marks: {
        type: Number,
        min: 0,
        max: 250
    },
    paperNumber: {
        type: String,
        trim: true  // e.g., "GS1", "GS2", "GS3", "GS4"
    },
    
    // Search Optimization Fields
    keywords: [{
        type: String,
        lowercase: true
    }],
    searchableText: {
        type: String,
        lowercase: true
    },
    
    // Metadata Flags
    hasAnswer: {
        type: Boolean,
        default: false,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Engagement Metrics
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    bookmarkCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Admin Tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Soft Delete
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// ================== INDEXES ==================

// Text index for full-text search
questionSchema.index({
    questionText: 'text',
    answerText: 'text',
    keywords: 'text'
}, {
    weights: {
        questionText: 10,
        keywords: 5,
        answerText: 3
    },
    name: 'question_text_search'
});

// Compound indexes for common filter combinations
questionSchema.index({ year: 1, examType: 1, subject: 1 }, { name: 'year_exam_subject' });
questionSchema.index({ examType: 1, subject: 1, topic: 1 }, { name: 'exam_subject_topic' });
questionSchema.index({ year: -1, isActive: 1 }, { name: 'year_active' });
questionSchema.index({ subject: 1, hasAnswer: 1 }, { name: 'subject_answer' });

// ================== MIDDLEWARE ==================

// Pre-save middleware to set hasAnswer and searchableText
questionSchema.pre('save', function(next) {
    // Set hasAnswer flag
    this.hasAnswer = !!(this.answerText && this.answerText.trim().length > 0);
    
    // Create searchable text (normalized version)
    const searchParts = [
        this.questionText,
        this.answerText,
        this.subject,
        this.topic,
        this.subTopic
    ].filter(Boolean);
    
    this.searchableText = searchParts
        .join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/gi, ' ')  // Remove special characters
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim();
    
    next();
});

// ================== INSTANCE METHODS ==================

// Increment view count
questionSchema.methods.incrementViewCount = async function() {
    this.viewCount += 1;
    await this.save();
};

// Increment bookmark count
questionSchema.methods.incrementBookmarkCount = async function() {
    this.bookmarkCount += 1;
    await this.save();
};

// Decrement bookmark count
questionSchema.methods.decrementBookmarkCount = async function() {
    if (this.bookmarkCount > 0) {
        this.bookmarkCount -= 1;
        await this.save();
    }
};

// Soft delete
questionSchema.methods.softDelete = async function() {
    this.isActive = false;
    await this.save();
};

// ================== STATIC METHODS ==================

// Search with filters
questionSchema.statics.searchQuestions = async function(filters, options = {}) {
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
    } = filters;
    
    const query = { isActive: true };
    
    // Text search
    if (keyword && keyword.trim()) {
        query.$text = { $search: keyword.trim() };
    }
    
    // Filters
    if (year && Array.isArray(year) && year.length > 0) {
        query.year = { $in: year.map(y => parseInt(y)) };
    }
    if (examType) {
        query.examType = examType.toLowerCase();
    }
    if (subject && Array.isArray(subject) && subject.length > 0) {
        query.subject = { $in: subject };
    }
    if (topic && Array.isArray(topic) && topic.length > 0) {
        query.topic = { $in: topic };
    }
    if (hasAnswer !== undefined) {
        query.hasAnswer = hasAnswer === 'true' || hasAnswer === true;
    }
    if (difficulty) {
        query.difficulty = difficulty.toLowerCase();
    }
    
    // Projection
    const projection = keyword && keyword.trim() 
        ? { score: { $meta: 'textScore' } }
        : {};
    
    // Sorting
    let sort = {};
    if (keyword && keyword.trim()) {
        sort = { score: { $meta: 'textScore' }, year: -1 };
    } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [questions, total] = await Promise.all([
        this.find(query, projection)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-searchableText -__v')
            .lean(),
        this.countDocuments(query)
    ]);
    
    return {
        questions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    };
};

// Get filter options dynamically
questionSchema.statics.getFilterOptions = async function() {
    const [years, examTypes, subjects, topics] = await Promise.all([
        this.distinct('year').sort({ _id: -1 }),
        this.distinct('examType'),
        this.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { name: '$_id', count: 1, _id: 0 } }
        ]),
        this.aggregate([
            { $match: { isActive: true, topic: { $exists: true, $ne: null } } },
            { $group: { _id: { subject: '$subject', topic: '$topic' } } },
            { $group: { _id: '$_id.subject', topics: { $push: '$_id.topic' } } },
            { $project: { subject: '$_id', topics: 1, _id: 0 } }
        ])
    ]);
    
    return {
        years: years.sort((a, b) => b - a),
        examTypes: examTypes.sort(),
        subjects: subjects,
        topics: topics.reduce((acc, item) => {
            acc[item.subject] = item.topics.sort();
            return acc;
        }, {})
    };
};

// Get statistics
questionSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        { $match: { isActive: true } },
        {
            $facet: {
                total: [{ $count: 'count' }],
                byYear: [
                    { $group: { _id: '$year', count: { $sum: 1 } } },
                    { $sort: { _id: -1 } }
                ],
                byExamType: [
                    { $group: { _id: '$examType', count: { $sum: 1 } } }
                ],
                bySubject: [
                    { $group: { _id: '$subject', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                withAnswers: [
                    { $match: { hasAnswer: true } },
                    { $count: 'count' }
                ],
                verified: [
                    { $match: { isVerified: true } },
                    { $count: 'count' }
                ]
            }
        }
    ]);
    
    return {
        total: stats[0].total[0]?.count || 0,
        byYear: stats[0].byYear,
        byExamType: stats[0].byExamType,
        bySubject: stats[0].bySubject,
        withAnswers: stats[0].withAnswers[0]?.count || 0,
        verified: stats[0].verified[0]?.count || 0
    };
};

// Bulk insert with validation
questionSchema.statics.bulkInsertQuestions = async function(questionsArray, createdBy) {
    const validQuestions = [];
    const errors = [];
    
    for (let i = 0; i < questionsArray.length; i++) {
        try {
            const question = new this({
                ...questionsArray[i],
                createdBy: createdBy
            });
            
            // Validate
            await question.validate();
            validQuestions.push(question);
        } catch (error) {
            errors.push({
                row: i + 1,
                data: questionsArray[i],
                error: error.message
            });
        }
    }
    
    // Insert valid questions
    let inserted = [];
    if (validQuestions.length > 0) {
        inserted = await this.insertMany(validQuestions, { ordered: false });
    }
    
    return {
        success: inserted.length,
        failed: errors.length,
        errors: errors
    };
};

// Remove __v from JSON response
questionSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.searchableText;
    return obj;
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
