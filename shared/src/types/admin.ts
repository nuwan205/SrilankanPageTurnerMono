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

// Destination schemas
export const DestinationSchema = z.object({
  id: z.string(),
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().min(0).max(5).default(0),
  duration: z.string().min(1, "Duration is required"),
  highlights: z.array(z.string()).min(1, "At least one highlight required"),
  images: z.array(z.string().regex(/^https?:\/\/.+/, "Valid image URL required")).min(1, "At least one image required").max(5, "Maximum 5 images allowed"),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateDestinationSchema = DestinationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDestinationSchema = CreateDestinationSchema.partial();

export const DestinationQuerySchema = z.object({
  categoryId: z.string().optional(),
  enabled: z.boolean().optional(),
  search: z.string().optional(),
});

export type Destination = z.infer<typeof DestinationSchema>;
export type CreateDestination = z.infer<typeof CreateDestinationSchema>;
export type UpdateDestination = z.infer<typeof UpdateDestinationSchema>;
export type DestinationQuery = z.infer<typeof DestinationQuerySchema>;

// API endpoint response types
export type DestinationsResponse = ApiResponse<{
  destinations: Destination[];
}>;

export type DestinationResponse = ApiResponse<Destination>;

// Validation helpers
export const validateCreateDestination = (data: unknown): CreateDestination => {
  return CreateDestinationSchema.parse(data);
};

export const validateUpdateDestination = (data: unknown): UpdateDestination => {
  return UpdateDestinationSchema.parse(data);
};

export const validateDestinationQuery = (data: unknown): DestinationQuery => {
  return DestinationQuerySchema.parse(data);
};

// Place schemas
export const PlaceSchema = z.object({
  id: z.string(),
  destinationId: z.string().min(1, "Destination is required"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().min(1, "Description is required"),
  rating: z.number().min(0).max(5).default(0),
  duration: z.string().min(1, "Duration is required"),
  images: z.array(z.string().regex(/^https?:\/\/.+/, "Valid image URL required")).min(1, "At least one image required").max(3, "Maximum 3 images allowed"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreatePlaceSchema = PlaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePlaceSchema = CreatePlaceSchema.partial();

export const PlaceQuerySchema = z.object({
  destinationId: z.string().optional(),
});

export type Place = z.infer<typeof PlaceSchema>;
export type CreatePlace = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlace = z.infer<typeof UpdatePlaceSchema>;
export type PlaceQuery = z.infer<typeof PlaceQuerySchema>;

// API endpoint response types
export type PlacesResponse = ApiResponse<{
  places: Place[];
}>;

export type PlaceResponse = ApiResponse<Place>;

// Validation helpers
export const validateCreatePlace = (data: unknown): CreatePlace => {
  return CreatePlaceSchema.parse(data);
};

export const validateUpdatePlace = (data: unknown): UpdatePlace => {
  return UpdatePlaceSchema.parse(data);
};

export const validatePlaceQuery = (data: unknown): PlaceQuery => {
  return PlaceQuerySchema.parse(data);
};
