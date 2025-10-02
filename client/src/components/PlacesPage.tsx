import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { Place as ApiPlace } from '@/lib/api';
import { toast } from 'sonner';

interface Place {
  id: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
}

interface Destination {
  id: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  highlights: string[];
  image: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface PlacesPageProps {
  destination: Destination;
  onPlaceSelect: (place: Place) => void;
  onBack: () => void;
}

// Book loading spinner component
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
        Discovering Places...
      </h3>
      <p className="text-muted-foreground text-sm">
        Loading amazing places to visit
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

const PlacesPage: React.FC<PlacesPageProps> = ({ destination, onPlaceSelect, onBack }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch places from API
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true);
        
        const response = await apiClient.getPlaces({
          destinationId: destination.id,
        });

        if (response.success && response.data) {
          // Map API places to local format
          const mappedPlaces: Place[] = response.data.places.map((place: ApiPlace) => ({
            id: place.id,
            name: place.name,
            description: place.description,
            rating: place.rating,
            duration: place.duration,
            images: place.images,
            location: place.location,
          }));

          setPlaces(mappedPlaces);
        }
      } catch (error) {
        console.error('Failed to load places:', error);
        toast.error('Failed to load places');
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, [destination.id]);

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
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Destinations
          </button>
          
          <h1 className="chapter-title mb-2">
            Places to Visit
          </h1>
          <p className="text-lg text-muted-foreground">
            in {destination.name}
          </p>
        </div>
      </motion.div>

      {/* Places Grid */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Loading Spinner */}
          {loading && <BookLoadingSpinner />}

          {/* Places Grid */}
          {!loading && places.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {places.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ y: -8 }}
                className="category-tile group cursor-pointer"
                onClick={() => onPlaceSelect(place)}
              >
                {/* Place Image */}
                <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                  <img
                    src={place.images[0] || '/src/assets/category-adventure.jpg'}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/category-adventure.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">{place.rating}</span>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">{place.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {place.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {place.description}
                  </p>
                  
                  {/* Call to Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium text-sm group-hover:text-primary-glow transition-colors duration-300">
                      View on Map
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            ))}
            </motion.div>
          )}

          {/* No Places Message */}
          {!loading && places.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Places Found</h3>
              <p className="text-muted-foreground text-sm">Please check back later for amazing places to visit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-cultural-gold/10 rounded-full blur-2xl" />
    </div>
  );
};

export default PlacesPage;
