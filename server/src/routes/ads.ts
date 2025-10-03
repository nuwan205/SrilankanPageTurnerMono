import { Hono } from "hono";
import { adService } from "../services/adService";
import { validateCreateAd, validateUpdateAd } from "../../../shared/src/types/admin";
import { ZodError } from "zod";

const ads = new Hono();

// GET /api/ads - Get all ads
ads.get("/", async (c) => {
  try {
    const allAds = await adService.getAllAds();

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
    const ad = await adService.getAdById(id);

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

    // Check if place already has an ad
    const hasAd = await adService.checkPlaceHasAd(validatedData.placeId);
    if (hasAd) {
      return c.json(
        {
          success: false,
          error: "This place already has an ad. Only one ad per place is allowed.",
        },
        400
      );
    }

    const newAd = await adService.createAd(validatedData);

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

    // If updating placeId, check if the new place already has an ad
    if (validatedData.placeId) {
      const hasAd = await adService.checkPlaceHasAd(validatedData.placeId, id);
      if (hasAd) {
        return c.json(
          {
            success: false,
            error: "The selected place already has an ad. Only one ad per place is allowed.",
          },
          400
        );
      }
    }

    const updatedAd = await adService.updateAd(id, validatedData);

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
    const deleted = await adService.deleteAd(id);

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
