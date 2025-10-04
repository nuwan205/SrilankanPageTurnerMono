import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { placeService } from "../services/placeService";
import type { 
  CreatePlace,
  UpdatePlace,
  PlacesResponse,
  PlaceResponse,
  ApiResponse,
  PlaceQuery
} from "../../../shared/src/types/admin";

type Bindings = {
  DATABASE_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_TOKEN: string;
  BUCKET_NAME: string;
  PUBLIC_BUCKET_URL: string;
};

const placeRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Get all places with optional filtering
 * GET /api/places
 * Query params: destinationId
 * Note: This endpoint is public and doesn't require authentication
 */
placeRoutes.get("/", async (c) => {
  try {
    const query = c.req.query();
    
    const placeQuery: PlaceQuery = {
      destinationId: query.destinationId,
    };

    const places = await placeService.getPlaces(c.env.DATABASE_URL, placeQuery);

    const response: PlacesResponse = {
      success: true,
      message: "Places retrieved successfully",
      data: { places },
    };

    return c.json(response);
  } catch (error) {
    console.error("Get places error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve places",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Get a single place by ID
 * GET /api/places/:id
 * Note: This endpoint is public and doesn't require authentication
 */
placeRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No place ID provided",
        message: "Please provide a place ID",
      } as ApiResponse, 400);
    }

    const place = await placeService.getPlaceById(c.env.DATABASE_URL, id);

    if (!place) {
      return c.json({
        success: false,
        error: "Place not found",
        message: "The requested place does not exist",
      } as ApiResponse, 404);
    }

    const response: PlaceResponse = {
      success: true,
      message: "Place retrieved successfully",
      data: place,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get place error:", error);
    return c.json({
      success: false,
      error: "Failed to retrieve place",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Create a new place
 * POST /api/places
 * Requires authentication
 */
placeRoutes.post("/", requireAuth, async (c) => {
  try {
    const body = await c.req.json();

    // Validate required fields
    if (!body.name || !body.description || !body.destinationId || !body.location || !body.timeDuration || !body.highlights) {
      return c.json({
        success: false,
        error: "Missing required fields",
        message: "Please provide name, description, destinationId, location, timeDuration, and highlights",
      } as ApiResponse, 400);
    }

    const placeData: CreatePlace = {
      destinationId: body.destinationId,
      name: body.name,
      description: body.description,
      rating: body.rating || 0,
      duration: body.duration,
      timeDuration: body.timeDuration,
      highlights: body.highlights || [],
      images: body.images || [],
      location: body.location,
    };

    const newPlace = await placeService.createPlace(c.env.DATABASE_URL, placeData);

    const response: PlaceResponse = {
      success: true,
      message: "Place created successfully",
      data: newPlace,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error("Create place error:", error);
    return c.json({
      success: false,
      error: "Failed to create place",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Update an existing place
 * PUT /api/places/:id
 * Requires authentication
 */
placeRoutes.put("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!id) {
      return c.json({
        success: false,
        error: "No place ID provided",
        message: "Please provide a place ID",
      } as ApiResponse, 400);
    }

    const placeData: UpdatePlace = {
      name: body.name,
      description: body.description,
      rating: body.rating,
      duration: body.duration,
      timeDuration: body.timeDuration,
      highlights: body.highlights,
      images: body.images,
      location: body.location,
      destinationId: body.destinationId,
    };

    const updatedPlace = await placeService.updatePlace(c.env.DATABASE_URL, id, placeData);

    if (!updatedPlace) {
      return c.json({
        success: false,
        error: "Place not found",
        message: "The place you're trying to update does not exist",
      } as ApiResponse, 404);
    }

    const response: PlaceResponse = {
      success: true,
      message: "Place updated successfully",
      data: updatedPlace,
    };

    return c.json(response);
  } catch (error) {
    console.error("Update place error:", error);
    return c.json({
      success: false,
      error: "Failed to update place",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

/**
 * Delete a place
 * DELETE /api/places/:id
 * Requires authentication
 */
placeRoutes.delete("/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({
        success: false,
        error: "No place ID provided",
        message: "Please provide a place ID",
      } as ApiResponse, 400);
    }

    const deleted = await placeService.deletePlace(c.env.DATABASE_URL, id);

    if (!deleted) {
      return c.json({
        success: false,
        error: "Place not found",
        message: "The place you're trying to delete does not exist",
      } as ApiResponse, 404);
    }

    const response: ApiResponse = {
      success: true,
      message: "Place deleted successfully",
    };

    return c.json(response);
  } catch (error) {
    console.error("Delete place error:", error);
    return c.json({
      success: false,
      error: "Failed to delete place",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    } as ApiResponse, 500);
  }
});

export { placeRoutes };
