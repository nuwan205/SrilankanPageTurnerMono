import { db } from "../db";
import { ads } from "../db/schema/ads";
import { places } from "../db/schema/places";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Ad as SharedAd } from "../../../shared/src/types";

type Ad = SharedAd & { placeName?: string };
type CreateAd = Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>;
type UpdateAd = Partial<CreateAd>;

// Map database Ad to shared Ad type
const mapToSharedAd = (dbAd: typeof ads.$inferSelect, placeName?: string): Ad => {
  return {
    id: dbAd.id,
    placeId: dbAd.placeId,
    placeName: placeName,
    title: dbAd.title,
    description: dbAd.description,
    images: dbAd.images,
    rating: dbAd.rating,
    phone: dbAd.phone || undefined,
    whatsapp: dbAd.whatsapp || undefined,
    email: dbAd.email || undefined,
    link: dbAd.link,
    bookingLink: dbAd.bookingLink || undefined,
    createdAt: dbAd.createdAt.toISOString(),
    updatedAt: dbAd.updatedAt.toISOString(),
  };
};

export class AdService {
  // Get all ads
  async getAllAds(): Promise<Ad[]> {
    const allAds = await db
      .select({
        ad: ads,
        place: places,
      })
      .from(ads)
      .leftJoin(places, eq(ads.placeId, places.id))
      .orderBy(ads.createdAt);

    return allAds.map(({ ad, place }) => mapToSharedAd(ad, place?.name));
  }

  // Get ad by ID
  async getAdById(id: string): Promise<Ad | null> {
    const result = await db
      .select({
        ad: ads,
        place: places,
      })
      .from(ads)
      .leftJoin(places, eq(ads.placeId, places.id))
      .where(eq(ads.id, id))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return mapToSharedAd(result[0].ad, result[0].place?.name);
  }

  // Get ads by place ID
  async getAdsByPlaceId(placeId: string): Promise<Ad[]> {
    const placeAds = await db
      .select({
        ad: ads,
        place: places,
      })
      .from(ads)
      .leftJoin(places, eq(ads.placeId, places.id))
      .where(eq(ads.placeId, placeId))
      .orderBy(ads.createdAt);

    return placeAds.map(({ ad, place }) => mapToSharedAd(ad, place?.name));
  }

  // Create new ad
  async createAd(data: CreateAd): Promise<Ad> {
    const id = nanoid();
    const now = new Date();

    const [newAd] = await db
      .insert(ads)
      .values({
        id,
        placeId: data.placeId,
        title: data.title,
        description: data.description,
        images: data.images,
        rating: data.rating ?? 4.5,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        link: data.link,
        bookingLink: data.bookingLink,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!newAd) {
      throw new Error('Failed to create ad');
    }

    // Get place name
    const place = await db
      .select()
      .from(places)
      .where(eq(places.id, data.placeId))
      .limit(1);

    return mapToSharedAd(newAd, place[0]?.name);
  }

  // Update ad
  async updateAd(id: string, data: UpdateAd): Promise<Ad | null> {
    const now = new Date();

    const [updatedAd] = await db
      .update(ads)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(ads.id, id))
      .returning();

    if (!updatedAd) {
      return null;
    }

    // Get place name
    const place = await db
      .select()
      .from(places)
      .where(eq(places.id, updatedAd.placeId))
      .limit(1);

    return mapToSharedAd(updatedAd, place[0]?.name);
  }

  // Delete ad
  async deleteAd(id: string): Promise<boolean> {
    const result = await db.delete(ads).where(eq(ads.id, id)).returning();
    return result.length > 0;
  }

  // Check if place already has an ad
  async checkPlaceHasAd(placeId: string, excludeAdId?: string): Promise<boolean> {
    const query = db
      .select({ id: ads.id })
      .from(ads)
      .where(eq(ads.placeId, placeId));

    const result = await query;

    if (excludeAdId) {
      return result.some(ad => ad.id !== excludeAdId);
    }

    return result.length > 0;
  }
}

export const adService = new AdService();
