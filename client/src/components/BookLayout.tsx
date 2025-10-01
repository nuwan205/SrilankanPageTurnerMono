import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookLayoutProps {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showNavigation?: boolean;
}

const BookLayout: React.FC<BookLayoutProps> = ({
  children,
  currentPage,
  totalPages,
  onPageChange,
  showNavigation = true,
}) => {
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device and viewport changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset scroll position on page change
  useEffect(() => {
    // Reset scroll position whenever page changes
    const resetScroll = () => {
      // Reset window scroll
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Reset any scrollable containers
      const scrollableElements = document.querySelectorAll('[data-scrollable], .book-page-container, .mobile-book, .book-page');
      scrollableElements.forEach(element => {
        if (element.scrollTop !== undefined) {
          element.scrollTop = 0;
        }
      });
      
      // Force layout recalculation to ensure proper positioning
      document.body.style.transform = 'translateZ(0)';
      setTimeout(() => {
        document.body.style.transform = '';
      }, 10);
    };
    
    // Reset immediately
    resetScroll();
    
    // Also reset after a small delay to catch any async updates
    const timeoutId = setTimeout(resetScroll, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage]);

  const paginate = (newDirection: number) => {
    const newPage = currentPage + newDirection;
    if (newPage >= 0 && newPage < totalPages) {
      setDirection(newDirection);
      onPageChange(newPage);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    // Much stricter thresholds to prevent accidental swipes
    const swipeThreshold = isMobile ? 40 : 80;
    const velocity = Math.abs(info.velocity.x);
    
    // On mobile, require both higher velocity AND distance for swipes
    if (isMobile) {
      const minDistance = 30;
      const minVelocity = 500;
      
      if (velocity > minVelocity && Math.abs(info.offset.x) > minDistance) {
        if (info.velocity.x > 0 && currentPage > 0) {
          paginate(-1);
        } else if (info.velocity.x < 0 && currentPage < totalPages - 1) {
          paginate(1);
        }
      }
      return;
    }
    
    // Desktop swipe logic remains the same
    if (info.offset.x > swipeThreshold && currentPage > 0) {
      paginate(-1);
    } else if (info.offset.x < -swipeThreshold && currentPage < totalPages - 1) {
      paginate(1);
    }
  };

  // Simple flip book animation variants
  const pageVariants = {
    enter: (direction: number) => {
      return {
        rotateY: direction > 0 ? -90 : 90,
        opacity: 0,
        transformOrigin: direction > 0 ? 'left center' : 'right center',
      };
    },
    center: {
      rotateY: 0,
      opacity: 1,
      transformOrigin: 'center center',
    },
    exit: (direction: number) => {
      return {
        rotateY: direction < 0 ? -90 : 90,
        opacity: 0,
        transformOrigin: direction < 0 ? 'right center' : 'left center',
      };
    },
  };

  return (
    <div className={`book-container ${isMobile ? 'mobile-book' : ''}`}>
      {/* Simple Background */}
      <div className="cultural-pattern" />
      
      {/* Page Container with mobile overflow protection */}
      <div className="book-page-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x" // Enable drag/swipe for both mobile and desktop
            dragConstraints={isMobile ? { left: -2, right: 2 } : { left: -10, right: 10 }}
            dragElastic={isMobile ? 0.005 : 0.05}
            dragMomentum={false}
            dragPropagation={false}
            onDragEnd={handleDragEnd}
            transition={{
              duration: isMobile ? 0.4 : 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="book-page"
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              top: 0,
              left: 0,
            }}
          >
            {/* Subtle page corner fold effect */}
            <div 
              className="absolute top-0 right-0 w-6 h-6 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(-45deg, transparent 45%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.05) 100%)',
                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
              }}
            />
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile-optimized Navigation */}
      {showNavigation && (
        <div className={`fixed ${isMobile ? 'bottom-4' : 'bottom-6'} left-1/2 transform -translate-x-1/2 z-50`}>
          <div className={`flex items-center ${isMobile ? 'gap-2 px-4 py-2' : 'gap-3 px-6 py-3'} bg-card/90 backdrop-blur-sm rounded-full shadow-lg border border-primary/20`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => paginate(-1)}
              disabled={currentPage === 0}
              className={`rounded-full hover:bg-primary/10 hover:text-primary ${isMobile ? 'h-8 w-8 p-0' : ''}`}
            >
              <ChevronLeft className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
            
            <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentPage ? 1 : -1);
                    onPageChange(i);
                  }}
                  className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-all duration-300 ${
                    i === currentPage
                      ? 'bg-primary scale-125'
                      : 'bg-primary/30 hover:bg-primary/60'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => paginate(1)}
              disabled={currentPage === totalPages - 1}
              className={`rounded-full hover:bg-primary/10 hover:text-primary ${isMobile ? 'h-8 w-8 p-0' : ''}`}
            >
              <ChevronRight className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
          </div>
        </div>
      )}

      {/* Page Counter */}
      <div className={`fixed ${isMobile ? 'bottom-2 right-3 text-xs px-2 py-1' : 'bottom-4 right-6 text-sm px-3 py-1'} text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full border border-primary/10`}>
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
};

export default BookLayout;