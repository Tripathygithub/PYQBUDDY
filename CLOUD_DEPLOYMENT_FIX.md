# Cloud Deployment Fix - Memory Storage

## Problem
When deploying to Render (or similar cloud platforms), file uploads were failing with:
```
ENOENT: no such file or directory, open 'uploads/videos/video-1766322922224-316228817.mp4'
```

## Root Cause
- **Ephemeral File System**: Cloud platforms like Render, Heroku, Railway use ephemeral storage
- Files written to disk are **deleted** when containers restart or scale
- The `uploads/` directory doesn't persist between deployments
- Previous code used `multer.diskStorage()` to save files locally first

## Solution Applied
Switched from **disk storage** to **memory storage**:

### 1. **service/mediaUpload.js** Changes
**Before:**
```javascript
const imageStorage = multer.diskStorage({
    destination: 'uploads/images/',
    filename: 'image-' + timestamp + extension
});
```

**After:**
```javascript
const memoryStorage = multer.memoryStorage();
// Files stored in memory as Buffer
```

### 2. **service/cloudinary.js** Changes
**Before:**
```javascript
const uploadImage = async (filePath, folder) => {
    const result = await cloudinary.uploader.upload(filePath, {...});
    fs.unlinkSync(filePath); // Delete local file
}
```

**After:**
```javascript
const uploadImage = async (filePathOrBuffer, folder) => {
    let uploadSource = filePathOrBuffer;
    if (Buffer.isBuffer(filePathOrBuffer)) {
        uploadSource = `data:image/png;base64,${filePathOrBuffer.toString('base64')}`;
    }
    const result = await cloudinary.uploader.upload(uploadSource, {...});
    // No local file to delete
}
```

### 3. **controllers/mediaController.js** Changes
**Before:**
```javascript
const filePath = req.file.path;
await uploadImage(filePath, folder);
```

**After:**
```javascript
const buffer = req.file.buffer;
await uploadImage(buffer, folder);
```

## How It Works Now

### Upload Flow:
1. **Client** sends file via multipart/form-data
2. **Multer** stores file in **memory** (RAM) as Buffer
3. **Controller** receives `req.file.buffer` (not req.file.path)
4. **Cloudinary Service** converts Buffer to base64 data URI
5. **Cloudinary API** receives and stores the file
6. **Response** returns Cloudinary URL
7. **Memory** is automatically freed (no cleanup needed)

### Data URI Format:
```javascript
// Images
data:image/png;base64,iVBORw0KGgoAAAANS...

// Videos
data:video/mp4;base64,AAAAIGZ0eXBpc29t...
```

## Benefits

✅ **Works on Any Cloud Platform** - No local storage needed  
✅ **No File Cleanup** - Memory auto-freed by Node.js  
✅ **Scalable** - Works with container restarts  
✅ **Backward Compatible** - Still works with file paths on localhost  

## Memory Considerations

### File Size Limits:
- **Images**: 10MB max (reasonable for memory)
- **Videos**: 100MB max (monitored for memory usage)

### Memory Usage:
- Files stored temporarily (seconds)
- Freed immediately after Cloudinary upload
- Multiple uploads use `Promise.all()` for efficiency

## Testing

### Local Testing:
```bash
npm start
# Upload using Postman with form-data
```

### Production (Render):
```bash
# Push to GitHub
git add .
git commit -m "Fix: Use memory storage for cloud deployment"
git push origin main

# Render auto-deploys
# Test uploads - should work without ENOENT errors
```

## Environment Variables Required
```env
CLOUDINARY_CLOUD_NAME=dlzwwtbls
CLOUDINARY_API_KEY=312328378328984
CLOUDINARY_API_SECRET=54W5n4CQAPnMhEuhVRG0dOOeBkc
```

## Fallback Support
The code still supports file paths for backward compatibility:
```javascript
if (Buffer.isBuffer(filePathOrBuffer)) {
    // Use base64 encoding
} else if (typeof filePathOrBuffer === 'string') {
    // Use file path (local testing)
}
```

## No Changes Needed For:
- ✅ API endpoints (same URLs)
- ✅ Request format (still form-data)
- ✅ Response format (same JSON structure)
- ✅ Authentication (same JWT tokens)
- ✅ Postman collection (works as-is)

## Status
✅ **Ready for Production Deployment on Render**

---
**Last Updated**: December 21, 2025  
**Fixed By**: Memory Storage Implementation
