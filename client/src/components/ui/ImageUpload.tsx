import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  disabled?: boolean;
  accept?: string;
  maxFileSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 1,
  label = "Upload Images",
  disabled = false,
  accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif",
  maxFileSize = 10, // 10MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} image(s) allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB`);
          continue;
        }

        // Validate file type
        if (!accept.split(',').some(type => file.type.includes(type.replace('image/', '').replace('*', '')))) {
          toast.error(`File "${file.name}" is not a supported image format`);
          continue;
        }

        const response = await apiClient.uploadImage(file, {
          alt: file.name.split('.')[0],
        });

        if (response.success && response.data) {
          newUrls.push(response.data.url);
          toast.success(`"${file.name}" uploaded successfully`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages, maxFileSize, accept]);

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

  const removeImage = useCallback((indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(newUrls);
    toast.success('Image removed');
  }, [value, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      
      {/* Upload Area */}
      <button
        type="button"
        disabled={disabled || uploading || value.length >= maxImages}
        aria-label={`Upload ${maxImages > 1 ? 'images' : 'image'}. ${value.length}/${maxImages} selected.`}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors w-full
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled || value.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
          ${uploading ? 'pointer-events-none' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !uploading && value.length < maxImages) {
            document.getElementById('image-upload-input')?.click();
          }
        }}
      >
        <input
          id="image-upload-input"
          type="file"
          multiple={maxImages > 1}
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {uploading && (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Uploading images...</p>
            </>
          )}
          
          {!uploading && value.length >= maxImages && (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Maximum {maxImages} image(s) reached
              </p>
            </>
          )}
          
          {!uploading && value.length < maxImages && (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-foreground mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                {maxImages > 1 ? `Up to ${maxImages} images` : '1 image'} • Max {maxFileSize}MB each
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP, GIF supported
              </p>
            </>
          )}
        </div>
      </button>

      {/* Current Images */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Uploaded Images ({value.length}/{maxImages})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((url, index) => (
              <Card key={`${url}-${index}`} className="relative group overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.png'; // Fallback image
                    }}
                  />
                </div>
                
                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  disabled={disabled || uploading}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button for when drag area is full */}
      {value.length > 0 && value.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload-input')?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Add More Images ({value.length}/{maxImages})
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
