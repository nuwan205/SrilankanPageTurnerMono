interface R2UploadResult {
  key: string;
  url: string;
  etag: string;
  size: number;
  lastModified: string;
}

interface R2Config {
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_TOKEN: string;
  BUCKET_NAME: string;
  PUBLIC_BUCKET_URL: string;
}

export class ImageService {
  private readonly config: R2Config;

  constructor(config: R2Config) {
    this.config = config;
  }

  /**
   * Factory method to create ImageService with environment variables
   */
  static create(env: R2Config): ImageService {
    return new ImageService(env);
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
    const baseUrl = `${this.config.PUBLIC_BUCKET_URL}/${key}`;
    
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

      const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${this.config.BUCKET_NAME}`;
      const response = await fetch(`${baseUrl}/objects/${key}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.config.CLOUDFLARE_TOKEN}`,
          "Content-Type": contentType,
          "Content-Length": size.toString(),
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.config.PUBLIC_BUCKET_URL}/${key}`;
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
    size: number;
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
      const size = arrayBuffer.byteLength;
      
      // Generate filename if not provided
      const finalFilename = filename || `image-${Date.now()}.jpg`;
      const key = this.generateImageKey(finalFilename);

      const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${this.config.BUCKET_NAME}`;
      const response = await fetch(`${baseUrl}/objects/${key}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.config.CLOUDFLARE_TOKEN}`,
          "Content-Type": contentType,
          "Content-Length": size.toString(),
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.config.PUBLIC_BUCKET_URL}/${key}`;
      const variants = this.buildImageVariants(key);

      return {
        id: key,
        url: publicUrl,
        publicUrl: publicUrl,
        filename: finalFilename,
        size: size,
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
      const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${this.config.BUCKET_NAME}`;
      const response = await fetch(`${baseUrl}/objects/${imageKey}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.config.CLOUDFLARE_TOKEN}`,
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
    size: number;
    uploadedAt: string;
    variants: Record<string, string>;
  }> {
    try {

       const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${this.config.BUCKET_NAME}`;
      const response = await fetch(`${baseUrl}/objects/${imageKey}`, {
        method: "HEAD",
        headers: {
          "Authorization": `Bearer ${this.config.CLOUDFLARE_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`R2 head request failed: ${response.status} - ${errorText}`);
      }

      const publicUrl = `${this.config.PUBLIC_BUCKET_URL}/${imageKey}`;
      const variants = this.buildImageVariants(imageKey);
      const lastModified = response.headers.get('last-modified') || new Date().toISOString();
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : 0;
      const filename = imageKey.split('/').pop() || imageKey;

      return {
        id: imageKey,
        url: publicUrl,
        publicUrl: publicUrl,
        filename: filename,
        size: size,
        uploadedAt: lastModified,
        variants,
      };
    } catch (error) {
      console.error("Get image details error:", error);
      throw new Error(`Failed to get image details: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

// Legacy singleton export - deprecated
// Use ImageService.create(env) in your routes instead
export const imageService = {
  uploadImage: () => {
    throw new Error('Use ImageService.create(c.env) instead of imageService singleton');
  },
  uploadImageFromUrl: () => {
    throw new Error('Use ImageService.create(c.env) instead of imageService singleton');
  },
  deleteImage: () => {
    throw new Error('Use ImageService.create(c.env) instead of imageService singleton');
  },
  getImageDetails: () => {
    throw new Error('Use ImageService.create(c.env) instead of imageService singleton');
  },
};