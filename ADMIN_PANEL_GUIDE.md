# PYQBUDDY Admin Panel - Complete Implementation Guide

## 🎯 Overview

This document outlines the complete implementation of PYQBUDDY's new question management system. The system supports **10 different question types** and provides a RESTful API for manual question creation through an admin panel.

## 📊 Question Types Supported

Based on UPSC examination patterns, our system handles these 10 question formats:

1. **Simple Direct MCQ** - Standard multiple choice with 4 options
2. **Chronological Ordering** - Arrange items in correct sequence
3. **Multiple Statements** - Select correct statement combinations  
4. **Match The Following** - Simple list matching with answer codes
5. **Match List-I with List-II** - Table format matching
6. **Negative Selection** - "Which is NOT correct" questions
7. **Assertion & Reason** - Logic-based A/R questions
8. **Multi-Statement Logic** - Complex statement relationships
9. **Fill in the Blanks** - Missing value identification
10. **Mismatched Pairs** - Identify incorrect pairings

---

## 🗄️ Database Schema

### QuestionNew Model

Located in: `Models/QuestionNew.js`

#### Core Fields (Common to all question types)

```javascript
{
  questionId: String (auto-generated, unique),
  year: Number (required, 2000-2035),
  subject: String (required, e.g., "History", "Geography"),
  topic: String (e.g., "Ancient India", "Climate"),
  subTopic: String,
  examType: String (required: 'prelims', 'mains', 'optional'),
  examName: String (required, e.g., "OPSC", "UPSC CSE"),
  questionType: String (required, one of 10 types),
  questionText: String (required, max 10000 chars),
  correctAnswer: String (required),
  explanation: String (max 5000 chars),
  difficulty: String ('easy', 'medium', 'hard'),
  marks: Number (default: 1),
  paperNumber: String (e.g., "Paper-I", "GS1"),
  
  // Media support
  questionImages: [{ url, caption, publicId }],
  explanationImages: [{ url, caption, publicId }],
  explanationVideos: [{ url, thumbnailUrl, title, duration, publicId }],
  
  // Search & engagement
  tags: [String],
  keywords: [String],
  viewCount: Number,
  attemptCount: Number,
  correctAttemptCount: Number,
  bookmarkCount: Number,
  
  // Status
  isVerified: Boolean,
  isActive: Boolean,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

#### Question Type-Specific Fields

**For Simple MCQ, Negative Selection, Fill Blanks, Mismatched Pairs:**
```javascript
options: [{
  key: String,        // "A", "B", "C", "D"
  text: String,
  images: [String],
  isCorrect: Boolean
}]
```

**For Chronological Ordering:**
```javascript
chronologicalItems: [{
  key: String,   // "a", "b", "c", "d"
  text: String,
  order: Number
}]
```

**For Multiple Statements:**
```javascript
statements: [{
  number: Number,
  text: String,
  isCorrect: Boolean
}],
options: [{ key, text, isCorrect }]  // For answer combinations
```

**For Match The Following:**
```javascript
matchPairs: {
  leftHeader: String,   // e.g., "Day"
  rightHeader: String,  // e.g., "Event"
  pairs: [{
    left: String,       // "3 March"
    right: String,      // "World Wildlife Day"
    leftLabel: String,
    rightLabel: String
  }]
},
options: [{ key, text, isCorrect }]  // For answer codes like "a-1 b-2 c-3 d-4"
```

**For Match List-I with List-II (Table):**
```javascript
matchListTable: {
  listIHeader: String,   // "List-I (Indian Rivers)"
  listIIHeader: String,  // "List-II (Tributaries)"
  items: [{
    key: String,         // "(a)", "(b)"
    listIValue: String,  // "Chambal"
    listIIValue: String  // "Banas"
  }]
},
options: [{ key, text, isCorrect }]  // Answer codes
```

**For Assertion-Reason:**
```javascript
assertionReason: {
  assertion: String,
  reason: String
},
options: [{
  key: "A",
  text: "Both A and R are true, and R correctly explains A"
}, {
  key: "B",
  text: "Both A and R are true, but R does not correctly explain A"
}, {
  key: "C",
  text: "A is true, but R is false"
}, {
  key: "D",
  text: "A is false, but R is true"
}]
```

---

## 🔌 Admin API Endpoints

Base URL: `http://localhost:9235/api/v1/admin-v2`

**Authentication Required**: All endpoints require admin JWT token in `Authorization: Bearer <token>` header

### 1. Create Single Question

**POST** `/questions`

```json
{
  "year": 2024,
  "subject": "Current Affairs",
  "topic": "International Awards",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "simple-mcq",
  "questionText": "Who won the 2024 Nobel Peace Prize?",
  "options": [
    { "key": "A", "text": "Narges Mohammadi", "isCorrect": true },
    { "key": "B", "text": "Han Kang", "isCorrect": false },
    { "key": "C", "text": "Daron Acemoglu", "isCorrect": false },
    { "key": "D", "text": "John Hopfield", "isCorrect": false }
  ],
  "correctAnswer": "A",
  "explanation": "Narges Mohammadi won the 2024 Nobel Peace Prize for her fight against oppression of women in Iran.",
  "difficulty": "easy",
  "marks": 1,
  "tags": ["nobel-prize", "2024", "peace"],
  "keywords": ["narges", "mohammadi", "nobel", "peace", "iran"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question created successfully",
    "question": { ...questionData }
  }
}
```

### 2. Get All Questions (with Filters)

**GET** `/questions?page=1&limit=20&year=2024&examType=prelims&subject=Geography`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `year` - Filter by year
- `examType` - Filter by exam type (prelims/mains/optional)
- `examName` - Filter by exam name (partial match)
- `subject` - Filter by subject (partial match)
- `topic` - Filter by topic (partial match)
- `questionType` - Filter by question type
- `difficulty` - Filter by difficulty (easy/medium/hard)
- `isVerified` - Filter by verification status (true/false)
- `isActive` - Filter by active status (true/false)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalQuestions": 87,
      "questionsPerPage": 20
    }
  }
}
```

### 3. Get Single Question

**GET** `/questions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      ...fullQuestionData,
      "createdBy": { "name": "Admin", "email": "admin@example.com" },
      "updatedBy": { "name": "Admin", "email": "admin@example.com" }
    }
  }
}
```

### 4. Update Question

**PUT** `/questions/:id`

Send the fields you want to update. Same structure as create.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question updated successfully",
    "question": { ...updatedQuestionData }
  }
}
```

### 5. Delete Question

**DELETE** `/questions/:id?permanent=false`

- Without `permanent=true` query param: Soft delete (sets `isActive: false`)
- With `permanent=true`: Permanently deletes from database

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question deactivated successfully"
  }
}
```

### 6. Bulk Create Questions

**POST** `/questions/bulk`

```json
{
  "questions": [
    { ...question1Data },
    { ...question2Data },
    ...
  ]
}
```

**Max 100 questions per request**

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully created 25 questions",
    "count": 25,
    "questions": [...]
  }
}
```

### 7. Toggle Verification

**PATCH** `/questions/:id/verify`

Toggles `isVerified` status.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question verified successfully",
    "question": { ...questionData }
  }
}
```

### 8. Duplicate Question

**POST** `/questions/:id/duplicate`

Creates a copy of existing question (unverified).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Question duplicated successfully",
    "question": { ...duplicatedQuestionData }
  }
}
```

### 9. Get Statistics

**GET** `/statistics/questions`

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 150,
      "verified": 120,
      "byYear": [
        { "_id": 2024, "count": 45 },
        { "_id": 2023, "count": 65 },
        { "_id": 2022, "count": 40 }
      ],
      "byExamType": [
        { "_id": "prelims", "count": 80 },
        { "_id": "mains", "count": 50 },
        { "_id": "optional", "count": 20 }
      ],
      "byQuestionType": [
        { "_id": "simple-mcq", "count": 60 },
        { "_id": "multiple-statements", "count": 30 },
        ...
      ],
      "bySubject": [
        { "_id": "History", "count": 35 },
        { "_id": "Geography", "count": 30 },
        ...
      ]
    }
  }
}
```

---

## 📝 Sample Question Payloads for Each Type

### 1. Simple MCQ

```json
{
  "year": 2024,
  "subject": "Geography",
  "topic": "Rivers",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "simple-mcq",
  "questionText": "Which is the longest river in India?",
  "options": [
    { "key": "A", "text": "Ganges", "isCorrect": false },
    { "key": "B", "text": "Brahmaputra", "isCorrect": true },
    { "key": "C", "text": "Godavari", "isCorrect": false },
    { "key": "D", "text": "Yamuna", "isCorrect": false }
  ],
  "correctAnswer": "B",
  "difficulty": "easy"
}
```

### 2. Chronological Order

```json
{
  "year": 2024,
  "subject": "History",
  "topic": "Ancient Literature",
  "examType": "prelims",
  "examName": "UPSC",
  "questionType": "chronological-order",
  "questionText": "Arrange the following texts in their chronological order:",
  "chronologicalItems": [
    { "key": "a", "text": "Brihadaranyaka Upanishad", "order": 1 },
    { "key": "b", "text": "Manusmriti", "order": 3 },
    { "key": "c", "text": "Arthashastra", "order": 2 },
    { "key": "d", "text": "Milinda Panha", "order": 4 }
  ],
  "options": [
    { "key": "A", "text": "a - b - c - d", "isCorrect": false },
    { "key": "B", "text": "b - c - a - d", "isCorrect": false },
    { "key": "C", "text": "c - a - b - d", "isCorrect": false },
    { "key": "D", "text": "a - c - b - d", "isCorrect": true }
  ],
  "correctAnswer": "D"
}
```

### 3. Multiple Statements

```json
{
  "year": 2024,
  "subject": "Environment",
  "topic": "Climate Change",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "multiple-statements",
  "questionText": "Consider the following statements about India's NDCs:",
  "statements": [
    { "number": 1, "text": "India has committed to reduce emissions intensity by 45% by 2030", "isCorrect": true },
    { "number": 2, "text": "India aims for 50% power from non-fossil fuels by 2030", "isCorrect": true },
    { "number": 3, "text": "India's NDC is linked to Panchamrit announcement at COP26", "isCorrect": true }
  ],
  "options": [
    { "key": "A", "text": "1 and 2 only", "isCorrect": false },
    { "key": "B", "text": "2 and 3 only", "isCorrect": false },
    { "key": "C", "text": "1 and 3 only", "isCorrect": false },
    { "key": "D", "text": "1, 2 and 3", "isCorrect": true }
  ],
  "correctAnswer": "D"
}
```

### 4. Match The Following

```json
{
  "year": 2024,
  "subject": "Current Affairs",
  "topic": "UN Days",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "match-following",
  "questionText": "Match the following UN days:",
  "matchPairs": {
    "leftHeader": "Day",
    "rightHeader": "Event",
    "pairs": [
      { "left": "a) 3 March", "right": "1) World Wildlife Day" },
      { "left": "b) 7 April", "right": "2) World Health Day" },
      { "left": "c) 3 May", "right": "3) World Press Freedom Day" },
      { "left": "d) 20 June", "right": "4) World Refugee Day" }
    ]
  },
  "options": [
    { "key": "A", "text": "a-1 b-2 c-3 d-4", "isCorrect": true },
    { "key": "B", "text": "a-2 b-3 c-4 d-1", "isCorrect": false },
    { "key": "C", "text": "a-1 b-3 c-4 d-2", "isCorrect": false },
    { "key": "D", "text": "a-3 b-2 c-1 d-4", "isCorrect": false }
  ],
  "correctAnswer": "A"
}
```

### 5. Match List-I with List-II (Table Format)

```json
{
  "year": 2024,
  "subject": "Geography",
  "topic": "Geological Structure",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "match-list-table",
  "questionText": "Match List-I (Geological Structure) with List-II (Economic Importance):",
  "matchListTable": {
    "listIHeader": "List-I (Geological Structure)",
    "listIIHeader": "List-II (Economic Importance)",
    "items": [
      { "key": "(a)", "listIValue": "Siwalik Hills", "listIIValue": "Coal, Mica, Uranium" },
      { "key": "(b)", "listIValue": "Deccan Traps", "listIIValue": "Black cotton soils, Sugarcane" },
      { "key": "(c)", "listIValue": "Singhbhum Craton", "listIIValue": "Fossil-rich Sedimentary" },
      { "key": "(d)", "listIValue": "Chhota Nagpur Plateau", "listIIValue": "Iron ore deposits" }
    ]
  },
  "options": [
    { "key": "A", "text": "2 1 3 4", "isCorrect": false },
    { "key": "B", "text": "3 2 1 4", "isCorrect": false },
    { "key": "C", "text": "3 2 4 1", "isCorrect": false },
    { "key": "D", "text": "3 4 2 1", "isCorrect": false }
  ],
  "correctAnswer": "B"
}
```

### 6. Assertion-Reason

```json
{
  "year": 2024,
  "subject": "Geography",
  "topic": "Geology",
  "examType": "prelims",
  "examName": "OPSC",
  "questionType": "assertion-reason",
  "questionText": "Read the Assertion (A) and Reason (R) carefully:",
  "assertionReason": {
    "assertion": "In Odisha, the Proterozoic era is represented by the Eastern Ghats Granulite Belt",
    "reason": "These formations are linked to mineralisation of bauxite, manganese, and gemstones"
  },
  "options": [
    { "key": "A", "text": "Both A and R are true, and R correctly explains A", "isCorrect": false },
    { "key": "B", "text": "Both A and R are true, but R does not correctly explain A", "isCorrect": true },
    { "key": "C", "text": "A is true, but R is false", "isCorrect": false },
    { "key": "D", "text": "A is false, but R is true", "isCorrect": false }
  ],
  "correctAnswer": "B"
}
```

---

## 🚀 React Admin Panel Structure

### Folder Structure

```
admin-panel/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── QuestionForms/
│   │   │   ├── SimpleMCQForm.jsx
│   │   │   ├── ChronologicalOrderForm.jsx
│   │   │   ├── MultipleStatementsForm.jsx
│   │   │   ├── MatchFollowingForm.jsx
│   │   │   ├── MatchListTableForm.jsx
│   │   │   ├── NegativeSelectionForm.jsx
│   │   │   ├── AssertionReasonForm.jsx
│   │   │   ├── MultiStatementLogicForm.jsx
│   │   │   ├── FillBlanksForm.jsx
│   │   │   └── MismatchedPairsForm.jsx
│   │   ├── QuestionPreview/
│   │   │   ├── PreviewSimpleMCQ.jsx
│   │   │   ├── PreviewChronological.jsx
│   │   │   └── ... (one for each type)
│   │   ├── QuestionList/
│   │   │   ├── QuestionTable.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   └── FilterPanel.jsx
│   │   ├── Common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   └── VideoUpload.jsx
│   │   └── Statistics/
│   │       ├── DashboardCards.jsx
│   │       └── Charts.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── QuestionCreate.jsx
│   │   ├── QuestionEdit.jsx
│   │   ├── QuestionList.jsx
│   │   └── Statistics.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── questionService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useQuestions.js
│   │   └── useMediaUpload.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   ├── validation.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── tailwind.config.js
```

### Key Features to Implement

1. **Authentication**
   - Login page with JWT token management
   - Protected routes
   - Token refresh mechanism

2. **Dashboard**
   - Statistics cards (total questions, by type, by subject)
   - Recent activity
   - Quick actions

3. **Question Creation**
   - Dynamic form based on selected question type
   - Rich text editor for question text and explanation
   - Image/video upload integration with Cloudinary
   - Real-time preview of how question will appear in app
   - Form validation
   - Draft save functionality

4. **Question Management**
   - Searchable/filterable table
   - Bulk actions (verify, delete, export)
   - Inline edit
   - Duplicate question
   - Sort and pagination

5. **Media Management**
   - Image upload for questions, options, explanations
   - Video upload for explanations
   - Media library browser

6. **Preview Component**
   - Exact replica of React Native app UI
   - Toggle between light/dark mode
   - Device preview (mobile/tablet)

---

## 🔧 Implementation Roadmap

### Phase 1: Backend Complete ✅
- [x] New QuestionNew schema created
- [x] Question CRUD controllers implemented
- [x] Admin routes configured
- [x] Validation logic added

### Phase 2: React Admin Panel Setup
1. Initialize React app with Vite
2. Install dependencies (react-router-dom, axios, react-hook-form, tailwindcss)
3. Set up routing and authentication
4. Create layout components

### Phase 3: Form Components
1. Create base form with common fields (year, subject, exam type, etc.)
2. Build 10 question type-specific forms
3. Integrate Cloudinary media upload
4. Add form validation

### Phase 4: Question Management
1. Build question list with filters
2. Implement CRUD operations
3. Add bulk operations
4. Create statistics dashboard

### Phase 5: Preview & Testing
1. Build preview components for each question type
2. Match React Native app styling
3. Test all question types
4. User acceptance testing

---

## 📱 React Native App Integration

The questions will be fetched using the public search API and rendered based on `questionType`:

```javascript
// React Native component structure
const QuestionRenderer = ({ question }) => {
  switch(question.questionType) {
    case 'simple-mcq':
      return <SimpleMCQView question={question} />;
    case 'chronological-order':
      return <ChronologicalView question={question} />;
    case 'match-list-table':
      return <MatchListTableView question={question} />;
    // ... other cases
  }
};
```

---

## 🔍 Search API Updates

The existing search APIs will work with the new schema. Main updates:

1. Update `questionController.js` to use `QuestionNew` model
2. Ensure response format includes all question type-specific fields
3. Add filtering by `questionType`
4. Add media URLs in response

---

## 📊 Database Migration Plan

Since you're starting fresh with manual uploads:

1. **Keep old Question model** for reference/backup
2. **Use QuestionNew model** for all new questions
3. **Deprecate CSV upload** functionality
4. **Admin panel** becomes the primary data entry method

---

## ✅ Next Steps

1. **Start React Admin Panel**
   - I'll create the complete React admin panel in a separate folder
   - Initialize with Vite + React + TailwindCSS
   - Build authentication and layout first
   
2. **Build Question Forms**
   - Create reusable form components
   - Implement dynamic form based on question type
   - Add real-time validation
   
3. **Integrate Media Upload**
   - Connect with existing Cloudinary endpoints
   - Image/video preview
   - Drag-and-drop upload

4. **Create Preview Components**
   - Match your React Native app design exactly
   - Support all 10 question types
   - Mobile-responsive preview

Would you like me to start building the React admin panel now?
