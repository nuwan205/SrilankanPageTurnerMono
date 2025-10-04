import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Star, Clock, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import AdCarousel from '@/components/AdCarousel';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Place {
  id: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  timeDuration?: string;
  highlights?: string[];
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  // Travel Tips
  bestTime?: string;
  travelTime?: string;
  idealFor?: string;
  // Single ad for backward compatibility
  ad?: {
    id: string;
    title: string;
    description: string;
    poster: string; // Main poster image
    images: string[]; // Multiple images for the ad
    rating: number;
    phone?: string;
    whatsapp?: string;
    email?: string;
    link: string;
    bookingLink?: string;
  };
  // Multiple ads list
  ads?: Ad[];
}

interface Ad {
  id: string;
  title: string;
  description: string;
  poster: string; // Main poster image
  images: string[]; // Gallery images
  rating: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  link: string;
  bookingLink?: string;
}

interface MapPageProps {
  place: Place;
  onBack: () => void;
}

// Enhanced Ad/Place Component with Multiple Images
const AdCard: React.FC<{ ad: Ad; isActualAd?: boolean; place: Place }> = ({ ad, isActualAd = true, place }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Create shuffled image array: place images interlaced with ad posters
  const shuffledImages = React.useMemo(() => {
    const placeImages = ad.images; // Place images
    const adPosters = place.ads?.map(adItem => adItem.poster).filter(Boolean) || [];
    
    // Interlace: after each place image, show ALL ad posters
    const result: string[] = [];
    
    if (adPosters.length === 0) {
      // No ads, just return place images
      return placeImages;
    }
    
    // For each place image, add it followed by all ad posters
    for (let i = 0; i < placeImages.length; i++) {
      result.push(placeImages[i]); // Add place image
      
      // Add all ad posters after this place image
      adPosters.forEach(poster => {
        result.push(poster);
      });
    }
    
    return result.length > 0 ? result : placeImages;
  }, [ad.images, place.ads]);

  useEffect(() => {
    if (shuffledImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
      }, 5000); // Auto-play every 5 seconds

      return () => clearInterval(interval);
    }
  }, [shuffledImages.length]);

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + shuffledImages.length) % shuffledImages.length);
  };

  return (
    <Card className="heritage-card overflow-hidden p-0">
      <div className="relative">
        {/* Image Carousel - Full Width */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden"
          >
            <img
              src={shuffledImages[currentImageIndex]}
              alt={`${ad.title} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Navigation Arrows */}
            {shuffledImages.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 sm:left-2 top-1/2 -translate-y-1/2 p-2 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all z-10"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all z-10"
                >
                  <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                </button>
              </>
            )}

            {/* Sponsored Badge - only show for actual ads */}
            {isActualAd && (
              <div className="absolute top-3 left-3 sm:top-3 sm:left-3 bg-primary/90 text-white text-xs sm:text-xs px-2 py-1 sm:px-2 sm:py-1 rounded-full">
                Sponsored
              </div>
            )}

            {/* Image Counter */}
            {shuffledImages.length > 1 && (
              <div className="absolute bottom-3 right-3 sm:bottom-3 sm:right-3 bg-black/50 text-white text-xs sm:text-xs px-2 py-1 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm">
                {currentImageIndex + 1} / {shuffledImages.length}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Place Content */}
        <div className="p-4 sm:p-4 lg:p-5">
          <div className="flex items-start justify-between gap-2 mb-3 sm:mb-3">
            <h3 className="text-lg sm:text-lg lg:text-xl font-medium text-foreground flex-1 leading-tight line-clamp-2">{ad.title}</h3>
            <div className="flex items-center gap-1 sm:gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 sm:px-2 sm:py-1 rounded-full text-sm sm:text-sm flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-3 sm:h-3 fill-current" />
              {ad.rating}
            </div>
          </div>
          
          <div className="text-sm sm:text-sm text-muted-foreground mb-4 sm:mb-4 leading-relaxed">
            <MarkdownRenderer content={place.description} className="text-sm sm:text-sm" />
          </div>

          {/* Dots Indicator */}
          {shuffledImages.length > 1 && (
            <div className="flex gap-1.5 justify-center">
              {shuffledImages.map((_img, index) => (
                <button
                  key={`${ad.id}-img-${index}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary w-5 sm:w-4' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const MapPage: React.FC<MapPageProps> = ({ place, onBack }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Check if place has an actual ad (backward compatibility)
  const hasActualAd = !!place.ad;

  // If place has ad, use it; otherwise create fallback from place data
  const adToDisplay: Ad = place.ad || {
    id: place.id,
    title: place.name,
    description: place.description,
    poster: place.images[0] || '', // Use first image as poster
    images: place.images,
    rating: place.rating,
    link: `#${place.id}`, // Fallback link
  };

  // Get ads list (convert single ad to array if needed)
  const adsToShow: Ad[] = place.ads || (place.ad ? [place.ad] : []);

  return (
    <div className="h-screen bg-gradient-paper relative overflow-y-auto hide-scrollbar pb-20 sm:pb-8 lg:pb-8" style={{ scrollBehavior: 'smooth', touchAction: 'pan-y' }}>
      {/* Cultural Pattern Background */}
      <div className="cultural-pattern" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4 sticky top-0 bg-gradient-paper/95 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-0 hover:bg-primary/10 hover:text-primary text-base sm:text-base h-10 sm:h-10 px-3 sm:px-4 border-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
            Back to Places
          </Button>
        </div>
      </motion.div>

      {/* Main Content - Scrollable */}
      <div className="relative z-10 px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Always use 2-column layout with ad/place display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Ad/Place Column - Large (2/3 width) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <AdCard ad={adToDisplay} isActualAd={hasActualAd} place={place} />
            </motion.div>

            {/* Sidebar Column - Small (1/3 width) or Full Width */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Sponsored Ads Carousel - Only show if ads exist */}
                {adsToShow.length > 0 && (
                  <AdCarousel ads={adsToShow} autoPlayInterval={8000} />
                )}

                {/* Map with Key Highlights - Combined Card */}
                <Card className="heritage-card overflow-hidden p-0">
                  {/* Compact Map */}
                  <div className="relative h-[180px] sm:h-[200px]">
                    {/* Leaflet Map */}
                    <MapContainer
                      center={[place.location.lat, place.location.lng]}
                      zoom={13}
                      className="h-full w-full z-0"
                      style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[place.location.lat, place.location.lng]}>
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-medium text-sm mb-1">{place.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              ⭐ {place.rating} • {place.duration}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                    
                    {/* Map Overlay Info */}
                    <div className="absolute top-3 left-3 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-2 shadow-soft max-w-[180px] sm:max-w-[180px] z-[1000]">
                      <div className="flex items-center gap-1.5 sm:gap-1.5 mb-1 sm:mb-1">
                        <div className="w-2 h-2 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-xs font-medium truncate">{place.name}</span>
                      </div>
                      <p className="text-[10px] sm:text-[10px] text-muted-foreground truncate">
                        {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}
                      </p>
                    </div>

                    {/* Map Action Buttons */}
                    <div className="absolute bottom-3 right-3 sm:bottom-3 sm:right-3 flex gap-2 z-[1000]">
                      {/* Share Button */}
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
                          if (navigator.share) {
                            navigator.share({
                              title: place.name,
                              text: `Check out ${place.name} - ${place.description.substring(0, 100)}...`,
                              url: url,
                            }).catch(() => {
                              // Fallback to clipboard
                              navigator.clipboard.writeText(url);
                            });
                          } else {
                            navigator.clipboard.writeText(url);
                          }
                        }}
                        className="p-2.5 sm:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-soft transition-all hover:scale-110"
                        title="Share location"
                      >
                        <ExternalLink className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                      </button>
                      
                      {/* Enlarge Map Button */}
                      <button
                        onClick={() => setIsMapModalOpen(true)}
                        className="p-2.5 sm:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-soft transition-all hover:scale-110"
                        title="Enlarge map"
                      >
                        <Maximize2 className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Place Information with Padding */}
                  <div className="p-4 sm:p-4">
                    <div className="mb-4 sm:mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-2">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-xl lg:text-2xl font-medium text-foreground leading-tight truncate">
                            {place.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 sm:px-2 sm:py-1 rounded-full text-sm sm:text-sm flex-shrink-0">
                          <Star className="w-4 h-4 sm:w-4 sm:h-4 fill-current" />
                          {place.rating}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 sm:w-4 sm:h-4" />
                          <span className="truncate">{place.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Travel Tips */}
                    {(place.bestTime || place.travelTime || place.idealFor) && (
                      <div>
                        <h3 className="text-sm sm:text-sm font-semibold text-foreground mb-3 sm:mb-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full"></span>
                          Travel Tips
                        </h3>
                        <div className="space-y-2.5 sm:space-y-2.5">
                          {place.bestTime && (
                            <div className="bg-muted/30 rounded-lg p-3 sm:p-2.5">
                              <p className="text-xs sm:text-xs font-semibold text-foreground mb-1">Best Time:</p>
                              <p className="text-sm sm:text-sm text-muted-foreground leading-tight">{place.bestTime}</p>
                            </div>
                          )}
                          {place.travelTime && (
                            <div className="bg-muted/30 rounded-lg p-3 sm:p-2.5">
                              <p className="text-xs sm:text-xs font-semibold text-foreground mb-1">Travel Time:</p>
                              <p className="text-sm sm:text-sm text-muted-foreground leading-tight">{place.travelTime}</p>
                            </div>
                          )}
                          {place.idealFor && (
                            <div className="bg-muted/30 rounded-lg p-3 sm:p-2.5">
                              <p className="text-xs sm:text-xs font-semibold text-foreground mb-1">Ideal For:</p>
                              <p className="text-sm sm:text-sm text-muted-foreground leading-tight">{place.idealFor}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                </Card>


              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Map Enlargement Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl h-[85vh] sm:h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
            <DialogTitle className="text-base sm:text-lg lg:text-xl font-medium truncate pr-8">
              {place.name} - Location Map
            </DialogTitle>
          </DialogHeader>
          <div className="h-[calc(85vh-70px)] sm:h-[calc(90vh-80px)] lg:h-[calc(90vh-90px)] w-full">
            <MapContainer
              center={[place.location.lat, place.location.lng]}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[place.location.lat, place.location.lng]}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-medium text-xs sm:text-sm mb-1">{place.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      ⭐ {place.rating} • {place.duration}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                      {place.location.lat.toFixed(6)}, {place.location.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapPage;