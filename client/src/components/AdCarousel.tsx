import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Phone, Mail, MessageCircle, ExternalLink, Maximize2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

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

interface AdCarouselProps {
  ads: Ad[];
  autoPlayInterval?: number;
}

const AdCarousel: React.FC<AdCarouselProps> = ({ ads, autoPlayInterval = 8000 }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedAdForGallery, setSelectedAdForGallery] = useState<Ad | null>(null);
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [ads.length, autoPlayInterval]);

  const goToNextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const goToPreviousAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const openGallery = (ad: Ad) => {
    setSelectedAdForGallery(ad);
    setCurrentGalleryImage(0);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const goToNextGalleryImage = () => {
    if (selectedAdForGallery) {
      setCurrentGalleryImage((prev) => (prev + 1) % selectedAdForGallery.images.length);
    }
  };

  const goToPreviousGalleryImage = () => {
    if (selectedAdForGallery) {
      setCurrentGalleryImage(
        (prev) => (prev - 1 + selectedAdForGallery.images.length) % selectedAdForGallery.images.length
      );
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x > 100) {
      goToPreviousGalleryImage();
    } else if (info.offset.x < -100) {
      goToNextGalleryImage();
    }
  };

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <>
      <Card className="heritage-card overflow-hidden p-0 relative">
        {/* Sponsored Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary/90 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-20 shadow-lg">
          Sponsored {ads.length > 1 && `(${currentAdIndex + 1}/${ads.length})`}
        </div>

        {/* Navigation Arrows - Only show if multiple ads */}
        {ads.length > 1 && (
          <>
            <button
              onClick={goToPreviousAd}
              className="absolute left-2 top-[60px] sm:top-[80px] -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all z-20 shadow-lg hover:scale-110"
              aria-label="Previous ad"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
            <button
              onClick={goToNextAd}
              className="absolute right-2 top-[60px] sm:top-[80px] -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all z-20 shadow-lg hover:scale-110"
              aria-label="Next ad"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Poster Image with Enlarge Button - Compact */}
            <div className="relative h-32 sm:h-40 overflow-hidden group">
              <img
                src={currentAd.poster}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Enlarge Button */}
              <button
                onClick={() => openGallery(currentAd)}
                className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg z-10 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="View gallery"
              >
                <Maximize2 className="w-4 h-4 text-primary" />
              </button>

              {/* Ad Title & Rating Overlay - Compact */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white flex-1 leading-tight drop-shadow-lg line-clamp-1">
                    {currentAd.title}
                  </h2>
                  <div className="flex items-center gap-0.5 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    {currentAd.rating}
                  </div>
                </div>
                {currentAd.images.length > 0 && (
                  <p className="text-white/90 text-xs drop-shadow-lg mt-0.5">
                    📸 {currentAd.images.length} {currentAd.images.length === 1 ? 'image' : 'images'}
                  </p>
                )}
              </div>
            </div>

            {/* Ad Content - Compact, No Description */}
            <div className="p-3 sm:p-4">

              {/* Contact Information - Compact */}
              {(currentAd.phone || currentAd.whatsapp || currentAd.email || currentAd.link) && (
                <div className="mb-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <span className="w-0.5 h-4 bg-primary rounded-full"></span>
                    Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentAd.phone && (
                      <a
                        href={`tel:${currentAd.phone}`}
                        className="group flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-muted group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                          <Phone className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-medium">Phone</p>
                          <p className="text-xs text-foreground font-semibold truncate">{currentAd.phone}</p>
                        </div>
                      </a>
                    )}

                    {currentAd.whatsapp && (
                      <a
                        href={`https://wa.me/${currentAd.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-green-500/50 transition-all"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-muted group-hover:bg-green-50 rounded-full flex items-center justify-center transition-colors">
                          <MessageCircle className="w-3.5 h-3.5 text-green-600/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-medium">WhatsApp</p>
                          <p className="text-xs text-foreground font-semibold truncate">{currentAd.whatsapp}</p>
                        </div>
                      </a>
                    )}

                    {currentAd.email && (
                      <a
                        href={`mailto:${currentAd.email}`}
                        className="group flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-muted group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                          <Mail className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-medium">Email</p>
                          <p className="text-xs text-foreground font-semibold truncate">{currentAd.email}</p>
                        </div>
                      </a>
                    )}

                    {currentAd.link && (
                      <a
                        href={currentAd.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-muted group-hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-foreground/70 group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-medium">Website</p>
                          <p className="text-xs text-foreground font-semibold truncate">Visit Website</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Booking.com Link - Compact */}
              {currentAd.bookingLink && (
                <div className="mb-3">
                  <a
                    href={currentAd.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-2.5 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-lg border-2 border-primary/30 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary">Booking.com</p>
                        <p className="text-[10px] text-muted-foreground">Best price • Free cancel</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Carousel Dots Indicator - Compact */}
              {ads.length > 1 && (
                <div className="flex gap-1.5 justify-center pt-3 border-t border-border/50">
                  {ads.map((ad, index) => (
                    <button
                      key={`ad-dot-${ad.id}-${index}`}
                      onClick={() => setCurrentAdIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 hover:opacity-100 ${
                        index === currentAdIndex 
                          ? 'bg-primary w-8 opacity-100' 
                          : 'bg-muted-foreground/40 w-2 opacity-50 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Go to ad ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Gallery Modal - Using Portal to render at document root */}
      {isGalleryOpen && selectedAdForGallery && createPortal(
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
                {selectedAdForGallery.title}
              </motion.h2>

              {/* Image Container */}
              <motion.div
                key={currentGalleryImage}
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
                  src={selectedAdForGallery.images[currentGalleryImage]}
                  alt={`${selectedAdForGallery.title} gallery view ${currentGalleryImage + 1}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{ maxHeight: '60vh' }}
                  draggable={false}
                />

                {/* Navigation Arrows */}
                {selectedAdForGallery.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousGalleryImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={goToNextGalleryImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                  {currentGalleryImage + 1} / {selectedAdForGallery.images.length}
                </div>
              </motion.div>

              {/* Thumbnail Strip */}
              {selectedAdForGallery.images.length > 1 && (
                <div className="mt-3 flex gap-2 justify-center overflow-x-auto pb-2">
                  {selectedAdForGallery.images.map((img, index) => (
                    <button
                      key={`gallery-thumb-${selectedAdForGallery.id}-${index}`}
                      onClick={() => setCurrentGalleryImage(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentGalleryImage 
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
    </>
  );
};

export default AdCarousel;
