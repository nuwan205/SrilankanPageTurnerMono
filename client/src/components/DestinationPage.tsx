import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, Camera, ArrowLeft, X, ChevronLeft, ChevronRight, Image as ImageIcon, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import type { Destination as ApiDestination } from '@/lib/api';
import { toast } from 'sonner';

interface Destination {
  id: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  highlights: string[];
  image: string;
  gallery: string[];
  location: {
    lat: number;
    lng: number;
  };
}

// Sample destinations for each category
const destinationsByCategory: Record<string, Destination[]> = {
  wildlife: [
    {
      id: 'yala',
      name: 'Yala National Park',
      description: 'Famous for leopards and elephants, this is Sri Lanka\'s most visited national park.',
      rating: 4.8,
      duration: '2-3 hours',
      highlights: ['Leopard spotting', 'Elephant herds', 'Bird watching', 'Scenic landscapes'],
      image: '/src/assets/category-wildlife.jpg',
      gallery: [
        '/src/assets/category-wildlife.jpg',
        '/src/assets/category-adventure.jpg',
        '/src/assets/category-hill-country.jpg',
        '/src/assets/hero-sri-lanka.jpg'
      ],
      location: { lat: 6.3728, lng: 81.5206 }
    },
    {
      id: 'udawalawe',
      name: 'Udawalawe National Park',
      description: 'Best place to see wild elephants in their natural habitat.',
      rating: 4.7,
      duration: '2-3 hours',
      highlights: ['Elephant observatory', 'Water buffalo', 'Crocodiles', 'Bird species'],
      image: '/src/assets/category-wildlife.jpg',
      gallery: [
        '/src/assets/category-wildlife.jpg',
        '/src/assets/category-beaches.jpg',
        '/src/assets/category-cultural.jpg',
        '/src/assets/hero-sri-lanka.jpg'
      ],
      location: { lat: 6.4333, lng: 80.8833 }
    }
  ],
  beaches: [
    {
      id: 'unawatuna',
      name: 'Unawatuna Beach',
      description: 'A crescent-shaped beach with calm waters perfect for swimming.',
      rating: 4.6,
      duration: 'Full day',
      highlights: ['Swimming', 'Snorkeling', 'Beach restaurants', 'Sunset views'],
      image: '/src/assets/category-beaches.jpg',
      gallery: [
        '/src/assets/category-beaches.jpg',
        '/src/assets/hero-sri-lanka.jpg',
        '/src/assets/category-adventure.jpg',
        '/src/assets/category-wildlife.jpg'
      ],
      location: { lat: 6.0108, lng: 80.2494 }
    },
    {
      id: 'mirissa',
      name: 'Mirissa Beach',
      description: 'Known for whale watching and stunning sunrise views.',
      rating: 4.9,
      duration: 'Full day',
      highlights: ['Whale watching', 'Surfing', 'Beach parties', 'Coconut palms'],
      image: '/src/assets/category-beaches.jpg',
      gallery: [
        '/src/assets/category-beaches.jpg',
        '/src/assets/category-cultural.jpg',
        '/src/assets/hero-sri-lanka.jpg',
        '/src/assets/category-hill-country.jpg'
      ],
      location: { lat: 5.9486, lng: 80.4611 }
    }
  ],
  heritage: [
    {
      id: 'sigiriya',
      name: 'Sigiriya Rock Fortress',
      description: 'Ancient rock citadel with breathtaking frescoes and gardens.',
      rating: 4.9,
      duration: '3-4 hours',
      highlights: ['Ancient frescoes', 'Lion\'s Gate', 'Water gardens', 'Summit views'],
      image: '/src/assets/category-heritage.jpg',
      gallery: [
        '/src/assets/category-heritage.jpg',
        '/src/assets/category-cultural.jpg',
        '/src/assets/hero-sri-lanka.jpg',
        '/src/assets/category-adventure.jpg'
      ],
      location: { lat: 7.9570, lng: 80.7603 }
    },
    {
      id: 'polonnaruwa',
      name: 'Polonnaruwa',
      description: 'Medieval capital with well-preserved ruins and sculptures.',
      rating: 4.7,
      duration: '4-5 hours',
      highlights: ['Ancient temples', 'Buddha statues', 'Royal palace ruins', 'Archaeological site'],
      image: '/src/assets/category-heritage.jpg',
      gallery: [
        '/src/assets/category-heritage.jpg',
        '/src/assets/category-beaches.jpg',
        '/src/assets/hero-sri-lanka.jpg',
        '/src/assets/category-wildlife.jpg'
      ],
      location: { lat: 7.9403, lng: 81.0188 }
    }
  ]
};

// Book reading spinner component
const BookLoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <motion.div
      animate={{ 
        rotateY: [0, 180, 360],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <BookOpen className="w-16 h-16 text-primary" />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6 text-center"
    >
      <h3 className="text-lg font-medium text-foreground mb-2">
        Turning the Pages...
      </h3>
      <p className="text-muted-foreground text-sm">
        Loading amazing destinations
      </p>
      
      {/* Animated dots */}
      <div className="flex justify-center mt-4 space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

interface DestinationPageProps {
  categoryId: string;
  onDestinationSelect: (destination: Destination) => void;
  onBack: () => void;
}

const DestinationPage: React.FC<DestinationPageProps> = ({ 
  categoryId, 
  onDestinationSelect, 
  onBack 
}) => {
  const [selectedGallery, setSelectedGallery] = useState<{images: string[], name: string} | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('');

  // Fetch destinations from API
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        
        // Fetch destinations for the selected category
        const response = await apiClient.getDestinations({
          categoryId: categoryId,
          enabled: true, // Only show enabled destinations on the front-end
        });

        if (response.success && response.data) {
          // Map API destinations to local format
          const mappedDestinations: Destination[] = response.data.destinations.map((dest: ApiDestination) => ({
            id: dest.id,
            name: dest.title,
            description: dest.description,
            rating: dest.rating,
            duration: dest.duration,
            highlights: dest.highlights,
            image: dest.images[0] || '/src/assets/hero-sri-lanka.jpg',
            gallery: dest.images.length > 0 ? dest.images : ['/src/assets/hero-sri-lanka.jpg'],
            location: { lat: 0, lng: 0 } // Default coordinates if not available
          }));

          setDestinations(mappedDestinations);
        } else {
          // Fallback to dummy data if API fails
          setDestinations(destinationsByCategory[categoryId] || []);
        }

        // Fetch category name
        try {
          const categoriesResponse = await apiClient.getCategories();
          if (categoriesResponse.success && categoriesResponse.data) {
            const category = categoriesResponse.data.categories.find(cat => cat.id === categoryId);
            setCategoryTitle(category?.title || categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' '));
          } else {
            setCategoryTitle(categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' '));
          }
        } catch {
          setCategoryTitle(categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' '));
        }
      } catch (error) {
        console.error('Failed to load destinations:', error);
        toast.error('Failed to load destinations');
        // Fallback to dummy data
        setDestinations(destinationsByCategory[categoryId] || []);
        setCategoryTitle(categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' '));
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, [categoryId]);

  const openGallery = (e: React.MouseEvent, destination: Destination) => {
    e.stopPropagation();
    setSelectedGallery({ images: destination.gallery, name: destination.name });
    setCurrentImageIndex(0);
    // Prevent body scroll and hide overflow
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setSelectedGallery(null);
    setCurrentImageIndex(0);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedGallery.images.length - 1 : prev - 1
      );
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    const swipeVelocity = 500;

    // Swipe right to go to previous image
    if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      previousImage();
    } 
    // Swipe left to go to next image
    else if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      nextImage();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-paper relative overflow-hidden">
      {/* Cultural Pattern Background */}
      <div className="cultural-pattern" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-16 pb-8"
      >
        <div className="max-w-6xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          
          <h1 className="chapter-title mb-4">
            {categoryTitle} Destinations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover the most amazing {categoryTitle.toLowerCase()} experiences Sri Lanka has to offer
          </p>
        </div>
      </motion.div>

      {/* Destinations Grid */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Loading Spinner */}
          {loading && <BookLoadingSpinner />}
          
          {/* Destinations Grid */}
          {!loading && destinations.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="heritage-card overflow-hidden cursor-pointer group h-full"
                      onClick={() => onDestinationSelect(destination)}>
                  {/* Destination Image */}
                  <div className="relative h-64 overflow-hidden">
                    {destination.image ? (
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {destination.name}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        {destination.duration}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {destination.description}
                    </p>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-foreground mb-2">Highlights:</h4>
                      <div className="flex flex-wrap gap-2">
                        {destination.highlights.map((highlight) => (
                          <span 
                            key={highlight}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center justify-between">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => openGallery(e, destination)}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        View Gallery
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-gradient-saffron hover:shadow-cultural text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDestinationSelect(destination);
                        }}
                      >
                        Explore Places
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            </div>
          )}

          {/* Coming Soon Message */}
          {!loading && destinations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Destinations Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  We're curating the best {categoryTitle.toLowerCase()} destinations for you. 
                  Check back soon for amazing places to explore!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Side Ad */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed top-1/2 right-4 transform -translate-y-1/2 w-24 h-64 bg-card/60 backdrop-blur-sm border border-primary/20 rounded-lg shadow-soft hidden xl:block"
      >
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs text-center p-2">
          Vertical Ad Space
        </div>
      </motion.div>

      {/* Gallery Modal - Using Portal to render at document root */}
      {selectedGallery && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGallery}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div 
              className="relative max-w-5xl w-full my-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeGallery}
                className="absolute -top-10 right-0 p-2 text-white hover:text-primary transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Gallery Title */}
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl md:text-2xl font-semibold text-white mb-3"
              >
                {selectedGallery.name}
              </motion.h2>

              {/* Image Container */}
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="relative bg-black rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                style={{ maxHeight: '60vh' }}
              >
                <img
                  src={selectedGallery.images[currentImageIndex]}
                  alt={`${selectedGallery.name} gallery view ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{ maxHeight: '60vh' }}
                  draggable={false}
                />

                {/* Navigation Arrows */}
                {selectedGallery.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                  {currentImageIndex + 1} / {selectedGallery.images.length}
                </div>
              </motion.div>

              {/* Thumbnail Strip */}
              {selectedGallery.images.length > 1 && (
                <div className="mt-3 flex gap-2 justify-center overflow-x-auto pb-2">
                  {selectedGallery.images.map((img, index) => (
                    <button
                      key={`gallery-thumb-${index}-${img}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary scale-110' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default DestinationPage;