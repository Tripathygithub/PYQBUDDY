# CSV Upload Format Guide for PYQBUDDY

## 📋 CSV Column Headers (in order)

```csv
year,examType,subject,topic,subTopic,questionText,answerText,explanation,difficulty,marks,paperNumber,keywords
```

---

## 📝 Field Descriptions

### **Required Fields** ⚠️

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| **year** | Number | Year of the exam | • Required<br>• Must be between 2000-2030<br>• Example: `2021`, `2022`, `2023` |
| **examType** | String | Type of examination | • Required<br>• Must be one of: `prelims`, `mains`, `optional`<br>• Case-insensitive<br>• Example: `prelims` |
| **subject** | String | Subject name | • Required<br>• Valid subjects: Polity, Economy, History, Geography, Environment, Science & Technology, International Relations, Internal Security, Social Issues, Ethics<br>• Example: `Polity`, `Economy` |
| **questionText** | String | The actual question | • Required<br>• Minimum 10 characters<br>• Maximum 5000 characters<br>• Example: `"Which Article deals with Right to Equality?"` |

---

### **Optional Fields** (Can be left empty)

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| **topic** | String | Topic under the subject | • Optional<br>• Maximum 200 characters<br>• Example: `Constitution`, `GDP`, `Climate Change` |
| **subTopic** | String | Subtopic under the topic | • Optional<br>• Maximum 200 characters<br>• Example: `Fundamental Rights`, `Economic Growth` |
| **answerText** | String | Detailed answer | • Optional<br>• Maximum 10,000 characters<br>• Markdown supported<br>• If provided, `hasAnswer` flag is automatically set to `true` |
| **explanation** | String | Additional explanation | • Optional<br>• Maximum 5,000 characters<br>• Used for extra context/notes |
| **difficulty** | String | Difficulty level | • Optional<br>• Must be one of: `easy`, `medium`, `hard`<br>• Case-insensitive<br>• Leave empty if not applicable |
| **marks** | Number | Marks for the question | • Optional<br>• Must be between 0-250<br>• Example: `2` (for prelims), `10`, `15`, `20` (for mains) |
| **paperNumber** | String | Paper identifier | • Optional<br>• Common values: `GS1`, `GS2`, `GS3`, `GS4`<br>• Useful for mains questions |
| **keywords** | String | Comma-separated keywords | • Optional<br>• Separate multiple keywords with commas<br>• Used for search optimization<br>• Example: `fundamental rights, equality, article 14` |

---

## 📄 Sample CSV File

```csv
year,examType,subject,topic,subTopic,questionText,answerText,explanation,difficulty,marks,paperNumber,keywords
2021,prelims,Polity,Constitution,Fundamental Rights,"Which Article of the Constitution deals with the Right to Equality?","Articles 14 to 18 deal with the Right to Equality. Article 14 provides equality before law, Article 15 prohibits discrimination, Article 16 provides equality of opportunity in public employment, Article 17 abolishes untouchability, and Article 18 abolishes titles.","The Right to Equality is a fundamental right guaranteed by the Constitution.",medium,2,,fundamental rights, equality, article 14
2022,mains,Economy,GDP,Economic Growth,"Discuss the impact of GDP growth on poverty alleviation in India.","GDP growth contributes to poverty reduction through employment generation, increased income levels, and improved social welfare programs. However, the impact depends on the inclusiveness of growth.","This question tests understanding of economic development and poverty.",hard,15,GS3,GDP, poverty, economic growth
2023,prelims,Geography,Climate,Monsoon,"What is the primary cause of the Indian monsoon?","The Indian monsoon is primarily caused by the differential heating of land and sea, which creates pressure differences leading to moisture-laden winds from the Indian Ocean.",,easy,2,,monsoon, climate, India
2024,prelims,Environment,Climate Change,Global Warming,"Which international agreement aims to limit global temperature rise?",,"This refers to the Paris Agreement of 2015.",medium,2,,Paris Agreement, climate, UNFCCC
```

---

## 💡 Important Tips

### 1. **CSV Formatting Rules**
- Always include the header row (first line with column names)
- Use commas (`,`) as delimiters
- Wrap text containing commas in double quotes (`"`)
- Escape double quotes inside text by using two quotes (`""`)
- Empty fields can be left blank but keep the commas

### 2. **Text with Special Characters**
```csv
questionText
"What is ""Article 14""?"           ← Escaped quotes
"Discuss GDP, inflation, and employment"   ← Text with commas
```

### 3. **Keywords Format**
- Separate multiple keywords with commas INSIDE the field
- Example: `"GDP, poverty, economic growth"` or just `GDP, poverty, economic growth`

### 4. **Empty Optional Fields**
```csv
year,examType,subject,topic,subTopic,questionText,answerText,explanation,difficulty,marks,paperNumber,keywords
2024,prelims,Polity,,,What is the capital of India?,,,,,,
```
*(Notice empty fields between commas)*

---

## 🎯 Valid Values Reference

### Exam Types
- `prelims` (UPSC Preliminary Examination)
- `mains` (UPSC Main Examination)
- `optional` (Optional Subject Papers)

### Subjects (Pre-seeded in Database)
1. Polity
2. Economy
3. History
4. Geography
5. Environment
6. Science & Technology
7. International Relations
8. Internal Security
9. Social Issues
10. Ethics

### Difficulty Levels
- `easy` - Basic conceptual questions
- `medium` - Moderate complexity
- `hard` - Advanced analytical questions

### Paper Numbers (for Mains)
- `GS1` - General Studies Paper 1
- `GS2` - General Studies Paper 2
- `GS3` - General Studies Paper 3
- `GS4` - General Studies Paper 4
- Or leave empty for Prelims

---

## ⚠️ Common Errors to Avoid

### ❌ **Error 1: Missing Required Fields**
```csv
2024,prelims,,,Question text missing
```
**Fix:** Always include year, examType, subject, and questionText

### ❌ **Error 2: Invalid Exam Type**
```csv
2024,preliminary,Polity,...
```
**Fix:** Use only `prelims`, `mains`, or `optional`

### ❌ **Error 3: Year Out of Range**
```csv
1999,prelims,Polity,...
```
**Fix:** Year must be between 2000-2030

### ❌ **Error 4: Text Too Long**
```csv
...,This is a very long question text exceeding 5000 characters...
```
**Fix:** Keep questionText under 5000 chars, answerText under 10000 chars

### ❌ **Error 5: Unescaped Commas**
```csv
...,What is GDP, inflation, and employment?,...
```
**Fix:** Wrap in quotes: `"What is GDP, inflation, and employment?"`

---

## 📥 How to Upload

1. **Download Template**
   - CSV: `GET /api/v1/admin/questions/download-template`
   - Excel: `GET /api/v1/admin/questions/download-template-excel`

2. **Fill in Your Data**
   - Add rows following the template format
   - Ensure all required fields are filled
   - Validate data before upload

3. **Upload & Validate**
   - `POST /api/v1/admin/questions/upload-csv`
   - File will be validated
   - You'll receive a preview of valid/invalid rows

4. **Confirm Import**
   - `POST /api/v1/admin/questions/confirm-import`
   - Provide the temporary file name received
   - Data will be inserted into database

---

## 🔍 Auto-Generated Fields

These fields are automatically set by the system:

| Field | Auto Value |
|-------|------------|
| `questionId` | Unique ID: `Q-{timestamp}-{uuid}` |
| `hasAnswer` | `true` if answerText is provided, `false` otherwise |
| `searchableText` | Concatenated from questionText + answerText + keywords |
| `isVerified` | `false` by default (admin can verify later) |
| `viewCount` | `0` initially |
| `bookmarkCount` | `0` initially |
| `isActive` | `true` by default |
| `createdAt` | Current timestamp |
| `updatedAt` | Current timestamp |

---

## 📊 Excel Format

If you prefer Excel (.xlsx or .xls):
- Use the same column headers
- One row per question
- Save as Excel format
- Upload using the same endpoint

Excel Benefits:
- Better formatting support
- Formula validation possible
- Easier data management
- Multi-sheet support (only first sheet is imported)

---

## 🚀 Quick Start Example

**Minimum Valid CSV (Required Fields Only):**
```csv
year,examType,subject,questionText
2024,prelims,Polity,"What is the Indian Constitution?"
2024,mains,Economy,"Discuss economic reforms in India."
```

**Complete CSV (All Fields):**
```csv
year,examType,subject,topic,subTopic,questionText,answerText,explanation,difficulty,marks,paperNumber,keywords
2024,prelims,Polity,Constitution,Preamble,"What does the Preamble of the Constitution declare India to be?","The Preamble declares India to be a Sovereign, Socialist, Secular, Democratic Republic.","The Preamble is the introductory statement of the Constitution.",easy,2,,preamble, constitution, sovereign
```

---

## 📞 Need Help?

- **Download CSV Template:** Use the API endpoint to get a pre-formatted template
- **Validation Errors:** The upload API will provide detailed error messages for each invalid row
- **Field Questions:** Check the Question model in `Models/Question.js` for complete schema

---

**Last Updated:** December 20, 2025  
**Version:** 1.0
