# PYQBUDDY Quick Start Guide

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend
Open terminal and run:
```bash
cd c:\Users\SOHAM\OneDrive\Desktop\PYQBUDDY
npm start
```

✅ Backend will run on: **http://localhost:9235**

---

### Step 2: Start Admin Panel
Open **NEW terminal** and run:
```bash
cd c:\Users\SOHAM\OneDrive\Desktop\PYQBUDDY\admin-panel
npm run dev
```

✅ Admin Panel will run on: **http://localhost:5173**

---

## 📝 Login

1. Open browser: **http://localhost:5173/login**
2. Login with admin credentials:
   - Email: Your admin email
   - Password: Your admin password

⚠️ **Important:** User must have `role: "admin"` in MongoDB

---

## ✨ Create Your First Question

### Using the Form:

1. **Fill Metadata:**
   - Year: 2024
   - Exam Type: UPSC
   - Exam Name: UPSC Prelims
   - Subject: History
   - Topic: Medieval India

2. **Type Question:**
   - Click in the question text editor
   - Type: "Who was the first Mughal emperor?"
   - Use toolbar for formatting (Bold, Italic, etc.)

3. **Fill Options:**
   - Option A: Babur ✅
   - Option B: Akbar
   - Option C: Humayun
   - Option D: Aurangzeb

4. **Correct Answer:** A

5. **Explanation (optional):**
   - Click in explanation editor
   - Type: "Babur founded the Mughal Empire in 1526 after winning the Battle of Panipat."

6. **Click Preview** to see how it looks

7. **Click "Create Question"** ✅

---

## 🎯 For Match-the-Following Questions

1. Type intro text: "Match List-I with List-II:"

2. Click **"📊 Table"** button in toolbar

3. Fill the table:
   ```
   | List-I        | List-II              |
   |---------------|---------------------|
   | A. Gandhi     | 1. Non-violence     |
   | B. Nehru      | 2. Discovery of India |
   | C. Patel      | 3. Iron Man         |
   ```

4. Use **+ Col** / **+ Row** buttons to add more

5. Fill options with answer codes:
   - A: A-1, B-2, C-3
   - B: A-2, B-1, C-3
   - C: A-1, B-3, C-2
   - D: A-3, B-2, C-1

6. Correct answer: A

7. Submit! ✅

---

## 📋 Copy-Paste from Excel

**Fastest way to add questions:**

1. Open your Excel file with questions
2. Select a question (including any tables)
3. **Copy** (Ctrl+C)
4. Click in question text editor
5. **Paste** (Ctrl+V)
6. Table auto-formats! ✨
7. Fill options and answer
8. Submit!

**Time:** 15-30 seconds per question

---

## 🖼️ Upload Images/Videos

### For Question Images:
1. Scroll to "Question Images" section
2. Click "Choose File"
3. Select one or more images
4. Wait for upload
5. Thumbnails appear below

### For Explanation Videos:
1. Scroll to "Explanation Videos" section
2. Click "Choose File"
3. Select a video (max 100MB)
4. Wait for upload
5. Video URL appears below

---

## 🎨 Toolbar Buttons

| Button | Function |
|--------|----------|
| **B** | Bold text |
| **I** | Italic text |
| H1, H2, H3 | Headings |
| • List | Bullet list |
| 1. List | Numbered list |
| 📊 Table | Insert table |
| + Col | Add column |
| + Row | Add row |
| − Col | Delete column |
| − Row | Delete row |
| 🗑️ Table | Delete entire table |

---

## 📊 API Endpoints Available

```
POST   /api/v1/admin-panel/questions              - Create question
GET    /api/v1/admin-panel/questions              - Get all (with filters)
GET    /api/v1/admin-panel/questions/search       - Search questions
GET    /api/v1/admin-panel/questions/:id          - Get single question
PUT    /api/v1/admin-panel/questions/:id          - Update question
DELETE /api/v1/admin-panel/questions/:id          - Delete (soft)
POST   /api/v1/admin-panel/questions/bulk         - Bulk create
PATCH  /api/v1/admin-panel/questions/:id/verify   - Toggle verification
POST   /api/v1/admin-panel/questions/:id/duplicate - Duplicate question
GET    /api/v1/admin-panel/questions/statistics   - Get statistics
```

---

## 🐛 Common Issues

### Issue: "Backend connection failed"
**Solution:** Make sure backend is running on port 9235
```bash
cd c:\Users\SOHAM\OneDrive\Desktop\PYQBUDDY
npm start
```

### Issue: "Login failed - role not admin"
**Solution:** Check MongoDB - user must have:
```json
{
  "email": "your-email@example.com",
  "role": "admin"
}
```

### Issue: "Cannot upload images"
**Solution:** Check Cloudinary credentials in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🎯 What Makes This Special?

✅ **ONE form for ALL 10 question types**
- No complex type selection
- No different forms
- Universal approach

✅ **30-second question entry**
- Type naturally
- Paste from Excel
- Auto-formatting

✅ **Rich text editor (WYSIWYG)**
- No manual markdown
- What you see = what students get
- Tables, formatting, all visual

✅ **Live preview**
- See exactly how it renders
- Before you submit
- Both app and web view

✅ **Industry standard**
- Same as Moodle, Canvas, Google Forms
- Proven approach
- Easy maintenance

---

## 🎉 You're Ready!

**Everything is set up and ready to use:**
- ✅ Backend running
- ✅ Admin panel running
- ✅ Rich text editor working
- ✅ Image/video upload working
- ✅ Live preview working
- ✅ All 10 question types supported

**Start creating questions now! 🚀**

Need help? Check `ADMIN_PANEL_COMPLETE_GUIDE.md` for detailed documentation.
