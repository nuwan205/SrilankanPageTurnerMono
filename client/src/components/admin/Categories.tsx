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
  getCategories,
  saveCategory,
  deleteCategory,
  toggleCategoryEnabled,
  type Category,
} from '@/lib/data-store';
import { toast } from 'sonner';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: '',
    image: '',
    color: '',
    enabled: true,
  });

  const refreshCategories = () => {
    setCategories(getCategories());
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      icon: 'FolderTree',
      image: '',
      color: 'from-primary/20 to-primary/5',
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData: Category = {
      ...formData,
      id: formData.id || `category-${Date.now()}`,
    };
    saveCategory(categoryData);
    refreshCategories();
    setDialogOpen(false);
    toast.success(editingCategory ? 'Category updated' : 'Category created');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
      refreshCategories();
      toast.success('Category deleted');
    }
  };

  const handleToggleEnabled = (id: string) => {
    toggleCategoryEnabled(id);
    refreshCategories();
    toast.success('Category status updated');
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image Path</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/src/assets/category-name.jpg"
                  required
                />
              </div>
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
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative h-40">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color}`} />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{category.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
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
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
