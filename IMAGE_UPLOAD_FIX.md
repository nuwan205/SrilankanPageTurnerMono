# Image Upload Fix Summary

## Issue
After uploading 1 image to the "Poster" field, users couldn't add multiple images to the "Gallery Images" field.

## Root Cause
The two ImageUpload components weren't properly isolated from each other, causing React to potentially reuse component state between them.

## Solution Applied

### 1. Added Unique Keys
```typescript
<ImageUpload
  key="poster-upload"  // Unique key for poster
  // ...
/>

<ImageUpload
  key="gallery-upload"  // Unique key for gallery
  // ...
/>
```

This ensures React treats them as completely separate component instances.

### 2. Used Functional setState
```typescript
// Before:
onChange={(urls) => setFormData({ ...formData, poster: urls[0] || '' })}

// After:
onChange={(urls) => {
  const newPoster = urls.length > 0 ? urls[0] : '';
  setFormData(prev => ({ ...prev, poster: newPoster }));
}}
```

This ensures we always work with the latest state, preventing stale closure issues.

## How to Test

1. **Open Admin Panel** → Manage Ads → Add New Ad
2. **Upload Poster Image:**
   - Click "Upload Images" under "Poster/Company Image"
   - Select 1 image
   - Verify it uploads successfully
3. **Upload Gallery Images:**
   - Scroll to "Gallery Images (1-5 images)"
   - Click "Upload Images"
   - Select multiple images (2-5)
   - **Expected:** All images upload successfully
   - **Expected:** Can see all gallery images as separate thumbnails
4. **Remove & Re-add:**
   - Remove a gallery image
   - Add another one
   - **Expected:** Works without issues
5. **Change Poster:**
   - Remove the poster image
   - Upload a different one
   - **Expected:** Gallery images remain untouched

## Technical Details

### Poster Field:
- Accepts: 1 image only
- Stored as: `formData.poster` (string)
- Database: `ads.poster` (TEXT, NOT NULL)

### Gallery Field:
- Accepts: 1-5 images
- Stored as: `formData.images` (string[])
- Database: `ads.images` (JSONB, NOT NULL)

### Component Isolation:
Each ImageUpload component now:
- Has a unique React key
- Manages its own upload state independently
- Updates form state using functional setState
- Validates against its own maxImages limit

## Files Changed
- ✅ `client/src/components/admin/ManageAdsPage.tsx`
  - Added unique keys to both ImageUpload components
  - Changed to functional setState pattern
  - Improved callback functions for clarity

## Validation Rules

### Poster Upload:
- Required: Yes (1 image minimum)
- Maximum: 1 image
- Validation: "Please upload a poster image"

### Gallery Upload:
- Required: Yes (1 image minimum)
- Maximum: 5 images
- Validation: "Please add at least one image"

Both validations are independent and checked in `handleSave()`.

## Troubleshooting

If issues persist:

1. **Check Browser Console:**
   - Look for errors during upload
   - Verify API responses are successful

2. **Check React DevTools:**
   - Inspect `formData` state
   - Verify `poster` is a string
   - Verify `images` is an array

3. **Check Network Tab:**
   - Ensure each image upload gets a 200 response
   - Verify image URLs are returned

4. **Clear State:**
   - Close and reopen the dialog
   - Try with a fresh browser tab

## Expected Behavior

✅ **Poster Upload:**
- Can upload 1 image
- Shows thumbnail when uploaded
- Can remove and re-upload
- Error if trying to add more than 1

✅ **Gallery Upload:**
- Can upload 1-5 images simultaneously
- Shows all thumbnails
- Can remove individual images
- Can add more until limit is reached
- Independent of poster upload

✅ **Form Submission:**
- Validates both fields separately
- Saves poster and gallery independently
- Backend receives both fields correctly
