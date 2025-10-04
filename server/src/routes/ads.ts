import { Hono } from "hono";
import { adService } from "../services/adService";
import { validateCreateAd, validateUpdateAd } from "../../../shared/src/types/admin";
import { ZodError } from "zod";

type Bindings = {
  DATABASE_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_TOKEN: string;
  BUCKET_NAME: string;
  PUBLIC_BUCKET_URL: string;
};

const ads = new Hono<{ Bindings: Bindings }>();

// GET /api/ads - Get all ads
ads.get("/", async (c) => {
  try {
    const allAds = await adService.getAllAds(c.env.DATABASE_URL);

    return c.json({
      success: true,
      data: { ads: allAds },
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch ads",
      },
      500
    );
  }
});

// GET /api/ads/:id - Get ad by ID
ads.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const ad = await adService.getAdById(c.env.DATABASE_URL, id);

    if (!ad) {
      return c.json(
        {
          success: false,
          error: "Ad not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch ad",
      },
      500
    );
  }
});

// POST /api/ads - Create new ad
ads.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = validateCreateAd(body);

    // Multiple ads per place are now allowed - no check needed

    const newAd = await adService.createAd(c.env.DATABASE_URL, validatedData);

    return c.json(
      {
        success: true,
        message: "Ad created successfully",
        data: newAd,
      },
      201
    );
  } catch (error) {
    console.error("Error creating ad:", error);

    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create ad",
      },
      500
    );
  }
});

// PUT /api/ads/:id - Update ad
ads.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validatedData = validateUpdateAd(body);

    // Multiple ads per place are now allowed - no check needed

    const updatedAd = await adService.updateAd(c.env.DATABASE_URL, id, validatedData);

    if (!updatedAd) {
      return c.json(
        {
          success: false,
          error: "Ad not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Ad updated successfully",
      data: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error);

    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update ad",
      },
      500
    );
  }
});

// DELETE /api/ads/:id - Delete ad
ads.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await adService.deleteAd(c.env.DATABASE_URL, id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: "Ad not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete ad",
      },
      500
    );
  }
});

export default ads;
