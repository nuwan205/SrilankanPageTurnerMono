import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface PosterImageUploadProps {
  value: string; // Single image URL
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
  maxFileSize?: number; // in MB
}

const PosterImageUpload: React.FC<PosterImageUploadProps> = ({
  value = '',
  onChange,
  label = "Upload Poster Image",
  disabled = false,
  maxFileSize = 10, // 10MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Only allow one image at a time
    if (value) {
      toast.error('Please delete the existing poster image before uploading a new one');
      return;
    }

    const file = files[0]; // Only take the first file
    
    setUploading(true);

    try {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File is too large. Maximum size is ${maxFileSize}MB`);
        setUploading(false);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files (JPEG, PNG, WebP, GIF)');
        setUploading(false);
        return;
      }

      // Upload the image
      const response = await apiClient.uploadImage(file);

      if (response.success && response.data?.url) {
        onChange(response.data.url);
        toast.success('Poster image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload poster image');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFileSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, uploading, handleFileSelect]);

  const extractImageKey = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return `images/${fileName}`;
    } catch (error) {
      console.error('Error extracting image key:', error);
      return '';
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      setDeleting(true);
      const imageKey = extractImageKey(value);

      if (!imageKey) {
        throw new Error('Invalid image URL');
      }

      const response = await apiClient.deleteImage(imageKey);

      if (response.success) {
        onChange('');
        toast.success('Poster image deleted successfully');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete poster image');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {value ? (
        // Display uploaded poster image
        <Card className="relative overflow-hidden group">
          <div className="relative h-48 w-full">
            <img
              src={value}
              alt="Poster"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Delete Poster
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        // Upload area
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 ease-in-out
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) {
              document.getElementById('poster-file-input')?.click();
            }
          }}
        >
          <input
            id="poster-file-input"
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            disabled={disabled || uploading}
          />

          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading poster image...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Single poster image (max {maxFileSize}MB)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP, or GIF
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterImageUpload;
