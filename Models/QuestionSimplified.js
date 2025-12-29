const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const questionSimplifiedSchema = new mongoose.Schema({
    questionId: {
        type: String,
        default: () => `Q-${Date.now()}-${uuidv4().substring(0, 8)}`,
        unique: true,
        required: true,
        index: true
    },
    
    // ========== METADATA ==========
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
            values: ['prelims', 'mains'],
            message: '{VALUE} is not a valid exam type'
        },
        lowercase: true,
        index: true
    },
    examName: {
        type: String,
        required: [true, 'Exam name is required'],
        trim: true
    },
    
    // ========== QUESTION CONTENT (RICH TEXT / MARKDOWN) ==========
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [15000, 'Question text cannot exceed 15000 characters']
        // Supports: markdown tables, formatting, line breaks
        // Example: "Match the following:\n\n| Day | Event |\n|-----|-------|\n| a) 3 March | 1) World Wildlife Day |"
    },
    
    // ========== OPTIONS (SIMPLE KEY-VALUE) ==========
    options: {
        type: Map,
        of: String,
        required: [true, 'Options are required']
        // Example: { "A": "a-1 b-2 c-3 d-4", "B": "a-2 b-3 c-4 d-1", "C": "...", "D": "..." }
    },
    
    // ========== CORRECT ANSWER ==========
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        trim: true
        // Can be: "A", "B", "C", "D" or "1, 2 and 3" or "a-1 b-2 c-3 d-4"
    },
    
    // ========== EXPLANATION (RICH TEXT / MARKDOWN) ==========
    explanation: {
        type: String,
        trim: true,
        maxlength: [10000, 'Explanation cannot exceed 10000 characters']
    },
    
    // ========== MEDIA SUPPORT ==========
    questionImages: [{
        type: String  // Cloudinary URLs
    }],
    explanationImages: [{
        type: String
    }],
    explanationVideos: [{
        url: String,
        thumbnailUrl: String,
        title: String,
        duration: Number,  // in seconds
        publicId: String   // Cloudinary public_id for deletion
    }],
    
    // ========== ADDITIONAL METADATA ==========
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        lowercase: true,
        default: 'medium'
    },
    marks: {
        type: Number,
        min: 0,
        max: 250,
        default: 1
    },
    paperNumber: {
        type: String,
        trim: true  // e.g., "Paper-I", "GS1", "GS2"
    },
    sourceDocument: {
        type: String  // e.g., "General Studies Paper-I (T.B.C.: CSP-24/1)"
    },
    questionNumber: {
        type: Number  // Original question number in the paper
    },
    
    // ========== TAGS & KEYWORDS FOR SEARCH ==========
    tags: [{
        type: String,
        lowercase: true
    }],
    keywords: [{
        type: String,
        lowercase: true
    }],
    
    // ========== SEARCH OPTIMIZATION ==========
    searchableText: {
        type: String,
        lowercase: true
    },
    
    // ========== STATUS FLAGS ==========
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    
    // ========== ENGAGEMENT METRICS ==========
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
    correctAttemptCount: {
        type: Number,
        default: 0,
        min: 0
    },
    bookmarkCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // ========== ADMIN TRACKING ==========
    createdBy: {
        type: String,
        ref: 'user-new'
    },
    updatedBy: {
        type: String,
        ref: 'user-new'
    }
}, {
    timestamps: true
});

// ================== INDEXES ==================

// Text index for full-text search
questionSimplifiedSchema.index({
    questionText: 'text',
    explanation: 'text',
    keywords: 'text',
    tags: 'text'
}, {
    weights: {
        questionText: 10,
        keywords: 7,
        tags: 5,
        explanation: 3
    },
    name: 'question_fulltext_search'
});

// Compound indexes for common query patterns
questionSimplifiedSchema.index({ year: 1, examType: 1, subject: 1 }, { name: 'year_exam_subject' });
questionSimplifiedSchema.index({ examType: 1, examName: 1, year: -1 }, { name: 'exam_name_year' });
questionSimplifiedSchema.index({ subject: 1, topic: 1 }, { name: 'subject_topic' });
questionSimplifiedSchema.index({ year: -1, isActive: 1, isVerified: 1 }, { name: 'year_active_verified' });

// ================== MIDDLEWARE ==================

// Pre-save middleware to generate searchable text
questionSimplifiedSchema.pre('save', function(next) {
    const searchParts = [
        this.questionText,
        this.explanation,
        this.subject,
        this.topic,
        this.subTopic,
        this.examName,
        ...this.tags,
        ...this.keywords
    ].filter(Boolean);
    
    // Add option values to searchable text
    if (this.options) {
        this.options.forEach((value, key) => {
            searchParts.push(value);
        });
    }
    
    this.searchableText = searchParts
        .join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    next();
});

// ================== INSTANCE METHODS ==================

// Increment view count
questionSimplifiedSchema.methods.incrementViewCount = async function() {
    this.viewCount += 1;
    await this.save();
};

// Record attempt
questionSimplifiedSchema.methods.recordAttempt = async function(isCorrect) {
    this.attemptCount += 1;
    if (isCorrect) {
        this.correctAttemptCount += 1;
    }
    await this.save();
};

// Toggle bookmark
questionSimplifiedSchema.methods.toggleBookmark = async function(increment = true) {
    if (increment) {
        this.bookmarkCount += 1;
    } else if (this.bookmarkCount > 0) {
        this.bookmarkCount -= 1;
    }
    await this.save();
};

// Get success rate
questionSimplifiedSchema.methods.getSuccessRate = function() {
    if (this.attemptCount === 0) return 0;
    return (this.correctAttemptCount / this.attemptCount * 100).toFixed(2);
};

// ================== STATIC METHODS ==================

// Get questions by filters
questionSimplifiedSchema.statics.findByFilters = async function(filters = {}) {
    const query = { isActive: true };
    
    if (filters.year) query.year = filters.year;
    if (filters.examType) query.examType = filters.examType;
    if (filters.examName) query.examName = new RegExp(filters.examName, 'i');
    if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
    
    return this.find(query).sort({ year: -1, createdAt: -1 });
};

// Text search with Atlas Search (supports partial matching)
questionSimplifiedSchema.statics.searchQuestions = function(searchTerm, filters = {}) {
    // Build the Atlas Search query
    const searchQuery = {
        index: 'questions_search_index', // Name of the Atlas Search index
        compound: {
            should: [
                {
                    autocomplete: {
                        query: searchTerm,
                        path: 'questionText',
                        score: { boost: { value: 10 } }
                    }
                },
                {
                    autocomplete: {
                        query: searchTerm,
                        path: 'subject',
                        score: { boost: { value: 7 } }
                    }
                },
                {
                    autocomplete: {
                        query: searchTerm,
                        path: 'topic',
                        score: { boost: { value: 5 } }
                    }
                },
                {
                    text: {
                        query: searchTerm,
                        path: 'explanation',
                        score: { boost: { value: 3 } }
                    }
                }
            ],
            must: []
        }
    };
    
    // Add filters to the must clause
    if (filters.year) {
        searchQuery.compound.must.push({
            equals: { path: 'year', value: filters.year }
        });
    }
    
    if (filters.examType) {
        searchQuery.compound.must.push({
            equals: { path: 'examType', value: filters.examType }
        });
    }
    
    if (filters.subject) {
        searchQuery.compound.must.push({
            regex: { path: 'subject', query: filters.subject, allowAnalyzedField: true }
        });
    }
    
    // Always filter by isActive
    searchQuery.compound.must.push({
        equals: { path: 'isActive', value: true }
    });
    
    return this.aggregate([
        { $search: searchQuery },
        { $addFields: { score: { $meta: 'searchScore' } } },
        { $sort: { score: -1, year: -1 } }
    ]);
};

// Get statistics
questionSimplifiedSchema.statics.getStatistics = async function() {
    return {
        total: await this.countDocuments({ isActive: true }),
        verified: await this.countDocuments({ isActive: true, isVerified: true }),
        byYear: await this.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]),
        byExamType: await this.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$examType', count: { $sum: 1 } } }
        ]),
        bySubject: await this.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        byDifficulty: await this.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ])
    };
};

module.exports = mongoose.model('questions-simplified', questionSimplifiedSchema);
