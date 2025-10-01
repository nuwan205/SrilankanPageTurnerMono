import { z } from "zod";

// Base API response structure
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};

// Image upload and management schemas
export const ImageUploadSchema = z.object({
  file: z.instanceof(File).optional(),
  url: z.string().regex(/^https?:\/\/.+/, "Valid URL required").optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export const ImageResponseSchema = z.object({
  id: z.string(),
  url: z.string().regex(/^https?:\/\/.+/, "Valid URL required"),
  publicUrl: z.string().regex(/^https?:\/\/.+/, "Valid URL required"),
  filename: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
  variants: z.record(z.string(), z.string().regex(/^https?:\/\/.+/, "Valid URL required")).optional(),
});

export type ImageUpload = z.infer<typeof ImageUploadSchema>;
export type ImageResponse = z.infer<typeof ImageResponseSchema>;

// Category schemas
export const CategorySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  imageUrl: z.string().regex(/^https?:\/\/.+/, "Valid image URL is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CategoryQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  enabled: z.boolean().optional(),
  search: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryQuery = z.infer<typeof CategoryQuerySchema>;

// API endpoint response types
export type CategoriesResponse = ApiResponse<{
  categories: Category[];
}>;

export type CategoryResponse = ApiResponse<Category>;

// Validation helpers
export const validateCreateCategory = (data: unknown): CreateCategory => {
  return CreateCategorySchema.parse(data);
};

export const validateUpdateCategory = (data: unknown): UpdateCategory => {
  return UpdateCategorySchema.parse(data);
};

export const validateCategoryQuery = (data: unknown): CategoryQuery => {
  return CategoryQuerySchema.parse(data);
};

export const validateImageUpload = (data: unknown): ImageUpload => {
  return ImageUploadSchema.parse(data);
};
