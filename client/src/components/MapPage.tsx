import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Star, Clock, ChevronLeft, ChevronRight, Phone, Mail, MessageCircle, Maximize2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  // Ad information for this specific place (optional)
  ad?: {
    id: string;
    title: string;
    description: string;
    images: string[]; // Multiple images for the ad
    rating: number;
    phone?: string;
    whatsapp?: string;
    email?: string;
    link: string;
    bookingLink?: string;
  };
}

interface Ad {
  id: string;
  title: string;
  description: string;
  images: string[]; // Multiple images
  rating: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  link: string;
  bookingLink?: string;
}

interface MapPageProps {
  destination: Destination;
  place: Place;
  onBack: () => void;
}

// Enhanced Ad/Place Component with Multiple Images
const AdCard: React.FC<{ ad: Ad; isActualAd?: boolean }> = ({ ad, isActualAd = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (ad.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
      }, 5000); // Auto-play every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ad.images.length]);

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
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
              src={ad.images[currentImageIndex]}
              alt={`${ad.title} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Navigation Arrows */}
            {ad.images.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all z-10"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all z-10"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>
              </>
            )}

            {/* Sponsored Badge - only show for actual ads */}
            {isActualAd && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary/90 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                Sponsored
              </div>
            )}

            {/* Image Counter */}
            {ad.images.length > 1 && (
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm">
                {currentImageIndex + 1} / {ad.images.length}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Ad Content */}
        <div className="p-3 sm:p-4 lg:p-5">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg lg:text-xl font-medium text-foreground flex-1 leading-tight line-clamp-2">{ad.title}</h3>
            <div className="flex items-center gap-0.5 sm:gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm flex-shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              {ad.rating}
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-4">{ad.description}</p>
          
          {/* Contact Information - Professional Grid Layout - Only show for actual ads */}
          {isActualAd && (ad.phone || ad.whatsapp || ad.email || ad.link) && (
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {ad.phone && (
                <a 
                  href={`tel:${ad.phone}`}
                  className="group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-muted group-hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Phone</p>
                    <p className="text-xs sm:text-sm text-foreground font-semibold truncate">{ad.phone}</p>
                  </div>
                </a>
              )}
              
              {ad.whatsapp && (
                <a 
                  href={`https://wa.me/${ad.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-muted group-hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">WhatsApp</p>
                    <p className="text-xs sm:text-sm text-foreground font-semibold truncate">{ad.whatsapp}</p>
                  </div>
                </a>
              )}
              
              {ad.email && (
                <a 
                  href={`mailto:${ad.email}`}
                  className="group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-muted group-hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Email</p>
                    <p className="text-xs sm:text-sm text-foreground font-semibold truncate">{ad.email}</p>
                  </div>
                </a>
              )}

              {ad.link && (
                <a 
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-muted group-hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Website</p>
                    <p className="text-xs sm:text-sm text-foreground font-semibold truncate">Visit Website</p>
                  </div>
                </a>
              )}
              </div>
            </div>
          )}

          {/* Booking.com Link - Full Width CTA - Only show for actual ads */}
          {isActualAd && ad.bookingLink && (
            <div className="mb-3 sm:mb-4">
              <a 
                href={ad.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-lg border-2 border-primary/30 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">B</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-primary mb-0.5">Book on Booking.com</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Best price guaranteed • Free cancellation</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Dots Indicator */}
          {ad.images.length > 1 && (
            <div className="flex gap-1 justify-center">
              {ad.images.map((_img, index) => (
                <button
                  key={`${ad.id}-img-${index}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary w-3 sm:w-4' : 'bg-muted-foreground/30'
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

const MapPage: React.FC<MapPageProps> = ({ destination, place, onBack }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Check if place has an actual ad
  const hasActualAd = !!place.ad;

  // If place has ad, use it; otherwise create fallback from place data
  const adToDisplay: Ad = place.ad || {
    id: place.id,
    title: place.name,
    description: place.description,
    images: place.images,
    rating: place.rating,
    link: `#${place.id}`, // Fallback link
  };

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
            className="mb-0 hover:bg-primary/10 hover:text-primary text-sm sm:text-base h-8 sm:h-10 px-2 sm:px-4 border-0"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
              <AdCard ad={adToDisplay} isActualAd={hasActualAd} />
            </motion.div>

            {/* Sidebar Column - Small (1/3 width) or Full Width */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Compact Map with Enlarge Option - Full Width */}
                <Card className="heritage-card overflow-hidden p-0">
                  <div className="relative h-[250px] sm:h-[300px] lg:h-[350px]">
                    {/* Leaflet Map */}
                    <MapContainer
                      center={[place.location.lat, place.location.lng]}
                      zoom={13}
                      className="h-full w-full z-0"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[place.location.lat, place.location.lng]}>
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-medium text-sm mb-1">{place.name}</h3>
                            <p className="text-xs text-muted-foreground">{destination.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ⭐ {place.rating} • {place.duration}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                    
                    {/* Map Overlay Info */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 lg:top-4 lg:left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 shadow-soft max-w-[200px] sm:max-w-xs z-[1000]">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm font-medium truncate">{place.name}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}
                      </p>
                    </div>

                    {/* Enlarge Map Button */}
                    <button
                      onClick={() => setIsMapModalOpen(true)}
                      className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 lg:bottom-4 lg:right-4 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-soft z-[1000] transition-all hover:scale-110"
                      title="Enlarge map"
                    >
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </button>
                  </div>
                </Card>

                {/* Place Information */}
                <Card className="heritage-card p-3 sm:p-4 lg:p-6">
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground leading-tight truncate">
                          {place.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">in {destination.name}</p>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm flex-shrink-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        {place.rating}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{place.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {place.highlights && place.highlights.length > 0 && (
                    <div className="mb-3 sm:mb-4 lg:mb-6">
                      <h3 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Key Highlights</h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        {place.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-start gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                            <span className="text-xs sm:text-sm text-muted-foreground leading-tight">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 sm:space-y-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full bg-gradient-saffron hover:shadow-cultural text-white text-xs sm:text-sm h-9 sm:h-10">
                        Get Directions
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </a>
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
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{destination.name}</p>
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