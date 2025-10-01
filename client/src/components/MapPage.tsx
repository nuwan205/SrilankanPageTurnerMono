import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Star, Clock } from 'lucide-react';
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

interface MapPageProps {
  destination: Destination;
  onBack: () => void;
}

const MapPage: React.FC<MapPageProps> = ({ destination, onBack }) => {

  return (
    <div className="min-h-screen bg-gradient-paper relative overflow-hidden">
      {/* Cultural Pattern Background */}
      <div className="cultural-pattern" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-8 pb-4"
      >
        <div className="max-w-7xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Destinations
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            
            {/* Map Container */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 relative"
            >
              <Card className="heritage-card h-full overflow-hidden">
                <div className="relative h-full">
                  {/* Placeholder Map - Replace with actual Leaflet integration */}
                  <div className="h-full w-full bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Map Background Pattern */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,140,0,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,140,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    
                    {/* Location Marker */}
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                        <span className="text-2xl text-white">📍</span>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{destination.name}</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Interactive map coming soon with detailed location information
                      </p>
                      <div className="mt-4 text-xs text-muted-foreground bg-white/60 rounded-full px-3 py-1 inline-block">
                        {destination.location.lat.toFixed(4)}, {destination.location.lng.toFixed(4)}
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-10 left-10 w-8 h-8 bg-primary/30 rounded-full animate-bounce" />
                    <div className="absolute bottom-10 right-10 w-6 h-6 bg-cultural-gold/40 rounded-full animate-bounce delay-1000" />
                    <div className="absolute top-20 right-20 w-4 h-4 bg-secondary/40 rounded-full animate-bounce delay-500" />
                  </div>
                  
                  {/* Map Overlay Info */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-soft max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">Current Location</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {destination.location.lat.toFixed(4)}, {destination.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Destination Details */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Main Info Card */}
              <Card className="heritage-card p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-medium text-foreground">
                      {destination.name}
                    </h2>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      {destination.rating}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {destination.duration}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {destination.description}
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">Key Highlights</h3>
                  <div className="space-y-2">
                    {destination.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-saffron hover:shadow-cultural text-white">
                    Book Your Visit
                  </Button>
                  <Button variant="outline" className="w-full group">
                    Get Directions
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>

              {/* Weather Info Placeholder */}
              <Card className="heritage-card p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Local Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Best time to visit:</span>
                    <span className="text-foreground">Early morning</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry fee:</span>
                    <span className="text-foreground">USD 30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Open hours:</span>
                    <span className="text-foreground">6 AM - 6 PM</span>
                  </div>
                </div>
              </Card>

              {/* Ad Space */}
              <Card className="heritage-card p-4 text-center">
                <div className="text-muted-foreground text-sm">
                  <div className="w-full h-20 bg-muted/30 rounded-lg flex items-center justify-center mb-2">
                    Advertisement
                  </div>
                  <p className="text-xs">Sponsored content</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;