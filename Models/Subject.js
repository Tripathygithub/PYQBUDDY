const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    },
    subTopics: [{
        type: String,
        trim: true
    }],
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        unique: true,
        trim: true,
        index: true
    },
    code: {
        type: String,
        required: [true, 'Subject code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true  // For future use (emoji or icon class)
    },
    topics: [topicSchema],
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Admin tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// ================== INDEXES ==================
subjectSchema.index({ name: 1, isActive: 1 });
subjectSchema.index({ displayOrder: 1 });

// ================== STATIC METHODS ==================

// Get all active subjects with topics
subjectSchema.statics.getActiveSubjects = async function() {
    return await this.find({ isActive: true })
        .select('-__v -createdAt -updatedAt')
        .sort({ displayOrder: 1, name: 1 })
        .lean();
};

// Get subject with topics by name
subjectSchema.statics.getSubjectByName = async function(name) {
    return await this.findOne({ name: name, isActive: true })
        .select('-__v')
        .lean();
};

// Get all topics for a subject
subjectSchema.statics.getTopicsForSubject = async function(subjectName) {
    const subject = await this.findOne({ name: subjectName, isActive: true })
        .select('topics')
        .lean();
    
    return subject ? subject.topics.filter(t => t.isActive) : [];
};

// Seed initial subjects (to be called once during setup)
subjectSchema.statics.seedSubjects = async function() {
    const subjects = [
        {
            name: 'Polity',
            code: 'POL',
            description: 'Indian Polity and Governance',
            icon: '🏛️',
            displayOrder: 1,
            topics: [
                { name: 'Constitution', code: 'CONST', displayOrder: 1, subTopics: ['Preamble', 'Fundamental Rights', 'DPSP', 'Fundamental Duties', 'Union Executive', 'Parliament', 'Judiciary', 'Centre-State Relations', 'Local Governance', 'Emergency Provisions', 'Constitutional Bodies', 'Constitutional Amendments'] },
                { name: 'Federalism', code: 'FED', displayOrder: 2, subTopics: ['Centre-State Relations', 'Inter-State Relations', 'Governor', 'State Legislature'] },
                { name: 'Parliament', code: 'PARL', displayOrder: 3, subTopics: ['Lok Sabha', 'Rajya Sabha', 'Parliamentary Committees', 'Budget Process', 'Question Hour'] },
                { name: 'Judiciary', code: 'JUD', displayOrder: 4, subTopics: ['Supreme Court', 'High Courts', 'Judicial Review', 'PIL', 'Judicial Activism'] },
                { name: 'Governance', code: 'GOV', displayOrder: 5, subTopics: ['E-Governance', 'Transparency', 'Accountability', 'Citizen Services', 'Right to Information'] },
                { name: 'Elections', code: 'ELEC', displayOrder: 6, subTopics: ['Election Commission', 'Electoral Reforms', 'Political Parties', 'Election Process'] }
            ]
        },
        {
            name: 'History',
            code: 'HIST',
            description: 'Ancient, Medieval and Modern History',
            icon: '📜',
            displayOrder: 2,
            topics: [
                { name: 'Ancient History', code: 'ANC', displayOrder: 1, subTopics: ['Indus Valley Civilization', 'Vedic Age', 'Mauryan Empire', 'Gupta Empire', 'Post-Gupta Period', 'Art and Architecture', 'Literature'] },
                { name: 'Medieval History', code: 'MED', displayOrder: 2, subTopics: ['Delhi Sultanate', 'Mughal Empire', 'Vijayanagara Empire', 'Bhakti Movement', 'Medieval Architecture'] },
                { name: 'Modern History', code: 'MOD', displayOrder: 3, subTopics: ['British Rule', 'Freedom Struggle', 'Revolt of 1857', 'Indian National Movement', 'Social Reforms', 'Post-Independence India'] },
                { name: 'Art & Culture', code: 'ART', displayOrder: 4, subTopics: ['Indian Architecture', 'Paintings', 'Music', 'Dance', 'Literature', 'UNESCO Heritage Sites'] },
                { name: 'Freedom Movement', code: 'FREE', displayOrder: 5, subTopics: ['Gandhi Ji', 'Congress Sessions', 'Revolutionary Movement', 'Partition', 'Integration of States'] }
            ]
        },
        {
            name: 'Geography',
            code: 'GEO',
            description: 'Physical, Human and Economic Geography',
            icon: '🌍',
            displayOrder: 3,
            topics: [
                { name: 'Physical Geography', code: 'PHYS', displayOrder: 1, subTopics: ['Earth', 'Climate', 'Rocks and Minerals', 'Geomorphology', 'Oceanography', 'Atmosphere'] },
                { name: 'Indian Geography', code: 'IND', displayOrder: 2, subTopics: ['Location and Extent', 'Physiography', 'Rivers', 'Climate', 'Natural Vegetation', 'Soil', 'Agriculture', 'Minerals', 'Industries'] },
                { name: 'World Geography', code: 'WORLD', displayOrder: 3, subTopics: ['Continents', 'Major Countries', 'Climate Zones', 'Ocean Currents', 'International Boundaries'] },
                { name: 'Environmental Geography', code: 'ENV', displayOrder: 4, subTopics: ['Climate Change', 'Biodiversity', 'Ecosystems', 'Conservation', 'Natural Disasters'] },
                { name: 'Resources', code: 'RES', displayOrder: 5, subTopics: ['Water Resources', 'Mineral Resources', 'Energy Resources', 'Forest Resources'] }
            ]
        },
        {
            name: 'Economy',
            code: 'ECO',
            description: 'Indian and World Economy',
            icon: '💰',
            displayOrder: 4,
            topics: [
                { name: 'Basic Concepts', code: 'BASIC', displayOrder: 1, subTopics: ['GDP', 'Inflation', 'Fiscal Policy', 'Monetary Policy', 'Taxation', 'Budget'] },
                { name: 'Indian Economy', code: 'IND', displayOrder: 2, subTopics: ['Economic Development', 'Planning', 'Five Year Plans', 'NITI Aayog', 'Poverty', 'Unemployment'] },
                { name: 'Sectors', code: 'SECT', displayOrder: 3, subTopics: ['Agriculture', 'Industry', 'Services', 'Banking', 'Insurance', 'Capital Market'] },
                { name: 'Economic Reforms', code: 'REF', displayOrder: 4, subTopics: ['LPG Reforms', 'GST', 'Demonetization', 'Digital Economy', 'Make in India'] },
                { name: 'International Economics', code: 'INT', displayOrder: 5, subTopics: ['Trade', 'WTO', 'IMF', 'World Bank', 'FDI', 'Balance of Payments'] },
                { name: 'Government Schemes', code: 'SCH', displayOrder: 6, subTopics: ['Social Welfare', 'Employment', 'Financial Inclusion', 'Skill Development'] }
            ]
        },
        {
            name: 'Environment',
            code: 'ENV',
            description: 'Environment and Ecology',
            icon: '🌱',
            displayOrder: 5,
            topics: [
                { name: 'Ecology', code: 'ECO', displayOrder: 1, subTopics: ['Ecosystem', 'Food Chain', 'Biodiversity', 'Species', 'Habitats'] },
                { name: 'Climate Change', code: 'CLIM', displayOrder: 2, subTopics: ['Global Warming', 'Paris Agreement', 'Carbon Credits', 'UNFCCC', 'Kyoto Protocol'] },
                { name: 'Conservation', code: 'CONS', displayOrder: 3, subTopics: ['Wildlife Protection', 'National Parks', 'Sanctuaries', 'Biosphere Reserves', 'Project Tiger'] },
                { name: 'Pollution', code: 'POL', displayOrder: 4, subTopics: ['Air Pollution', 'Water Pollution', 'Soil Pollution', 'Noise Pollution', 'E-waste'] },
                { name: 'Environmental Laws', code: 'LAW', displayOrder: 5, subTopics: ['Environment Protection Act', 'Wildlife Protection Act', 'Forest Conservation Act', 'EIA'] },
                { name: 'Sustainable Development', code: 'SUS', displayOrder: 6, subTopics: ['SDGs', 'Renewable Energy', 'Green Technology', 'Circular Economy'] }
            ]
        },
        {
            name: 'Science & Technology',
            code: 'SCI',
            description: 'Science and Technology Developments',
            icon: '🔬',
            displayOrder: 6,
            topics: [
                { name: 'Basic Science', code: 'BASIC', displayOrder: 1, subTopics: ['Physics', 'Chemistry', 'Biology', 'Mathematics'] },
                { name: 'Space Technology', code: 'SPACE', displayOrder: 2, subTopics: ['ISRO', 'Satellites', 'Space Missions', 'GPS'] },
                { name: 'Nuclear Technology', code: 'NUC', displayOrder: 3, subTopics: ['Nuclear Energy', 'NPT', 'Nuclear Power Plants', 'Nuclear Safety'] },
                { name: 'Biotechnology', code: 'BIO', displayOrder: 4, subTopics: ['Genetic Engineering', 'GM Crops', 'Stem Cell', 'Cloning', 'Vaccines'] },
                { name: 'Information Technology', code: 'IT', displayOrder: 5, subTopics: ['AI', 'Machine Learning', 'Blockchain', 'IoT', 'Cybersecurity', 'Digital India'] },
                { name: 'Defence Technology', code: 'DEF', displayOrder: 6, subTopics: ['Missiles', 'Defence Deals', 'Indigenous Defence Production', 'Make in India Defence'] },
                { name: 'Health & Medicine', code: 'HEALTH', displayOrder: 7, subTopics: ['Diseases', 'Medical Research', 'Pharmaceuticals', 'Health Programs'] }
            ]
        },
        {
            name: 'International Relations',
            code: 'IR',
            description: 'International Relations and Organizations',
            icon: '🌐',
            displayOrder: 7,
            topics: [
                { name: 'India & Neighbors', code: 'NEIGH', displayOrder: 1, subTopics: ['Pakistan', 'China', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Myanmar', 'Bhutan', 'Afghanistan'] },
                { name: 'Major Powers', code: 'POW', displayOrder: 2, subTopics: ['USA', 'Russia', 'Europe', 'Japan', 'ASEAN'] },
                { name: 'International Organizations', code: 'ORG', displayOrder: 3, subTopics: ['UN', 'UNSC', 'NATO', 'BRICS', 'G20', 'SCO', 'SAARC'] },
                { name: 'Global Issues', code: 'GLOB', displayOrder: 4, subTopics: ['Terrorism', 'Refugees', 'Climate Change', 'Trade Wars', 'Cyber Warfare'] },
                { name: 'Bilateral Relations', code: 'BIL', displayOrder: 5, subTopics: ['Strategic Partnerships', 'Trade Agreements', 'Defence Cooperation', 'Cultural Ties'] }
            ]
        },
        {
            name: 'Internal Security',
            code: 'SEC',
            description: 'Internal Security and Disaster Management',
            icon: '🛡️',
            displayOrder: 8,
            topics: [
                { name: 'Terrorism', code: 'TERR', displayOrder: 1, subTopics: ['Naxalism', 'Insurgency', 'Radicalization', 'Counter-terrorism'] },
                { name: 'Border Management', code: 'BOR', displayOrder: 2, subTopics: ['Border Security Force', 'Coastal Security', 'Border Infrastructure'] },
                { name: 'Cybersecurity', code: 'CYB', displayOrder: 3, subTopics: ['Cyber Attacks', 'Data Protection', 'IT Act', 'Cyber Crime'] },
                { name: 'Disaster Management', code: 'DIS', displayOrder: 4, subTopics: ['NDMA', 'Natural Disasters', 'Disaster Response', 'Mitigation'] },
                { name: 'Law & Order', code: 'LAW', displayOrder: 5, subTopics: ['Police Reforms', 'Criminal Justice System', 'Communal Violence', 'Women Safety'] }
            ]
        },
        {
            name: 'Social Issues',
            code: 'SOC',
            description: 'Social Justice and Welfare',
            icon: '👥',
            displayOrder: 9,
            topics: [
                { name: 'Poverty & Unemployment', code: 'POV', displayOrder: 1, subTopics: ['Below Poverty Line', 'Employment Generation', 'MGNREGA', 'Skill Development'] },
                { name: 'Education', code: 'EDU', displayOrder: 2, subTopics: ['Right to Education', 'Literacy', 'Higher Education', 'NEP 2020'] },
                { name: 'Health', code: 'HEALTH', displayOrder: 3, subTopics: ['Ayushman Bharat', 'Maternal Health', 'Child Health', 'Sanitation', 'Nutrition'] },
                { name: 'Gender Issues', code: 'GEN', displayOrder: 4, subTopics: ['Women Empowerment', 'Gender Equality', 'Crimes Against Women', 'Reservation for Women'] },
                { name: 'Caste & Tribes', code: 'CASTE', displayOrder: 5, subTopics: ['SC/ST Issues', 'Tribal Welfare', 'Reservation', 'Atrocities'] },
                { name: 'Urbanization', code: 'URB', displayOrder: 6, subTopics: ['Smart Cities', 'Slums', 'Urban Planning', 'Infrastructure'] }
            ]
        },
        {
            name: 'Ethics',
            code: 'ETH',
            description: 'Ethics, Integrity and Aptitude',
            icon: '⚖️',
            displayOrder: 10,
            topics: [
                { name: 'Ethics Basics', code: 'BASIC', displayOrder: 1, subTopics: ['Values', 'Morals', 'Ethics Theories', 'Virtues'] },
                { name: 'Public Service Ethics', code: 'PUB', displayOrder: 2, subTopics: ['Civil Service Values', 'Accountability', 'Transparency', 'Objectivity'] },
                { name: 'Probity in Governance', code: 'PROB', displayOrder: 3, subTopics: ['Corruption', 'Integrity', 'Whistleblowing', 'Lokpal', 'RTI'] },
                { name: 'Case Studies', code: 'CASE', displayOrder: 4, subTopics: ['Ethical Dilemmas', 'Decision Making', 'Conflict Resolution'] },
                { name: 'Attitude', code: 'ATT', displayOrder: 5, subTopics: ['Empathy', 'Tolerance', 'Compassion', 'Emotional Intelligence'] }
            ]
        }
    ];
    
    // Check if subjects already exist
    const existingCount = await this.countDocuments();
    if (existingCount > 0) {
        console.log('Subjects already seeded.');
        return { message: 'Subjects already exist', count: existingCount };
    }
    
    // Insert subjects
    const result = await this.insertMany(subjects);
    console.log(`Seeded ${result.length} subjects successfully.`);
    
    return { message: 'Subjects seeded successfully', count: result.length };
};

// Remove __v from JSON response
subjectSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
