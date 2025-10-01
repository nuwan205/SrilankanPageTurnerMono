// Import types directly from shared types
import type { 
  CreateCategory, 
  UpdateCategory, 
  Category, 
  CategoriesResponse, 
  CategoryResponse,
  ImageResponse,
  ApiResponse 
} from "../../../shared/src/types/admin";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:3001";

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const config = { ...defaultOptions, ...options };
    
    // Don't set Content-Type for FormData
    if (config.body instanceof FormData) {
      delete (config.headers as Record<string, string>)["Content-Type"];
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse JSON, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Category API methods
  async getCategories(params?: {
    page?: number;
    limit?: number;
    enabled?: boolean;
    search?: string;
  }): Promise<CategoriesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.enabled !== undefined) searchParams.set("enabled", params.enabled.toString());
      if (params.search) searchParams.set("search", params.search);
    }

    const query = searchParams.toString();
    const endpoint = query ? `/api/categories?${query}` : "/api/categories";
    
    return this.request<CategoriesResponse>(endpoint);
  }

  async getCategoryById(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/categories/${id}`);
  }

  async createCategory(data: CreateCategory): Promise<CategoryResponse> {
    return this.request<CategoryResponse>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategory): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  }

  async toggleCategoryEnabled(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/categories/${id}/toggle`, {
      method: "PATCH",
    });
  }

  // Image API methods
  async uploadImage(file: File, metadata?: { alt?: string; caption?: string }): Promise<ApiResponse & { data?: ImageResponse }> {
    const formData = new FormData();
    formData.append("file", file);
    
    if (metadata?.alt) formData.append("alt", metadata.alt);
    if (metadata?.caption) formData.append("caption", metadata.caption);

    return this.request<ApiResponse & { data?: ImageResponse }>("/api/images/upload", {
      method: "POST",
      body: formData,
    });
  }

  async uploadImageFromUrl(url: string, filename?: string): Promise<ApiResponse & { data?: ImageResponse }> {
    return this.request<ApiResponse & { data?: ImageResponse }>("/api/images/upload-from-url", {
      method: "POST",
      body: JSON.stringify({ url, filename }),
    });
  }

  async deleteImage(imageId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/images/${imageId}`, {
      method: "DELETE",
    });
  }

  async getImageDetails(imageId: string): Promise<ApiResponse & { data?: ImageResponse }> {
    return this.request<ApiResponse & { data?: ImageResponse }>(`/api/images/${imageId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for convenience
export type { 
  Category, 
  CreateCategory, 
  UpdateCategory, 
  CategoriesResponse, 
  CategoryResponse,
  ImageResponse,
  ApiResponse 
};
