export type ApiResponse = {
  message: string;
  success: true;
}

// Re-export admin types to avoid conflicts
export type {
  Category,
  CreateCategory,
  UpdateCategory,
  CategoryQuery,
  CategoriesResponse,
  CategoryResponse,
  ImageUpload,
  ImageResponse
} from "./admin";
