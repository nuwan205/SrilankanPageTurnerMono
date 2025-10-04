import React, { useState, useEffect } from 'react';
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
import ImageUpload from '@/components/ui/ImageUpload';
import { apiClient, type Category } from '@/lib/api';
import { toast } from 'sonner';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    imageUrls: [] as string[], // Changed to array for multiple images
    color: '',
    type: 'category' as 'category' | 'location',
    enabled: true,
  });

  const refreshCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description,
      icon: category.icon,
      imageUrls: [category.imageUrl], // Convert single URL to array
      color: category.color,
      type: category.type || 'category',
      enabled: category.enabled,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setFormData({
      title: '',
      description: '',
      icon: 'FolderTree',
      imageUrls: [], // Empty array for new category
      color: 'from-primary/20 to-primary/5',
      type: 'category',
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one image is uploaded
    if (formData.imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    
    try {
      // Convert imageUrls array to single imageUrl for API compatibility
      const apiData = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        imageUrl: formData.imageUrls[0], // Use first image as primary
        color: formData.color,
        type: formData.type,
        enabled: formData.enabled,
      };

      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, apiData);
        toast.success('Category updated successfully');
      } else {
        await apiClient.createCategory(apiData);
        toast.success('Category created successfully');
      }
      await refreshCategories();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await apiClient.deleteCategory(id);
        await refreshCategories();
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Failed to delete category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleToggleEnabled = async (id: string) => {
    try {
      await apiClient.toggleCategoryEnabled(id);
      await refreshCategories();
      toast.success('Category status updated');
    } catch (error) {
      console.error('Failed to toggle category:', error);
      toast.error('Failed to update category status');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage tourism categories for your website
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., TreePine"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description ({formData.description.length}/300)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={300}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Keep it concise - maximum 300 characters
                </p>
              </div>
              <ImageUpload
                value={formData.imageUrls}
                onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                maxImages={3}
                label="Category Images"
                maxFileSize={5}
              />
              <div className="space-y-2">
                <Label htmlFor="color">Gradient Color Classes</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="from-primary/20 to-primary/5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Category Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'category' | 'location' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="category">Category</option>
                  <option value="location">Location</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Category: Interest-based grouping (e.g., Wildlife, Cultural). Location: Geographic area (e.g., Kandy, Galle)
                </p>
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
                  {editingCategory ? 'Update' : 'Create'}
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
        {loading && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!loading && categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
          </div>
        )}
        
        {!loading && categories.length > 0 && categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative h-40">
              <img
                src={category.imageUrl}
                alt={category.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color}`} />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      category.type === 'location' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {category.type === 'location' ? 'Location' : 'Category'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleEnabled(category.id)}
                    className="flex-1"
                  >
                    {category.enabled ? (
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
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
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
    </div>
  );
};

export default AdminCategories;
