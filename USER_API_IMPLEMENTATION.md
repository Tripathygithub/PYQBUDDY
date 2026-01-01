# User API Implementation - Summary

## Overview
Added read-only question access routes to the user endpoint with authentication token requirement. Users can now view, filter, and search questions but cannot create, update, or delete them.

## Changes Made

### 1. Updated `routes/v1/user.js`
Added three new routes for authenticated users:

#### New Routes:
- **GET `/api/v1/user/questions`** - Get all questions with filters
  - Supports filtering by: year, examType, subject, topic, difficulty, isVerified
  - Includes pagination (page, limit)
  - Requires: Bearer Token authentication

- **GET `/api/v1/user/questions/search`** - Search questions
  - Search query parameter: `q`
  - Supports all filters from above
  - Smart regex matching with word variations
  - Requires: Bearer Token authentication

- **GET `/api/v1/user/questions/:id`** - Get single question by ID
  - Returns detailed information about a specific question
  - Requires: Bearer Token authentication

#### Controller Used:
- `questionSimplifiedController.js` - Same controller used by admin routes
- Functions: `getAllQuestions`, `searchQuestions`, `getQuestionById`

### 2. Updated `PYQBUDDY_User_Collection.postman_collection.json`
Completely restructured the Postman collection with:

#### Authentication Folder:
1. **User Register** - POST `/api/v1/auth/signup`
   - Creates a new user account
   - Fields: name, email, password, role

2. **User Login** - POST `/api/v1/auth/login`
   - Returns authentication token
   - Auto-saves token to `AUTH_TOKEN` environment variable
   - Fields: email, password

#### Questions Folder (16 Requests):
All requests use the `/api/v1/user/questions` endpoint with Bearer Token authentication:

1. Get All Questions
2. Get Questions with Pagination
3. Filter by Year
4. Filter by Exam Type
5. Filter by Subject
6. Filter by Topic
7. Filter by Difficulty
8. Combined Filters
9. Get Single Question by ID
10. Search Questions
11. Search with Pagination
12. Search + Filter by Year
13. Search + Filter by Exam Type
14. Search + Filter by Subject
15. Advanced Search with Multiple Filters

## Authentication Flow

### Step 1: Register User
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

### Step 2: Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Step 3: Use Token for Questions
```bash
GET /api/v1/user/questions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Key Features

### 1. Read-Only Access
- Users can only **view** questions (GET requests)
- Users **cannot** create, update, or delete questions
- Admin routes remain separate for administrative tasks

### 2. Authentication Required
- All question routes require Bearer Token authentication
- Token is obtained through login
- Middleware validates token before processing requests

### 3. Full Filtering Capabilities
Users can filter questions by:
- Year (e.g., 2021, 2022)
- Exam Type (e.g., prelims, mains)
- Subject (e.g., Polity, Economy)
- Topic (e.g., Constitution)
- Difficulty (easy, medium, hard)
- Verification Status (isVerified: true/false)

### 4. Smart Search
- Searches across multiple fields: questionText, explanation, subject, topic, examName, tags, keywords
- Uses smart regex with word variations
- Can combine search with filters

### 5. Pagination
- Default: page=1, limit=20
- Customizable in all requests
- Returns total count and page information

## API Endpoints

### Base URL
```
http://localhost:9235/api/v1
```

### User Routes (Authenticated)

#### Get All Questions
```
GET /user/questions
GET /user/questions?page=1&limit=20
GET /user/questions?year=2021&examType=prelims&subject=Polity
```

#### Search Questions
```
GET /user/questions/search?q=constitution
GET /user/questions/search?q=polity&page=1&limit=20
GET /user/questions/search?q=agriculture&year=2021
```

#### Get Single Question
```
GET /user/questions/:id
```

## Example Usage

### 1. Get All Questions with Filters
```bash
curl -X GET "http://localhost:9235/api/v1/user/questions?year=2021&examType=prelims&subject=Polity&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Search Questions
```bash
curl -X GET "http://localhost:9235/api/v1/user/questions/search?q=constitution&year=2021" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Single Question
```bash
curl -X GET "http://localhost:9235/api/v1/user/questions/60d5ec49f1a2c8b1f8e4e5a1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": {
    "questions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalQuestions": 200,
      "questionsPerPage": 20
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security

### Token Validation
- All routes protected by `middleware` function from `service/middleware.js`
- Applied at router level in `routes/v1/index.js`
- Invalid/missing tokens return 401 Unauthorized

### User vs Admin
- Users: Read-only access via `/api/v1/user/questions`
- Admins: Full CRUD access via `/api/v1/admin-panel/questions`

## Testing with Postman

### Environment Variables Setup
1. Set `BASE_URL` = `http://localhost:9235`
2. Set `AUTH_TOKEN` = (will be auto-populated after login)

### Test Flow
1. Use "User Register" to create account
2. Use "User Login" - token auto-saved
3. Use any question endpoint - token auto-applied

## Notes

- Same backend controller used for both user and admin routes
- Only difference is the route prefix and access level
- User routes are simpler and focused on viewing/searching
- Admin routes include create, update, delete, bulk operations
- Both use the same database model: `QuestionSimplified`

## Files Modified

1. `routes/v1/user.js` - Added 3 new routes with authentication
2. `PYQBUDDY_User_Collection.postman_collection.json` - Complete restructure with 18 requests

## Next Steps

To use this implementation:
1. Start the server
2. Import the Postman collection
3. Set environment variables (BASE_URL)
4. Register a user
5. Login to get token
6. Test question endpoints

The system is now ready for user-facing applications!
