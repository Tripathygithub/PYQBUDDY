const Question = require('../Models/Question');
const Subject = require('../Models/Subject');
const response = require('../responsecode/response');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const path = require('path');

// Valid enum values
const VALID_EXAM_TYPES = ['prelims', 'mains', 'optional'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// ==================== VALIDATE CSV ROW ====================
const validateQuestionRow = (row, rowNumber, validSubjects) => {
    const errors = [];

    // Required fields validation
    if (!row.year || row.year.toString().trim() === '') {
        errors.push('Year is required');
    } else {
        const year = parseInt(row.year);
        if (isNaN(year) || year < 2000 || year > 2030) {
            errors.push('Year must be between 2000 and 2030');
        }
    }

    if (!row.examType || row.examType.trim() === '') {
        errors.push('Exam type is required');
    } else if (!VALID_EXAM_TYPES.includes(row.examType.toLowerCase().trim())) {
        errors.push(`Exam type must be one of: ${VALID_EXAM_TYPES.join(', ')}`);
    }

    if (!row.subject || row.subject.trim() === '') {
        errors.push('Subject is required');
    } else if (!validSubjects.includes(row.subject.trim())) {
        errors.push(`Invalid subject. Valid subjects: ${validSubjects.join(', ')}`);
    }

    if (!row.questionText || row.questionText.trim() === '') {
        errors.push('Question text is required');
    } else if (row.questionText.trim().length > 5000) {
        errors.push('Question text cannot exceed 5000 characters');
    }

    // Optional fields validation
    if (row.answerText && row.answerText.trim().length > 10000) {
        errors.push('Answer text cannot exceed 10000 characters');
    }

    if (row.explanation && row.explanation.trim().length > 5000) {
        errors.push('Explanation cannot exceed 5000 characters');
    }

    if (row.difficulty && !VALID_DIFFICULTIES.includes(row.difficulty.toLowerCase().trim())) {
        errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
    }

    if (row.marks) {
        const marks = parseInt(row.marks);
        if (isNaN(marks) || marks < 0 || marks > 250) {
            errors.push('Marks must be between 0 and 250');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        rowNumber: rowNumber
    };
};

// ==================== PARSE CSV FILE ====================
const parseCSVFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

// ==================== PARSE EXCEL FILE ====================
const parseExcelFile = (filePath) => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        return data;
    } catch (error) {
        throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
};

// ==================== UPLOAD AND VALIDATE CSV ====================
// POST /api/v1/admin/questions/upload-csv
exports.uploadAndValidateCSV = async (req, res) => {
    try {
        if (!req.file) {
            return response.errorResponse(res, 'Please upload a CSV or Excel file');
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        let rawData = [];

        // Parse file based on extension
        if (fileExtension === '.csv') {
            rawData = await parseCSVFile(filePath);
        } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            rawData = parseExcelFile(filePath);
        } else {
            // Clean up uploaded file
            fs.unlinkSync(filePath);
            return response.errorResponse(res, 'Only CSV and Excel files are supported');
        }

        if (rawData.length === 0) {
            fs.unlinkSync(filePath);
            return response.errorResponse(res, 'File is empty or invalid format');
        }

        // Get valid subjects
        const subjects = await Subject.find({ isActive: true }).select('name').lean();
        const validSubjects = subjects.map(s => s.name);

        // Validate each row
        const validatedData = [];
        const errors = [];

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const validation = validateQuestionRow(row, i + 2, validSubjects); // +2 because row 1 is header

            if (validation.valid) {
                // Clean and prepare data
                const questionData = {
                    year: parseInt(row.year),
                    examType: row.examType.toLowerCase().trim(),
                    subject: row.subject.trim(),
                    topic: row.topic?.trim() || undefined,
                    subTopic: row.subTopic?.trim() || undefined,
                    questionText: row.questionText.trim(),
                    answerText: row.answerText?.trim() || undefined,
                    explanation: row.explanation?.trim() || undefined,
                    difficulty: row.difficulty?.toLowerCase().trim() || undefined,
                    marks: row.marks ? parseInt(row.marks) : undefined,
                    paperNumber: row.paperNumber?.trim() || undefined,
                    keywords: row.keywords ? row.keywords.split(',').map(k => k.trim()) : []
                };

                validatedData.push(questionData);
            } else {
                errors.push({
                    row: validation.rowNumber,
                    data: row,
                    errors: validation.errors
                });
            }
        }

        // Store validated data in temporary location (or session)
        const tempFileName = `temp_${Date.now()}_${req.file.filename}.json`;
        const tempFilePath = path.join('uploads', tempFileName);
        fs.writeFileSync(tempFilePath, JSON.stringify(validatedData));

        // Clean up original file
        fs.unlinkSync(filePath);

        return response.successResponse(
            res,
            'File validated successfully',
            {
                totalRows: rawData.length,
                validRows: validatedData.length,
                invalidRows: errors.length,
                preview: validatedData.slice(0, 10), // First 10 valid rows
                errors: errors.slice(0, 20), // First 20 errors
                tempFileName: tempFileName, // To be used for final import
                stats: {
                    byExamType: validatedData.reduce((acc, q) => {
                        acc[q.examType] = (acc[q.examType] || 0) + 1;
                        return acc;
                    }, {}),
                    bySubject: validatedData.reduce((acc, q) => {
                        acc[q.subject] = (acc[q.subject] || 0) + 1;
                        return acc;
                    }, {}),
                    byYear: validatedData.reduce((acc, q) => {
                        acc[q.year] = (acc[q.year] || 0) + 1;
                        return acc;
                    }, {})
                }
            }
        );

    } catch (error) {
        console.error('CSV Upload Error:', error);
        // Clean up file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return response.errorResponse(res, error.message);
    }
};

// ==================== CONFIRM AND IMPORT ====================
// POST /api/v1/admin/questions/confirm-import
exports.confirmImport = async (req, res) => {
    try {
        const { tempFileName } = req.body;

        if (!tempFileName) {
            return response.errorResponse(res, 'Temp file name is required');
        }

        const tempFilePath = path.join('uploads', tempFileName);

        if (!fs.existsSync(tempFilePath)) {
            return response.errorResponse(res, 'Temporary file not found. Please upload again.');
        }

        // Read validated data
        const validatedData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));

        // Bulk insert using model method
        const result = await Question.bulkInsertQuestions(validatedData, req.user.id);

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        return response.successResponse(
            res,
            'Questions imported successfully',
            {
                totalAttempted: validatedData.length,
                successfullyImported: result.success,
                failed: result.failed,
                errors: result.errors.slice(0, 20) // Show first 20 errors
            }
        );

    } catch (error) {
        console.error('Import Error:', error);
        // Clean up temp file if exists
        if (req.body.tempFileName) {
            const tempFilePath = path.join('uploads', req.body.tempFileName);
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
        return response.errorResponse(res, error.message);
    }
};

// ==================== CANCEL IMPORT ====================
// POST /api/v1/admin/questions/cancel-import
exports.cancelImport = async (req, res) => {
    try {
        const { tempFileName } = req.body;

        if (!tempFileName) {
            return response.errorResponse(res, 'Temp file name is required');
        }

        const tempFilePath = path.join('uploads', tempFileName);

        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        return response.successResponse(
            res,
            'Import cancelled successfully'
        );

    } catch (error) {
        console.error('Cancel Import Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== DOWNLOAD CSV TEMPLATE ====================
// GET /api/v1/admin/questions/download-template
exports.downloadTemplate = async (req, res) => {
    try {
        const templateData = [
            {
                year: 2021,
                examType: 'prelims',
                subject: 'Polity',
                topic: 'Constitution',
                subTopic: 'Fundamental Rights',
                questionText: 'Which Article of the Constitution deals with the Right to Equality?',
                answerText: 'Articles 14 to 18 deal with the Right to Equality. Article 14 provides equality before law, Article 15 prohibits discrimination, Article 16 provides equality of opportunity in public employment, Article 17 abolishes untouchability, and Article 18 abolishes titles.',
                explanation: 'The Right to Equality is a fundamental right guaranteed by the Constitution.',
                difficulty: 'medium',
                marks: 2,
                paperNumber: '',
                keywords: 'fundamental rights, equality, article 14'
            },
            {
                year: 2022,
                examType: 'mains',
                subject: 'Economy',
                topic: 'GDP',
                subTopic: 'Economic Growth',
                questionText: 'Discuss the impact of GDP growth on poverty alleviation in India.',
                answerText: 'GDP growth contributes to poverty reduction through employment generation, increased income levels, and improved social welfare programs. However, the impact depends on the inclusiveness of growth.',
                explanation: 'This question tests understanding of economic development and poverty.',
                difficulty: 'hard',
                marks: 15,
                paperNumber: 'GS3',
                keywords: 'GDP, poverty, economic growth'
            },
            {
                year: 2023,
                examType: 'prelims',
                subject: 'Geography',
                topic: 'Climate',
                subTopic: 'Monsoon',
                questionText: 'What is the primary cause of the Indian monsoon?',
                answerText: 'The Indian monsoon is primarily caused by the differential heating of land and sea, which creates pressure differences leading to moisture-laden winds from the Indian Ocean.',
                explanation: '',
                difficulty: 'easy',
                marks: 2,
                paperNumber: '',
                keywords: 'monsoon, climate, India'
            }
        ];

        // Create CSV content
        const headers = Object.keys(templateData[0]);
        const csvRows = [headers.join(',')];

        for (const row of templateData) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in values
                const escaped = value.toString().replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pyqbuddy_template.csv');
        res.send(csvContent);

    } catch (error) {
        console.error('Download Template Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== DOWNLOAD EXCEL TEMPLATE ====================
// GET /api/v1/admin/questions/download-template-excel
exports.downloadTemplateExcel = async (req, res) => {
    try {
        const templateData = [
            {
                year: 2021,
                examType: 'prelims',
                subject: 'Polity',
                topic: 'Constitution',
                subTopic: 'Fundamental Rights',
                questionText: 'Which Article of the Constitution deals with the Right to Equality?',
                answerText: 'Articles 14 to 18 deal with the Right to Equality. Article 14 provides equality before law, Article 15 prohibits discrimination, Article 16 provides equality of opportunity in public employment, Article 17 abolishes untouchability, and Article 18 abolishes titles.',
                explanation: 'The Right to Equality is a fundamental right guaranteed by the Constitution.',
                difficulty: 'medium',
                marks: 2,
                paperNumber: '',
                keywords: 'fundamental rights, equality, article 14'
            },
            {
                year: 2022,
                examType: 'mains',
                subject: 'Economy',
                topic: 'GDP',
                subTopic: 'Economic Growth',
                questionText: 'Discuss the impact of GDP growth on poverty alleviation in India.',
                answerText: 'GDP growth contributes to poverty reduction through employment generation, increased income levels, and improved social welfare programs. However, the impact depends on the inclusiveness of growth.',
                explanation: 'This question tests understanding of economic development and poverty.',
                difficulty: 'hard',
                marks: 15,
                paperNumber: 'GS3',
                keywords: 'GDP, poverty, economic growth'
            },
            {
                year: 2023,
                examType: 'prelims',
                subject: 'Geography',
                topic: 'Climate',
                subTopic: 'Monsoon',
                questionText: 'What is the primary cause of the Indian monsoon?',
                answerText: 'The Indian monsoon is primarily caused by the differential heating of land and sea, which creates pressure differences leading to moisture-laden winds from the Indian Ocean.',
                explanation: '',
                difficulty: 'easy',
                marks: 2,
                paperNumber: '',
                keywords: 'monsoon, climate, India'
            }
        ];

        // Create workbook
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(templateData);

        // Set column widths
        ws['!cols'] = [
            { wch: 6 },  // year
            { wch: 10 }, // examType
            { wch: 20 }, // subject
            { wch: 20 }, // topic
            { wch: 20 }, // subTopic
            { wch: 60 }, // questionText
            { wch: 60 }, // answerText
            { wch: 30 }, // explanation
            { wch: 10 }, // difficulty
            { wch: 6 },  // marks
            { wch: 12 }, // paperNumber
            { wch: 30 }  // keywords
        ];

        xlsx.utils.book_append_sheet(wb, ws, 'Questions');

        // Create instructions sheet
        const instructions = [
            { Field: 'year', Required: 'Yes', Format: 'Number (2000-2030)', Example: '2021' },
            { Field: 'examType', Required: 'Yes', Format: 'prelims/mains/optional', Example: 'prelims' },
            { Field: 'subject', Required: 'Yes', Format: 'Valid subject name', Example: 'Polity' },
            { Field: 'topic', Required: 'No', Format: 'Text', Example: 'Constitution' },
            { Field: 'subTopic', Required: 'No', Format: 'Text', Example: 'Fundamental Rights' },
            { Field: 'questionText', Required: 'Yes', Format: 'Text (max 5000 chars)', Example: 'What is...' },
            { Field: 'answerText', Required: 'No', Format: 'Text (max 10000 chars)', Example: 'The answer is...' },
            { Field: 'explanation', Required: 'No', Format: 'Text (max 5000 chars)', Example: 'Additional info...' },
            { Field: 'difficulty', Required: 'No', Format: 'easy/medium/hard', Example: 'medium' },
            { Field: 'marks', Required: 'No', Format: 'Number (0-250)', Example: '2' },
            { Field: 'paperNumber', Required: 'No', Format: 'Text (GS1/GS2/GS3/GS4)', Example: 'GS3' },
            { Field: 'keywords', Required: 'No', Format: 'Comma-separated', Example: 'polity, rights' }
        ];

        const wsInstructions = xlsx.utils.json_to_sheet(instructions);
        wsInstructions['!cols'] = [
            { wch: 20 },
            { wch: 10 },
            { wch: 30 },
            { wch: 30 }
        ];
        xlsx.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

        // Generate buffer
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=pyqbuddy_template.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Download Excel Template Error:', error);
        return response.errorResponse(res, error.message);
    }
};

// ==================== GET UPLOAD HISTORY (Admin) ====================
// GET /api/v1/admin/questions/upload-history
exports.getUploadHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get recently created questions grouped by upload time
        const recentUploads = await Question.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: {
                        createdBy: '$createdBy',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    },
                    count: { $sum: 1 },
                    subjects: { $addToSet: '$subject' },
                    years: { $addToSet: '$year' },
                    firstQuestion: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.createdBy',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    date: '$_id.date',
                    count: 1,
                    subjects: 1,
                    years: 1,
                    uploadedBy: {
                        name: '$user.name',
                        email: '$user.email'
                    },
                    createdAt: '$firstQuestion.createdAt'
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        const total = await Question.distinct('createdAt').then(dates => dates.length);

        return response.successResponse(
            res,
            'Upload history retrieved successfully',
            {
                uploads: recentUploads,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: recentUploads.length,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        );

    } catch (error) {
        console.error('Get Upload History Error:', error);
        return response.errorResponse(res, error.message);
    }
};
