import { db } from "../config/drizzle";
import { categories } from "../db/schema/categories";
import { eq, desc } from "drizzle-orm";
import type { 
  Category as SharedCategory, 
  CreateCategory, 
  UpdateCategory
} from "../../../shared/src/types/admin";

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategory): Promise<SharedCategory> {
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
  async getCategories(): Promise<{
    categories: SharedCategory[];
  }> {
    // Get all categories without any filtering
    const categoryList = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));

    return {
      categories: categoryList.map(this.mapToSharedCategory)
    };
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<SharedCategory | null> {
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
  async updateCategory(id: string, data: UpdateCategory): Promise<SharedCategory | null> {
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
  async deleteCategory(id: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    return result.length > 0;
  }

  /**
   * Toggle category enabled status
   */
  async toggleCategoryEnabled(id: string): Promise<SharedCategory | null> {
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
      enabled: category.enabled,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
