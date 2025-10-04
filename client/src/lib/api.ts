// Import types directly from shared types
import type { 
  CreateCategory, 
  UpdateCategory, 
  Category, 
  CategoriesResponse, 
  CategoryResponse,
  CreatePlace,
  UpdatePlace,
  Place,
  PlacesResponse,
  PlaceResponse,
  CreateAd,
  UpdateAd,
  Ad,
  AdsResponse,
  AdResponse,
  ImageResponse,
  ApiResponse 
} from "../../../shared/src/types/admin";

const API_BASE_URL = import.meta.env.DEV ? "http://127.0.0.1:3001" : "";

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
    // URL encode the imageId since it contains slashes (e.g., images/123-abc.jpg)
    const encodedImageId = encodeURIComponent(imageId);
    return this.request<ApiResponse>(`/api/images/${encodedImageId}`, {
      method: "DELETE",
    });
  }

  async getImageDetails(imageId: string): Promise<ApiResponse & { data?: ImageResponse }> {
    return this.request<ApiResponse & { data?: ImageResponse }>(`/api/images/${imageId}`);
  }

  // Place API methods
  async getPlaces(params?: {
    categoryId?: string;
  }): Promise<PlacesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    }

    const query = searchParams.toString();
    const endpoint = query ? `/api/places?${query}` : "/api/places";
    
    return this.request<PlacesResponse>(endpoint);
  }

  async getPlaceById(id: string): Promise<PlaceResponse> {
    return this.request<PlaceResponse>(`/api/places/${id}`);
  }

  async createPlace(data: CreatePlace): Promise<PlaceResponse> {
    return this.request<PlaceResponse>("/api/places", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlace(id: string, data: UpdatePlace): Promise<PlaceResponse> {
    return this.request<PlaceResponse>(`/api/places/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePlace(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/places/${id}`, {
      method: "DELETE",
    });
  }

  // Ad API methods
  async getAds(): Promise<AdsResponse> {
    return this.request<AdsResponse>("/api/ads");
  }

  async getAdById(id: string): Promise<AdResponse> {
    return this.request<AdResponse>(`/api/ads/${id}`);
  }

  async createAd(data: CreateAd): Promise<AdResponse> {
    return this.request<AdResponse>("/api/ads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAd(id: string, data: UpdateAd): Promise<AdResponse> {
    return this.request<AdResponse>(`/api/ads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAd(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/ads/${id}`, {
      method: "DELETE",
    });
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
  Place,
  CreatePlace,
  UpdatePlace,
  PlacesResponse,
  PlaceResponse,
  Ad,
  CreateAd,
  UpdateAd,
  AdsResponse,
  AdResponse,
  ImageResponse,
  ApiResponse 
};
