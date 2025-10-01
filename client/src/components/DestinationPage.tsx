import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      image: '/placeholder-yala.jpg',
      location: { lat: 6.3728, lng: 81.5206 }
    },
    {
      id: 'udawalawe',
      name: 'Udawalawe National Park',
      description: 'Best place to see wild elephants in their natural habitat.',
      rating: 4.7,
      duration: '2-3 hours',
      highlights: ['Elephant observatory', 'Water buffalo', 'Crocodiles', 'Bird species'],
      image: '/placeholder-udawalawe.jpg',
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
      image: '/placeholder-unawatuna.jpg',
      location: { lat: 6.0108, lng: 80.2494 }
    },
    {
      id: 'mirissa',
      name: 'Mirissa Beach',
      description: 'Known for whale watching and stunning sunrise views.',
      rating: 4.9,
      duration: 'Full day',
      highlights: ['Whale watching', 'Surfing', 'Beach parties', 'Coconut palms'],
      image: '/placeholder-mirissa.jpg',
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
      image: '/placeholder-sigiriya.jpg',
      location: { lat: 7.9570, lng: 80.7603 }
    },
    {
      id: 'polonnaruwa',
      name: 'Polonnaruwa',
      description: 'Medieval capital with well-preserved ruins and sculptures.',
      rating: 4.7,
      duration: '4-5 hours',
      highlights: ['Ancient temples', 'Buddha statues', 'Royal palace ruins', 'Archaeological site'],
      image: '/placeholder-polonnaruwa.jpg',
      location: { lat: 7.9403, lng: 81.0188 }
    }
  ]
};

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
  const destinations = destinationsByCategory[categoryId] || [];
  const categoryTitle = categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' ');

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
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-primary/40" />
                      <span className="absolute bottom-4 left-4 text-white/80 text-sm bg-black/40 px-2 py-1 rounded">
                        {destination.name}
                      </span>
                    </div>
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
                        {destination.highlights.map((highlight, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        View on Map
                      </div>
                      <Button 
                        size="sm"
                        className="bg-gradient-saffron hover:shadow-cultural text-white"
                      >
                        Explore Location
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Message */}
          {destinations.length === 0 && (
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
    </div>
  );
};

export default DestinationPage;