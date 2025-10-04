import { getDb } from "../config/drizzle";
import { categories } from "../db/schema/categories";
import { eq, desc } from "drizzle-orm";
import { ImageService } from "./imageService";
import type { 
  Category as SharedCategory, 
  CreateCategory, 
  UpdateCategory
} from "../../../shared/src/types/admin";

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(databaseUrl: string, data: CreateCategory): Promise<SharedCategory> {
    const db = getDb(databaseUrl);
    const id = `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const [category] = await db
      .insert(categories)
      .values({
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToSharedCategory(category);
  }

  /**
   * Get all categories
   */
  async getCategories(databaseUrl: string, type?: "category" | "location"): Promise<{
    categories: SharedCategory[];
  }> {
    const db = getDb(databaseUrl);
    
    let query = db.select().from(categories);
    
    // Filter by type if provided
    if (type) {
      query = query.where(eq(categories.type, type)) as any;
    }
    
    const categoryList = await query.orderBy(desc(categories.createdAt));

    return {
      categories: categoryList.map(this.mapToSharedCategory)
    };
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(databaseUrl: string, id: string): Promise<SharedCategory | null> {
    const db = getDb(databaseUrl);
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return category ? this.mapToSharedCategory(category) : null;
  }

  /**
   * Update a category
   */
  async updateCategory(databaseUrl: string, id: string, data: UpdateCategory): Promise<SharedCategory | null> {
    const db = getDb(databaseUrl);
    const [category] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return category ? this.mapToSharedCategory(category) : null;
  }

  /**
   * Delete a category
   */
  async deleteCategory(databaseUrl: string, id: string, imageService?: ImageService): Promise<boolean> {
    const db = getDb(databaseUrl);
    // First, get the category to retrieve its image
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      return false;
    }

    // Delete the category from database
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    // If deletion successful and category has an image, delete it from R2 storage
    if (result.length > 0 && category.imageUrl && imageService) {
      try {
        const imageKey = this.extractImageKey(category.imageUrl);
        await imageService.deleteImage(imageKey);
        console.log(`Deleted category image from R2: ${imageKey}`);
      } catch (error) {
        console.error(`Failed to delete category image from R2: ${category.imageUrl}`, error);
      }
    }

    return result.length > 0;
  }

  /**
   * Toggle category enabled status
   */
  async toggleCategoryEnabled(databaseUrl: string, id: string): Promise<SharedCategory | null> {
    const db = getDb(databaseUrl);
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      return null;
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        enabled: !category.enabled,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return this.mapToSharedCategory(updatedCategory);
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
   * Map database category to shared category type
   */
  private mapToSharedCategory(category: any): SharedCategory {
    return {
      id: category.id,
      title: category.title,
      description: category.description,
      imageUrl: category.imageUrl,
      icon: category.icon,
      color: category.color,
      type: category.type || "category",
      enabled: category.enabled,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
