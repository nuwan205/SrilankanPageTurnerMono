import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { imageService } from "../services/imageService";
import type { 
  ImageResponse, 
  ApiResponse 
} from "../../../shared/src/types/admin";

const imageRoutes = new Hono();

// Apply auth middleware to all image routes
imageRoutes.use("*", requireAuth);

/**
 * Upload image file
 * POST /api/images/upload
 */
imageRoutes.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const alt = formData.get("alt") as string;
    const caption = formData.get("caption") as string;

    if (!file) {
      return c.json({
        success: false,
        error: "No file provided",
        message: "Please select a file to upload",
      } as ApiResponse, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        error: "Invalid file type",
        message: "Only JPEG, PNG, WebP and GIF images are allowed",
      } as ApiResponse, 400);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        error: "File too large",
        message: "File size must be less than 10MB",
      } as ApiResponse, 400);
    }

    const result = await imageService.uploadImage(file, { alt, caption });

    const response: ApiResponse<ImageResponse> = {
      success: true,
      message: "Image uploaded successfully",
      data: result,
    };

    return c.json(response);
  } catch (error) {
    console.error("Image upload error:", error);
    return c.json({
      success: false,
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Failed to upload image",
    } as ApiResponse, 500);
  }
});

/**
 * Upload image from URL
 * POST /api/images/upload-from-url
 */
imageRoutes.post("/upload-from-url", async (c) => {
  try {
    const { url, filename } = await c.req.json();

    if (!url) {
      return c.json({
        success: false,
        error: "No URL provided",
        message: "Please provide an image URL",
      } as ApiResponse, 400);
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return c.json({
        success: false,
        error: "Invalid URL",
        message: "Please provide a valid image URL",
      } as ApiResponse, 400);
    }

    const result = await imageService.uploadImageFromUrl(url, filename);

    const response: ApiResponse<ImageResponse> = {
      success: true,
      message: "Image uploaded successfully from URL",
      data: result,
    };

    return c.json(response);
  } catch (error) {
    console.error("Image upload from URL error:", error);
    return c.json({
      success: false,
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Failed to upload image from URL",
    } as ApiResponse, 500);
  }
});

/**
 * Delete image
 * DELETE /api/images/:imageId
 */
imageRoutes.delete("/:imageId", async (c) => {
  try {
    const imageId = c.req.param("imageId");

    if (!imageId) {
      return c.json({
        success: false,
        error: "No image ID provided",
        message: "Please provide an image ID to delete",
      } as ApiResponse, 400);
    }

    await imageService.deleteImage(imageId);

    return c.json({
      success: true,
      message: "Image deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Image deletion error:", error);
    return c.json({
      success: false,
      error: "Deletion failed",
      message: error instanceof Error ? error.message : "Failed to delete image",
    } as ApiResponse, 500);
  }
});

/**
 * Get image details
 * GET /api/images/:imageId
 */
imageRoutes.get("/:imageId", async (c) => {
  try {
    const imageId = c.req.param("imageId");

    if (!imageId) {
      return c.json({
        success: false,
        error: "No image ID provided",
        message: "Please provide an image ID",
      } as ApiResponse, 400);
    }

    const result = await imageService.getImageDetails(imageId);

    const response: ApiResponse<ImageResponse> = {
      success: true,
      message: "Image details retrieved successfully",
      data: result,
    };

    return c.json(response);
  } catch (error) {
    console.error("Get image details error:", error);
    return c.json({
      success: false,
      error: "Failed to get image details",
      message: error instanceof Error ? error.message : "Failed to retrieve image details",
    } as ApiResponse, 500);
  }
});

export { imageRoutes };
