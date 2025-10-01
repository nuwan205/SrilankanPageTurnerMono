interface R2UploadResult {
  key: string;
  url: string;
  etag: string;
  size: number;
  lastModified: string;
}

export class ImageService {
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly bucketName: string;
  private readonly publicBucketUrl: string;
  private readonly baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.CLOUDFLARE_TOKEN!;
    this.bucketName = process.env.BUCKET_NAME!;
    this.publicBucketUrl = process.env.PUBLIC_BUCKET_URL!;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/r2/buckets/${this.bucketName}`;

    if (!this.accountId || !this.apiToken || !this.bucketName || !this.publicBucketUrl) {
      throw new Error("Cloudflare R2 credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_TOKEN, BUCKET_NAME, and PUBLIC_BUCKET_URL environment variables.");
    }
  }

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cloudflare R2 API failed: ${response.status} - ${errorData}`);
    }

    // For R2, we handle the response differently
    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    
    return response.text() as Promise<T>;
  }

  private generateImageKey(originalFilename: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = originalFilename.split('.').pop();
    return `images/${timestamp}-${randomId}.${extension}`;
  }

  private buildImageVariants(key: string): Record<string, string> {
    const baseUrl = `${this.publicBucketUrl}/${key}`;
    
    return {
      thumbnail: baseUrl, // R2 doesn't have built-in variants, you'd need to implement image processing
      small: baseUrl,
      medium: baseUrl,
      large: baseUrl,
      original: baseUrl,
    };
  }

  /**
   * Upload an image to Cloudflare R2
   */
  async uploadImage(file: File | Buffer, metadata?: { 
    filename?: string;
    contentType?: string;
    alt?: string; 
    caption?: string;
  }): Promise<{
    id: string;
    url: string;
    publicUrl: string;
    filename: string;
    size: number;
    uploadedAt: string;
    variants: Record<string, string>;
  }> {
    try {
      let arrayBuffer: ArrayBuffer;
      let filename: string;
      let contentType: string;
      let size: number;

      if (file instanceof File) {
        // Browser File object or Hono File
        arrayBuffer = await file.arrayBuffer();
        filename = file.name;
        contentType = file.type;
        size = file.size;
      } else {
        // Buffer (Node.js)
        arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
        filename = metadata?.filename || `image-${Date.now()}.jpg`;
        contentType = metadata?.contentType || 'image/jpeg';
        size = file.length;
      }

      const key = this.generateImageKey(filename);

      const response = await fetch(`${this.baseUrl}/objects/${key}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": contentType,
          "Content-Length": size.toString(),
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.publicBucketUrl}/${key}`;
      const variants = this.buildImageVariants(key);

      return {
        id: key,
        url: publicUrl,
        publicUrl: publicUrl,
        filename: filename,
        size: size,
        uploadedAt: new Date().toISOString(),
        variants,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Upload image from URL to Cloudflare R2
   */
  async uploadImageFromUrl(imageUrl: string, filename?: string): Promise<{
    id: string;
    url: string;
    publicUrl: string;
    filename: string;
    uploadedAt: string;
    variants: Record<string, string>;
  }> {
    try {
      // First, fetch the image from the URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      // Generate filename if not provided
      const finalFilename = filename || `image-${Date.now()}.jpg`;
      const key = this.generateImageKey(finalFilename);

      const response = await fetch(`${this.baseUrl}/objects/${key}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": contentType,
          "Content-Length": arrayBuffer.byteLength.toString(),
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.publicBucketUrl}/${key}`;
      const variants = this.buildImageVariants(key);

      return {
        id: key,
        url: publicUrl,
        publicUrl: publicUrl,
        filename: finalFilename,
        uploadedAt: new Date().toISOString(),
        variants,
      };
    } catch (error) {
      console.error("Image upload from URL error:", error);
      throw new Error(`Failed to upload image from URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Delete an image from Cloudflare R2
   */
  async deleteImage(imageKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/objects/${imageKey}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 delete failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Image deletion error:", error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get image details from Cloudflare R2
   */
  async getImageDetails(imageKey: string): Promise<{
    id: string;
    url: string;
    publicUrl: string;
    filename: string;
    uploadedAt: string;
    variants: Record<string, string>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/objects/${imageKey}`, {
        method: "HEAD",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 head request failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.publicBucketUrl}/${imageKey}`;
      const variants = this.buildImageVariants(imageKey);
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();
      const filename = imageKey.split('/').pop() || imageKey;

      return {
        id: imageKey,
        url: publicUrl,
        publicUrl: publicUrl,
        filename: filename,
        uploadedAt: lastModified,
        variants,
      };
    } catch (error) {
      console.error("Get image details error:", error);
      throw new Error(`Failed to get image details: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();