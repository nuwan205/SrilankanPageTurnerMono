import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { destinationService } from "../services/destinationService";
import type { 
  CreateDestination,
  UpdateDestination,
  DestinationsResponse,
  DestinationResponse,
  ApiResponse,
  DestinationQuery
} from "../../../shared/src/types/admin";

type Bindings = {
  DATABASE_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_TOKEN: string;
  BUCKET_NAME: string;
  PUBLIC_BUCKET_URL: string;
};

const destinationRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Get all destinations with optional filtering
 * GET /api/destinations
 * Query params: categoryId, enabled, search
 * Note: This endpoint is public and doesn't require authentication
 */
destinationRoutes.get("/", async (c) => {
  try {
    const query = c.req.query();
    
    const destinationQuery: DestinationQuery = {
      categoryId: query.categoryId,
      enabled: query.enabled ? query.enabled === 'true' : undefined,
      search: query.search,
    };

    const result = await destinationService.getDestinations(c.env.DATABASE_URL, destinationQuery);

    const response: DestinationsResponse = {
      success: true,
      message: "Destinations retrieved successfully",
      data: result,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get destinations error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve destinations",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Get a single destination by ID
 * GET /api/destinations/:id
 * Note: This endpoint is public and doesn't require authentication
 */
destinationRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No destination ID provided",
        message: "Please provide a destination ID",
      } as ApiResponse, 400);
    }

    const destination = await destinationService.getDestinationById(c.env.DATABASE_URL, id);

    if (!destination) {
      return c.json({
        success: false,
        error: "Destination not found",
        message: "The requested destination does not exist",
      } as ApiResponse, 404);
    }

    const response: DestinationResponse = {
      success: true,
      message: "Destination retrieved successfully",
      data: destination,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get destination error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve destination",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Get destinations count by category
 * GET /api/destinations/category/:categoryId/count
 */
destinationRoutes.get("/category/:categoryId/count", async (c) => {
  try {
    const categoryId = c.req.param("categoryId");

    if (!categoryId) {
      return c.json({
        success: false,
        error: "No category ID provided",
        message: "Please provide a category ID",
      } as ApiResponse, 400);
    }

    const count = await destinationService.getDestinationsCountByCategory(c.env.DATABASE_URL, categoryId);

    return c.json({
      success: true,
      message: "Count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    console.error("Get destinations count error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve count",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Create a new destination
 * POST /api/destinations
 * Note: This endpoint requires authentication
 */
destinationRoutes.post("/", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input using shared schema
    let validatedData: CreateDestination;
    try {
      const { validateCreateDestination } = await import("../../../shared/src/types/admin");
      validatedData = validateCreateDestination(body);
    } catch (validationError) {
      return c.json({
        success: false,
        error: "Validation failed",
        message: validationError instanceof Error ? validationError.message : "Invalid input data",
      } as ApiResponse, 400);
    }

    const destination = await destinationService.createDestination(c.env.DATABASE_URL, validatedData);

    const response: DestinationResponse = {
      success: true,
      message: "Destination created successfully",
      data: destination,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error("Create destination error:", error);
    return c.json({
      success: false,
      error: "Failed to create destination",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Update a destination
 * PUT /api/destinations/:id
 * Note: This endpoint requires authentication
 */
destinationRoutes.put("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!id) {
      return c.json({
        success: false,
        error: "No destination ID provided",
        message: "Please provide a destination ID",
      } as ApiResponse, 400);
    }

    // Validate input using shared schema
    let validatedData: UpdateDestination;
    try {
      const { validateUpdateDestination } = await import("../../../shared/src/types/admin");
      validatedData = validateUpdateDestination(body);
    } catch (validationError) {
      return c.json({
        success: false,
        error: "Validation failed",
        message: validationError instanceof Error ? validationError.message : "Invalid input data",
      } as ApiResponse, 400);
    }

    const destination = await destinationService.updateDestination(c.env.DATABASE_URL, id, validatedData);

    if (!destination) {
      return c.json({
        success: false,
        error: "Destination not found",
        message: "The requested destination does not exist",
      } as ApiResponse, 404);
    }

    const response: DestinationResponse = {
      success: true,
      message: "Destination updated successfully",
      data: destination,
    };

    return c.json(response);
  } catch (error) {
    console.error("Update destination error:", error);
    return c.json({
      success: false,
      error: "Failed to update destination",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Delete a destination
 * DELETE /api/destinations/:id
 * Note: This endpoint requires authentication
 */
destinationRoutes.delete("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No destination ID provided",
        message: "Please provide a destination ID",
      } as ApiResponse, 400);
    }

    const deleted = await destinationService.deleteDestination(c.env.DATABASE_URL, id);

    if (!deleted) {
      return c.json({
        success: false,
        error: "Destination not found",
        message: "The requested destination does not exist",
      } as ApiResponse, 404);
    }

    return c.json({
      success: true,
      message: "Destination deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete destination error:", error);
    return c.json({
      success: false,
      error: "Failed to delete destination",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Toggle destination enabled status
 * PATCH /api/destinations/:id/toggle
 * Note: This endpoint requires authentication
 */
destinationRoutes.patch("/:id/toggle", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No destination ID provided",
        message: "Please provide a destination ID",
      } as ApiResponse, 400);
    }

    const destination = await destinationService.toggleDestinationEnabled(c.env.DATABASE_URL, id);

    if (!destination) {
      return c.json({
        success: false,
        error: "Destination not found",
        message: "The requested destination does not exist",
      } as ApiResponse, 404);
    }

    const response: DestinationResponse = {
      success: true,
      message: "Destination status toggled successfully",
      data: destination,
    };

    return c.json(response);
  } catch (error) {
    console.error("Toggle destination error:", error);
    return c.json({
      success: false,
      error: "Failed to toggle destination status",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

export default destinationRoutes;
