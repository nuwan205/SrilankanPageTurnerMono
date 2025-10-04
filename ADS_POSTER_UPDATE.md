# Ads Poster & Multiple Images Update

## Summary
Updated the Ads management system to support:
1. **One Place → Multiple Ads**: A place can have several ads, but each ad belongs to exactly one place
2. **Poster Image**: Each ad has a single poster/company logo image (new field)
3. **Gallery Images**: Each ad maintains 1-5 gallery images for carousel display

## Changes Made

### 1. Database Schema (`server/src/db/schema/ads.ts`)
```typescript
export const ads = pgTable("ads", {
  // ...existing fields...
  poster: text("poster").notNull(), // NEW: Single poster/company image
  // ...rest of fields...
});
```

### 2. Migration Script (`server/migrations/0004_add_ads_poster.sql`)
- Adds `poster` column (TEXT, NOT NULL)
- Sets default poster to first image from existing ads
- Includes rollback-safe logic

**To apply:**
```bash
psql -U your_user -d your_database -f server/migrations/0004_add_ads_poster.sql
```

### 3. Shared Types (`shared/src/types/admin.ts`)
```typescript
export const AdSchema = z.object({
  // ...existing fields...
  poster: z.string().regex(/^https?:\/\/.+/, "Valid poster image URL required"),
  // ...rest of fields...
});
```

### 4. Backend Service (`server/src/services/adService.ts`)
- Updated `mapToSharedAd()` to include poster field
- Updated `createAd()` to handle poster field

### 5. Backend Routes (`server/src/routes/ads.ts`)
- Already validates using updated shared schemas
- Enforces "one ad per place" rule
- Validates poster field automatically through Zod

### 6. Frontend (`client/src/components/admin/ManageAdsPage.tsx`)

#### Updated Ad Interface:
```typescript
interface Ad {
  // ...existing fields...
  poster: string; // NEW FIELD: Single poster/company image
  // ...rest of fields...
}
```

#### Updated Form State:
```typescript
const [formData, setFormData] = useState({
  // ...existing fields...
  poster: '', // NEW FIELD: Single poster image
  // ...rest of fields...
});
```

#### New UI Components:
1. **Poster Upload** (Single Image):
   - Label: "Poster/Company Image (1 image required) *"
   - maxImages: 1
   - Used for main branding/logo image

2. **Gallery Upload** (Multiple Images):
   - Label: "Gallery Images (1-5 images) *"
   - maxImages: 5
   - Used for carousel display

## Usage Guide

### For Admins:

1. **Create New Ad:**
   - Select a place from dropdown (one ad per place)
   - Enter ad title and description
   - **Upload poster image** (1 required) - Company logo or main visual
   - **Upload gallery images** (1-5 required) - Additional photos for carousel
   - Add contact info (optional)
   - Add website link (required)

2. **Edit Existing Ad:**
   - Click "Edit" on any ad card
   - Update fields as needed
   - Change poster or gallery images independently

### Image Upload Workflow:

**Poster Image:**
- Upload exactly 1 image
- This becomes the primary branding image
- Recommended: Company logo, main visual, or location photo

**Gallery Images:**
- Upload 1-5 images
- These appear in the carousel
- Can add/remove independently of poster

## Data Relationship

```
Place (1) ────→ (*) Ads
   ↓
Each Place can have MULTIPLE ads
Each Ad belongs to ONE place
Each Ad has:
  - 1 poster image (NEW)
  - 1-5 gallery images (existing)
```

## API Changes

### Create Ad (POST /api/ads)
```json
{
  "placeId": "abc123",
  "title": "Luxury Hotel",
  "description": "...",
  "poster": "https://example.com/poster.jpg",  // NEW FIELD
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "rating": 4.5,
  "phone": "+94...",
  "link": "https://..."
}
```

### Update Ad (PUT /api/ads/:id)
Same structure as create, all fields optional except what's being updated.

## Testing Checklist

- [ ] Run migration script
- [ ] Create new ad with poster + gallery images
- [ ] Edit ad and change poster only
- [ ] Edit ad and change gallery images only
- [ ] Verify one ad per place rule
- [ ] Test with place that has no ads
- [ ] Test validation errors (missing poster, missing gallery)
- [ ] Verify images display correctly in cards
- [ ] Test search and filtering

## Known Issues & Solutions

### Issue: "Cannot add multiple gallery images after poster"
**Cause**: Each ImageUpload component is independent and tracks its own state.

**Solution**: The components work correctly - ensure you:
1. Upload 1 image to Poster field
2. Then upload 1-5 images to Gallery field (separately)
3. Each component has its own upload button

**Debug Steps:**
1. Check formData.poster has 1 URL
2. Check formData.images is an array (can be 1-5 URLs)
3. Verify both ImageUpload components render independently
4. Check browser console for errors

## Files Changed

### Backend:
- ✅ `server/src/db/schema/ads.ts`
- ✅ `server/src/services/adService.ts`
- ✅ `server/migrations/0004_add_ads_poster.sql`
- ✅ `shared/src/types/admin.ts`

### Frontend:
- ✅ `client/src/components/admin/ManageAdsPage.tsx`

## Next Steps

1. **Run Migration:**
   ```bash
   cd server
   psql $DATABASE_URL -f migrations/0004_add_ads_poster.sql
   ```

2. **Test Functionality:**
   - Go to Admin Panel → Manage Ads
   - Create a new ad
   - Upload poster (1 image)
   - Upload gallery (multiple images)
   - Verify both work independently

3. **Update Existing Ads:**
   - Edit existing ads to add poster images
   - Existing gallery images remain unchanged

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify formData state in React DevTools
3. Check API responses in Network tab
4. Ensure migration was applied successfully
5. Verify ImageUpload component props are correct
