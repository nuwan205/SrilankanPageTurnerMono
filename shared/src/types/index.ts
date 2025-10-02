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
  Destination,
  CreateDestination,
  UpdateDestination,
  DestinationQuery,
  DestinationsResponse,
  DestinationResponse,
  Place,
  CreatePlace,
  UpdatePlace,
  PlaceQuery,
  PlacesResponse,
  PlaceResponse,
  ImageUpload,
  ImageResponse
} from "./admin";
