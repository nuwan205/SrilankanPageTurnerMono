import { db } from "../config/drizzle";
import { places } from "../db/schema/places";
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
  async createPlace(data: CreatePlace): Promise<SharedPlace> {
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
   * Get places with optional filtering
   */
  async getPlaces(query: Partial<PlaceQuery> = {}): Promise<SharedPlace[]> {
    const { destinationId } = query;

    // Build WHERE conditions
    const conditions = [];
    
    if (destinationId) {
      conditions.push(eq(places.destinationId, destinationId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all results
    const placesList = await db
      .select()
      .from(places)
      .where(whereClause)
      .orderBy(desc(places.createdAt));

    return placesList.map(this.mapToSharedPlace);
  }

  /**
   * Get a single place by ID
   */
  async getPlaceById(id: string): Promise<SharedPlace | null> {
    const [place] = await db
      .select()
      .from(places)
      .where(eq(places.id, id))
      .limit(1);

    return place ? this.mapToSharedPlace(place) : null;
  }

  /**
   * Update a place
   */
  async updatePlace(id: string, data: UpdatePlace): Promise<SharedPlace | null> {
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
  async deletePlace(id: string): Promise<boolean> {
    const result = await db
      .delete(places)
      .where(eq(places.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get places count for a destination
   */
  async getPlacesCountByDestination(destinationId: string): Promise<number> {
    const result = await db
      .select()
      .from(places)
      .where(eq(places.destinationId, destinationId));

    return result.length;
  }

  /**
   * Map database place to shared type
   */
  private mapToSharedPlace(place: any): SharedPlace {
    return {
      id: place.id,
      destinationId: place.destinationId,
      name: place.name,
      description: place.description,
      rating: place.rating,
      duration: place.duration,
      images: place.images as string[],
      location: place.location as { lat: number; lng: number },
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
    };
  }
}

export const placeService = new PlaceService();
