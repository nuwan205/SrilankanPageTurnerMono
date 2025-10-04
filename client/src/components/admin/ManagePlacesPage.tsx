import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Save, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import ImageUpload from '@/components/ui/ImageUpload';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/ui/SimpleTextEditor';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { apiClient } from '@/lib/api';
import type { Place, Category } from '@/lib/api';
import { toast } from 'sonner';

// Google Maps configuration
const libraries: ("places")[] = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718 // Sri Lanka center
};

const ManagePlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [searchInput, setSearchInput] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rating: 4.5,
    duration: '',
    highlights: '',
    images: [] as string[],
    location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    categoryIds: [] as string[],
    type: 'wellknown' as 'wellknown' | 'hidden',
    // Travel Tips
    bestTime: '',
    travelTime: '',
    idealFor: ''
  });

  // Load places and categories on mount
  useEffect(() => {
    loadPlaces();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPlaces({
        categoryId: categoryFilter || undefined,
      });
      if (response.success && response.data) {
        setPlaces(response.data.places);
      }
    } catch (error) {
      console.error('Failed to load places:', error);
      toast.error('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        description: place.description,
        rating: place.rating,
        duration: place.duration,
        highlights: place.highlights ? place.highlights.join(', ') : '',
        images: place.images,
        location: place.location,
        categoryIds: place.categoryIds || [],
        type: place.type || 'wellknown',
        bestTime: place.bestTime || '',
        travelTime: place.travelTime || '',
        idealFor: place.idealFor || ''
      });
      setMarkerPosition(place.location);
      setMapCenter(place.location);
    } else {
      setEditingPlace(null);
      setFormData({
        name: '',
        description: '',
        rating: 4.5,
        duration: '',
        highlights: '',
        images: [],
        location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
        categoryIds: [],
        type: 'wellknown',
        bestTime: '',
        travelTime: '',
        idealFor: ''
      });
      setMarkerPosition(defaultCenter);
      setMapCenter(defaultCenter);
    }
    setSearchInput('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlace(null);
  };

  const handleSave = async () => {
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (!formData.highlights.trim()) {
      toast.error('Please enter at least one highlight');
      return;
    }

    if (formData.categoryIds.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      setSubmitting(true);

      const placeData = {
        categoryIds: formData.categoryIds,
        name: formData.name,
        description: formData.description,
        rating: Number(formData.rating),
        duration: formData.duration,
        highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean),
        images: formData.images,
        location: formData.location,
        type: formData.type,
        bestTime: formData.bestTime.trim() || undefined,
        travelTime: formData.travelTime.trim() || undefined,
        idealFor: formData.idealFor.trim() || undefined,
      };

      if (editingPlace) {
        await apiClient.updatePlace(editingPlace.id, placeData);
        toast.success('Place updated successfully');
      } else {
        await apiClient.createPlace(placeData);
        toast.success('Place created successfully');
      }

      handleCloseDialog();
      loadPlaces();
    } catch (error) {
      console.error('Failed to save place:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save place');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this place?')) {
      return;
    }

    try {
      await apiClient.deletePlace(id);
      toast.success('Place deleted successfully');
      loadPlaces();
    } catch (error) {
      console.error('Failed to delete place:', error);
      toast.error('Failed to delete place');
    }
  };

  // Google Maps handlers
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarkerPosition(newLocation);
        setMapCenter(newLocation);
        setFormData(prev => ({ ...prev, location: newLocation }));
        setSearchInput(place.formatted_address || place.name || '');
      }
    }
  };

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newLocation);
      setFormData(prev => ({ ...prev, location: newLocation }));
    }
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newLocation);
      setFormData(prev => ({ ...prev, location: newLocation }));
    }
  }, []);

  const filteredPlaces = places.filter(place => {
    // Filter by search query
    const matchesSearch = 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background relative p-6">
      {/* No pattern background for admin */}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Manage Places
              </h1>
              <p className="text-muted-foreground">
                Add, edit, or remove places. Each place can belong to multiple categories.
              </p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Place
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlaces}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Places Grid */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading places...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={place.images[0] || '/src/assets/category-heritage.jpg'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-lg mb-1">{place.name}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <span>⭐ {place.rating}</span>
                      <span>•</span>
                      <span>{place.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {place.description
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/#{1,3}\s+/g, '') // Remove markdown headings
                      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
                      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
                      .replace(/^[•\-\*]\s+/gm, '') // Remove bullet points
                      .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
                      .replace(/\n+/g, ' ') // Replace line breaks with spaces
                      .trim()
                    }
                  </p>
                  
                  {/* Category Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {place.categoryIds.map(catId => {
                      const category = categories.find(c => c.id === catId);
                      return category ? (
                        <Badge key={catId} variant="secondary" className="text-xs">
                          {category.title}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>{place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(place)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(place.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {filteredPlaces.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No places found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new place.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlace ? 'Edit Place' : 'Add New Place'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Place Name</label>
                <Input
                  placeholder="e.g., Sacred Temple"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Describe the place with rich formatting..."
                  maxWords={500}
                />
                
                {/* Formatted Preview */}
                {formData.description && (
                  <div className="mt-4 border border-border rounded-lg p-4 bg-muted/20">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Preview (How it will appear to users)
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={formData.description} />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Input
                    placeholder="e.g., 2 hours"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Place Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'wellknown' | 'hidden' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="wellknown">Well Known</option>
                    <option value="hidden">Hidden Gem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Key Highlights</label>
                <Textarea
                  placeholder="e.g., Ancient frescoes, Lion's Gate, Summit views"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter highlights separated by commas
                </p>
              </div>

              {/* Travel Tips Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Travel Tips (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Best Time to Visit
                    </label>
                    <Input
                      placeholder="e.g., March–September (dry season)"
                      value={formData.bestTime}
                      onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Travel Time
                    </label>
                    <Input
                      placeholder="e.g., 4–5 hours from Colombo"
                      value={formData.travelTime}
                      onChange={(e) => setFormData({ ...formData, travelTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ideal For
                    </label>
                    <Input
                      placeholder="e.g., Eco-tourists, families, nature enthusiasts"
                      value={formData.idealFor}
                      onChange={(e) => setFormData({ ...formData, idealFor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Categories <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/20 max-h-48 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">Loading categories...</p>
                  ) : (
                    categories.map(category => (
                      <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{category.title}</span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select at least one category. Places can belong to multiple categories.
                </p>
              </div>

              <div>
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={3}
                  label="Place Images (Max 3)"
                  maxFileSize={5}
                />
              </div>
            </div>

            {/* Location Selection with Google Maps */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Click/drag the marker on the map or use the search below to set the exact position
                </p>
                
                {/* Google Maps */}
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}
                  libraries={libraries}
                >
                  {/* Google Map */}
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onClick={onMapClick}
                  >
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={onMarkerDragEnd}
                    />
                  </GoogleMap>

                  {/* Google Maps Search - Below Map */}
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative mt-4">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder="Or search for a place in Sri Lanka..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </Autocomplete>
                </LoadScript>
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.location.lat}
                    onChange={(e) => {
                      const newLat = parseFloat(e.target.value);
                      const newLocation = { lat: newLat, lng: formData.location.lng };
                      setFormData({ ...formData, location: newLocation });
                      setMarkerPosition(newLocation);
                      setMapCenter(newLocation);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.location.lng}
                    onChange={(e) => {
                      const newLng = parseFloat(e.target.value);
                      const newLocation = { lat: formData.location.lat, lng: newLng };
                      setFormData({ ...formData, location: newLocation });
                      setMarkerPosition(newLocation);
                      setMapCenter(newLocation);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : editingPlace ? 'Update Place' : 'Add Place'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePlacesPage;
