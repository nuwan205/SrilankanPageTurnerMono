import { getDb } from "../config/drizzle";
import { places } from "../db/schema/places";
import { ads } from "../db/schema/ads";
import { eq, desc, and } from "drizzle-orm";
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

    const [place] = await db
      .insert(places)
      .values({
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToSharedPlace(place);
  }

  /**
   * Get places with optional filtering, including their ads
   */
  async getPlaces(databaseUrl: string, query: Partial<PlaceQuery> = {}): Promise<SharedPlace[]> {
    const db = getDb(databaseUrl);
    const { destinationId } = query;

    // Build WHERE conditions
    const conditions = [];
    
    if (destinationId) {
      conditions.push(eq(places.destinationId, destinationId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all results with left join to ads
    const placesList = await db
      .select({
        place: places,
        ad: ads,
      })
      .from(places)
      .leftJoin(ads, eq(places.id, ads.placeId))
      .where(whereClause)
      .orderBy(desc(places.createdAt));

    return placesList.map(({ place, ad }) => this.mapToSharedPlace(place, ad));
  }

  /**
   * Get a single place by ID, including its ad
   */
  async getPlaceById(databaseUrl: string, id: string): Promise<SharedPlace | null> {
    const db = getDb(databaseUrl);
    const result = await db
      .select({
        place: places,
        ad: ads,
      })
      .from(places)
      .leftJoin(ads, eq(places.id, ads.placeId))
      .where(eq(places.id, id))
      .limit(1);

    if (!result[0]) return null;

    return this.mapToSharedPlace(result[0].place, result[0].ad);
  }

  /**
   * Update a place
   */
  async updatePlace(databaseUrl: string, id: string, data: UpdatePlace): Promise<SharedPlace | null> {
    const db = getDb(databaseUrl);
    const [place] = await db
      .update(places)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(places.id, id))
      .returning();

    return place ? this.mapToSharedPlace(place) : null;
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
   * Get places count for a destination
   */
  async getPlacesCountByDestination(databaseUrl: string, destinationId: string): Promise<number> {
    const db = getDb(databaseUrl);
    const result = await db
      .select()
      .from(places)
      .where(eq(places.destinationId, destinationId));

    return result.length;
  }

  /**
   * Map database place to shared type, including ad if present
   */
  private mapToSharedPlace(place: any, ad?: any): SharedPlace {
    const mappedPlace: SharedPlace = {
      id: place.id,
      destinationId: place.destinationId,
      name: place.name,
      description: place.description,
      rating: place.rating,
      duration: place.duration,
      timeDuration: place.timeDuration,
      highlights: place.highlights as string[],
      images: place.images as string[],
      location: place.location as { lat: number; lng: number },
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
    };

    // Add ad information if it exists
    if (ad) {
      (mappedPlace as any).ad = {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        images: ad.images,
        rating: ad.rating,
        phone: ad.phone || undefined,
        whatsapp: ad.whatsapp || undefined,
        email: ad.email || undefined,
        link: ad.link,
        bookingLink: ad.bookingLink || undefined,
      };
    }

    return mappedPlace;
  }
}

export const placeService = new PlaceService();
