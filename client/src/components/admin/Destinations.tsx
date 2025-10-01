import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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
import {
  getCategories,
  getDestinations,
  saveDestination,
  deleteDestination,
  toggleDestinationEnabled,
  type Destination,
} from '@/lib/data-store';
import { toast } from 'sonner';

const AdminDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>(getDestinations());
  const categories = getCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    categoryId: '',
    name: '',
    description: '',
    rating: 0,
    duration: '',
    highlights: '',
    image: '',
    lat: 0,
    lng: 0,
    enabled: true,
  });

  const refreshDestinations = () => {
    setDestinations(getDestinations());
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      id: destination.id,
      categoryId: destination.categoryId,
      name: destination.name,
      description: destination.description,
      rating: destination.rating,
      duration: destination.duration,
      highlights: destination.highlights.join(', '),
      image: destination.image,
      lat: destination.location.lat,
      lng: destination.location.lng,
      enabled: destination.enabled,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingDestination(null);
    setFormData({
      id: '',
      categoryId: categories[0]?.id || '',
      name: '',
      description: '',
      rating: 0,
      duration: '',
      highlights: '',
      image: '',
      lat: 0,
      lng: 0,
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destinationData: Destination = {
      id: formData.id || `dest-${Date.now()}`,
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      rating: Number(formData.rating),
      duration: formData.duration,
      highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean),
      image: formData.image,
      location: {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      },
      enabled: formData.enabled,
    };
    saveDestination(destinationData);
    refreshDestinations();
    setDialogOpen(false);
    toast.success(editingDestination ? 'Destination updated' : 'Destination created');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      deleteDestination(id);
      refreshDestinations();
      toast.success('Destination deleted');
    }
  };

  const handleToggleEnabled = (id: string) => {
    toggleDestinationEnabled(id);
    refreshDestinations();
    toast.success('Destination status updated');
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="image">Image Path</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/placeholder-location.jpg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
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
                <Button type="submit" className="flex-1">
                  {editingDestination ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden">
            <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-4xl">📍</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{destination.name}</h3>
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
              </div>
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
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDestinations;
