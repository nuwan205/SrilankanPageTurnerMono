import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { categoryService } from "../services/categoryService";
import type { 
  CreateCategory,
  UpdateCategory,
  CategoriesResponse,
  CategoryResponse,
  ApiResponse
} from "../../../shared/src/types/admin";

const categoryRoutes = new Hono();

/**
 * Get all categories
 * GET /api/categories
 * Note: This endpoint is public and doesn't require authentication
 */
categoryRoutes.get("/", async (c) => {
  try {
    const result = await categoryService.getCategories();

    const response: CategoriesResponse = {
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get categories error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve categories",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Get a single category by ID
 * GET /api/categories/:id
 * Note: This endpoint is public and doesn't require authentication
 */
categoryRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No category ID provided",
        message: "Please provide a category ID",
      } as ApiResponse, 400);
    }

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return c.json({
        success: false,
        error: "Category not found",
        message: "The requested category does not exist",
      } as ApiResponse, 404);
    }

    const response: CategoryResponse = {
      success: true,
      message: "Category retrieved successfully",
      data: category,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get category error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve category",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Create a new category
 * POST /api/categories
 * Note: This endpoint requires authentication
 */
categoryRoutes.post("/", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input using shared schema
    let validatedData: CreateCategory;
    try {
      // Import the validation function
      const { validateCreateCategory } = await import("../../../shared/src/types/admin");
      validatedData = validateCreateCategory(body);
    } catch (validationError) {
      return c.json({
        success: false,
        error: "Validation failed",
        message: validationError instanceof Error ? validationError.message : "Invalid input data",
      } as ApiResponse, 400);
    }

    const category = await categoryService.createCategory(validatedData);

    const response: CategoryResponse = {
      success: true,
      message: "Category created successfully",
      data: category,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return c.json({
      success: false,
      error: "Failed to create category",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Update an existing category
 * PUT /api/categories/:id
 * Note: This endpoint requires authentication
 */
categoryRoutes.put("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!id) {
      return c.json({
        success: false,
        error: "No category ID provided",
        message: "Please provide a category ID",
      } as ApiResponse, 400);
    }

    // Validate input using shared schema
    let validatedData: UpdateCategory;
    try {
      const { validateUpdateCategory } = await import("../../../shared/src/types/admin");
      validatedData = validateUpdateCategory(body);
    } catch (validationError) {
      return c.json({
        success: false,
        error: "Validation failed",
        message: validationError instanceof Error ? validationError.message : "Invalid input data",
      } as ApiResponse, 400);
    }

    const category = await categoryService.updateCategory(id, validatedData);

    if (!category) {
      return c.json({
        success: false,
        error: "Category not found",
        message: "The requested category does not exist",
      } as ApiResponse, 404);
    }

    const response: CategoryResponse = {
      success: true,
      message: "Category updated successfully",
      data: category,
    };

    return c.json(response);
  } catch (error) {
    console.error("Update category error:", error);
    return c.json({
      success: false,
      error: "Failed to update category",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Delete a category
 * DELETE /api/categories/:id
 * Note: This endpoint requires authentication
 */
categoryRoutes.delete("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No category ID provided",
        message: "Please provide a category ID",
      } as ApiResponse, 400);
    }

    const deleted = await categoryService.deleteCategory(id);

    if (!deleted) {
      return c.json({
        success: false,
        error: "Category not found",
        message: "The requested category does not exist",
      } as ApiResponse, 404);
    }

    return c.json({
      success: true,
      message: "Category deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete category error:", error);
    return c.json({
      success: false,
      error: "Failed to delete category",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Toggle category enabled status
 * PATCH /api/categories/:id/toggle
 * Note: This endpoint requires authentication
 */
categoryRoutes.patch("/:id/toggle", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No category ID provided",
        message: "Please provide a category ID",
      } as ApiResponse, 400);
    }

    const category = await categoryService.toggleCategoryEnabled(id);

    if (!category) {
      return c.json({
        success: false,
        error: "Category not found",
        message: "The requested category does not exist",
      } as ApiResponse, 404);
    }

    const response: CategoryResponse = {
      success: true,
      message: `Category ${category.enabled ? "enabled" : "disabled"} successfully`,
      data: category,
    };

    return c.json(response);
  } catch (error) {
    console.error("Toggle category error:", error);
    return c.json({
      success: false,
      error: "Failed to toggle category status",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

export { categoryRoutes };
