import { getDb } from "../config/drizzle";
import { places } from "../db/schema/places";
import { placesToCategories } from "../db/schema/placesToCategories";
import { ads } from "../db/schema/ads";
import { eq, desc, and, inArray } from "drizzle-orm";
import type { 
  Place as SharedPlace, 
  CreatePlace, 
  UpdatePlace,
  PlaceQuery
} from "../../../shared/src/types/admin";

export class PlaceService {
  /**
   * Create a new place
   */

  async createPlace(databaseUrl: string, data: CreatePlace): Promise<SharedPlace> {
    const db = getDb(databaseUrl);
    const id = `place-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Extract categoryIds from data
    const { categoryIds, ...placeData } = data;

    // Insert the place
    const [place] = await db
      .insert(places)
      .values({
        id,
        ...placeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Insert category associations
    if (categoryIds && categoryIds.length > 0) {
      await db.insert(placesToCategories).values(
        categoryIds.map(categoryId => ({
          placeId: id,
          categoryId,
          createdAt: new Date(),
        }))
      );
    }

    return this.mapToSharedPlace(place, [], categoryIds);
  }

  /**
   * Get places with optional filtering, including their ads
   */
  async getPlaces(databaseUrl: string, query: Partial<PlaceQuery> = {}): Promise<SharedPlace[]> {
    const db = getDb(databaseUrl);
    const { categoryId, type } = query;

    let placeIds: string[] | undefined;

    // If filtering by category, get place IDs from junction table
    if (categoryId) {
      const placeCategories = await db
        .select({ placeId: placesToCategories.placeId })
        .from(placesToCategories)
        .where(eq(placesToCategories.categoryId, categoryId));
      
      placeIds = placeCategories.map(pc => pc.placeId);
      
      // If no places found for this category, return empty array
      if (placeIds.length === 0) {
        return [];
      }
    }

    // Build WHERE conditions
    const conditions = [];
    if (placeIds) {
      conditions.push(inArray(places.id, placeIds));
    }
    if (type) {
      conditions.push(eq(places.type, type));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all places
    const placesList = await db
      .select()
      .from(places)
      .where(whereClause)
      .orderBy(desc(places.createdAt));

    // Get category IDs for each place
    const allPlaceIds = placesList.map((place) => place.id);
    const categoriesByPlace: Record<string, string[]> = {};
    const adsByPlace: Record<string, any[]> = {};

    if (allPlaceIds.length > 0) {
      // Get categories
      const placeCategories = await db
        .select()
        .from(placesToCategories)
        .where(inArray(placesToCategories.placeId, allPlaceIds));

      placeCategories.forEach(pc => {
        categoriesByPlace[pc.placeId] ??= [];
        categoriesByPlace[pc.placeId]!.push(pc.categoryId);
      });

      // Get all ads for these places
      const allAds = await db
        .select()
        .from(ads)
        .where(inArray(ads.placeId, allPlaceIds));

      allAds.forEach(ad => {
        adsByPlace[ad.placeId] ??= [];
        adsByPlace[ad.placeId]!.push(ad);
      });
    }

    return placesList.map((place) => 
      this.mapToSharedPlace(place, adsByPlace[place.id] || [], categoriesByPlace[place.id] || [])
    );
  }

  /**
   * Get a single place by ID, including its ads
   */
  async getPlaceById(databaseUrl: string, id: string): Promise<SharedPlace | null> {
    const db = getDb(databaseUrl);
    const placeResult = await db
      .select()
      .from(places)
      .where(eq(places.id, id))
      .limit(1);

    if (!placeResult[0]) return null;

    // Get category IDs for this place
    const placeCategories = await db
      .select({ categoryId: placesToCategories.categoryId })
      .from(placesToCategories)
      .where(eq(placesToCategories.placeId, id));

    const categoryIds = placeCategories.map(pc => pc.categoryId);

    // Get all ads for this place
    const placeAds = await db
      .select()
      .from(ads)
      .where(eq(ads.placeId, id));

    return this.mapToSharedPlace(placeResult[0], placeAds, categoryIds);
  }

  /**
   * Update a place
   */
  async updatePlace(databaseUrl: string, id: string, data: UpdatePlace): Promise<SharedPlace | null> {
    const db = getDb(databaseUrl);
    
    // Extract categoryIds from data
    const { categoryIds, ...placeData } = data;

    // Update the place
    const [place] = await db
      .update(places)
      .set({
        ...placeData,
        updatedAt: new Date(),
      })
      .where(eq(places.id, id))
      .returning();

    if (!place) return null;

    // Update category associations if provided
    if (categoryIds !== undefined) {
      // Delete existing associations
      await db
        .delete(placesToCategories)
        .where(eq(placesToCategories.placeId, id));

      // Insert new associations
      if (categoryIds.length > 0) {
        await db.insert(placesToCategories).values(
          categoryIds.map(categoryId => ({
            placeId: id,
            categoryId,
            createdAt: new Date(),
          }))
        );
      }
    }

    // Get current category IDs
    const placeCategories = await db
      .select({ categoryId: placesToCategories.categoryId })
      .from(placesToCategories)
      .where(eq(placesToCategories.placeId, id));

    const finalCategoryIds = placeCategories.map(pc => pc.categoryId);

    return this.mapToSharedPlace(place, [], finalCategoryIds);
  }

  /**
   * Delete a place
   */
  async deletePlace(databaseUrl: string, id: string): Promise<boolean> {
    const db = getDb(databaseUrl);
    const result = await db
      .delete(places)
      .where(eq(places.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get places count for a category
   */
  async getPlacesCountByCategory(databaseUrl: string, categoryId: string): Promise<number> {
    const db = getDb(databaseUrl);
    const result = await db
      .select({ placeId: placesToCategories.placeId })
      .from(placesToCategories)
      .where(eq(placesToCategories.categoryId, categoryId));

    return result.length;
  }

  /**
   * Map database place to shared type, including ads if present
   */
  private mapToSharedPlace(place: any, adsArray: any[] = [], categoryIds: string[] = []): SharedPlace {
    const mappedPlace: SharedPlace = {
      id: place.id,
      categoryIds: categoryIds,
      name: place.name,
      description: place.description,
      rating: place.rating,
      duration: place.duration,
      highlights: place.highlights as string[],
      images: place.images as string[],
      location: place.location as { lat: number; lng: number },
      type: place.type || "wellknown",
      bestTime: place.bestTime,
      travelTime: place.travelTime,
      idealFor: place.idealFor,
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
    };

    // Add ads information if they exist
    if (adsArray && adsArray.length > 0) {
      // Map ads to the expected format
      (mappedPlace as any).ads = adsArray.map(ad => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        poster: ad.poster,
        images: ad.images,
        rating: ad.rating,
        phone: ad.phone || undefined,
        whatsapp: ad.whatsapp || undefined,
        email: ad.email || undefined,
        link: ad.link,
        bookingLink: ad.bookingLink || undefined,
      }));

      // For backward compatibility, set the first ad as 'ad'
      (mappedPlace as any).ad = (mappedPlace as any).ads[0];
    }

    return mappedPlace;
  }
}

export const placeService = new PlaceService();
