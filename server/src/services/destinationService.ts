import { getDb } from "../config/drizzle";
import { destinations } from "../db/schema/destinations";
import { eq, desc, and, sql } from "drizzle-orm";
import { ImageService } from "./imageService";
import type { 
  Destination as SharedDestination, 
  CreateDestination, 
  UpdateDestination,
  DestinationQuery
} from "../../../shared/src/types/admin";

export class DestinationService {
  /**
   * Create a new destination
   */
  
  async createDestination(databaseUrl: string, data: CreateDestination): Promise<SharedDestination> {
    const db = getDb(databaseUrl);
    const id = `destination-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const [destination] = await db
      .insert(destinations)
      .values({
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToSharedDestination(destination);
  }

  /**
   * Get destinations with optional filtering
   */
  async getDestinations(databaseUrl: string, query: Partial<DestinationQuery> = {}): Promise<{
    destinations: SharedDestination[];
  }> {
    const db = getDb(databaseUrl);
    const { categoryId, enabled, search } = query;

    // Build WHERE conditions
    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(destinations.categoryId, categoryId));
    }
    
    if (enabled !== undefined) {
      conditions.push(eq(destinations.enabled, enabled));
    }
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        sql`(${destinations.title} ILIKE ${searchPattern} OR ${destinations.description} ILIKE ${searchPattern})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all results
    const destinationList = await db
      .select()
      .from(destinations)
      .where(whereClause)
      .orderBy(desc(destinations.createdAt));

    return {
      destinations: destinationList.map(this.mapToSharedDestination),
    };
  }

  /**
   * Get a single destination by ID
   */
  async getDestinationById(databaseUrl: string, id: string): Promise<SharedDestination | null> {
    const db = getDb(databaseUrl);
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);

    return destination ? this.mapToSharedDestination(destination) : null;
  }

  /**
   * Update a destination
   */
  async updateDestination(databaseUrl: string, id: string, data: UpdateDestination): Promise<SharedDestination | null> {
    const db = getDb(databaseUrl);
    const [destination] = await db
      .update(destinations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(destinations.id, id))
      .returning();

    return destination ? this.mapToSharedDestination(destination) : null;
  }

  /**
   * Delete a destination
   */
  async deleteDestination(databaseUrl: string, id: string, imageService?: ImageService): Promise<boolean> {
    const db = getDb(databaseUrl);
    // First, get the destination to retrieve its images
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);

    if (!destination) {
      return false;
    }

    // Delete the destination from database
    const result = await db
      .delete(destinations)
      .where(eq(destinations.id, id))
      .returning({ id: destinations.id });

    // If deletion successful, delete images from R2 storage
    if (result.length > 0 && destination.images && Array.isArray(destination.images) && imageService) {
      for (const imageUrl of destination.images) {
        try {
          const imageKey = this.extractImageKey(imageUrl);
          await imageService.deleteImage(imageKey);
          console.log(`Deleted image from R2: ${imageKey}`);
        } catch (error) {
          console.error(`Failed to delete image from R2: ${imageUrl}`, error);
          // Continue with other images even if one fails
        }
      }
    }

    return result.length > 0;
  }

  /**
   * Toggle destination enabled status
   */
  async toggleDestinationEnabled(databaseUrl: string, id: string): Promise<SharedDestination | null> {
    const db = getDb(databaseUrl);
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);

    if (!destination) {
      return null;
    }

    const [updated] = await db
      .update(destinations)
      .set({
        enabled: !destination.enabled,
        updatedAt: new Date(),
      })
      .where(eq(destinations.id, id))
      .returning();

    return this.mapToSharedDestination(updated);
  }

  /**
   * Get destinations count by category
   */
  async getDestinationsCountByCategory(databaseUrl: string, categoryId: string): Promise<number> {
    const db = getDb(databaseUrl);
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(destinations)
      .where(eq(destinations.categoryId, categoryId));

    return Number(countResult[0]?.count ?? 0);
  }

  /**
   * Extract image key from full URL
   */
  private extractImageKey(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      // If URL parsing fails, assume it's already a key
      return url;
    }
  }

  /**
   * Map database destination to shared type
   */
  private mapToSharedDestination(destination: any): SharedDestination {
    return {
      id: destination.id,
      categoryId: destination.categoryId,
      title: destination.title,
      description: destination.description,
      rating: destination.rating,
      duration: destination.duration,
      highlights: destination.highlights as string[],
      images: destination.images as string[],
      enabled: destination.enabled,
      createdAt: destination.createdAt.toISOString(),
      updatedAt: destination.updatedAt.toISOString(),
    };
  }
}

// Export a singleton instance
export const destinationService = new DestinationService();
