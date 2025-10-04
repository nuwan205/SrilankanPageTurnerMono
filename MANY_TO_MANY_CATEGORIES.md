# Many-to-Many Categories Implementation

## Overview
Changed from **one place belongs to one category** to **one place can belong to multiple categories**.

## Status: 🚧 IN PROGRESS

### ✅ Completed:
1. Backend Schema Changes:
   - ✅ Created junction table `placesToCategories` for many-to-many relationship
   - ✅ Removed `categoryId` from places table
   - ✅ Updated shared types: `Place.categoryId` → `Place.categoryIds` (array)
   - ✅ Exported junction table from schema index

### ⚠️ TODO - Backend:
1. Update `placeService.ts`:
   - Modify `getPlaces()` to join with junction table
   - Modify `createPlace()` to insert into junction table
   - Modify `updatePlace()` to update junction table entries
   - Modify `deletePlace()` to cascade delete junction entries
   - Update `mapToSharedPlace()` to return `categoryIds` array

2. Update `places.ts` routes:
   - Update GET to support filtering by multiple categories
   - Update POST to handle `categoryIds` array
   - Update PUT to handle `categoryIds` array

3. Database Migration:
   ```sql
   -- Create junction table
   CREATE TABLE places_to_categories (
     place_id VARCHAR(255) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
     category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     PRIMARY KEY (place_id, category_id)
   );
   
   -- Migrate existing data from places.category_id
   INSERT INTO places_to_categories (place_id, category_id)
   SELECT id, category_id FROM places WHERE category_id IS NOT NULL;
   
   -- Drop old column
   ALTER TABLE places DROP COLUMN category_id;
   ```

### ⚠️ TODO - Frontend:
1. Remove Category → Places Link:
   - ✅ Already added in Categories.tsx (needs to be removed)
   - ❌ Delete route file: `client/src/routes/admin/categories/$categoryId/places.tsx`

2. Add Places to Admin Sidebar:
   - ❌ Update sidebar navigation to include "Places" menu item
   - ❌ Create route: `client/src/routes/admin/places.tsx`

3. Update ManagePlacesPage.tsx:
   - ❌ Remove `categoryId` prop (no longer filter by single category)
   - ❌ Change form to use multi-select for categories
   - ❌ Update state: `categoryId: string` → `categoryIds: string[]`
   - ❌ Add category multi-select dropdown component
   - ❌ Update API calls to send `categoryIds` array
   - ❌ Display chips/badges for selected categories

4. Update TourismBook Frontend:
   - ❌ Update `PlacesPage.tsx` to handle places with multiple categories
   - ❌ Update `CategoryPage.tsx` to fetch places by category from junction table
   - ❌ May need to adjust filtering logic

5. Update API Client:
   - ❌ Update `getPlaces()` parameters
   - ❌ Update `createPlace()` to accept `categoryIds`
   - ❌ Update `updatePlace()` to accept `categoryIds`

## Architecture Changes

### Old Structure:
```
places table:
- id
- category_id (FK) → ONE category
- name
- ...
```

### New Structure:
```
places table:              places_to_categories:        categories table:
- id                       - place_id (FK)              - id
- name                     - category_id (FK)           - title
- ...                      - created_at                 - ...
                           PRIMARY KEY (place_id, category_id)
```

### API Changes:

**Old:**
```typescript
// Create place
POST /api/places
{
  categoryId: "cat123",
  name: "Temple",
  ...
}

// Get places
GET /api/places?categoryId=cat123
```

**New:**
```typescript
// Create place
POST /api/places
{
  categoryIds: ["cat123", "cat456"],
  name: "Temple",
  ...
}

// Get places
GET /api/places?categoryIds=cat123,cat456
// Or get all and filter on frontend
```

## UI/UX Changes

### Admin Panel - Places Management:
1. **Separate Menu Item**: Places now has its own sidebar entry
2. **Multi-Category Selection**: 
   - Dropdown with checkboxes to select multiple categories
   - Display selected categories as chips/badges
   - Can filter places by category but not required
3. **Category Display**: Show all assigned categories for each place card

### Public Frontend - Tourism Book:
1. **Category Page**: Fetches places that have the selected category in their `categoryIds`
2. **Place Cards**: May show multiple category badges
3. **Filtering**: More flexible - one place appears in multiple categories

## Next Steps:
1. Update backend service and routes
2. Create database migration script
3. Update frontend components
4. Test thoroughly
5. Deploy with data migration

---

**Breaking Changes**: Yes - requires database migration and coordinated backend/frontend deployment
