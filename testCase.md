# PYQBUDDY - Complete Test Suite Documentation
**Version:** 1.0  
**Last Updated:** December 2024  
**Purpose:** Comprehensive testing checklist for search engine functionality

---

## TABLE OF CONTENTS
1. [Test Environment Setup](#test-environment-setup)
2. [Functional Tests](#functional-tests)
3. [Search Algorithm Tests](#search-algorithm-tests)
4. [Filter Tests](#filter-tests)
5. [Performance Tests](#performance-tests)
6. [Edge Case Tests](#edge-case-tests)
7. [Security Tests](#security-tests)
8. [User Experience Tests](#user-experience-tests)
9. [Data Integrity Tests](#data-integrity-tests)
10. [Acceptance Criteria](#acceptance-criteria)

---

## TEST ENVIRONMENT SETUP

### Prerequisites
- Test database with **at least 1000 sample questions** (across 5 years minimum)
- Sample data should include:
  - Questions from both Prelims and Mains
  - All subjects (Polity, History, Geography, Economy, Environment, Science & Tech)
  - Questions with and without answers
  - Questions with special characters, numbers, symbols
  - Questions of varying lengths (short and long)

### Test Data Requirements
```
Minimum Test Dataset:
- Total Questions: 1000+
- Years: 2019-2024 (at least)
- Prelims: 500 questions
- Mains: 500 questions
- Each subject: 100+ questions
- 10-20 questions with missing answers
- 5-10 questions with special characters
```

---

## 1. FUNCTIONAL TESTS

### 1.1 Basic Search Functionality

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| FT-001 | Empty search returns all questions | `keyword=""` | All questions displayed (paginated) | HIGH |
| FT-002 | Single keyword search | `keyword="constitution"` | All questions containing "constitution" | HIGH |
| FT-003 | Multiple keyword search | `keyword="constitution federal"` | Questions containing BOTH words | HIGH |
| FT-004 | Search with only spaces | `keyword="   "` | Same as empty search | MEDIUM |
| FT-005 | Null keyword | `keyword=null` | Same as empty search | MEDIUM |

**Pass Criteria:** All tests return results within 500ms

---

### 1.2 Search + Filter Combinations

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| FT-006 | Keyword + Year filter | `keyword="GDP"`, `year=[2021]` | Only 2021 questions with "GDP" | HIGH |
| FT-007 | Keyword + Exam Type | `keyword="constitution"`, `exam_type="prelims"` | Only Prelims questions | HIGH |
| FT-008 | Keyword + Subject | `keyword="climate"`, `subject="Geography"` | Only Geography questions with "climate" | HIGH |
| FT-009 | Keyword + Multiple filters | `keyword="federalism"`, `year=[2021]`, `subject="Polity"` | Intersection of all filters | HIGH |
| FT-010 | Only filters (no keyword) | `year=[2021,2022]`, `subject="Economy"` | All Economy questions from 2021-2022 | HIGH |

**Pass Criteria:** Filter combinations work correctly with AND logic

---

## 2. SEARCH ALGORITHM TESTS

### 2.1 Text Matching

| Test ID | Test Case | Input | Expected Behavior | Priority |
|---------|-----------|-------|-------------------|----------|
| SA-001 | Exact match | `keyword="Constitution of India"` | Returns exact phrase matches | HIGH |
| SA-002 | Case insensitivity | `keyword="CONSTITUTION"` vs `"constitution"` | Both return identical results | HIGH |
| SA-003 | Partial word match | `keyword="constitu"` | Returns "constitution", "constitutional" | HIGH |
| SA-004 | Leading spaces | `keyword="  GDP"` | Same as "GDP" | MEDIUM |
| SA-005 | Trailing spaces | `keyword="GDP  "` | Same as "GDP" | MEDIUM |
| SA-006 | Multiple spaces between words | `keyword="constitution    polity"` | Same as "constitution polity" | MEDIUM |
| SA-007 | Special characters in search | `keyword="Article-370"` | Handles hyphen correctly | MEDIUM |
| SA-008 | Numbers in search | `keyword="Article 21"` | Returns Article 21 related questions | MEDIUM |
| SA-009 | Parentheses | `keyword="GDP(PPP)"` | Handles parentheses | LOW |
| SA-010 | Apostrophes | `keyword="India's economy"` | Handles apostrophe | LOW |

**Pass Criteria:** All text variations return expected results

---

### 2.2 Fuzzy Search (Phase 2 - Optional)

| Test ID | Test Case | Input (Typo) | Should Find | Priority |
|---------|-----------|--------------|-------------|----------|
| SA-011 | Single character typo | `"constituiton"` | "constitution" | MEDIUM |
| SA-012 | Multiple typos | `"fedaralism"` | "federalism" | MEDIUM |
| SA-013 | Transposed letters | `"parliment"` | "parliament" | MEDIUM |
| SA-014 | Missing letter | `"econmy"` | "economy" | MEDIUM |
| SA-015 | Extra letter | `"constituttion"` | "constitution" | MEDIUM |

**Pass Criteria:** Finds correct term with up to 2 character difference

---

### 2.3 Stop Words Handling

| Test ID | Test Case | Input | Processed As | Priority |
|---------|-----------|-------|--------------|----------|
| SA-016 | Common stop words | `"the constitution of india"` | "constitution india" | MEDIUM |
| SA-017 | Multiple stop words | `"what is the GDP growth"` | "GDP growth" | MEDIUM |
| SA-018 | Only stop words | `"the is are"` | Empty search | LOW |

**Pass Criteria:** Stop words are filtered but search remains functional

---

### 2.4 Relevance Ranking

| Test ID | Test Case | Expected Order | Priority |
|---------|-----------|----------------|----------|
| SA-019 | Search "constitution" | Most recent year appears first | HIGH |
| SA-020 | Multiple occurrences | Questions with keyword appearing 3x > 1x | MEDIUM |
| SA-021 | Exact phrase match | Exact match ranks higher than partial | MEDIUM |

**Pass Criteria:** Results are ordered by relevance score

---

## 3. FILTER TESTS

### 3.1 Single Filter Tests

| Test ID | Filter Type | Input | Expected Output | Priority |
|---------|-------------|-------|-----------------|----------|
| FI-001 | Year filter | `year=[2021]` | Only 2021 questions | HIGH |
| FI-002 | Multiple years | `year=[2021,2022,2023]` | Questions from any of these years | HIGH |
| FI-003 | Exam type (Prelims) | `exam_type="prelims"` | Only Prelims questions | HIGH |
| FI-004 | Exam type (Mains) | `exam_type="mains"` | Only Mains questions | HIGH |
| FI-005 | Subject filter | `subject="Polity"` | Only Polity questions | HIGH |
| FI-006 | Multiple subjects | `subject=["Polity","Economy"]` | Questions from either subject | HIGH |
| FI-007 | Topic filter | `topic="Constitution"` | Only Constitution topic | MEDIUM |

**Pass Criteria:** Each filter correctly narrows results

---

### 3.2 Combined Filter Tests

| Test ID | Test Case | Filters Applied | Expected Logic | Priority |
|---------|-----------|-----------------|----------------|----------|
| FI-008 | Year + Exam Type | `year=[2021]`, `exam_type="prelims"` | 2021 AND Prelims | HIGH |
| FI-009 | Year + Subject | `year=[2021,2022]`, `subject="Polity"` | (2021 OR 2022) AND Polity | HIGH |
| FI-010 | All filters | All filters applied | Correct intersection | HIGH |
| FI-011 | Conflicting filters | Invalid combination | Empty result with message | MEDIUM |

**Pass Criteria:** Multiple filters use AND logic between categories, OR within

---

### 3.3 Filter Edge Cases

| Test ID | Test Case | Input | Expected Behavior | Priority |
|---------|-----------|-------|-------------------|----------|
| FI-012 | Invalid year | `year=[3000]` | Returns empty with helpful message | MEDIUM |
| FI-013 | Non-existent subject | `subject="InvalidSubject"` | Returns empty | MEDIUM |
| FI-014 | Empty filter array | `year=[]` | Ignores filter | MEDIUM |
| FI-015 | Null filter value | `subject=null` | Ignores filter | MEDIUM |
| FI-016 | Filters only (no keyword) | Multiple filters, no search term | All matching questions | HIGH |

**Pass Criteria:** Edge cases handled gracefully without errors

---

## 4. PERFORMANCE TESTS

### 4.1 Response Time Tests

| Test ID | Scenario | Expected Time | Priority |
|---------|----------|---------------|----------|
| PT-001 | Simple keyword search | < 300ms | HIGH |
| PT-002 | Keyword + 1 filter | < 400ms | HIGH |
| PT-003 | Keyword + 3 filters | < 500ms | HIGH |
| PT-004 | Complex search (keyword + all filters) | < 1000ms | MEDIUM |
| PT-005 | Large result set (500+ results) | < 1000ms | MEDIUM |

**Testing Tool:** Use Apache JMeter or similar

**Pass Criteria:** 95% of requests meet time targets

---

### 4.2 Concurrent User Tests

| Test ID | Scenario | Users | Expected Behavior | Priority |
|---------|----------|-------|-------------------|----------|
| PT-006 | Simultaneous searches | 10 users | All complete within 1s | HIGH |
| PT-007 | Load test | 100 users | 95% success rate | HIGH |
| PT-008 | Stress test | 500 users | Graceful degradation | MEDIUM |
| PT-009 | Same search repeated | 100 identical requests | Cache utilization | MEDIUM |

**Pass Criteria:** System remains responsive under load

---

### 4.3 Database Performance

| Test ID | Test Case | Expected Behavior | Priority |
|---------|-----------|-------------------|----------|
| PT-010 | Query optimization | All queries use indexes | HIGH |
| PT-011 | Database connection pool | No connection timeout | HIGH |
| PT-012 | Query execution plan | No full table scans | MEDIUM |

**Pass Criteria:** All queries are optimized

---

## 5. EDGE CASE TESTS

### 5.1 Input Validation

| Test ID | Test Case | Input | Expected Behavior | Priority |
|---------|-----------|-------|-------------------|----------|
| EC-001 | Very long keyword | 500 character string | Truncate or reject gracefully | MEDIUM |
| EC-002 | Special characters only | `"@#$%^&*()"` | Returns empty or error message | MEDIUM |
| EC-003 | SQL injection attempt | `"'; DROP TABLE questions;--"` | Sanitized, no execution | HIGH |
| EC-004 | XSS attempt | `"<script>alert('XSS')</script>"` | Escaped, no execution | HIGH |
| EC-005 | Unicode characters | `"संविधान"` (Hindi) | Handled correctly | LOW |
| EC-006 | Emoji in search | `"😀 constitution"` | Ignored or handled | LOW |

**Pass Criteria:** All malicious inputs neutralized

---

### 5.2 Result Handling

| Test ID | Test Case | Scenario | Expected Output | Priority |
|---------|-----------|----------|-----------------|----------|
| EC-007 | Zero results | Search returns nothing | "No results found" message | HIGH |
| EC-008 | Single result | Only 1 match | Display single result correctly | MEDIUM |
| EC-009 | Maximum results | 5000+ matches | Pagination implemented | HIGH |
| EC-010 | Missing answer | Question without answer | "Answer not available" placeholder | MEDIUM |
| EC-011 | Malformed question text | Corrupted data | Skip or display error | LOW |

**Pass Criteria:** All scenarios display user-friendly messages

---

### 5.3 Pagination Edge Cases

| Test ID | Test Case | Input | Expected Behavior | Priority |
|---------|-----------|-------|-------------------|----------|
| EC-012 | First page | `page=1` | Shows first 50 results | HIGH |
| EC-013 | Last page | `page=last` | Shows remaining results | HIGH |
| EC-014 | Out of bounds | `page=999` (when only 10 pages exist) | Error or redirect to last page | MEDIUM |
| EC-015 | Negative page | `page=-1` | Default to page 1 | MEDIUM |
| EC-016 | Page=0 | `page=0` | Default to page 1 | MEDIUM |

**Pass Criteria:** Pagination handles all edge cases

---

## 6. SECURITY TESTS

### 6.1 Injection Attacks

| Test ID | Attack Type | Input | Expected Defense | Priority |
|---------|-------------|-------|------------------|----------|
| SE-001 | SQL Injection | `"1' OR '1'='1"` | Parameterized queries block | HIGH |
| SE-002 | NoSQL Injection | `{"$ne": null}` | Input validation blocks | HIGH |
| SE-003 | Command Injection | `"; ls -la"` | No system command execution | HIGH |

**Pass Criteria:** Zero successful injections

---

### 6.2 XSS Prevention

| Test ID | Attack Vector | Input | Expected Output | Priority |
|---------|---------------|-------|-----------------|----------|
| SE-004 | Script tag | `"<script>alert(1)</script>"` | Escaped: `&lt;script&gt;` | HIGH |
| SE-005 | Event handler | `"<img onerror='alert(1)'>"` | Escaped or stripped | HIGH |
| SE-006 | JavaScript URL | `"javascript:alert(1)"` | Sanitized | HIGH |

**Pass Criteria:** All XSS attempts neutralized

---

### 6.3 Rate Limiting

| Test ID | Test Case | Scenario | Expected Behavior | Priority |
|---------|-----------|----------|-------------------|----------|
| SE-007 | Rapid requests | 100 requests in 1 second | Rate limit triggered | MEDIUM |
| SE-008 | API abuse | 1000 requests/minute | IP blocked temporarily | MEDIUM |

**Pass Criteria:** Rate limiting prevents abuse

---

## 7. USER EXPERIENCE TESTS

### 7.1 Response Formatting

| Test ID | Test Case | Expected Behavior | Priority |
|---------|-----------|-------------------|----------|
| UX-001 | Results display | Questions shown in clean card format | HIGH |
| UX-002 | Year/Subject/Type visible | Metadata clearly displayed | HIGH |
| UX-003 | Answer toggle | Click to expand/collapse answer | HIGH |
| UX-004 | Loading indicator | Spinner shows during search | MEDIUM |
| UX-005 | Error messages | User-friendly, actionable messages | HIGH |

**Pass Criteria:** UI is clean and intuitive

---

### 7.2 Mobile Responsiveness

| Test ID | Device Type | Test Case | Expected Behavior | Priority |
|---------|-------------|-----------|-------------------|----------|
| UX-006 | Mobile (320px) | Search bar | Fully functional | HIGH |
| UX-007 | Tablet (768px) | Filters | Accessible and usable | HIGH |
| UX-008 | Desktop (1920px) | Full layout | Optimal use of space | HIGH |

**Testing Devices:** iPhone SE, iPad, Desktop

---

### 7.3 Accessibility

| Test ID | Test Case | Expected Behavior | Priority |
|---------|-----------|-------------------|----------|
| UX-009 | Keyboard navigation | Tab through all elements | MEDIUM |
| UX-010 | Screen reader | ARIA labels present | MEDIUM |
| UX-011 | Color contrast | WCAG AA compliant | LOW |

**Pass Criteria:** Basic accessibility standards met

---

## 8. DATA INTEGRITY TESTS

### 8.1 Question Data Validation

| Test ID | Test Case | Expected Behavior | Priority |
|---------|-----------|-------------------|----------|
| DI-001 | Duplicate detection | No duplicate questions in same year | HIGH |
| DI-002 | Required fields | Year, exam_type, subject must exist | HIGH |
| DI-003 | Data consistency | All subjects from predefined list | MEDIUM |
| DI-004 | Character encoding | UTF-8 properly stored and displayed | MEDIUM |

**Pass Criteria:** Database maintains integrity

---

### 8.2 Answer Validation

| Test ID | Test Case | Expected Behavior | Priority |
|---------|-----------|-------------------|----------|
| DI-005 | Answer format | Properly formatted text | MEDIUM |
| DI-006 | Missing answers | Handled gracefully | HIGH |
| DI-007 | Answer length | No truncation issues | MEDIUM |

**Pass Criteria:** Answers display correctly

---

## 9. ACCEPTANCE CRITERIA

### 9.1 Minimum Viable Product (MVP) Requirements

**Must Pass ALL of the following:**

#### Search Functionality
- [ ] Keyword search returns relevant results
- [ ] Case-insensitive search works
- [ ] Partial word matching works
- [ ] Empty search returns all questions

#### Filters
- [ ] Year filter works correctly
- [ ] Exam type filter works correctly
- [ ] Subject filter works correctly
- [ ] Multiple filters combine with AND logic
- [ ] Multiple selections within same filter use OR logic

#### Performance
- [ ] Search completes in < 500ms (95% of requests)
- [ ] Handles 50 concurrent users
- [ ] Pagination works for large result sets

#### Security
- [ ] SQL injection protected
- [ ] XSS attacks prevented
- [ ] Input sanitization implemented

#### User Experience
- [ ] Results display in card format
- [ ] Answer expand/collapse works
- [ ] Mobile responsive
- [ ] Loading indicators present
- [ ] Error messages are helpful

#### Data Quality
- [ ] All questions have year, exam_type, subject
- [ ] No duplicate questions
- [ ] Answers linked to questions

---

### 9.2 Phase 2 Enhancements (Optional)

**Nice to Have:**
- [ ] Fuzzy search (typo tolerance)
- [ ] Search suggestions/autocomplete
- [ ] Advanced relevance ranking
- [ ] Search analytics
- [ ] "Did you mean...?" feature
- [ ] Bookmark functionality
- [ ] User accounts

---

## 10. TEST EXECUTION CHECKLIST

### Pre-Testing
- [ ] Test database populated with sample data
- [ ] All environments set up (dev, staging, production)
- [ ] Testing tools configured (Postman, JMeter, etc.)

### During Testing
- [ ] Document all bugs found
- [ ] Record response times
- [ ] Screenshot any UI issues
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on multiple devices (mobile, tablet, desktop)

### Post-Testing
- [ ] Create bug report document
- [ ] Prioritize issues (Critical, High, Medium, Low)
- [ ] Verify all critical bugs are fixed
- [ ] Retest after fixes
- [ ] Get stakeholder approval

---

## 11. BUG REPORTING TEMPLATE

```
Bug ID: [Unique identifier]
Severity: [Critical/High/Medium/Low]
Test ID: [Reference test case]
Title: [Brief description]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happened]

Environment:
- Browser: 
- Device: 
- OS: 

Screenshots/Logs:
[Attach evidence]

Priority: [P0/P1/P2/P3]
Status: [Open/In Progress/Fixed/Closed]
```

---

## 12. SIGN-OFF CRITERIA

**The system is ready for launch when:**

1. ✅ All HIGH priority tests pass (100%)
2. ✅ All MEDIUM priority tests pass (95%+)
3. ✅ No CRITICAL or HIGH severity bugs remain
4. ✅ Performance targets met
5. ✅ Security vulnerabilities addressed
6. ✅ Stakeholder approval obtained

---

## APPENDIX A: Test Data Examples

### Sample Questions for Testing

```json
{
  "id": 1,
  "year": 2021,
  "exam_type": "prelims",
  "subject": "Polity",
  "topic": "Constitution",
  "question_text": "Which Article of the Constitution deals with the Right to Equality?",
  "answer_text": "Article 14 to 18 deal with the Right to Equality..."
}

{
  "id": 2,
  "year": 2021,
  "exam_type": "mains",
  "subject": "Economy",
  "topic": "GDP",
  "question_text": "Discuss the impact of GDP growth on poverty alleviation in India.",
  "answer_text": "GDP growth contributes to poverty reduction through..."
}
```

### Test Keywords
- constitution
- GDP
- federalism
- climate change
- fundamental rights
- parliament
- judiciary
- Article 370
- monsoon
- inflation

---

## APPENDIX B: Performance Benchmarks

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Search Response Time | < 500ms | Chrome DevTools |
| Database Query Time | < 200ms | Database profiler |
| API Latency | < 100ms | Postman |
| Page Load Time | < 2s | Lighthouse |
| Time to First Byte (TTFB) | < 200ms | WebPageTest |

---

## DOCUMENT CONTROL

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 2024 | Initial release | PYQBUDDY Team |

---

**END OF TEST SUITE DOCUMENT**

*This document should be shared with developers, QA team, and stakeholders before development begins.*