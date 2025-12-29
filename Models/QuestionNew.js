const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ==========================================
// SIMPLIFIED QUESTION SCHEMA (MARKDOWN-BASED)
// ==========================================
// Supports ALL 10 question types through markdown formatting
// No complex nested structures - easier admin entry and rendering
// ==========================================

const questionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        default: () => `Q-${Date.now()}-${uuidv4().substring(0, 8)}`,
        unique: true,
        required: true,
        index: true
    },
    
    // ========== BASIC METADATA ==========
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be 2000 or later'],
        max: [2035, 'Year cannot exceed 2035'],
        index: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        index: true
    },
    topic: {
        type: String,
        trim: true,
        index: true
    },
    subTopic: {
        type: String,
        trim: true
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
    examName: {
        type: String,
        required: [true, 'Exam name is required'],
        trim: true,
        index: true
    },
    
    // ========== QUESTION CONTENT (FLEXIBLE MARKDOWN) ==========
    // Supports: markdown tables, bold, italic, lists, line breaks
    // Handles all 10 question types through formatting
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [15000, 'Question text cannot exceed 15000 characters']
    },
    
    // Question images (uploaded separately)
    questionImages: [{
        url: String,
        caption: String,
        publicId: String
    }],
    
    // ========== OPTIONS (SIMPLE MAP STRUCTURE) ==========
    // Example: { "A": "Option A text", "B": "Option B text", "C": "...", "D": "..." }
    // Can have 2-6 options (A, B, C, D, E, F)
    options: {
        type: Map,
        of: String,
        required: [true, 'Options are required']
    },
    
    // ========== ANSWER & EXPLANATION ==========
    // Can be: "A", "B", "C", "D" for MCQ
    // Or: "1, 2 and 3" for multiple statements
    // Or: "a-1 b-2 c-3 d-4" for matching
    // Or: any custom format
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        trim: true
    },
    
    // Supports markdown formatting
    explanation: {
        type: String,
        trim: true,
        maxlength: [10000, 'Explanation cannot exceed 10000 characters']
    },
    
    explanationImages: [{
        url: String,
        caption: String,
        publicId: String
    }],
    
    explanationVideos: [{
        url: String,
        thumbnailUrl: String,
        title: String,
        duration: Number,
        publicId: String
    }],
    
    // ========== ADDITIONAL METADATA ==========
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    marks: {
        type: Number,
        min: 0.5,
        max: 10,
        default: 2
    },
    negativeMarks: {
        type: Number,
        default: 0.66,
        min: 0
    },
    
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    
    // ========== STATUS & VERIFICATION ==========
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published',
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    
    // ========== ANALYTICS ==========
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    attemptCount: {
        type: Number,
        default: 0,
        min: 0
    },
    successRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // ========== ADMIN TRACKING ==========
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// ================== INDEXES ==================

// Text index for full-text search
questionSchema.index({
    questionText: 'text',
    explanation: 'text',
    tags: 'text'
}, {
    weights: {
        questionText: 10,
        tags: 5,
        explanation: 3
    },
    name: 'question_fulltext_search'
});

// Compound indexes for common query patterns
questionSchema.index({ year: 1, examType: 1, subject: 1 }, { name: 'year_exam_subject' });
questionSchema.index({ examType: 1, examName: 1, year: -1 }, { name: 'exam_name_year' });
questionSchema.index({ subject: 1, topic: 1 }, { name: 'subject_topic' });
questionSchema.index({ difficulty: 1, year: -1 }, { name: 'difficulty_year' });
questionSchema.index({ status: 1, isVerified: 1 }, { name: 'status_verified' });

// ================== VALIDATION ==================

// Validate options have at least 2 entries
questionSchema.pre('save', function(next) {
    if (this.options) {
        const optionsCount = Object.keys(this.options.toObject()).length;
        if (optionsCount < 2) {
            return next(new Error('At least 2 options are required'));
        }
    }
    next();
});

// ================== INSTANCE METHODS ==================

// Increment view count
questionSchema.methods.incrementViewCount = async function() {
    this.viewCount += 1;
    await this.save();
};

// Record attempt
questionSchema.methods.recordAttempt = async function(isCorrect) {
    this.attemptCount += 1;
    if (isCorrect) {
        const newSuccessRate = ((this.successRate * (this.attemptCount - 1)) + (isCorrect ? 100 : 0)) / this.attemptCount;
        this.successRate = Math.round(newSuccessRate);
    }
    await this.save();
};

// ================== STATIC METHODS ==================

// Get questions by filters
questionSchema.statics.findByFilters = async function(filters = {}) {
    const query = { status: 'published' };
    
    if (filters.year) query.year = filters.year;
    if (filters.examType) query.examType = filters.examType;
    if (filters.examName) query.examName = new RegExp(filters.examName, 'i');
    if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
    
    return this.find(query).sort({ year: -1, createdAt: -1 });
};

// Text search
questionSchema.statics.searchQuestions = async function(searchTerm, filters = {}) {
    const query = {
        $text: { $search: searchTerm },
        status: 'published'
    };
    
    if (filters.year) query.year = filters.year;
    if (filters.examType) query.examType = filters.examType;
    if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
    
    return this.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, year: -1 });
};

// Get statistics
questionSchema.statics.getStatistics = async function() {
    return {
        total: await this.countDocuments({ status: 'published' }),
        verified: await this.countDocuments({ status: 'published', isVerified: true }),
        byYear: await this.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]),
        byExamType: await this.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$examType', count: { $sum: 1 } } }
        ]),
        bySubject: await this.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    };
};

module.exports = mongoose.model('questions-v2', questionSchema);
