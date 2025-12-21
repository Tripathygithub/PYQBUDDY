# 📸 Media Upload API - Cloudinary Integration

## 🚀 Overview

Complete image and video upload system integrated with Cloudinary for PYQBUDDY. Supports single/multiple image uploads, video uploads, optimized URLs, and thumbnails.

---

## 🔑 Cloudinary Configuration

**Environment Variables:**
```env
CLOUDINARY_CLOUD_NAME=dlzwwtbls
CLOUDINARY_API_KEY=312328378328984
CLOUDINARY_API_SECRET=54W5n4CQAPnMhEuhVRG0dOOeBkc
```

**Base URL:** `http://localhost:9235/api/v1/media`

---

## 📤 Upload APIs

### 1. Upload Single Image

**Endpoint:** `POST /api/v1/media/upload-image`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | ✅ Yes | Image file (JPEG, PNG, GIF, WebP, SVG) |
| `folder` | String | ❌ No | Custom folder path (default: `pyqbuddy/images`) |

**Supported Formats:** JPEG, JPG, PNG, GIF, WebP, SVG

**Max File Size:** 10MB

**Example Request (Postman):**
```
POST http://localhost:9235/api/v1/media/upload-image
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
Body (form-data):
  image: [Select File]
  folder: pyqbuddy/questions (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "public_id": "pyqbuddy/images/image-1703154321000-123456789",
    "url": "https://res.cloudinary.com/dlzwwtbls/image/upload/v1703154321/pyqbuddy/images/image-1703154321000-123456789.jpg",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "size": 256789,
    "created_at": "2025-12-21T12:25:21Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:9235/api/v1/media/upload-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "folder=pyqbuddy/questions"
```

---

### 2. Upload Video

**Endpoint:** `POST /api/v1/media/upload-video`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | File | ✅ Yes | Video file (MP4, MPEG, MOV, AVI, WebM) |
| `folder` | String | ❌ No | Custom folder path (default: `pyqbuddy/videos`) |

**Supported Formats:** MP4, MPEG, MOV (QuickTime), AVI, WebM

**Max File Size:** 100MB

**Example Request (Postman):**
```
POST http://localhost:9235/api/v1/media/upload-video
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
Body (form-data):
  video: [Select File]
  folder: pyqbuddy/explanations (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "public_id": "pyqbuddy/videos/video-1703154321000-987654321",
    "url": "https://res.cloudinary.com/dlzwwtbls/video/upload/v1703154321/pyqbuddy/videos/video-1703154321000-987654321.mp4",
    "width": 1920,
    "height": 1080,
    "format": "mp4",
    "duration": 120.5,
    "size": 15678900,
    "created_at": "2025-12-21T12:25:21Z",
    "playback_url": "https://res.cloudinary.com/dlzwwtbls/video/upload/v1703154321/pyqbuddy/videos/video-1703154321000-987654321.mp4",
    "thumbnail": "https://res.cloudinary.com/dlzwwtbls/video/upload/so_2.0,du_1.0,w_640,h_360,c_fill,q_auto,f_jpg/pyqbuddy/videos/video-1703154321000-987654321.jpg"
  }
}
```

**Features:**
- ✅ Auto-generates thumbnail at 2 seconds
- ✅ Creates mobile (640x360) and desktop (1280x720) versions
- ✅ Auto quality optimization
- ✅ Supports HLS streaming

---

### 3. Upload Multiple Images

**Endpoint:** `POST /api/v1/media/upload-multiple-images`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | File[] | ✅ Yes | Array of image files (max 10) |
| `folder` | String | ❌ No | Custom folder path |

**Max Files:** 10 images per request

**Max File Size:** 10MB per image

**Example Request (Postman):**
```
POST http://localhost:9235/api/v1/media/upload-multiple-images
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
Body (form-data):
  images: [Select Multiple Files]
  folder: pyqbuddy/gallery (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": [
    {
      "public_id": "pyqbuddy/images/image-1703154321000-111111111",
      "url": "https://res.cloudinary.com/dlzwwtbls/image/upload/v1703154321/pyqbuddy/images/image-1703154321000-111111111.jpg",
      "width": 1920,
      "height": 1080,
      "format": "jpg",
      "size": 256789,
      "created_at": "2025-12-21T12:25:21Z"
    },
    {
      "public_id": "pyqbuddy/images/image-1703154321000-222222222",
      "url": "https://res.cloudinary.com/dlzwwtbls/image/upload/v1703154321/pyqbuddy/images/image-1703154321000-222222222.png",
      "width": 1024,
      "height": 768,
      "format": "png",
      "size": 189456,
      "created_at": "2025-12-21T12:25:22Z"
    }
  ]
}
```

---

## 🗑️ Delete Media

### Delete Image or Video

**Endpoint:** `DELETE /api/v1/media/delete/:publicId`

**Authentication:** Required (Admin Only)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resourceType` | String | ❌ No | `image` or `video` (default: `image`) |

**Example Request:**
```
DELETE http://localhost:9235/api/v1/media/delete/pyqbuddy%2Fimages%2Fimage-1703154321000-123456789?resourceType=image
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Note:** URL-encode the `publicId` if it contains special characters (e.g., `/` becomes `%2F`)

**Example Response:**
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:9235/api/v1/media/delete/pyqbuddy%2Fimages%2Fimage-1703154321000-123456789?resourceType=image" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📊 Get Media Details

### Get Image/Video Information

**Endpoint:** `GET /api/v1/media/details/:publicId`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resourceType` | String | ❌ No | `image` or `video` (default: `image`) |

**Example Request:**
```
GET http://localhost:9235/api/v1/media/details/pyqbuddy%2Fimages%2Fimage-1703154321000-123456789?resourceType=image
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example Response:**
```json
{
  "success": true,
  "message": "Media details retrieved successfully",
  "data": {
    "asset_id": "abc123def456",
    "public_id": "pyqbuddy/images/image-1703154321000-123456789",
    "format": "jpg",
    "version": 1703154321,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2025-12-21T12:25:21Z",
    "bytes": 256789,
    "width": 1920,
    "height": 1080,
    "url": "http://res.cloudinary.com/dlzwwtbls/image/upload/v1703154321/pyqbuddy/images/image-1703154321000-123456789.jpg",
    "secure_url": "https://res.cloudinary.com/dlzwwtbls/image/upload/v1703154321/pyqbuddy/images/image-1703154321000-123456789.jpg"
  }
}
```

---

## 🎨 Get Optimized Image URL

### Generate Optimized/Transformed Image URL

**Endpoint:** `POST /api/v1/media/optimized-url`

**Authentication:** Not Required

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publicId` | String | ✅ Yes | Cloudinary public ID |
| `width` | Number | ❌ No | Target width in pixels |
| `height` | Number | ❌ No | Target height in pixels |
| `crop` | String | ❌ No | Crop mode: `fill`, `fit`, `scale`, `crop`, `thumb`, `pad` |
| `quality` | String | ❌ No | Quality: `auto`, `best`, `good`, `eco`, `low` or number (1-100) |

**Example Request:**
```json
POST http://localhost:9235/api/v1/media/optimized-url
Content-Type: application/json

{
  "publicId": "pyqbuddy/images/image-1703154321000-123456789",
  "width": 800,
  "height": 600,
  "crop": "fill",
  "quality": "auto"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Optimized URL generated successfully",
  "data": {
    "url": "https://res.cloudinary.com/dlzwwtbls/image/upload/w_800,h_600,c_fill,q_auto,f_auto/pyqbuddy/images/image-1703154321000-123456789"
  }
}
```

**Crop Modes:**
- `fill` - Resize and crop to exact dimensions
- `fit` - Resize to fit within dimensions
- `scale` - Scale to exact dimensions (may distort)
- `crop` - Crop to exact dimensions
- `thumb` - Generate thumbnail
- `pad` - Resize and pad to exact dimensions

---

## 🎬 Get Video Thumbnail

### Generate Video Thumbnail URL

**Endpoint:** `POST /api/v1/media/video-thumbnail`

**Authentication:** Not Required

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publicId` | String | ✅ Yes | Cloudinary video public ID |
| `time` | Number | ❌ No | Time in seconds (default: 2) |

**Example Request:**
```json
POST http://localhost:9235/api/v1/media/video-thumbnail
Content-Type: application/json

{
  "publicId": "pyqbuddy/videos/video-1703154321000-987654321",
  "time": 5
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Video thumbnail URL generated successfully",
  "data": {
    "thumbnail": "https://res.cloudinary.com/dlzwwtbls/video/upload/so_5.0,du_1.0,w_640,h_360,c_fill,q_auto,f_jpg/pyqbuddy/videos/video-1703154321000-987654321.jpg",
    "time": 5
  }
}
```

---

## 🔒 Authentication & Authorization

### Authentication Required:
- ✅ Upload Image
- ✅ Upload Video
- ✅ Upload Multiple Images
- ✅ Get Media Details

### Admin Only:
- ✅ Delete Media

### Public (No Auth):
- ✅ Get Optimized URL
- ✅ Get Video Thumbnail

**Token Usage:**
```
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get access token from `/api/v1/auth/login` endpoint.

---

## ⚡ Rate Limiting

**Upload Endpoints:** 10 uploads per hour per user

Applied to:
- `/upload-image`
- `/upload-video`
- `/upload-multiple-images`

---

## 🎯 Image Transformations

### Automatic Optimizations:
- ✅ Auto quality based on content
- ✅ Auto format (WebP for supported browsers)
- ✅ Max dimensions: 1920x1080
- ✅ Lazy loading support

### Video Transformations:
- ✅ Auto quality optimization
- ✅ Mobile version: 640x360
- ✅ Desktop version: 1280x720
- ✅ HLS streaming support

---

## 🛠️ Example Use Cases

### 1. Upload Question Image
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('folder', 'pyqbuddy/questions');

const response = await fetch('http://localhost:9235/api/v1/media/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log('Image URL:', result.data.url);
```

### 2. Upload Explanation Video
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('folder', 'pyqbuddy/explanations');

const response = await fetch('http://localhost:9235/api/v1/media/upload-video', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log('Video URL:', result.data.url);
console.log('Thumbnail:', result.data.thumbnail);
```

### 3. Get Responsive Image URLs
```javascript
// Get different sizes for responsive images
const sizes = [
  { width: 320, height: 240 },  // Mobile
  { width: 768, height: 576 },  // Tablet
  { width: 1920, height: 1080 } // Desktop
];

const imageUrls = await Promise.all(
  sizes.map(async ({ width, height }) => {
    const response = await fetch('http://localhost:9235/api/v1/media/optimized-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicId: 'pyqbuddy/images/my-image',
        width,
        height,
        crop: 'fill',
        quality: 'auto'
      })
    });
    const result = await response.json();
    return { size: `${width}x${height}`, url: result.data.url };
  })
);
```

---

## 📝 Error Responses

### Invalid File Type:
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed."
}
```

### File Too Large:
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB for images."
}
```

### No File Provided:
```json
{
  "success": false,
  "message": "No image file provided"
}
```

### Unauthorized:
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 📦 Postman Collection

Import the updated Postman collection: `PYQBUDDY_Complete_Collection.postman_collection.json`

New folder added: **"Media Upload"** with all 7 endpoints.

---

## 🚀 Quick Start

1. **Install Dependencies:**
```bash
npm install cloudinary
```

2. **Set Environment Variables:**
Add to `.env` file:
```env
CLOUDINARY_CLOUD_NAME=dlzwwtbls
CLOUDINARY_API_KEY=312328378328984
CLOUDINARY_API_SECRET=54W5n4CQAPnMhEuhVRG0dOOeBkc
```

3. **Start Server:**
```bash
npm start
```

4. **Test Upload:**
```bash
curl -X POST http://localhost:9235/api/v1/media/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg"
```

---

## 📊 Storage Structure

```
Cloudinary Account (dlzwwtbls)
└── pyqbuddy/
    ├── images/
    │   ├── image-1703154321000-123456789.jpg
    │   └── image-1703154322000-987654321.png
    ├── videos/
    │   ├── video-1703154321000-111111111.mp4
    │   └── video-1703154322000-222222222.mp4
    ├── questions/
    │   └── question-diagrams/
    └── explanations/
        └── video-solutions/
```

---

**Last Updated:** December 21, 2025  
**Version:** 1.0  
**Cloudinary Account:** dlzwwtbls
