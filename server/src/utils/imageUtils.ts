/**
 * Utility functions for image handling
 */

/**
 * Extract image key from full URL
 * @param url - Full image URL (e.g., https://bucket-url/images/timestamp-id.ext)
 * @returns Image key (e.g., images/timestamp-id.ext)
 */
export function extractImageKey(url: string): string {
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
 * Delete multiple images from R2 storage
 * @param imageUrls - Array of image URLs to delete
 * @param imageService - Image service instance
 */
export async function deleteImagesFromStorage(
  imageUrls: string[],
  imageService: { deleteImage: (key: string) => Promise<void> }
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const imageUrl of imageUrls) {
    try {
      const imageKey = extractImageKey(imageUrl);
      await imageService.deleteImage(imageKey);
      console.log(`Deleted image from R2: ${imageKey}`);
      success++;
    } catch (error) {
      console.error(`Failed to delete image from R2: ${imageUrl}`, error);
      failed++;
    }
  }

  return { success, failed };
}
