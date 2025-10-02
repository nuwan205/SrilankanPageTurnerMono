import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2, Filter, MapPin } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUpload from '@/components/ui/ImageUpload';
import { apiClient } from '@/lib/api';
import type { Destination, Category } from '@/lib/api';
import { toast } from 'sonner';

const AdminDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    categoryId: '',
    title: '',
    description: '',
    rating: 0,
    duration: '',
    highlights: '',
    images: [] as string[],
    enabled: true,
  });

  useEffect(() => {
    loadCategories();
    loadDestinations();
  }, [selectedCategory]);

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

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDestinations({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      if (response.success && response.data) {
        setDestinations(response.data.destinations);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      id: destination.id,
      categoryId: destination.categoryId,
      title: destination.title,
      description: destination.description,
      rating: destination.rating,
      duration: destination.duration,
      highlights: destination.highlights.join(', '),
      images: destination.images,
      enabled: destination.enabled,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingDestination(null);
    setFormData({
      id: '',
      categoryId: categories[0]?.id || '',
      title: '',
      description: '',
      rating: 0,
      duration: '',
      highlights: '',
      images: [],
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      setUploading(true);

      const destinationData = {
        categoryId: formData.categoryId,
        title: formData.title,
        description: formData.description,
        rating: Number(formData.rating),
        duration: formData.duration,
        highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean),
        images: formData.images,
        enabled: formData.enabled,
      };

      if (editingDestination) {
        await apiClient.updateDestination(editingDestination.id, destinationData);
        toast.success('Destination updated successfully');
      } else {
        await apiClient.createDestination(destinationData);
        toast.success('Destination created successfully');
      }

      setDialogOpen(false);
      loadDestinations();
    } catch (error) {
      console.error('Failed to save destination:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save destination');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    try {
      await apiClient.deleteDestination(id);
      toast.success('Destination deleted successfully');
      loadDestinations();
    } catch (error) {
      console.error('Failed to delete destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  const handleToggleEnabled = async (id: string) => {
    try {
      await apiClient.toggleDestinationEnabled(id);
      toast.success('Destination status updated');
      loadDestinations();
    } catch (error) {
      console.error('Failed to toggle destination:', error);
      toast.error('Failed to update status');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Destinations</h1>
            <p className="text-muted-foreground">
              Manage destination locations and details
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDestination ? 'Edit Destination' : 'Create Destination'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 2-3 hours"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlights">Highlights (comma-separated)</Label>
                  <Textarea
                    id="highlights"
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    placeholder="Swimming, Snorkeling, Beach restaurants"
                    rows={2}
                    required
                  />
                </div>
                
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={5}
                  label="Images (Max 5)"
                  maxFileSize={5}
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      editingDestination ? 'Update' : 'Create'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                {destination.images && destination.images.length > 0 ? (
                  <img 
                    src={destination.images[0]} 
                    alt={destination.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{destination.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getCategoryName(destination.categoryId)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {destination.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>⭐ {destination.rating}</span>
                  <span>{destination.duration}</span>
                  <span>{destination.images?.length || 0} images</span>
                </div>
                <div className="space-y-2">
                  {/* Manage Places Button */}
                  <Link
                    to="/admin/destinations/$destinationId/places"
                    params={{ destinationId: destination.id }}
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Manage Places
                    </Button>
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleEnabled(destination.id)}
                      className="flex-1"
                    >
                      {destination.enabled ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hidden
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(destination)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(destination.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && destinations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No destinations found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedCategory !== 'all' 
              ? 'No destinations in this category. Try selecting a different category or create a new destination.'
              : 'Get started by creating your first destination.'}
          </p>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Destination
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
