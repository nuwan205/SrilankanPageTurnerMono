import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Save, X, ExternalLink, Star, Filter } from 'lucide-react';
import ReactSelect from 'react-select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ImageUpload from '@/components/ui/ImageUpload';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { Place } from '@/lib/api';

interface Ad {
  id: string;
  placeId: string;
  placeName?: string;
  title: string;
  description: string;
  images: string[];
  rating: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  link: string;
  bookingLink?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageAdsPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    placeId: '',
    title: '',
    description: '',
    images: [] as string[],
    rating: 4.5,
    phone: '',
    whatsapp: '',
    email: '',
    link: '',
    bookingLink: ''
  });

  // Load ads and places on mount
  useEffect(() => {
    loadAds();
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const response = await apiClient.getPlaces();
      if (response.success && response.data) {
        setPlaces(response.data.places);
      }
    } catch (error) {
      console.error('Failed to load places:', error);
      toast.error('Failed to load places');
    }
  };

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAds();
      if (response.success && response.data) {
        setAds(response.data.ads);
      }
    } catch (error) {
      console.error('Failed to load ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        placeId: ad.placeId,
        title: ad.title,
        description: ad.description,
        images: ad.images,
        rating: ad.rating,
        phone: ad.phone || '',
        whatsapp: ad.whatsapp || '',
        email: ad.email || '',
        link: ad.link,
        bookingLink: ad.bookingLink || ''
      });
    } else {
      setEditingAd(null);
      setFormData({
        placeId: '',
        title: '',
        description: '',
        images: [],
        rating: 4.5,
        phone: '',
        whatsapp: '',
        email: '',
        link: '',
        bookingLink: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAd(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.placeId.trim()) {
      toast.error('Please select a place');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter ad title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter ad description');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (!formData.link.trim()) {
      toast.error('Please enter website link');
      return;
    }

    try {
      setSubmitting(true);

      const adData = {
        placeId: formData.placeId,
        title: formData.title,
        description: formData.description,
        images: formData.images,
        rating: Number(formData.rating),
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        link: formData.link,
        bookingLink: formData.bookingLink || undefined
      };

      if (editingAd) {
        await apiClient.updateAd(editingAd.id, adData);
        toast.success('Ad updated successfully');
      } else {
        await apiClient.createAd(adData);
        toast.success('Ad created successfully');
      }

      handleCloseDialog();
      loadAds();
    } catch (error) {
      console.error('Failed to save ad:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      await apiClient.deleteAd(id);
      toast.success('Ad deleted successfully');
      loadAds();
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  // Filter ads based on text search and place filter
  const filteredAds = ads.filter(ad => {
    const matchesSearch = searchQuery === '' || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.placeName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlaceFilter = placeFilter === 'all' || ad.placeId === placeFilter;
    
    return matchesSearch && matchesPlaceFilter;
  });

  return (
    <div className="min-h-screen bg-background relative p-6">
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
                Manage Ads
              </h1>
              <p className="text-muted-foreground">
                Create and manage sponsored ads for places (One ad per place)
              </p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Ad
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Simple Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search ads by title, description, or place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Place Filter Dropdown */}
            <div className="w-full sm:w-64">
              <Select value={placeFilter} onValueChange={setPlaceFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by place" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Places</SelectItem>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ads Grid */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading ads...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map((ad, index) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={ad.images[0] || '/src/assets/category-heritage.jpg'}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Sponsored Badge */}
                      <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
                        Sponsored
                      </div>
                      
                      {/* Images Count */}
                      {ad.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {ad.images.length} images
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-semibold text-lg mb-1">{ad.title}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{ad.rating}</span>
                          {ad.placeName && (
                            <>
                              <span>•</span>
                              <span className="truncate">{ad.placeName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ad.description}
                      </p>
                      
                      {/* Contact Info Preview */}
                      <div className="flex flex-wrap gap-2 mb-3 text-xs">
                        {ad.phone && (
                          <span className="px-2 py-1 bg-muted rounded-full">📞 Phone</span>
                        )}
                        {ad.whatsapp && (
                          <span className="px-2 py-1 bg-muted rounded-full">💬 WhatsApp</span>
                        )}
                        {ad.email && (
                          <span className="px-2 py-1 bg-muted rounded-full">✉️ Email</span>
                        )}
                        {ad.bookingLink && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">🏨 Booking.com</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(ad)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-12">
                <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No ads found</h3>
                <p className="text-muted-foreground">Try adjusting your search or add a new ad.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'Edit Ad' : 'Add New Ad'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Place Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Place <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  value={places.find(p => p.id === formData.placeId) ? {
                    value: formData.placeId,
                    label: places.find(p => p.id === formData.placeId)!.name,
                    data: places.find(p => p.id === formData.placeId)!
                  } : null}
                  onChange={(option) => setFormData({ ...formData, placeId: option?.value || '' })}
                  options={places.map(place => ({
                    value: place.id,
                    label: place.name,
                    data: place
                  }))}
                  isClearable
                  placeholder="Search and select a place..."
                  noOptionsMessage={() => "No places found"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                      minHeight: '2.5rem',
                      boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : 'none',
                      '&:hover': {
                        borderColor: 'hsl(var(--ring))'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      zIndex: 50
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused 
                        ? 'hsl(var(--accent))' 
                        : state.isSelected 
                          ? 'hsl(var(--primary))' 
                          : 'transparent',
                      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      '&:active': {
                        backgroundColor: 'hsl(var(--accent))'
                      }
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'hsl(var(--foreground))'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'hsl(var(--muted-foreground))'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'hsl(var(--foreground))'
                    }),
                    clearIndicator: (base) => ({
                      ...base,
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'hsl(var(--foreground))'
                      }
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'hsl(var(--foreground))'
                      }
                    })
                  }}
                  formatOptionLabel={(option) => (
                    <div className="py-1">
                      <span className="font-medium text-sm">{option.data.name}</span>
                    </div>
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select the place this ad is for (one ad per place)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ad Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Luxury Heritage Hotel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description ({formData.description.length}/600) <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Describe the advertised business or service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={600}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 600 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rating <span className="text-red-500">*</span>
                </label>
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
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={5}
                  label="Ad Images (Max 5) *"
                  maxFileSize={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload high-quality images for the ad carousel
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    placeholder="+94 11 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                  <Input
                    placeholder="+94 77 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="info@business.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Links</h3>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Website Link <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Booking.com Link</label>
                <Input
                  type="url"
                  placeholder="https://www.booking.com/hotel/..."
                  value={formData.bookingLink}
                  onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add a direct Booking.com link for reservations
                </p>
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
              {submitting ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAdsPage;
